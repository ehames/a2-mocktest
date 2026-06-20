export const DURATION_MINUTES_DEFAULT = 60

export const BAND_THRESHOLDS = [
  { min: 90, label: 'Excellent' },
  { min: 75, label: 'Strong pass' },
  { min: 60, label: 'Pass' },
  { min: 40, label: 'Keep practising' },
  { min: 0,  label: 'More practice needed' },
]

export function getBand(pct: number): string {
  return BAND_THRESHOLDS.find(b => pct >= b.min)!.label
}

export const PART_META = [
  null,
  { label: 'Part 1', subtitle: 'Multiple choice · short texts',   instr: 'For each question, choose the correct answer: A, B or C.' },
  { label: 'Part 2', subtitle: 'Multiple matching',               instr: 'Three students write about after-school clubs. For each question, choose A, B or C.' },
  { label: 'Part 3', subtitle: 'Multiple choice · longer text',   instr: 'Read the text. For each question, choose the correct answer: A, B or C.' },
  { label: 'Part 4', subtitle: 'Multiple-choice cloze',           instr: 'Read the text. Choose the best word (A, B or C) for each gap.' },
  { label: 'Part 5', subtitle: 'Open cloze',                      instr: 'Read the text. Write one word in each gap.' },
  { label: 'Part 6', subtitle: 'Guided writing',                  instr: 'Write your email below. Write at least 25 words.' },
  { label: 'Part 7', subtitle: 'Story writing',                   instr: 'Write the story shown in the pictures. Write at least 35 words.' },
] as const

export const PART_SCORE_RANGES = [
  null,
  { lo: 0,  hi: 5,  total: 6  },
  { lo: 6,  hi: 12, total: 7  },
  { lo: 13, hi: 17, total: 5  },
  { lo: 18, hi: 23, total: 6  },
  { lo: 24, hi: 29, total: 6  },
]

export const LS_KEY = 'a2key_v2'
export const BANK_CACHE = 'question-banks'

export const BASE = import.meta.env.BASE_URL
