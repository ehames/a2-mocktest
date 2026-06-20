import { useState } from 'react'

interface Props {
  name: string
  loadError: string | null
  onName: (name: string) => void
  onStart: () => Promise<void>
}

export default function IntroScreen({ name, loadError, onName, onStart }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    setLoading(true)
    await onStart()
    setLoading(false)
  }

  return (
    <div className="scrollbar-hidden" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', padding: '30px 22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
        <div style={{ width: 46, height: 46, borderRadius: 11, background: '#0B2447', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "800 19px 'Libre Franklin'", letterSpacing: '.5px' }}>A2</div>
        <div style={{ font: "600 12px 'Libre Franklin'", letterSpacing: '.16em', textTransform: 'uppercase', color: '#5B6B7F' }}>Key · Mock Test · New Set</div>
      </div>

      <h1 style={{ font: "800 31px/1.12 'Libre Franklin'", color: '#0B2447', margin: '0 0 10px', letterSpacing: '-.01em' }}>Reading and Writing</h1>
      <p style={{ font: "400 15px/1.55 'Libre Franklin'", color: '#5B6B7F', margin: '0 0 26px' }}>
        A full practice paper in seven parts. Answer everything, then submit to see your reading score and review your answers.
      </p>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
        {[['Parts', '7'], ['Scored questions', '30'], ['Time', '60 minutes']].map(([label, value], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: i < 2 ? '1px solid #EEF1F5' : 'none' }}>
            <span style={{ font: "500 14px 'Libre Franklin'", color: '#5B6B7F' }}>{label}</span>
            <span style={{ font: "700 15px 'Libre Franklin'", color: '#0B2447' }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ font: "700 12px 'Libre Franklin'", letterSpacing: '.1em', textTransform: 'uppercase', color: '#5B6B7F', marginBottom: 12 }}>Before you begin</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 26 }}>
        {[
          'Parts 1–4 are multiple choice and Part 5 needs one word per gap. These are scored automatically.',
          'Parts 6 and 7 are writing tasks — you will review these yourself at the end.',
          'The test submits automatically when the timer reaches zero.',
        ].map((text, i) => (
          <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', font: "400 14px/1.45 'Libre Franklin'", color: '#3A4A5E' }}>
            <span style={{ color: '#5B9BD5', fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <label style={{ font: "600 13px 'Libre Franklin'", color: '#16263D', marginBottom: 8, display: 'block' }}>
        Your name <span style={{ color: '#9AA7B6', fontWeight: 400 }}>(optional)</span>
      </label>
      <input
        value={name}
        onChange={e => onName(e.target.value)}
        placeholder="Type your name"
        style={{ width: '100%', padding: '13px 14px', borderRadius: 11, border: '1.5px solid #C2CEDC', background: '#fff', font: "500 15px 'Libre Franklin'", color: '#16263D', outline: 'none', marginBottom: 24 }}
      />

      {loadError && (
        <div style={{ background: '#FCEDED', border: '1px solid #C62828', borderRadius: 10, padding: '12px 14px', marginBottom: 16, font: "500 14px 'Libre Franklin'", color: '#C62828' }}>
          {loadError} — please check your connection and try again.
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={loading}
        style={{ marginTop: 'auto', width: '100%', background: loading ? '#4a6a9a' : '#0B2447', color: '#fff', border: 'none', borderRadius: 13, padding: 17, font: "700 16px 'Libre Franklin'", cursor: loading ? 'default' : 'pointer', boxShadow: '0 6px 18px rgba(11,36,71,.22)' }}
      >
        {loading ? 'Loading questions…' : 'Start test'}
      </button>
    </div>
  )
}
