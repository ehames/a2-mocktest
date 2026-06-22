interface Props {
  step: number
  total?: number
}

export default function ProgressBar({ step, total = 7 }: Props) {
  const pct = Math.round(step / total * 100)
  return (
    <div
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={7}
      aria-label={`Part ${step} of 7`}
      style={{ height: 4, background: 'var(--progress-track)', borderRadius: 2, marginTop: 13, overflow: 'hidden' }}
    >
      <div style={{ height: '100%', width: '100%', background: 'var(--accent)', borderRadius: 2, transformOrigin: 'left', transform: `scaleX(${pct / 100})`, transition: 'transform .35s ease' }} />
    </div>
  )
}
