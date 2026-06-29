import { useState, useRef, useEffect } from 'react'
import licenseText from '../../LICENSE?raw'

interface Props {
  name: string
  loadError: string | null
  onName: (name: string) => void
  onStart: () => Promise<void>
}

export default function IntroScreen({ name, loadError, onName, onStart }: Props) {
  const [loading, setLoading] = useState(false)
  const [showLicense, setShowLicense] = useState(false)
  const licenseDialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = licenseDialogRef.current
    if (showLicense && el && typeof el.showModal === 'function') el.showModal()
  }, [showLicense])

  async function handleStart() {
    setLoading(true)
    await onStart()
    setLoading(false)
  }

  return (
    <div className="scrollbar-hidden" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', padding: '30px 22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
        <div style={{ width: 46, height: 46, borderRadius: 11, background: 'var(--navy)', color: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "800 19px 'Libre Franklin'", letterSpacing: '.5px' }}>A2</div>
        <div style={{ font: "600 12px 'Libre Franklin'", letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>Key · Mock Test · New Set</div>
      </div>

      <p style={{ font: "400 12px/1.5 'Libre Franklin'", color: 'var(--muted)', margin: '0 0 20px', padding: '10px 12px', background: 'var(--page-bg)', borderRadius: 8 }}>
        This practice tool is independently developed for educational purposes and is not endorsed by or affiliated with Cambridge. Use at your own risk.{' '}
        <button onClick={() => setShowLicense(true)} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--navy)', textDecoration: 'underline', font: "inherit", cursor: 'pointer' }}>See license for further information.</button>
      </p>

      <h1 style={{ font: "800 31px/1.12 'Libre Franklin'", color: 'var(--navy)', margin: '0 0 10px', letterSpacing: '-.01em' }}>Reading and Writing</h1>
      <p style={{ font: "400 15px/1.55 'Libre Franklin'", color: 'var(--instr-ink)', margin: '0 0 26px' }}>
        A full practice paper in seven parts. Answer everything, then submit to see your reading score and review your answers.
      </p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
        {[['Parts', '7'], ['Scored questions', '30'], ['Time', '60 minutes']].map(([label, value], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: i < 2 ? '1px solid var(--page-bg)' : 'none' }}>
            <span style={{ font: "500 14px 'Libre Franklin'", color: 'var(--muted)' }}>{label}</span>
            <span style={{ font: "700 15px 'Libre Franklin'", color: 'var(--navy)' }}>{value}</span>
          </div>
        ))}
      </div>

      <div style={{ font: "700 12px 'Libre Franklin'", letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Before you begin</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 26 }}>
        {[
          'Parts 1–4 are multiple choice and Part 5 needs one word per gap. These are scored automatically.',
          'Parts 6 and 7 are writing tasks — you will review these yourself at the end.',
          'The test submits automatically when the timer reaches zero.',
        ].map((text, i) => (
          <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', font: "400 14px/1.45 'Libre Franklin'", color: 'var(--instr-ink)' }}>
            <span style={{ color: 'var(--navy)', fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      <label htmlFor="player-name" style={{ font: "600 13px 'Libre Franklin'", color: 'var(--ink)', marginBottom: 8, display: 'block' }}>
        Your name <span style={{ color: 'var(--muted)', fontWeight: 400, fontStyle: 'italic' }}>(optional)</span>
      </label>
      <input
        id="player-name"
        value={name}
        onChange={e => onName(e.target.value)}
        placeholder="Type your name"
        style={{ width: '100%', padding: '13px 14px', borderRadius: 11, border: '1.5px solid var(--input-border)', background: 'var(--surface)', font: "500 15px 'Libre Franklin'", color: 'var(--ink)', marginBottom: 24 }}
      />

      {loadError && (
        <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, font: "500 14px 'Libre Franklin'", color: 'var(--red)' }}>
          {loadError} — please check your connection and try again.
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={loading}
        className="btn-primary"
        style={{ marginTop: 'auto', width: '100%', background: loading ? 'var(--button-loading-bg)' : 'var(--navy)', color: 'var(--surface)', border: 'none', borderRadius: 13, padding: 17, font: "700 16px 'Libre Franklin'", cursor: loading ? 'default' : 'pointer', boxShadow: 'var(--shadow-cta)' }}
      >
        {loading ? 'Loading questions…' : 'Start test'}
      </button>
      {showLicense && (
        <dialog
          ref={licenseDialogRef}
          className="license-sheet"
          onClose={() => setShowLicense(false)}
          onClick={e => { if (e.target === licenseDialogRef.current) setShowLicense(false) }}
          aria-label="License"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <span style={{ font: "700 15px 'Libre Franklin'", color: 'var(--navy)' }}>License</span>
            <button
              onClick={() => setShowLicense(false)}
              aria-label="Close license"
              style={{ background: 'none', border: 'none', padding: '10px 14px', font: "600 14px 'Libre Franklin'", color: 'var(--muted)', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
          <div style={{ overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {licenseText.trim().split(/\n\n+/).map((para, i) => (
              <p key={i} style={{ margin: 0, font: "400 13px/1.6 'Libre Franklin'", color: 'var(--ink)' }}>
                {para.replace(/\n/g, ' ')}
              </p>
            ))}
          </div>
        </dialog>
      )}
    </div>
  )
}
