import { useState, useEffect, useRef } from 'react'
import type { AppState, Action, Step } from '../types'
import { PART_META } from '../constants'
import TimerPill from './ui/TimerPill'
import ProgressBar from './ui/ProgressBar'
import PartNavBar from './ui/PartNavBar'
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
  isDesktop: boolean
}

export default function TestScreen({ step, state, dispatch, isDesktop }: Props) {
  const [confirmingSubmit, setConfirmingSubmit] = useState(false)
  const [warnCount, setWarnCount] = useState(0)
  const warnDialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (warnCount > 0 && warnDialogRef.current && typeof warnDialogRef.current.showModal === 'function') {
      warnDialogRef.current.showModal()
    }
  }, [warnCount])

  const { activeTest, answers, text, writing, review } = state
  if (!activeTest) return null

  const meta = PART_META[step]!

  const canBack = review ? true : step > 1
  const isSubmitStep = !review && step === 7
  const nextLabel = review
    ? (step < 7 ? 'Next' : 'Results')
    : (step < 7 ? 'Next' : confirmingSubmit ? 'Confirm →' : 'Submit')
  const partOf = review ? `Reviewing · Part ${step} of 7` : `Part ${step} of 7`

  function countUnanswered(): number {
    let missing = 0
    for (let i = 0; i <= 23; i++) if (answers[i] === undefined) missing++
    for (let i = 0; i <= 5; i++) if (!text[i]?.trim()) missing++
    if (!writing[6]?.trim()) missing++
    if (!writing[7]?.trim()) missing++
    return missing
  }

  function handleBack() {
    setConfirmingSubmit(false)
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
    } else if (step < 7) {
      dispatch({ type: 'NAV_STEP', step: (step + 1) as Step })
    } else if (!confirmingSubmit) {
      const missing = countUnanswered()
      if (missing > 0) {
        setWarnCount(missing)
        return
      }
      setConfirmingSubmit(true)
    } else {
      setConfirmingSubmit(false)
      dispatch({ type: 'SUBMIT' })
    }
  }

  const partContent = (
    <>
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
          isDesktop={isDesktop}
        />
      )}
      {step === 3 && (
        <PassageMC
          set={activeTest.part3}
          answers={answers}
          review={review}
          onChoose={(qi, opt) => dispatch({ type: 'CHOOSE', qIndex: qi, option: opt })}
          baseIndex={13}
          isDesktop={isDesktop}
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
        />
      )}
      {step === 6 && (
        <Part6Writing
          prompt={activeTest.part6}
          value={writing[6]}
          review={review}
          onChange={v => dispatch({ type: 'SET_WRITING', part: 6, value: v })}
          isDesktop={isDesktop}
        />
      )}
      {step === 7 && (
        <Part7Writing
          prompt={activeTest.part7}
          value={writing[7]}
          review={review}
          onChange={v => dispatch({ type: 'SET_WRITING', part: 7, value: v })}
          isDesktop={isDesktop}
        />
      )}
    </>
  )

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header */}
      <div className="test-header" style={{ background: 'var(--navy)', color: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ font: "800 19px 'Libre Franklin'", lineHeight: 1.1 }}>{meta.label}</h2>
            <div className="test-header-subtitle" style={{ font: "500 12px 'Libre Franklin'", color: 'var(--header-muted)', marginTop: 3, letterSpacing: '.02em' }}>{meta.subtitle}</div>
          </div>
          <TimerPill secondsLeft={state.secondsLeft} />
        </div>
        {!isDesktop && <ProgressBar step={step} />}
      </div>

      {/* 30-second countdown warning */}
      {!state.submitted && state.secondsLeft > 0 && state.secondsLeft <= 30 && (
        <div role="alert" style={{ background: 'var(--red-bg)', borderBottom: '1px solid var(--red)', padding: '8px 18px', font: "600 13px 'Libre Franklin'", color: 'var(--red)', textAlign: 'center', flexShrink: 0 }}>
          {state.secondsLeft <= 10
            ? `${state.secondsLeft}s — submitting automatically`
            : 'Time almost up — submitting automatically'}
        </div>
      )}

      {isDesktop ? (
        <>
          {/* Desktop: instruction strip + content area */}
          <div style={{ padding: '10px 24px', background: 'var(--instr-bg)', borderBottom: '1px solid var(--border)', font: "500 13px/1.45 'Libre Franklin'", color: 'var(--instr-ink)', flexShrink: 0 }}>
            {meta.instr}
          </div>
          {/* SplitPanel parts fill height and handle their own scroll; single-column parts scroll here */}
          <div
            className={[2, 3, 6].includes(step) ? undefined : 'scrollbar-hidden'}
            style={{
              flex: 1,
              minHeight: 0,
              overflow: [2, 3, 6].includes(step) ? 'hidden' : 'auto',
              padding: [2, 3, 6].includes(step) ? 0 : '20px 24px 28px',
            }}
          >
            {partContent}
          </div>
        </>
      ) : (
        /* Mobile: single scrollable body */
        <div className="scrollbar-hidden" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '20px 18px 28px' }}>
          <div style={{ background: 'var(--instr-bg)', borderRadius: 10, padding: '11px 14px', marginBottom: 20, font: "500 13px/1.45 'Libre Franklin'", color: 'var(--instr-ink)' }}>
            {meta.instr}
          </div>
          {partContent}
        </div>
      )}

      {/* Footer */}
      {isDesktop ? (
        <PartNavBar
          step={step}
          answers={answers}
          text={text}
          writing={writing}
          review={review}
          canBack={canBack}
          nextLabel={nextLabel}
          confirmingSubmit={confirmingSubmit}
          onBack={handleBack}
          onNext={handleNext}
          dispatch={dispatch}
        />
      ) : (
        <div className="mobile-footer" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {canBack && (
            <button
              onClick={handleBack}
              className="btn-ghost"
              style={{ background: 'var(--surface)', color: 'var(--navy)', border: '1.5px solid var(--input-border)', borderRadius: 11, padding: '14px 18px', font: "600 14px 'Libre Franklin'", cursor: 'pointer' }}
            >
              Back
            </button>
          )}
          <div style={{ flex: 1, textAlign: 'center', font: "600 13px 'Libre Franklin'", color: 'var(--muted)' }}>{partOf}</div>
          <button
            onClick={handleNext}
            aria-label={isSubmitStep && confirmingSubmit ? 'Confirm submission' : undefined}
            className={isSubmitStep && confirmingSubmit ? 'btn-danger' : 'btn-primary'}
            style={{ background: isSubmitStep && confirmingSubmit ? 'var(--red)' : 'var(--navy)', color: 'var(--surface)', border: 'none', borderRadius: 11, padding: '14px 22px', font: "700 14px 'Libre Franklin'", cursor: 'pointer' }}
          >
            {nextLabel}
          </button>
        </div>
      )}
      {/* Unanswered-questions warning dialog — replaces window.confirm */}
      {warnCount > 0 && (
        <dialog
          ref={warnDialogRef}
          onClose={() => setWarnCount(0)}
          onClick={e => { if (e.target === warnDialogRef.current) { warnDialogRef.current.close() } }}
          aria-label={`${warnCount} unanswered question${warnCount === 1 ? '' : 's'}`}
          style={{ borderRadius: 16, maxWidth: 340, width: '90%', border: 'none', padding: 0 }}
        >
          <div style={{ padding: '22px 22px 18px' }}>
            <div style={{ font: "700 17px 'Libre Franklin'", color: 'var(--navy)', marginBottom: 8 }}>
              {warnCount} unanswered question{warnCount === 1 ? '' : 's'}
            </div>
            <div style={{ font: "400 14px/1.5 'Libre Franklin'", color: 'var(--muted)', marginBottom: 22 }}>
              You can go back and answer them, or submit as-is.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { warnDialogRef.current?.close() }}
                className="btn-ghost"
                style={{ background: 'var(--surface)', color: 'var(--navy)', border: '1.5px solid var(--input-border)', borderRadius: 10, padding: '12px 18px', font: "600 14px 'Libre Franklin'", cursor: 'pointer' }}
              >
                Go back
              </button>
              <button
                onClick={() => { warnDialogRef.current?.close(); setConfirmingSubmit(true) }}
                className="btn-primary"
                style={{ background: 'var(--navy)', color: 'var(--surface)', border: 'none', borderRadius: 10, padding: '12px 18px', font: "700 14px 'Libre Franklin'", cursor: 'pointer' }}
              >
                Submit anyway
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}
