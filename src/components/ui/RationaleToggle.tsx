import { useState } from 'react'

interface Props {
  rationale: string
}

export default function RationaleToggle({ rationale }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ marginTop: 8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          background: 'none',
          border: '1px solid var(--input-border)',
          borderRadius: 8,
          padding: '10px 14px',
          minHeight: 44,
          font: "600 12px 'Libre Franklin'",
          color: 'var(--muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <span style={{ fontSize: 10 }}>{open ? '▲' : '▼'}</span>
        {open ? 'Hide rationale' : 'Show rationale'}
      </button>
      {open && (
        <div className="rationale-body" style={{
          marginTop: 8,
          padding: '10px 13px',
          background: 'var(--instr-bg)',
          borderRadius: 8,
          font: "400 13px/1.5 'Libre Franklin'",
          color: 'var(--instr-ink)',
        }}>
          {rationale}
        </div>
      )}
    </div>
  )
}
