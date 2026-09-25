'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  CodeEditorLazy,
  CodeField,
  useField,
  useFormFields,
} from '@payloadcms/ui'
import type { CodeFieldClientProps } from 'payload'

type Mode = 'closed' | 'code' | 'preview'
type PreviewLang = 'html' | 'css' | 'js'

function normalizeLanguage(raw?: string): string {
  const language = String(raw || 'plaintext')
    .toLowerCase()
    .trim()

  if (language === 'html5' || language === 'htmlmixed') {
    return 'html'
  }

  if (
    language === 'javascript' ||
    language === 'ecmascript'
  ) {
    return 'js'
  }

  if (language === 'typescript') {
    return 'ts'
  }

  return language
}

function buildSrcDoc(
  language: PreviewLang,
  code: string,
): string {
  if (language === 'html') {
    return code
  }

  if (language === 'css') {
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
${code}
</style>
</head>
<body>
<div class="alloypress-css-preview">
  CSS Preview
</div>
</body>
</html>`
  }

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />

<style>
html,
body {
  margin: 0;
  padding: 16px;
  font-family: system-ui, sans-serif;
}

body {
  background: #ffffff;
  color: #111111;
}
</style>
</head>

<body>
<div id="app"></div>

<script>
try {
${code}
} catch (error) {
  document.body.innerHTML =
    "<pre style='color:red;white-space:pre-wrap;'>" +
    String(error?.stack || error) +
    "</pre>";
}
</script>

</body>
</html>`
}

const RESIZE_SCRIPT = `<script>
(function () {
  function send() {
    var height = Math.max(
      document.documentElement.scrollHeight,
      document.body
        ? document.body.scrollHeight
        : 0
    );

    parent.postMessage(
      {
        type: 'code-preview-height',
        height: height
      },
      '*'
    );
  }

  window.addEventListener('load', send);

  if (window.ResizeObserver) {
    new ResizeObserver(send).observe(
      document.documentElement
    );
  }

  setTimeout(send, 50);
})();
</script>`

export const CodePreviewField: React.FC<
  CodeFieldClientProps
> = (props) => {
  const { field, path } = props

  /*
   * ------------------------------------------------------------
   * LANGUAGE
   * ------------------------------------------------------------
   */

  const languagePath = path.includes('.')
    ? path.replace(/[^.]+$/, 'language')
    : 'language'

  const rawLanguage = useFormFields(
    ([fields]) =>
      fields?.[languagePath]?.value as
        | string
        | undefined,
  )

  const language = normalizeLanguage(rawLanguage)

  const canPreview =
    language === 'html' ||
    language === 'css' ||
    language === 'js'

  /*
   * ------------------------------------------------------------
   * PAYLOAD FIELD STATE
   * ------------------------------------------------------------
   *
   * For the custom editor we use useField().
   *
   * This is important because CodeEditorLazy is not
   * Payload's CodeField wrapper. We therefore have to
   * explicitly connect the editor to Payload's form state.
   */

  const {
    value: fieldValue,
    setValue,
    readOnly,
  } = useField<string>({
    path,
  })

  const code =
    typeof fieldValue === 'string'
      ? fieldValue
      : ''

  /*
   * ------------------------------------------------------------
   * UI STATE
   * ------------------------------------------------------------
   */

  const [mode, setMode] =
    useState<Mode>('closed')

  const [height, setHeight] =
    useState(200)

  const iframeRef =
    useRef<HTMLIFrameElement>(null)

  /*
   * ------------------------------------------------------------
   * LANGUAGE FALLBACK
   * ------------------------------------------------------------
   *
   * If someone changes the language from HTML/CSS/JS
   * to a language that cannot be previewed, return
   * to the closed state.
   */

  useEffect(() => {
    if (!canPreview && mode === 'preview') {
      setMode('closed')
    }
  }, [canPreview, mode])

  /*
   * ------------------------------------------------------------
   * PREVIEW DEBOUNCE
   * ------------------------------------------------------------
   *
   * Only debounce while preview is open.
   *
   * The code editor itself remains fully live.
   */

  const [debouncedCode, setDebouncedCode] =
    useState(code)

  useEffect(() => {
    if (mode !== 'preview') {
      return
    }

    const timer = window.setTimeout(() => {
      setDebouncedCode(code)
    }, 300)

    return () => {
      window.clearTimeout(timer)
    }
  }, [code, mode])

  /*
   * ------------------------------------------------------------
   * PREVIEW HEIGHT MESSAGE
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (mode !== 'preview') {
      return
    }

    const handleMessage = (
      event: MessageEvent,
    ) => {
      if (
        event.source !==
        iframeRef.current?.contentWindow
      ) {
        return
      }

      if (
        event.data?.type ===
          'code-preview-height' &&
        typeof event.data.height === 'number'
      ) {
        setHeight(
          Math.min(
            Math.max(
              event.data.height,
              80,
            ),
            1200,
          ),
        )
      }
    }

    window.addEventListener(
      'message',
      handleMessage,
    )

    return () => {
      window.removeEventListener(
        'message',
        handleMessage,
      )
    }
  }, [mode])

  /*
   * ------------------------------------------------------------
   * PREVIEW DOCUMENT
   * ------------------------------------------------------------
   */

  const srcDoc = useMemo(() => {
    if (
      mode !== 'preview' ||
      !canPreview
    ) {
      return ''
    }

    return (
      buildSrcDoc(
        language as PreviewLang,
        debouncedCode,
      ) + RESIZE_SCRIPT
    )
  }, [
    mode,
    canPreview,
    language,
    debouncedCode,
  ])

  /*
   * ------------------------------------------------------------
   * BUTTON STYLE
   * ------------------------------------------------------------
   */

  const tabStyle = (
    active: boolean,
  ): React.CSSProperties => ({
    padding: '6px 14px',
    fontSize: 13,
    lineHeight: 1.4,
    cursor: 'pointer',
    border: 'none',
    borderRadius: 4,
    background: active
      ? 'var(--theme-elevation-800)'
      : 'transparent',
    color: active
      ? 'var(--theme-elevation-0)'
      : 'var(--theme-elevation-800)',
  })

  /*
   * ------------------------------------------------------------
   * NON-PREVIEWABLE LANGUAGES
   * ------------------------------------------------------------
   *
   * Keep Payload's normal CodeField behaviour for languages
   * such as JSON, PHP, Python, TS, etc.
   */

  if (!canPreview) {
    return (
      <div className="alloypress-code-editor-wrap">
        <CodeField {...props} />
      </div>
    )
  }

  /*
   * ------------------------------------------------------------
   * CLOSED
   * ------------------------------------------------------------
   *
   * IMPORTANT:
   *
   * CodeEditorLazy is not mounted here.
   *
   * Therefore large HTML blocks do not create Monaco
   * instances until the user actually opens them.
   */

  if (mode === 'closed') {
    return (
      <div className="alloypress-code-preview-field">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '8px 0',
          }}
        >
          <span
            style={{
              fontSize: 13,
              color:
                'var(--theme-elevation-500)',
            }}
          >
            {language.toUpperCase()} editor
          </span>

          <div
            style={{
              display: 'flex',
              gap: 6,
            }}
          >
            <button
              type="button"
              style={tabStyle(false)}
              onClick={() => {
                setMode('code')
              }}
            >
              Open Editor
            </button>

            <button
              type="button"
              style={tabStyle(false)}
              onClick={() => {
                setDebouncedCode(code)
                setMode('preview')
              }}
            >
              Preview
            </button>
          </div>
        </div>
      </div>
    )
  }

  /*
   * ------------------------------------------------------------
   * OPEN EDITOR / PREVIEW
   * ------------------------------------------------------------
   */

  return (
    <div className="alloypress-code-preview-field">
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '6px 0',
        }}
      >
        <button
          type="button"
          style={tabStyle(
            mode === 'code',
          )}
          onClick={() => {
            setMode('code')
          }}
        >
          {language.toUpperCase()}
        </button>

        <button
          type="button"
          style={tabStyle(
            mode === 'preview',
          )}
          onClick={() => {
            setDebouncedCode(code)
            setMode('preview')
          }}
        >
          Preview
        </button>

        <button
          type="button"
          style={tabStyle(false)}
          onClick={() => {
            setMode('closed')
          }}
        >
          Close
        </button>
      </div>

      {mode === 'code' && (
        <div className="alloypress-code-editor-wrap">
          <CodeEditorLazy
            value={code}
            defaultLanguage={language}
            onChange={(value) => {
              setValue(value ?? '')
            }}
            readOnly={readOnly}
            minHeight={250}
            maxHeight={250}
            options={{
              /*
               * ------------------------------------------------
               * LAYOUT
               * ------------------------------------------------
               */

              automaticLayout: true,

              /*
               * ------------------------------------------------
               * SCROLLING
               * ------------------------------------------------
               *
               * Do not disable scrolling beyond the last line.
               * Monaco needs its normal scroll model to calculate
               * the final viewport correctly.
               */

              smoothScrolling: false,
              mouseWheelScrollSensitivity: 1.5,
              fastScrollSensitivity: 5,
              scrollPredominantAxis: true,
              scrollBeyondLastLine: true,

              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',

                /*
                 * Keep mouse-wheel events inside Monaco while
                 * the pointer is over the editor.
                 */

                alwaysConsumeMouseWheel: true,

                useShadows: false,
              },

              /*
               * ------------------------------------------------
               * PERFORMANCE
               * ------------------------------------------------
               */

              minimap: {
                enabled: false,
              },

              folding: false,

              stickyScroll: {
                enabled: false,
              },

              renderWhitespace: 'none',

              /*
               * Reduce visual work which is unnecessary for
               * HTML content editing.
               */

              guides: {
                indentation: false,
                bracketPairs: false,
                highlightActiveIndentation: false,
              },

              /*
               * Avoid extra blank space after the final line
               * beyond Monaco's normal scrolling behaviour.
               */

              padding: {
                top: 8,
                bottom: 8,
              },
            }}
          />
        </div>
      )}

      {mode === 'preview' && (
        <div
          style={{
            background: '#fff',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          {debouncedCode.trim() ? (
            <iframe
              ref={iframeRef}
              title={`${language} preview`}
              sandbox="allow-scripts"
              srcDoc={srcDoc}
              style={{
                width: '100%',
                height,
                border: 0,
                display: 'block',
              }}
            />
          ) : (
            <p
              style={{
                padding: 16,
                margin: 0,
                color: '#666',
              }}
            >
              Nothing to preview yet. Add some
              code in the editor tab.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default CodePreviewField