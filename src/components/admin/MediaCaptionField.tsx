'use client'

import React, {
  useEffect,
  useRef,
  useState,
} from 'react'
import { useField } from '@payloadcms/ui'

type Props = {
  path: string
  label?: string
  required?: boolean
}

type ToolbarButtonProps = {
  label: string
  title: string
  onClick: () => void
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  label,
  title,
  onClick,
}) => {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(event) => {
        // VERY IMPORTANT:
        // Do not allow toolbar click to destroy the selected text.
        event.preventDefault()
      }}
      onClick={onClick}
      style={{
        minWidth: 34,
        height: 34,
        padding: '0 9px',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 5,
        background: 'var(--theme-elevation-50)',
        color: 'var(--theme-text)',
        cursor: 'pointer',
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  )
}

export const MediaCaptionField: React.FC<Props> = ({
  path,
  label,
  required,
}) => {
  const { value, setValue } = useField<string>({ path })

  const editorRef = useRef<HTMLDivElement>(null)
  const savedRangeRef = useRef<Range | null>(null)

  const [linkURL, setLinkURL] = useState('')

  const initialValue =
    typeof value === 'string' ? value : ''

  /* ============================================================
     LOAD VALUE INTO EDITOR
     ============================================================ */

  useEffect(() => {
    const editor = editorRef.current

    if (!editor) return

    if (editor.innerHTML !== initialValue) {
      editor.innerHTML = initialValue
    }
  }, [initialValue])

  /* ============================================================
     SAVE
     ============================================================ */

  const saveValue = () => {
    const editor = editorRef.current

    if (!editor) return

    setValue(editor.innerHTML)
  }

  /* ============================================================
     SELECTION
     ============================================================ */

  const saveSelection = () => {
    const editor = editorRef.current
    const selection = window.getSelection()

    if (
      !editor ||
      !selection ||
      selection.rangeCount === 0
    ) {
      return
    }

    const range = selection.getRangeAt(0)

    if (
      editor.contains(range.commonAncestorContainer)
    ) {
      savedRangeRef.current =
        range.cloneRange()
    }
  }

  const restoreSelection = () => {
    const editor = editorRef.current
    const range = savedRangeRef.current

    if (!editor || !range) return

    const selection = window.getSelection()

    if (!selection) return

    try {
      selection.removeAllRanges()
      selection.addRange(range)
    } catch {
      // Ignore invalid/stale selection.
    }
  }

  /* ============================================================
     EXEC COMMAND
     ============================================================ */

  const exec = (
    command: string,
    commandValue?: string,
  ) => {
    const editor = editorRef.current

    if (!editor) return

    editor.focus()

    // Restore selected text BEFORE executing command.
    restoreSelection()

    document.execCommand(
      command,
      false,
      commandValue,
    )

    saveValue()

    // Keep latest selection available for another action.
    saveSelection()
  }

  /* ============================================================
     LINK
     ============================================================ */

  const addLink = () => {
    const url = linkURL.trim()

    if (!url) return

    const editor = editorRef.current

    if (!editor) return

    editor.focus()
    restoreSelection()

    const selection = window.getSelection()

    if (
      !selection ||
      selection.rangeCount === 0 ||
      selection.isCollapsed
    ) {
      setLinkURL('')
      return
    }

    let finalURL = url

    // Allow normal URLs without forcing protocol.
    if (
      !/^https?:\/\//i.test(finalURL) &&
      !/^mailto:/i.test(finalURL) &&
      !/^tel:/i.test(finalURL) &&
      !finalURL.startsWith('#') &&
      !finalURL.startsWith('/')
    ) {
      finalURL = `https://${finalURL}`
    }

    document.execCommand(
      'createLink',
      false,
      finalURL,
    )

    saveValue()
    saveSelection()

    setLinkURL('')
  }

  /* ============================================================
     LINK FIELD
     ============================================================ */

  const handleLinkMouseDown = () => {
    // Save selected "hii" BEFORE URL input receives focus.
    saveSelection()
  }

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div style={{ marginBottom: 24 }}>
      {label ? (
        <label
          style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          {label}
          {required ? ' *' : ''}
        </label>
      ) : null}

      {/* ======================================================
          TOOLBAR
         ====================================================== */}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          alignItems: 'center',
          padding: 8,
          border: '1px solid var(--theme-elevation-150)',
          borderBottom: 'none',
          borderRadius: '6px 6px 0 0',
          background: 'var(--theme-elevation-50)',
        }}
      >
        <ToolbarButton
          label="B"
          title="Bold"
          onClick={() => exec('bold')}
        />

        <ToolbarButton
          label="I"
          title="Italic"
          onClick={() => exec('italic')}
        />

        <ToolbarButton
          label="U"
          title="Underline"
          onClick={() => exec('underline')}
        />

        <span
          style={{
            width: 1,
            height: 24,
            background:
              'var(--theme-elevation-150)',
            margin: '0 3px',
          }}
        />

        <ToolbarButton
          label="←"
          title="Align left"
          onClick={() =>
            exec('justifyLeft')
          }
        />

        <ToolbarButton
          label="↔"
          title="Align center"
          onClick={() =>
            exec('justifyCenter')
          }
        />

        <ToolbarButton
          label="→"
          title="Align right"
          onClick={() =>
            exec('justifyRight')
          }
        />

        <span
          style={{
            width: 1,
            height: 24,
            background:
              'var(--theme-elevation-150)',
            margin: '0 3px',
          }}
        />

        {/* ==================================================
            LINK URL
           ================================================== */}

        <input
          type="url"
          value={linkURL}
          onMouseDown={handleLinkMouseDown}
          onChange={(event) => {
            setLinkURL(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              addLink()
            }
          }}
          placeholder="https://example.com"
          style={{
            width: 220,
            height: 34,
            padding: '0 9px',
            border:
              '1px solid var(--theme-elevation-150)',
            borderRadius: 5,
            background:
              'var(--theme-input-bg)',
            color: 'var(--theme-text)',
          }}
        />

        <ToolbarButton
          label="Link"
          title="Apply link to selected text"
          onClick={addLink}
        />

        <ToolbarButton
          label="×"
          title="Remove link"
          onClick={() => exec('unlink')}
        />
      </div>

      {/* ======================================================
          WYSIWYG EDITOR
         ====================================================== */}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        spellCheck
        onInput={() => {
          saveSelection()
          saveValue()
        }}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onKeyDown={(event) => {
          if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === 's'
          ) {
            event.preventDefault()
            saveValue()
          }
        }}
        onBlur={() => {
          saveSelection()
          saveValue()
        }}
        style={{
          minHeight: 90,
          padding: '12px 14px',
          border:
            '1px solid var(--theme-elevation-150)',
          borderRadius: '0 0 6px 6px',
          background:
            'var(--theme-input-bg)',
          color: 'var(--theme-text)',
          outline: 'none',
          lineHeight: 1.6,
        }}
      />

      <div
        style={{
          marginTop: 7,
          fontSize: 12,
          color:
            'var(--theme-elevation-500)',
        }}
      >
        Select text and use B, I, U, alignment,
        or add a link. HTML is handled automatically.
      </div>
    </div>
  )
}

export default MediaCaptionField