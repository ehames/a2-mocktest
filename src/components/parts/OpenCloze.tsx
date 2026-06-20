import type { Part5Set } from '../../types'
import RationaleToggle from '../ui/RationaleToggle'

interface Props {
  set: Part5Set
  textAnswers: Record<number, string>
  review: boolean
  onsetText: (gapIndex: number, value: string) => void
  baseLabel: number
}

export default function OpenCloze({ set, textAnswers, review, onsetText, baseLabel }: Props) {
  return (
    <>
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 18, marginBottom: 20 }}>
        <div style={{ font: "700 18px 'Libre Franklin'", color: '#0B2447', marginBottom: 11 }}>{set.title}</div>
        {set.paragraphs.map((p, i) => (
          <p key={i} className="serif" style={{ fontSize: 16, lineHeight: 1.62, color: '#1E2D40', margin: '0 0 12px' }}>{p}</p>
        ))}
      </div>

      {set.gaps.map((g, i) => {
        const val = textAnswers[i] || ''
        const ok = g.accept.includes(val.trim().toLowerCase())
        const borderColor = review ? (ok ? '#2E7D32' : '#C62828') : '#C2CEDC'
        const bgColor = review ? (ok ? '#EAF6EE' : '#FCEDED') : '#fff'

        return (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: '#0B2447', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "700 13px 'Libre Franklin'" }}>
                {baseLabel + i}
              </div>
              <input
                value={val}
                onChange={e => onsetText(i, e.target.value)}
                readOnly={review}
                placeholder="one word"
                style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${borderColor}`, background: bgColor, font: "500 16px 'Libre Franklin'", color: '#16263D', outline: 'none', minWidth: 0 }}
              />
              {review && (
                <span style={{ flexShrink: 0, font: "700 14px 'Libre Franklin'", color: ok ? '#2E7D32' : '#C62828' }}>
                  {ok ? '✓' : `✗ ${g.accept[0]}`}
                </span>
              )}
            </div>
            {review && g.rationale && (
              <div style={{ paddingLeft: 42 }}>
                <RationaleToggle rationale={g.rationale} />
              </div>
            )}
          </div>
        )
      })}
    </>
  )
}
