import type { AppState, Action, Step } from '../types'
import { PART_META } from '../constants'
import TimerPill from './ui/TimerPill'
import ProgressBar from './ui/ProgressBar'
import ShortMC from './parts/ShortMC'
import MatchingPart from './parts/MatchingPart'
import PassageMC from './parts/PassageMC'
import ClozeMC from './parts/ClozeMC'
import OpenCloze from './parts/OpenCloze'
import { Part6Writing, Part7Writing } from './parts/WritingPart'

interface Props {
  step: 1|2|3|4|5|6|7
  state: AppState
  dispatch: (a: Action) => void
}

export default function TestScreen({ step, state, dispatch }: Props) {
  const { activeTest, answers, text, writing, review } = state
  if (!activeTest) return null

  const meta = PART_META[step]!

  const canBack = review ? true : step > 1
  const nextLabel = review ? (step < 7 ? 'Next' : 'Results') : (step < 7 ? 'Next' : 'Submit')
  const partOf = review ? `Reviewing · Part ${step} of 7` : `Part ${step} of 7`

  function handleBack() {
    if (review) {
      if (step > 1) dispatch({ type: 'NAV_STEP', step: (step - 1) as Step })
      else dispatch({ type: 'NAV_STEP', step: 8 })
    } else if (step > 1) {
      dispatch({ type: 'NAV_STEP', step: (step - 1) as Step })
    }
  }

  function handleNext() {
    if (review) {
      if (step < 7) dispatch({ type: 'NAV_STEP', step: (step + 1) as Step })
      else dispatch({ type: 'NAV_STEP', step: 8 })
    } else {
      if (step < 7) dispatch({ type: 'NAV_STEP', step: (step + 1) as Step })
      else dispatch({ type: 'SUBMIT' })
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header */}
      <div style={{ background: '#0B2447', color: '#fff', padding: '16px 18px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ font: "800 19px 'Libre Franklin'", lineHeight: 1.1 }}>{meta.label}</div>
            <div style={{ font: "500 12px 'Libre Franklin'", color: '#9FB3CC', marginTop: 3, letterSpacing: '.02em' }}>{meta.subtitle}</div>
          </div>
          <TimerPill secondsLeft={state.secondsLeft} />
        </div>
        <ProgressBar step={step} />
      </div>

      {/* Scrollable body */}
      <div className="scrollbar-hidden" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '20px 18px 28px' }}>
        <div style={{ background: '#E8EEF6', borderRadius: 10, padding: '11px 14px', marginBottom: 20, font: "500 13px/1.45 'Libre Franklin'", color: '#3A4A5E' }}>
          {meta.instr}
        </div>

        {step === 1 && (
          <ShortMC
            items={activeTest.part1}
            answers={answers}
            review={review}
            onChoose={(qi, opt) => dispatch({ type: 'CHOOSE', qIndex: qi, option: opt })}
          />
        )}

        {step === 2 && (
          <MatchingPart
            set={activeTest.part2}
            answers={answers}
            review={review}
            onChoose={(qi, opt) => dispatch({ type: 'CHOOSE', qIndex: qi, option: opt })}
            baseIndex={6}
          />
        )}

        {step === 3 && (
          <PassageMC
            set={activeTest.part3}
            answers={answers}
            review={review}
            onChoose={(qi, opt) => dispatch({ type: 'CHOOSE', qIndex: qi, option: opt })}
            baseIndex={13}
          />
        )}

        {step === 4 && (
          <ClozeMC
            set={activeTest.part4}
            answers={answers}
            review={review}
            onChoose={(qi, opt) => dispatch({ type: 'CHOOSE', qIndex: qi, option: opt })}
            baseIndex={18}
          />
        )}

        {step === 5 && (
          <OpenCloze
            set={activeTest.part5}
            textAnswers={text}
            review={review}
            onsetText={(gi, val) => dispatch({ type: 'SET_TEXT', gapIndex: gi, value: val })}
            baseLabel={25}
          />
        )}

        {step === 6 && (
          <Part6Writing
            prompt={activeTest.part6}
            value={writing[6]}
            review={review}
            onChange={v => dispatch({ type: 'SET_WRITING', part: 6, value: v })}
          />
        )}

        {step === 7 && (
          <Part7Writing
            prompt={activeTest.part7}
            value={writing[7]}
            review={review}
            onChange={v => dispatch({ type: 'SET_WRITING', part: 7, value: v })}
          />
        )}
      </div>

      {/* Footer */}
      <div style={{ background: '#fff', borderTop: '1px solid #E2E8F0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {canBack && (
          <button
            onClick={handleBack}
            style={{ background: '#fff', color: '#0B2447', border: '1.5px solid #C2CEDC', borderRadius: 11, padding: '13px 18px', font: "600 14px 'Libre Franklin'", cursor: 'pointer' }}
          >
            Back
          </button>
        )}
        <div style={{ flex: 1, textAlign: 'center', font: "600 13px 'Libre Franklin'", color: '#5B6B7F' }}>{partOf}</div>
        <button
          onClick={handleNext}
          style={{ background: '#0B2447', color: '#fff', border: 'none', borderRadius: 11, padding: '13px 22px', font: "700 14px 'Libre Franklin'", cursor: 'pointer' }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}

