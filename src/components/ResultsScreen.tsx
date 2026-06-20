import type { AppState, Action } from '../types'
import { computeResults, wc } from '../scoring'

interface Props {
  state: AppState
  dispatch: (a: Action) => void
}

export default function ResultsScreen({ state, dispatch }: Props) {
  const { activeTest, answers, text, writing } = state
  if (!activeTest) return null

  const r = computeResults(activeTest, answers, text)
  const accent = '#5B9BD5'
  const ringDeg = r.pct * 3.6

  function writingCard(label: string, content: string, min: number) {
    const count = wc(content)
    const met = count >= min
    const hasText = content.trim().length > 0
    return (
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
          <span style={{ font: "700 15px 'Libre Franklin'", color: '#0B2447' }}>{label}</span>
          <span style={{ font: "700 12px 'Libre Franklin'", color: met ? '#2E7D32' : '#C0392B' }}>
            {count} words · min {min}
          </span>
        </div>
        <div style={hasText
          ? { fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 14, lineHeight: 1.55, color: '#1E2D40', whiteSpace: 'pre-wrap' }
          : { font: "400 14px 'Libre Franklin'", color: '#9AA7B6', fontStyle: 'italic' }
        }>
          {hasText ? content : '— No answer written —'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header */}
      <div style={{ background: '#0B2447', color: '#fff', padding: '22px 18px', flexShrink: 0 }}>
        <div style={{ font: "600 12px 'Libre Franklin'", letterSpacing: '.14em', textTransform: 'uppercase', color: '#9FB3CC' }}>A2 Key · Reading & Writing</div>
        <div style={{ font: "800 25px 'Libre Franklin'", marginTop: 4 }}>Your results</div>
      </div>

      {/* Scrollable body */}
      <div className="scrollbar-hidden" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '22px 18px 26px' }}>

        {/* Score ring */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20, marginBottom: 18 }}>
          <div style={{ flexShrink: 0, width: 128, height: 128, borderRadius: '50%', background: `conic-gradient(${accent} ${ringDeg}deg, #E2E8F0 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ font: "800 27px 'Libre Franklin'", color: '#0B2447', lineHeight: 1 }}>{r.score}</div>
              <div style={{ font: "600 11px 'Libre Franklin'", color: '#5B6B7F', marginTop: 2 }}>/ {r.total}</div>
            </div>
          </div>
          <div>
            <div style={{ font: "800 23px 'Libre Franklin'", color: '#0B2447' }}>{r.pct}%</div>
            <div style={{ font: "700 14px 'Libre Franklin'", color: accent, marginTop: 2 }}>{r.band}</div>
            <div style={{ font: "400 13px/1.4 'Libre Franklin'", color: '#5B6B7F', marginTop: 6 }}>Reading & cloze (Parts 1–5)</div>
          </div>
        </div>

        {/* Per-part breakdown */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '4px 18px', marginBottom: 20 }}>
          {r.perPart.map((pp, i) => (
            <div key={i} style={{ padding: '13px 0', borderBottom: i < r.perPart.length - 1 ? '1px solid #EEF1F5' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, font: "600 14px 'Libre Franklin'", color: '#16263D' }}>
                <span>{pp.label}</span>
                <span>{pp.score} / {pp.total}</span>
              </div>
              <div style={{ height: 6, background: '#EEF1F5', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round(pp.score / pp.total * 100)}%`, background: accent, borderRadius: 999, transition: 'width .4s ease' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Writing review */}
        <div style={{ font: "700 12px 'Libre Franklin'", letterSpacing: '.1em', textTransform: 'uppercase', color: '#5B6B7F', margin: '0 0 11px' }}>
          Writing — review yourself
        </div>
        {writingCard('Part 6 — Email', writing[6], activeTest.part6.minWords)}
        {writingCard('Part 7 — Story', writing[7], activeTest.part7.minWords)}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <button
            onClick={() => dispatch({ type: 'ENTER_REVIEW' })}
            style={{ flex: 1, background: '#fff', color: '#0B2447', border: '1.5px solid #C2CEDC', borderRadius: 12, padding: 15, font: "700 14px 'Libre Franklin'", cursor: 'pointer' }}
          >
            Review answers
          </button>
          <button
            onClick={() => dispatch({ type: 'RESTART' })}
            style={{ flex: 1, background: '#0B2447', color: '#fff', border: 'none', borderRadius: 12, padding: 15, font: "700 14px 'Libre Franklin'", cursor: 'pointer' }}
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  )
}
