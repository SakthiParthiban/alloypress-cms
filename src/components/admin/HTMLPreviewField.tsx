'use client'

import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {
    CodeEditorLazy,
    useField,
} from '@payloadcms/ui'
import { Copy, Check } from 'lucide-react'
import type { CodeFieldClientProps } from 'payload'

type Mode = 'closed' | 'code' | 'preview'

function buildHtmlPreview(code: string): string {
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html,
    body {
      margin: 0;
      padding: 0;
      min-height: 100%;
    }

    body {
      background: #ffffff;
      color: #111111;
    }
  </style>
</head>
<body>
${code}

<script>
(function () {
  function sendHeight() {
    var height = Math.max(
      document.documentElement.scrollHeight,
      document.body ? document.body.scrollHeight : 0
    );

    parent.postMessage(
      {
        type: 'html-preview-height',
        height: height
      },
      '*'
    );
  }

  window.addEventListener('load', sendHeight);

  if (window.ResizeObserver) {
    new ResizeObserver(sendHeight).observe(
      document.documentElement
    );
  }

  setTimeout(sendHeight, 50);
})();
</script>

</body>
</html>`
}

export const HTMLPreviewField: React.FC<
    CodeFieldClientProps
> = (props) => {
    const { path } = props

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

    const [copied, setCopied] = useState(false)

    const [mode, setMode] =
        useState<Mode>('closed')

    const [previewHeight, setPreviewHeight] =
        useState(200)

    const [debouncedCode, setDebouncedCode] =
        useState(code)

    const iframeRef =
        useRef<HTMLIFrameElement>(null)

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
                'html-preview-height' &&
                typeof event.data.height === 'number'
            ) {
                setPreviewHeight(
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

    const srcDoc = useMemo(() => {
        if (mode !== 'preview') {
            return ''
        }

        return buildHtmlPreview(
            debouncedCode,
        )
    }, [mode, debouncedCode])

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

    if (mode === 'closed') {
        return (
            <div className="alloypress-html-preview-field">
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
                        HTML editor
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

    return (
        <div className="alloypress-html-preview-field">
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
                    HTML
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
                    title={copied ? 'Copied' : 'Copy HTML'}
                    aria-label={copied ? 'Copied' : 'Copy HTML'}
                    onClick={async () => {
                        try {
                            await navigator.clipboard.writeText(code)
                            setCopied(true)
                            window.setTimeout(() => {
                                setCopied(false)
                            }, 1500)
                        } catch (error) {
                            console.error(
                                'Failed to copy HTML:',
                                error,
                            )
                        }
                    }}
                    style={{
                        ...tabStyle(false),
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 34,
                        padding: '6px 8px',
                    }}
                >
                    {copied ? (
                        <Check size={15} />
                    ) : (
                        <Copy size={15} />
                    )}
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
                <div className="alloypress-html-editor-wrap">
                    <CodeEditorLazy
                        value={code}
                        defaultLanguage="html"
                        onChange={(value) => {
                            setValue(value ?? '')
                        }}
                        readOnly={readOnly}
                        minHeight={250}
                        maxHeight={250}
                        options={{
                            automaticLayout: true,

                            smoothScrolling: false,
                            mouseWheelScrollSensitivity: 1.5,
                            fastScrollSensitivity: 5,
                            scrollPredominantAxis: true,
                            scrollBeyondLastLine: true,

                            scrollbar: {
                                vertical: 'auto',
                                horizontal: 'auto',
                                alwaysConsumeMouseWheel: true,
                                useShadows: false,
                            },

                            minimap: {
                                enabled: false,
                            },

                            folding: false,

                            stickyScroll: {
                                enabled: false,
                            },

                            renderWhitespace: 'none',

                            guides: {
                                indentation: false,
                                bracketPairs: false,
                                highlightActiveIndentation: false,
                            },

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
                    className="alloypress-html-preview-frame"
                    style={{
                        background: '#ffffff',
                        borderRadius: 4,
                        overflow: 'hidden',
                    }}
                >
                    {debouncedCode.trim() ? (
                        <iframe
                            ref={iframeRef}
                            title="HTML preview"
                            sandbox="allow-scripts"
                            srcDoc={srcDoc}
                            style={{
                                width: '100%',
                                height: previewHeight,
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
                            HTML in the editor.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

export default HTMLPreviewField