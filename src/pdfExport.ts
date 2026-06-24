import type { AppState } from './types'
import { computeResults } from './scoring'
import { DURATION_MINUTES_DEFAULT } from './constants'

const TOTAL_SECONDS = DURATION_MINUTES_DEFAULT * 60

function esc(s: string): string {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function wc(s: string): number {
  const t = (s ?? '').trim()
  return t ? t.split(/\s+/).length : 0
}

function letter(i: number): string {
  return ['A', 'B', 'C'][i] ?? String(i)
}

function formatTime(used: number): string {
  const m = Math.floor(used / 60)
  const s = used % 60
  return `${m} min ${String(s).padStart(2, '0')} sec`
}

// Replace "(N) ___" gap markers with inline badge spans
function renderPassage(paragraphs: string[]): string {
  return paragraphs
    .map(p => {
      const content = esc(p).replace(
        /\((\d+)\) ___/g,
        (_, n) => `<span class="gn">${n}</span>`
      )
      return `<p>${content}</p>`
    })
    .join('')
}

function mcOptions(
  opts: [string, string, string],
  studentIdx: number | undefined,
  correctIdx: number
): string {
  return opts
    .map((opt, i) => {
      const isStudentChoice = studentIdx === i
      const isCorrect = correctIdx === i
      let badgeClass = 'n'
      let mark = ''
      if (isStudentChoice && isCorrect) { badgeClass = 'c'; mark = '<span class="mk c">✓</span>' }
      else if (isStudentChoice && !isCorrect) { badgeClass = 'w'; mark = '<span class="mk w">✗</span>' }
      else if (!isStudentChoice && isCorrect) { badgeClass = 'c'; mark = '<span class="mk c">✓</span>' }
      const labelClass = !isStudentChoice && !isCorrect ? ' f' : ''
      return `<div class="or"><div class="ob ${badgeClass}">${letter(i)}</div><span class="ol${labelClass}">${esc(opt)}</span>${mark}</div>`
    })
    .join('')
}

function correctNote(studentIdx: number | undefined, correctIdx: number): string {
  if (studentIdx === correctIdx) return ''
  const prefix = studentIdx === undefined ? '► Not answered — correct answer:' : '► Correct answer:'
  return `<div class="cn">${prefix} ${letter(correctIdx)}</div>`
}

function rationale(r: string | undefined): string {
  if (!r) return ''
  return `<div class="rat">${esc(r)}</div>`
}

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,'Segoe UI',system-ui,sans-serif;background:#C8D0DB;padding:20px 12px 48px;color:#16263D;font-size:14px}
.page{background:#fff;max-width:680px;margin:0 auto 6px;box-shadow:0 1px 3px rgba(0,0,0,.2),0 4px 18px rgba(0,0,0,.1);overflow:hidden}
.doc-header{background:#0B2447;padding:22px 30px}
.ey{font-size:9.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.38);margin-bottom:4px}
.dt{font-size:19px;font-weight:800;color:#fff;margin-bottom:18px}
.mr{display:flex;flex-wrap:wrap;gap:28px}
.mf{display:flex;flex-direction:column;gap:2px}
.ml{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.38)}
.mv{font-size:13px;font-weight:600;color:#fff}
.ss{padding:18px 30px;display:flex;gap:22px;align-items:center;border-bottom:1px solid #E8EDF4}
.rg{flex-shrink:0;width:78px;height:78px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.ri{width:56px;height:56px;border-radius:50%;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}
.rs{font-size:18px;font-weight:800;color:#0B2447;line-height:1}
.rd{font-size:9.5px;color:#8496AA}
.sm{flex:1}
.sp{font-size:26px;font-weight:800;color:#0B2447;line-height:1}
.sb{font-size:12.5px;font-weight:700;color:#5B9BD5;margin:3px 0 8px}
.sl{font-size:11.5px;color:#8496AA}
.st{width:100%;border-collapse:collapse}
.st th{font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8496AA;padding:6px 10px;border-bottom:1px solid #E8EDF4;text-align:left}
.st td{padding:7px 10px;font-size:12.5px;border-bottom:1px solid #F2F5F9;vertical-align:middle;color:#16263D;font-variant-numeric:tabular-nums}
.st td:nth-child(2){width:52px;font-weight:700;color:#0B2447}
.st td:nth-child(3){width:160px}
.mb{height:4px;background:#DDE3EC;border-radius:999px;overflow:hidden}
.mf2{height:100%;background:#5B9BD5;border-radius:999px}
.wn{font-size:10px;color:#8496AA;font-style:italic}
.ph{display:flex;align-items:center;gap:10px;padding:13px 30px 11px;border-bottom:1px solid #F2F5F9;border-top:3px solid #0B2447}
.pt{font-size:9.5px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:#5B9BD5}
.pn{font-size:13.5px;font-weight:700;color:#0B2447}
.pp{margin-left:auto;font-size:11.5px;font-weight:700;color:#5B6B7F;background:#EEF1F5;padding:2px 11px;border-radius:999px;font-variant-numeric:tabular-nums}
.pb{padding:18px 30px}
.qi{margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #F2F5F9}
.qi:last-child{margin-bottom:0;padding-bottom:0;border-bottom:none}
.qm{display:flex;align-items:center;gap:7px;margin-bottom:6px}
.qn{font-size:10px;font-weight:800;color:#0B2447;background:#EEF1F5;padding:1px 7px;border-radius:4px;font-variant-numeric:tabular-nums}
.qt{font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8496AA}
.qs{font-size:12.5px;line-height:1.55;color:#16263D;background:#F7F9FB;border-left:3px solid #C6D0DC;padding:7px 12px;border-radius:0 6px 6px 0;margin-bottom:8px;font-style:italic}
.qp{font-size:12.5px;font-weight:600;color:#16263D;margin-bottom:6px}
.or{display:flex;align-items:center;gap:8px;padding:3.5px 0}
.ob{width:21px;height:21px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;flex-shrink:0}
.ob.n{background:#ECEEF2;color:#8496AA}
.ob.c{background:#EAF6EE;color:#2E7D32}
.ob.w{background:#FCEDED;color:#C62828}
.ol{flex:1;font-size:12.5px;color:#16263D}
.ol.f{color:#B0BACA}
.mk{font-size:12px;font-weight:800;width:16px;text-align:right;flex-shrink:0}
.mk.c{color:#2E7D32}
.mk.w{color:#C62828}
.cn{font-size:10.5px;color:#2E7D32;font-weight:700;margin-top:5px;padding-left:4px}
.pc{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
.pcd{border:1px solid #DDE3EC;border-radius:8px;padding:10px 11px;font-size:11.5px;line-height:1.5;color:#16263D}
.pb2{width:22px;height:22px;border-radius:50%;background:#0B2447;color:#fff;font-size:11.5px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-bottom:5px}
.pnl{font-size:11.5px;font-weight:700;color:#0B2447;margin-bottom:3px}
.mr2{display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #F2F5F9;font-size:12.5px}
.mr2:last-child{border-bottom:none}
.mn{font-weight:700;color:#8496AA;font-size:10.5px;width:22px;flex-shrink:0;text-align:center}
.mp{flex:1;color:#16263D}
.ma{font-size:11px;font-weight:700;padding:2px 9px;border-radius:4px;flex-shrink:0}
.ma.c{background:#EAF6EE;color:#2E7D32}
.ma.w{background:#FCEDED;color:#C62828}
.mca{font-size:11px;color:#5B6B7F;font-weight:600;flex-shrink:0}
.pbox{background:#F7F9FB;border:1px solid #DDE3EC;border-radius:8px;padding:13px 17px;margin-bottom:16px;font-size:13px;line-height:1.7;font-family:Georgia,'Times New Roman',serif;color:#16263D}
.pbox p+p{margin-top:8px}
.ptl{font-family:-apple-system,'Segoe UI',system-ui,sans-serif;font-size:12.5px;font-weight:700;color:#0B2447;margin-bottom:9px}
.gn{display:inline-flex;align-items:center;justify-content:center;width:18px;height:15px;background:#0B2447;color:#fff;font-family:-apple-system,'Segoe UI',system-ui,sans-serif;font-size:8.5px;font-weight:800;border-radius:3px;vertical-align:middle;margin:0 2px;position:relative;top:-1px}
.ct{width:100%;border-collapse:collapse;font-size:12.5px;font-variant-numeric:tabular-nums}
.ct th{font-size:9.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8496AA;padding:5px 10px;border-bottom:2px solid #DDE3EC;text-align:left}
.ct td{padding:7px 10px;border-bottom:1px solid #F2F5F9;vertical-align:middle;color:#16263D}
.ct tr:last-child td{border-bottom:none}
.ct td:first-child{text-align:center;font-weight:800;color:#0B2447;width:38px}
.ct td:nth-child(2){font-weight:600}
.rp{display:inline-flex;align-items:center;gap:3px;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:999px}
.rp.c{background:#EAF6EE;color:#2E7D32}
.rp.w{background:#FCEDED;color:#C62828}
.aw{font-size:11.5px;color:#5B6B7F}
.wpb{background:#F5F7FB;border:1px solid #D5DCE8;border-radius:8px;padding:13px 16px;margin-bottom:13px;font-size:12.5px;line-height:1.6}
.wpb p{color:#16263D}
.wpb p+p{margin-top:7px}
.wpb ul{padding-left:16px;margin-top:6px;color:#16263D}
.wpb li{margin-bottom:3px}
.stb{border:1px solid #D5DCE8;border-radius:8px;padding:13px 16px;font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:1.8;color:#16263D;white-space:pre-wrap;word-break:break-word}
.wc{text-align:right;font-size:10.5px;color:#8496AA;margin-top:6px}
.rat{font-size:11px;color:#5B6B7F;font-style:italic;margin-top:5px;padding:4px 8px;background:#F7F9FB;border-radius:4px;line-height:1.45}
@media print{
  body{background:#fff;padding:0}
  .page{max-width:none;box-shadow:none;margin:0;page-break-after:always}
  .page:last-child{page-break-after:avoid}
}
`

export function generatePdfHtml(state: AppState, p7ImageUrls: string[] = []): string {
  const { activeTest, answers, text, writing, name, secondsLeft } = state
  if (!activeTest) return ''

  const r = computeResults(activeTest, answers, text)
  const ringDeg = r.pct * 3.6
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const timeUsed = TOTAL_SECONDS - secondsLeft
  const timeStr = timeUsed > 0 ? formatTime(timeUsed) : '—'

  // ── Score summary page ──────────────────────────────────────────────────
  const scorePage = `
<div class="page">
  <div class="doc-header">
    <div class="ey">Cambridge English · Mock Test Report</div>
    <div class="dt">A2 Key — Reading &amp; Writing</div>
    <div class="mr">
      <div class="mf"><span class="ml">Student</span><span class="mv">${esc(name || '—')}</span></div>
      <div class="mf"><span class="ml">Date completed</span><span class="mv">${dateStr}</span></div>
      <div class="mf"><span class="ml">Time used</span><span class="mv">${timeStr}</span></div>
    </div>
  </div>
  <div class="ss">
    <div class="rg" style="background:conic-gradient(#5B9BD5 ${ringDeg}deg,#DDE3EC 0)">
      <div class="ri">
        <span class="rs">${r.score}</span>
        <span class="rd">/ ${r.total}</span>
      </div>
    </div>
    <div class="sm">
      <div class="sp">${r.pct}%</div>
      <div class="sb">${esc(r.band)}</div>
      <div class="sl">Reading &amp; cloze (Parts 1–5)</div>
    </div>
  </div>
  <div style="padding:0 30px 22px">
    <table class="st">
      <thead><tr><th>Part</th><th>Score</th><th>Progress</th></tr></thead>
      <tbody>
        ${r.perPart.map((pp, i) => `
        <tr>
          <td>${esc(pp.label)}${i >= 5 ? ` <span class="wn">(see full text below)</span>` : ''}</td>
          <td>${i >= 5 ? '—' : `${pp.score} / ${pp.total}`}</td>
          <td>${i < 5 ? `<div class="mb"><div class="mf2" style="width:${Math.round(pp.score / pp.total * 100)}%"></div></div>` : ''}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>`

  // ── Part 1 ──────────────────────────────────────────────────────────────
  const p1Items = activeTest.part1.map((item, i) => {
    const studentIdx = answers[i]
    return `
<div class="qi">
  <div class="qm"><span class="qn">${i + 1}</span><span class="qt">${esc(item.tag)}</span></div>
  <div class="qs">${esc(item.text)}</div>
  <div class="qp">${esc(item.prompt)}</div>
  ${mcOptions(item.opts, studentIdx, item.answer)}
  ${correctNote(studentIdx, item.answer)}
  ${rationale(item.rationale)}
</div>`
  }).join('')

  const part1Page = `
<div class="page">
  <div class="ph">
    <span class="pt">Part 1</span>
    <span class="pn">Short Texts — Multiple Choice</span>
    <span class="pp">${r.perPart[0].score} / ${r.perPart[0].total}</span>
  </div>
  <div class="pb">${p1Items}</div>
</div>`

  // ── Part 2 ──────────────────────────────────────────────────────────────
  const { people, questions: p2qs } = activeTest.part2
  const personCards = people.map((p, i) => `
<div class="pcd">
  <div class="pb2">${letter(i)}</div>
  <div class="pnl">${esc(p.name)}</div>
  ${esc(p.text)}
</div>`).join('')

  const matchRows = p2qs.map((q, i) => {
    const studentIdx = answers[6 + i]
    const isCorrect = studentIdx === q.answer
    const studentLabel = studentIdx !== undefined ? `${letter(studentIdx)} ${isCorrect ? '✓' : '✗'}` : '—'
    const showCorrect = studentIdx === undefined || !isCorrect
    return `
<div class="mr2" style="flex-wrap:wrap">
  <span class="mn">${i + 7}</span>
  <span class="mp">${esc(q.prompt)}</span>
  <span class="ma ${isCorrect ? 'c' : 'w'}">${studentLabel}</span>
  ${showCorrect ? `<span class="mca">→ Correct: ${letter(q.answer)}</span>` : ''}
  ${q.rationale ? `<div style="flex-basis:100%;padding-left:32px">${rationale(q.rationale)}</div>` : ''}
</div>`
  }).join('')

  const part2Page = `
<div class="page">
  <div class="ph">
    <span class="pt">Part 2</span>
    <span class="pn">Matching</span>
    <span class="pp">${r.perPart[1].score} / ${r.perPart[1].total}</span>
  </div>
  <div class="pb">
    <div class="pc">${personCards}</div>
    ${matchRows}
  </div>
</div>`

  // ── Part 3 ──────────────────────────────────────────────────────────────
  const p3qs = activeTest.part3.questions.map((q, i) => {
    const studentIdx = answers[13 + i]
    return `
<div class="qi">
  <div class="qm"><span class="qn">${13 + i}</span></div>
  <div class="qp">${esc(q.prompt)}</div>
  ${mcOptions(q.opts, studentIdx, q.answer)}
  ${correctNote(studentIdx, q.answer)}
  ${rationale(q.rationale)}
</div>`
  }).join('')

  const part3Page = `
<div class="page">
  <div class="ph">
    <span class="pt">Part 3</span>
    <span class="pn">Long Text — Multiple Choice</span>
    <span class="pp">${r.perPart[2].score} / ${r.perPart[2].total}</span>
  </div>
  <div class="pb">
    <div class="pbox">
      <div class="ptl">${esc(activeTest.part3.title)}</div>
      ${renderPassage(activeTest.part3.paragraphs)}
    </div>
    ${p3qs}
  </div>
</div>`

  // ── Part 4 ──────────────────────────────────────────────────────────────
  const p4qs = activeTest.part4.questions.map((q, i) => {
    const studentIdx = answers[18 + i]
    return `
<div class="qi">
  <div class="qm"><span class="qn">${18 + i}</span><span class="qt">Gap ${i + 1}</span></div>
  ${mcOptions(q.opts, studentIdx, q.answer)}
  ${correctNote(studentIdx, q.answer)}
  ${rationale(q.rationale)}
</div>`
  }).join('')

  const part4Page = `
<div class="page">
  <div class="ph">
    <span class="pt">Part 4</span>
    <span class="pn">Multiple-choice Cloze</span>
    <span class="pp">${r.perPart[3].score} / ${r.perPart[3].total}</span>
  </div>
  <div class="pb">
    <div class="pbox">
      <div class="ptl">${esc(activeTest.part4.title)}</div>
      ${renderPassage(activeTest.part4.paragraphs)}
    </div>
    ${p4qs}
  </div>
</div>`

  // ── Part 5 ──────────────────────────────────────────────────────────────
  const p5rows = activeTest.part5.gaps.map((g, i) => {
    const studentWord = (text[i] ?? '').trim()
    const isCorrect = g.accept.includes(studentWord.toLowerCase())
    const rationaleRow = g.rationale
      ? `<tr><td></td><td colspan="3" style="padding-top:0;padding-bottom:8px"><div class="rat">${esc(g.rationale)}</div></td></tr>`
      : ''
    return `
<tr>
  <td>${i + 1}</td>
  <td>${esc(studentWord) || '<em style="color:#8496AA">—</em>'}</td>
  <td><span class="rp ${isCorrect ? 'c' : 'w'}">${isCorrect ? '✓ Correct' : '✗ Incorrect'}</span></td>
  <td class="aw">${g.accept.map(esc).join(', ')}</td>
</tr>${rationaleRow}`
  }).join('')

  const part5Page = `
<div class="page">
  <div class="ph">
    <span class="pt">Part 5</span>
    <span class="pn">Open Cloze</span>
    <span class="pp">${r.perPart[4].score} / ${r.perPart[4].total}</span>
  </div>
  <div class="pb">
    <div class="pbox">
      <div class="ptl">${esc(activeTest.part5.title)}</div>
      ${renderPassage(activeTest.part5.paragraphs)}
    </div>
    <table class="ct">
      <thead>
        <tr>
          <th style="text-align:center">Gap</th>
          <th>Student's answer</th>
          <th>Result</th>
          <th>Accepted answers</th>
        </tr>
      </thead>
      <tbody>${p5rows}</tbody>
    </table>
  </div>
</div>`

  // ── Part 6 ──────────────────────────────────────────────────────────────
  const { intro: p6intro, bullets, minWords: p6min } = activeTest.part6
  const p6text = writing[6] ?? ''
  const p6wc = wc(p6text)

  const part6Page = `
<div class="page">
  <div class="ph">
    <span class="pt">Part 6</span>
    <span class="pn">Guided Writing</span>
  </div>
  <div class="pb">
    <div class="wpb">
      <p>${esc(p6intro)}</p>
      <p>Write your response. Include these points:</p>
      <ul>${bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    </div>
    <div class="stb">${esc(p6text) || '<em style="color:#8496AA">(no response)</em>'}</div>
    <div class="wc">${p6wc} word${p6wc !== 1 ? 's' : ''} &nbsp;·&nbsp; Minimum: ${p6min} words</div>
  </div>
</div>`

  // ── Part 7 ──────────────────────────────────────────────────────────────
  const { intro: p7intro, pics, minWords: p7min } = activeTest.part7
  const p7text = writing[7] ?? ''
  const p7wc = wc(p7text)

  const picCards = pics.map((pic, i) => {
    const src = p7ImageUrls[i] ?? ''
    const imgHtml = src
      ? `<img src="${src}" alt="${esc(pic.label)}" style="width:100%;height:auto;display:block;border-radius:5px;margin-bottom:6px">`
      : `<div style="width:100%;aspect-ratio:1;background:#EEF1F5;border-radius:5px;display:flex;align-items:center;justify-content:center;margin-bottom:6px;font-size:11px;color:#8496AA">Image unavailable</div>`
    return `
<div style="flex:1;min-width:0;break-inside:avoid;page-break-inside:avoid">
  ${imgHtml}
  <div style="font-size:11px;font-weight:700;color:#0B2447;margin-bottom:2px">${esc(pic.label)}</div>
  <div style="font-size:11px;color:#5B6B7F;line-height:1.4">${esc(pic.text)}</div>
</div>`
  }).join('')

  const part7Page = `
<div class="page">
  <div class="ph">
    <span class="pt">Part 7</span>
    <span class="pn">Story Writing</span>
  </div>
  <div class="pb">
    <div class="wpb">
      <p>${esc(p7intro)}</p>
    </div>
    <div style="display:flex;gap:12px;margin-bottom:16px;break-inside:avoid;page-break-inside:avoid">${picCards}</div>
    <div class="stb">${esc(p7text) || '<em style="color:#8496AA">(no response)</em>'}</div>
    <div class="wc">${p7wc} word${p7wc !== 1 ? 's' : ''} &nbsp;·&nbsp; Minimum: ${p7min} words</div>
  </div>
</div>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>A2 Key Mock Test — ${esc(name || 'Student')}</title>
<style>${CSS}</style>
</head>
<body>
${scorePage}
${part1Page}
${part2Page}
${part3Page}
${part4Page}
${part5Page}
${part6Page}
${part7Page}
</body>
</html>`
}

async function toDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function openPdf(state: AppState): Promise<void> {
  const pics = state.activeTest?.part7.pics ?? []
  const p7ImageUrls = await Promise.all(
    pics.map(async (pic) => {
      try {
        const url = new URL(pic.image, document.baseURI).href
        return await toDataUrl(url)
      } catch {
        return ''
      }
    })
  )

  const html = generatePdfHtml(state, p7ImageUrls)
  const win = window.open('', '_blank')
  if (!win) {
    alert('Pop-up blocked. Please allow pop-ups for this site and try again.')
    return
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 300)
}
