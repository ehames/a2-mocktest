type Variant = 'row' | 'inline' | 'letter'
type State = 'idle' | 'selected' | 'correct' | 'wrong'

interface Props {
  letter: 'A' | 'B' | 'C'
  label?: string
  variant: Variant
  optionState: State
  onClick?: () => void
  showMark?: boolean
}

const C = {
  navy: '#0B2447', ink: '#16263D', border: '#DCE3EC', bb: '#C2CEDC',
  green: '#2E7D32', greenBg: '#EAF6EE', red: '#C62828', redBg: '#FCEDED',
}

export default function OptionRow({ letter, label, variant, optionState, onClick, showMark }: Props) {
  const st = optionState
  const isCorrect = st === 'correct'
  const isWrong = st === 'wrong'

  let bd = C.border, bg = '#fff', tx = C.ink
  let bBg = '#fff', bBd = C.bb, bTx = C.navy

  if (variant === 'letter' && st === 'idle') { tx = C.navy }
  if (st === 'selected')  { bd = C.navy;       bg = C.navy;       tx = '#fff';  bBg = '#fff';      bBd = '#fff';  bTx = C.navy }
  if (st === 'correct')   { bd = C.green;      bg = C.greenBg;    tx = C.ink;   bBg = C.green;     bBd = C.green; bTx = '#fff' }
  if (st === 'wrong')     { bd = C.red;        bg = C.redBg;      tx = C.ink;   bBg = C.red;       bBd = C.red;   bTx = '#fff' }

  const cursor = onClick ? 'pointer' : 'default'

  if (variant === 'row') {
    return (
      <button
        onClick={onClick}
        style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: 14, borderRadius: 12, border: `1.5px solid ${bd}`, background: bg, color: tx, font: "500 15px/1.45 'Libre Franklin',sans-serif", cursor, minHeight: 54 }}
      >
        <span style={{ flex: 'none', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "700 13px 'Libre Franklin'", border: `1.5px solid ${bBd}`, color: bTx, background: bBg }}>
          {letter}
        </span>
        <span style={{ flex: 1 }}>{label}</span>
        {showMark && (
          <span style={{ marginLeft: 'auto', font: "800 16px 'Libre Franklin'", color: isCorrect ? C.green : C.red }}>
            {isCorrect ? '✓' : '✗'}
          </span>
        )}
      </button>
    )
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={onClick}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 13px', borderRadius: 10, border: `1.5px solid ${bd}`, background: bg, color: tx, font: "600 15px 'Libre Franklin'", cursor }}
      >
        <span style={{ flex: 'none', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "700 11px 'Libre Franklin'", border: `1.5px solid ${bBd}`, color: bTx, background: bBg }}>
          {letter}
        </span>
        <span>{label}</span>
        {showMark && (
          <span style={{ font: "800 14px 'Libre Franklin'", color: isCorrect ? C.green : C.red }}>
            {isCorrect ? '✓' : isWrong ? '✗' : ''}
          </span>
        )}
      </button>
    )
  }

  // letter variant (Part 2 A/B/C square buttons)
  return (
    <button
      onClick={onClick}
      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '13px 0', borderRadius: 10, border: `1.5px solid ${bd}`, background: bg, color: tx, font: "700 17px 'Libre Franklin'", cursor, minHeight: 50 }}
    >
      {letter}
      {showMark && (
        <span style={{ font: "800 14px 'Libre Franklin'", color: isCorrect ? C.green : C.red }}>
          {isCorrect ? '✓' : '✗'}
        </span>
      )}
    </button>
  )
}
