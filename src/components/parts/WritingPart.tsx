import type { Part6Prompt, Part7Prompt } from '../../types'
import { wc } from '../../scoring'

interface Part6Props {
  prompt: Part6Prompt
  value: string
  review: boolean
  onChange: (v: string) => void
}

interface Part7Props {
  prompt: Part7Prompt
  value: string
  review: boolean
  onChange: (v: string) => void
}

function WordCountIndicator({ count, min }: { count: number; min: number }) {
  const hasStarted = count > 0
  const met = count >= min
  const remaining = Math.max(0, min - count)
  const unmetLabel = remaining === 1 ? '1 more word needed' : `${remaining} more words needed`
  const statusColor = !hasStarted ? 'var(--muted)' : met ? 'var(--green)' : 'var(--red)'
  const statusText = !hasStarted ? `min ${min} words` : met ? `Minimum ${min} ✓` : unmetLabel
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
      <span style={{ font: "600 13px 'Libre Franklin'", color: 'var(--muted)' }}>{count} words</span>
      <span style={{ font: "700 13px 'Libre Franklin'", color: statusColor }}>
        {statusText}
      </span>
    </div>
  )
}

const textareaStyle = (review: boolean): React.CSSProperties => ({
  width: '100%',
  minHeight: 210,
  padding: 15,
  borderRadius: 12,
  border: '1.5px solid var(--input-border)',
  fontFamily: "'Source Serif 4', Georgia, serif",
  fontSize: 16,
  lineHeight: 1.6,
  color: 'var(--passage-ink)',
  resize: 'vertical',
  background: review ? 'var(--instr-bg)' : 'var(--surface)',
})

export function Part6Writing({ prompt, value, review, onChange }: Part6Props) {
  const count = wc(value)
  return (
    <>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginBottom: 16 }}>
        <div style={{ font: "500 15px/1.5 'Libre Franklin'", color: 'var(--ink)', marginBottom: 13 }}>{prompt.intro}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {prompt.bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', font: "400 15px/1.45 'Libre Franklin'", color: 'var(--instr-ink)' }}>
              <span style={{ color: 'var(--navy)', fontWeight: 800, flexShrink: 0 }}>•</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        readOnly={review}
        placeholder="Write your answer here..."
        aria-label="Part 6 writing answer"
        style={textareaStyle(review)}
      />
      <WordCountIndicator count={count} min={prompt.minWords} />
    </>
  )
}

export function Part7Writing({ prompt, value, review, onChange }: Part7Props) {
  const count = wc(value)
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <div style={{ font: "500 15px/1.5 'Libre Franklin'", color: 'var(--ink)', marginBottom: 13 }}>{prompt.intro}</div>
        <div
          data-testid="part7-image-strip"
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 4,
          }}
        >
          {prompt.pics.map((pic, i) => (
            <div
              key={i}
              style={{
                flex: '0 0 260px',
                borderRadius: 12,
                overflow: 'hidden',
                position: 'relative',
                scrollSnapAlign: 'start',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              <img
                src={pic.image}
                alt={pic.text}
                style={{ display: 'block', width: '100%', aspectRatio: '1 / 1', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 8,
                left: 8,
                background: 'rgba(0,0,0,0.55)',
                color: '#fff',
                borderRadius: 6,
                padding: '3px 8px',
                font: "700 11px 'Libre Franklin'",
                letterSpacing: '0.05em',
              }}>
                {pic.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        readOnly={review}
        placeholder="Write your answer here..."
        aria-label="Part 7 writing answer"
        style={textareaStyle(review)}
      />
      <WordCountIndicator count={count} min={prompt.minWords} />
    </>
  )
}
