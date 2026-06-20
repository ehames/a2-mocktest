import type { ActiveTest, Part1Bank, Part2Bank, Part3Bank, Part4Bank, Part5Bank, Part6Bank, Part7Bank } from './types'
import { BASE } from './constants'

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}questions/${path}`)
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export async function loadBanks(): Promise<ActiveTest> {
  const [b1, b2, b3, b4, b5, b6, b7] = await Promise.all([
    fetchJSON<Part1Bank>('part1.json'),
    fetchJSON<Part2Bank>('part2.json'),
    fetchJSON<Part3Bank>('part3.json'),
    fetchJSON<Part4Bank>('part4.json'),
    fetchJSON<Part5Bank>('part5.json'),
    fetchJSON<Part6Bank>('part6.json'),
    fetchJSON<Part7Bank>('part7.json'),
  ])

  return {
    part1: shuffle(b1.items).slice(0, 6),
    part2: pick(b2.sets),
    part3: pick(b3.sets),
    part4: pick(b4.sets),
    part5: pick(b5.sets),
    part6: pick(b6.prompts),
    part7: pick(b7.prompts),
  }
}
