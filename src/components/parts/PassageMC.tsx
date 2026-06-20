import type { Part3Set } from '../../types'
import OptionRow from '../ui/OptionRow'
import RationaleToggle from '../ui/RationaleToggle'

interface Props {
  set: Part3Set
  answers: Record<number, number>
  review: boolean
  onChoose: (qIndex: number, option: number) => void
  baseIndex: number
}

export default function PassageMC({ set, answers, review, onChoose, baseIndex }: Props) {
  return (
    <>
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 18, marginBottom: 20 }}>
        <div style={{ font: "700 18px 'Libre Franklin'", color: '#0B2447', marginBottom: 11 }}>{set.title}</div>
        {set.paragraphs.map((p, i) => (
          <p key={i} className="serif" style={{ fontSize: 16, lineHeight: 1.62, color: '#1E2D40', margin: '0 0 12px' }}>{p}</p>
        ))}
      </div>

      {set.questions.map((q, qi) => {
        const qIndex = baseIndex + qi
        const sel = answers[qIndex]
        return (
          <div key={qi} style={{ marginBottom: 22 }}>
            <div style={{ font: "600 16px/1.4 'Libre Franklin'", color: '#16263D', marginBottom: 12 }}>{baseIndex + qi + 1}. {q.prompt}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                    variant="row"
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
