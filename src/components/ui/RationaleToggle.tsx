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
        style={{
          background: 'none',
          border: '1px solid #C2CEDC',
          borderRadius: 7,
          padding: '5px 10px',
          font: "600 12px 'Libre Franklin'",
          color: '#5B6B7F',
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
        <div style={{
          marginTop: 8,
          padding: '10px 13px',
          background: '#F4F7FB',
          borderRadius: 8,
          borderLeft: '3px solid #5B9BD5',
          font: "400 13px/1.5 'Libre Franklin'",
          color: '#3A4A5E',
        }}>
          {rationale}
        </div>
      )}
    </div>
  )
}
