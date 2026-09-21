'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CodeField, useFormFields } from '@payloadcms/ui'
import type { CodeFieldClientProps } from 'payload'

type Mode = 'code' | 'preview'
type PreviewLang = 'html' | 'css' | 'js'

/* Same language normalisation as BlogPostView.tsx, so admin and site agree. */
function normalizeLanguage(raw?: string): string {
  const l = String(raw || 'plaintext').toLowerCase().trim()
  if (l === 'html5' || l === 'htmlmixed') return 'html'
  if (l === 'javascript' || l === 'ecmascript') return 'js'
  if (l === 'typescript') return 'ts'
  return l
}

/* Same srcDoc logic as BlogPostView.tsx (html / css / js). */
function buildSrcDoc(lang: PreviewLang, code: string): string {
  if (lang === 'html') return code

  if (lang === 'css') {
    return `<!doctype html><html><head><meta charset="utf-8" />
<style>${code}</style></head>
<body><div class="alloypress-css-preview">CSS Preview</div></body></html>`
  }

  return `<!doctype html><html><head><meta charset="utf-8" />
<style>
html, body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; }
body { background: #ffffff; color: #111111; }
</style></head>
<body>
<div id="app"></div>
<script>
try {
${code}
} catch (error) {
  document.body.innerHTML =
    "<pre style='color:red;white-space:pre-wrap;'>" + String(error?.stack || error) + "</pre>";
}
</script>
</body></html>`
}

/* Lets the sandboxed iframe report its height to the admin UI. */
const RESIZE_SCRIPT = `<script>
(function () {
  function send() {
    var h = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
    parent.postMessage({ type: 'code-preview-height', height: h }, '*');
  }
  window.addEventListener('load', send);
  if (window.ResizeObserver) new ResizeObserver(send).observe(document.documentElement);
  setTimeout(send, 50);
})();
</script>`

export const CodePreviewField: React.FC<CodeFieldClientProps> = (props) => {
  const { field, path } = props

  // Sibling "language" field lives next to "code" in the same block form
  const languagePath = path.includes('.') ? path.replace(/[^.]+$/, 'language') : 'language'

  const rawLanguage = useFormFields(([fields]) => fields?.[languagePath]?.value as string | undefined)
  const code = useFormFields(([fields]) => (fields?.[path]?.value as string | undefined) ?? '')

  const language = normalizeLanguage(rawLanguage)
  const canPreview = language === 'html' || language === 'css' || language === 'js'

  const [mode, setMode] = useState<Mode>('code')
  const [height, setHeight] = useState(200)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // If the language changes to something non-previewable, go back to the editor
  useEffect(() => {
    if (!canPreview) setMode('code')
  }, [canPreview])

  // Debounce so the iframe doesn't reload on every keystroke
  const [debounced, setDebounced] = useState(code)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(code), 300)
    return () => clearTimeout(t)
  }, [code])

  // Accept height messages from OUR iframe only
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return
      if (e.data?.type === 'code-preview-height' && typeof e.data.height === 'number') {
        setHeight(Math.min(Math.max(e.data.height, 80), 1200))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const srcDoc = useMemo(
    () => (canPreview ? buildSrcDoc(language as PreviewLang, debounced) + RESIZE_SCRIPT : ''),
    [canPreview, language, debounced],
  )

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    fontSize: 13,
    cursor: 'pointer',
    border: 'none',
    borderRadius: 4,
    background: active ? 'var(--theme-elevation-800)' : 'transparent',
    color: active ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-800)',
  })

  // Non-previewable languages (ts, jsx, json, bash, sql...) keep the normal editor
  if (!canPreview) {
    return <CodeField {...props} />
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 4, padding: '6px 0' }}>
        <button type="button" style={tabStyle(mode === 'code')} onClick={() => setMode('code')}>
          {language.toUpperCase()}
        </button>
        <button type="button" style={tabStyle(mode === 'preview')} onClick={() => setMode('preview')}>
          Preview
        </button>
      </div>

      {/* Keep the editor mounted (hidden) so switching tabs never loses state */}
      <div style={{ display: mode === 'code' ? 'block' : 'none' }}>
        <CodeField
          {...props}
          field={{ ...field, admin: { ...field.admin, language } }}
        />
      </div>

      {mode === 'preview' && (
        <div style={{ background: '#fff', borderRadius: 4, overflow: 'hidden' }}>
          {debounced.trim() ? (
            <iframe
              ref={iframeRef}
              title={`${language} preview`}
              // No allow-same-origin: scripts run but can't touch the admin panel or cookies
              sandbox="allow-scripts"
              srcDoc={srcDoc}
              style={{ width: '100%', height, border: 0, display: 'block' }}
            />
          ) : (
            <p style={{ padding: 16, margin: 0, color: '#666' }}>
              Nothing to preview yet. Add some code in the editor tab.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default CodePreviewField