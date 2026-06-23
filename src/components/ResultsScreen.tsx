import type { AppState, Action } from '../types'
import { computeResults } from '../scoring'

interface Props {
  state: AppState
  dispatch: (a: Action) => void
}

export default function ResultsScreen({ state, dispatch }: Props) {
  const { activeTest, answers, text } = state
  if (!activeTest) return null

  const r = computeResults(activeTest, answers, text)
  const ringDeg = r.pct * 3.6

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header */}
      <div style={{ background: 'var(--navy)', color: 'var(--surface)', padding: '22px 18px', flexShrink: 0 }}>
        <div style={{ font: "600 12px 'Libre Franklin'", letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--header-muted)' }}>A2 Key · Reading & Writing</div>
        <div style={{ font: "800 25px 'Libre Franklin'", marginTop: 4 }}>Your results</div>
      </div>

      {/* Scrollable body */}
      <div className="scrollbar-hidden" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '22px 18px 26px' }}>

        {/* Score ring */}
        <div role="group" aria-label="Score summary" className="animate-pop" style={{ display: 'flex', alignItems: 'center', gap: 18, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 18 }}>
          <div style={{ flexShrink: 0, width: 128, height: 128, borderRadius: '50%', background: `conic-gradient(var(--accent) ${ringDeg}deg, var(--border) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ font: "800 27px 'Libre Franklin'", color: 'var(--navy)', lineHeight: 1 }}>{r.score}</div>
              <div style={{ font: "600 11px 'Libre Franklin'", color: 'var(--muted)', marginTop: 2 }}>/ {r.total}</div>
            </div>
          </div>
          <div>
            <div style={{ font: "800 23px 'Libre Franklin'", color: 'var(--navy)' }}>{r.pct}%</div>
            <div style={{ font: "700 14px 'Libre Franklin'", color: 'var(--accent)', marginTop: 2 }}>{r.band}</div>
            <div style={{ font: "400 13px/1.4 'Libre Franklin'", color: 'var(--muted)', marginTop: 6 }}>Reading & cloze (Parts 1–5)</div>
          </div>
        </div>

        {/* Per-part breakdown */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '4px 18px', marginBottom: 20 }}>
          {r.perPart.map((pp, i) => (
            <div key={i} style={{ padding: '13px 0', borderBottom: i < r.perPart.length - 1 ? '1px solid var(--page-bg)' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, font: "600 14px 'Libre Franklin'", color: 'var(--ink)' }}>
                <span>{pp.label}</span>
                <span>{pp.score} / {pp.total}</span>
              </div>
              <div style={{ height: 6, background: 'var(--page-bg)', borderRadius: 999, overflow: 'hidden' }}>
                <div className="bar-animated" style={{ '--bar-delay': `${i * 0.08}s`, height: '100%', width: '100%', background: 'var(--accent)', borderRadius: 999, transformOrigin: 'left', transform: `scaleX(${Math.round(pp.score / pp.total * 100) / 100})` } as React.CSSProperties} />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <button
            onClick={() => dispatch({ type: 'ENTER_REVIEW' })}
            className="btn-ghost"
            style={{ flex: 1, background: 'var(--surface)', color: 'var(--navy)', border: '1.5px solid var(--input-border)', borderRadius: 12, padding: 15, font: "700 14px 'Libre Franklin'", cursor: 'pointer' }}
          >
            Review answers
          </button>
          <button
            onClick={() => dispatch({ type: 'RESTART' })}
            className="btn-primary"
            style={{ flex: 1, background: 'var(--navy)', color: 'var(--surface)', border: 'none', borderRadius: 12, padding: 15, font: "700 14px 'Libre Franklin'", cursor: 'pointer', boxShadow: 'var(--shadow-cta)' }}
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  )
}
