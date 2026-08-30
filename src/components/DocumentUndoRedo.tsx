'use client'

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import { useAllFormFields } from '@payloadcms/ui'

import type { BeforeDocumentControlsClientProps } from 'payload'

import { reduceFieldsToValues } from 'payload/shared'

type Snapshot = Record<string, unknown>

const MAX_HISTORY = 50
const SAVE_DELAY = 500

export const DocumentUndoRedo = (
  _props: BeforeDocumentControlsClientProps,
) => {
  const [fields, dispatchFields] = useAllFormFields()

  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const historyRef = useRef<Snapshot[]>([])
  const historyIndexRef = useRef(-1)

  const restoringRef = useRef(false)
  const initializedRef = useRef(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ============================================================
  // CREATE SNAPSHOT
  // ============================================================

  const getSnapshot = useCallback((): Snapshot => {
    const values = reduceFieldsToValues(fields, true)

    return structuredClone(values)
  }, [fields])

  // ============================================================
  // COMPARE SNAPSHOTS
  // ============================================================

  const snapshotsEqual = useCallback(
    (a: Snapshot, b: Snapshot) => {
      return JSON.stringify(a) === JSON.stringify(b)
    },
    [],
  )

  // ============================================================
  // UPDATE BUTTON STATE
  // ============================================================

  const updateButtons = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0)

    setCanRedo(
      historyIndexRef.current >= 0 &&
        historyIndexRef.current <
          historyRef.current.length - 1,
    )
  }, [])

  // ============================================================
  // CAPTURE FORM CHANGES
  // ============================================================

  useEffect(() => {
    // Ignore state change caused by Undo / Redo restore
    if (restoringRef.current) {
      restoringRef.current = false
      return
    }

    const snapshot = getSnapshot()

    // ----------------------------------------------------------
    // FIRST SNAPSHOT
    // ----------------------------------------------------------

    if (!initializedRef.current) {
      historyRef.current = [snapshot]
      historyIndexRef.current = 0

      initializedRef.current = true

      updateButtons()

      return
    }

    // ----------------------------------------------------------
    // DEBOUNCE
    // ----------------------------------------------------------

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      const currentHistory = historyRef.current

      const currentIndex = historyIndexRef.current

      const currentSnapshot =
        currentHistory[currentIndex]

      // No actual change
      if (
        currentSnapshot &&
        snapshotsEqual(currentSnapshot, snapshot)
      ) {
        return
      }

      // --------------------------------------------------------
      // REMOVE REDO HISTORY
      // --------------------------------------------------------

      const newHistory = currentHistory.slice(
        0,
        currentIndex + 1,
      )

      // Add new snapshot
      newHistory.push(snapshot)

      // --------------------------------------------------------
      // LIMIT HISTORY
      // --------------------------------------------------------

      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift()
      }

      historyRef.current = newHistory

      historyIndexRef.current =
        newHistory.length - 1

      updateButtons()
    }, SAVE_DELAY)

    // ----------------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------------

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [
    fields,
    getSnapshot,
    snapshotsEqual,
    updateButtons,
  ])

  // ============================================================
  // RESTORE SNAPSHOT
  // ============================================================

  const restoreSnapshot = useCallback(
    (snapshot: Snapshot) => {
      restoringRef.current = true

      Object.entries(snapshot).forEach(
        ([path, value]) => {
          dispatchFields({
            type: 'UPDATE',
            path,
            value,
            initialValue: value,
          })
        },
      )
    },
    [dispatchFields],
  )

  // ============================================================
  // UNDO
  // ============================================================

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) {
      return
    }

    const newIndex =
      historyIndexRef.current - 1

    historyIndexRef.current = newIndex

    const snapshot =
      historyRef.current[newIndex]

    if (!snapshot) {
      return
    }

    restoreSnapshot(snapshot)

    updateButtons()
  }, [
    restoreSnapshot,
    updateButtons,
  ])

  // ============================================================
  // REDO
  // ============================================================

  const handleRedo = useCallback(() => {
    if (
      historyIndexRef.current >=
      historyRef.current.length - 1
    ) {
      return
    }

    const newIndex =
      historyIndexRef.current + 1

    historyIndexRef.current = newIndex

    const snapshot =
      historyRef.current[newIndex]

    if (!snapshot) {
      return
    }

    restoreSnapshot(snapshot)

    updateButtons()
  }, [
    restoreSnapshot,
    updateButtons,
  ])

  // ============================================================
  // KEYBOARD SHORTCUTS
  // ============================================================

  useEffect(() => {
    const handleKeyboard = (
      event: KeyboardEvent,
    ) => {
      const modifier =
        event.ctrlKey || event.metaKey

      if (!modifier) {
        return
      }

      const key =
        event.key.toLowerCase()

      // --------------------------------------------------------
      // CTRL + Z
      // --------------------------------------------------------

      if (
        key === 'z' &&
        !event.shiftKey
      ) {
        event.preventDefault()

        handleUndo()

        return
      }

      // --------------------------------------------------------
      // CTRL + SHIFT + Z
      // --------------------------------------------------------

      if (
        key === 'z' &&
        event.shiftKey
      ) {
        event.preventDefault()

        handleRedo()

        return
      }

      // --------------------------------------------------------
      // CTRL + Y
      // --------------------------------------------------------

      if (key === 'y') {
        event.preventDefault()

        handleRedo()
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyboard,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyboard,
      )
    }
  }, [
    handleUndo,
    handleRedo,
  ])

  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginRight: '8px',
      }}
    >
      {/* ======================================================
          UNDO
      ====================================================== */}

      <button
        type="button"
        onClick={handleUndo}
        disabled={!canUndo}
        title="Undo (Ctrl + Z)"
        style={{
          height: '36px',
          padding: '0 12px',
          borderRadius: '4px',
          border:
            '1px solid var(--theme-elevation-150)',
          background:
            'var(--theme-elevation-50)',
          color: 'var(--theme-text)',
          cursor: canUndo
            ? 'pointer'
            : 'not-allowed',
          opacity: canUndo ? 1 : 0.45,
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        ↶ Undo
      </button>

      {/* ======================================================
          REDO
      ====================================================== */}

      <button
        type="button"
        onClick={handleRedo}
        disabled={!canRedo}
        title="Redo (Ctrl + Shift + Z)"
        style={{
          height: '36px',
          padding: '0 12px',
          borderRadius: '4px',
          border:
            '1px solid var(--theme-elevation-150)',
          background:
            'var(--theme-elevation-50)',
          color: 'var(--theme-text)',
          cursor: canRedo
            ? 'pointer'
            : 'not-allowed',
          opacity: canRedo ? 1 : 0.45,
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        ↷ Redo
      </button>
    </div>
  )
}