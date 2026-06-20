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
  const met = count >= min
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
      <span style={{ font: "600 13px 'Libre Franklin'", color: '#5B6B7F' }}>{count} words</span>
      <span style={{ font: "700 13px 'Libre Franklin'", color: met ? '#2E7D32' : '#9AA7B6' }}>
        {met ? `Minimum ${min} ✓` : `Minimum ${min} words`}
      </span>
    </div>
  )
}

const textareaStyle = (review: boolean): React.CSSProperties => ({
  width: '100%',
  minHeight: 210,
  padding: 15,
  borderRadius: 12,
  border: '1.5px solid #C2CEDC',
  fontFamily: "'Source Serif 4', Georgia, serif",
  fontSize: 16,
  lineHeight: 1.6,
  color: '#1E2D40',
  resize: 'vertical',
  outline: 'none',
  background: review ? '#F8FAFC' : '#fff',
})

export function Part6Writing({ prompt, value, review, onChange }: Part6Props) {
  const count = wc(value)
  return (
    <>
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 18, marginBottom: 16 }}>
        <div style={{ font: "500 15px/1.5 'Libre Franklin'", color: '#16263D', marginBottom: 13 }}>{prompt.intro}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {prompt.bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', font: "400 15px/1.45 'Libre Franklin'", color: '#3A4A5E' }}>
              <span style={{ color: '#5B9BD5', fontWeight: 800, flexShrink: 0 }}>•</span>
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
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 18, marginBottom: 16 }}>
        <div style={{ font: "500 15px/1.5 'Libre Franklin'", color: '#16263D', marginBottom: 13 }}>{prompt.intro}</div>
        <div style={{ display: 'flex', gap: 9 }}>
          {prompt.pics.map((pic, i) => (
            <div key={i} style={{ flex: 1, background: '#F4F6F9', border: '1px dashed #C2CEDC', borderRadius: 11, padding: '14px 8px', textAlign: 'center' }}>
              <div style={{ font: "700 10px 'Libre Franklin'", letterSpacing: '.1em', textTransform: 'uppercase', color: '#5B9BD5', marginBottom: 7 }}>{pic.label}</div>
              <div style={{ font: "600 12px/1.3 'Libre Franklin'", color: '#16263D' }}>{pic.text}</div>
            </div>
          ))}
        </div>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        readOnly={review}
        placeholder="Write your answer here..."
        style={textareaStyle(review)}
      />
      <WordCountIndicator count={count} min={prompt.minWords} />
    </>
  )
}
