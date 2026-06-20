interface Props {
  secondsLeft: number
}

function pad(n: number) { return String(n).padStart(2, '0') }

export default function TimerPill({ secondsLeft }: Props) {
  const warn = secondsLeft <= 300
  const mm = Math.floor(secondsLeft / 60)
  const ss = secondsLeft % 60

  return (
    <div style={{
      font: "700 15px 'Libre Franklin'",
      background: warn ? 'rgba(200,40,40,.92)' : 'rgba(255,255,255,.14)',
      color: '#fff',
      padding: '7px 12px',
      borderRadius: 8,
      letterSpacing: '.02em',
      flexShrink: 0,
    }}>
      {pad(mm)}:{pad(ss)}
    </div>
  )
}
