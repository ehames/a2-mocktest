import type { Part4Set } from '../../types'
import OptionRow from '../ui/OptionRow'
import RationaleToggle from '../ui/RationaleToggle'

interface Props {
  set: Part4Set
  answers: Record<number, number>
  review: boolean
  onChoose: (qIndex: number, option: number) => void
  baseIndex: number
}

export default function ClozeMC({ set, answers, review, onChoose, baseIndex }: Props) {
  return (
    <>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
        <div style={{ font: "700 18px 'Libre Franklin'", color: 'var(--navy)', marginBottom: 11 }}>{set.title}</div>
        {set.paragraphs.map((p, i) => (
          <p key={i} className="serif" style={{ fontSize: 16, lineHeight: 1.62, color: 'var(--passage-ink)', margin: '0 0 12px' }}>{p}</p>
        ))}
      </div>

      {set.questions.map((q, qi) => {
        const qIndex = baseIndex + qi
        const sel = answers[qIndex]
        return (
          <div key={qi} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--navy)', color: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "700 13px 'Libre Franklin'" }}>
                {baseIndex + qi + 1}
              </div>
              {q.opts.map((opt, oi) => {
                const isSel = sel === oi
                const isCorrect = oi === q.answer
                let optState: 'idle' | 'selected' | 'correct' | 'wrong' = 'idle'
                if (review) { if (isCorrect) optState = 'correct'; else if (isSel) optState = 'wrong' }
                else if (isSel) optState = 'selected'
                return (
                  <OptionRow
                    key={oi}
                    letter={(['A', 'B', 'C'] as const)[oi]}
                    label={opt}
                    variant="inline"
                    optionState={optState}
                    onClick={review ? undefined : () => onChoose(qIndex, oi)}
                    showMark={review && (isCorrect || isSel)}
                  />
                )
              })}
            </div>
            {review && q.rationale && (
              <RationaleToggle rationale={q.rationale} />
            )}
          </div>
        )
      })}
    </>
  )
}
