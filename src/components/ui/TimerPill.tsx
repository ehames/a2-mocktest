interface Props {
  secondsLeft: number
}

function pad(n: number) { return String(n).padStart(2, '0') }

export default function TimerPill({ secondsLeft }: Props) {
  const warn = secondsLeft <= 300
  const mm = Math.floor(secondsLeft / 60)
  const ss = secondsLeft % 60

  return (
    <div style={{ position: 'relative' }}>
      {/* Announce exactly once at the 5-minute mark */}
      <span
        className="sr-only"
        aria-live="assertive"
        aria-atomic="true"
      >
        {secondsLeft === 300 ? 'Warning: five minutes remaining' : ''}
      </span>
      <div
        role="timer"
        aria-label={`${mm} minutes ${pad(ss)} seconds remaining`}
        style={{
          font: "700 15px 'Libre Franklin'",
          background: warn ? 'rgba(200,40,40,.92)' : 'rgba(255,255,255,.14)',
          color: 'var(--surface)',
          padding: '7px 12px',
          borderRadius: 8,
          letterSpacing: '.02em',
          flexShrink: 0,
        }}
      >
        {pad(mm)}:{pad(ss)}
      </div>
    </div>
  )
}
