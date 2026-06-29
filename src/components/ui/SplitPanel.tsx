import { useState, useCallback, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'

interface Props {
  left: ReactNode
  right: ReactNode
  defaultRatio?: number
}

export default function SplitPanel({ left, right, defaultRatio = 0.45 }: Props) {
  const [ratio, setRatio] = useState(defaultRatio)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const listenerCleanup = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => { listenerCleanup.current?.() }
  }, [])

  const applyRatio = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setRatio(Math.min(0.8, Math.max(0.2, (clientX - rect.left) / rect.width)))
  }, [])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      applyRatio(ev.clientX)
    }
    const onMouseUp = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      listenerCleanup.current = null
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    listenerCleanup.current = () => {
      dragging.current = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [applyRatio])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setRatio(r => Math.max(0.2, r - 0.05))
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      setRatio(r => Math.min(0.8, r + 0.05))
    }
  }, [])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    dragging.current = true

    const onTouchMove = (ev: TouchEvent) => {
      if (!dragging.current || !ev.touches[0]) return
      applyRatio(ev.touches[0].clientX)
    }
    const onTouchEnd = () => {
      dragging.current = false
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      listenerCleanup.current = null
    }

    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    listenerCleanup.current = () => {
      dragging.current = false
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [applyRatio])

  return (
    <div ref={containerRef} style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left panel */}
      <div
        className="scrollbar-hidden"
        style={{ width: `${ratio * 100}%`, height: '100%', overflowY: 'auto', padding: '20px 20px 28px 24px', flexShrink: 0 }}
      >
        {left}
      </div>

      {/* Draggable divider — 12px wide for touch; visual line stays 2px via inner div */}
      <div
        className="split-divider"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={20}
        aria-valuemax={80}
        tabIndex={0}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onKeyDown={handleKeyDown}
        style={{
          width: 32,
          flexShrink: 0,
          cursor: 'col-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        <div className="split-line" style={{ position: 'absolute', inset: '0 15px', background: 'var(--border)' }} />
        <div className="split-divider-handle" style={{
          position: 'relative',
          zIndex: 1,
          width: 24,
          height: 24,
          borderRadius: 4,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          font: "600 12px 'Libre Franklin'",
          color: 'var(--muted)',
          pointerEvents: 'none',
        }}>
          ↔
        </div>
      </div>

      {/* Right panel */}
      <div
        className="scrollbar-hidden"
        style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '20px 24px 28px 20px', minWidth: 0 }}
      >
        {right}
      </div>
    </div>
  )
}
