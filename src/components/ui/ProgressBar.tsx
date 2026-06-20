interface Props {
  step: number
  total?: number
}

export default function ProgressBar({ step, total = 7 }: Props) {
  const pct = Math.round(step / total * 100)
  return (
    <div style={{ height: 4, background: 'rgba(255,255,255,.16)', borderRadius: 2, marginTop: 13, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width .35s ease' }} />
    </div>
  )
}
