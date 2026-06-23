# Part 7 Image Prefetch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Guarantee Part 7 images are available offline from the moment a student starts the test, and warm the cache for remaining prompts in the background.

**Architecture:** A new `src/prefetch.ts` module exposes two pure side-effect functions (`prefetchImages`, `schedulePrefetch`). `loadBanks.ts` imports them: after `pick()`-ing the active Part 7 prompt it always fires the eager prefetch of the 3 selected images, then (unless `navigator.connection.saveData` is on) schedules the remaining 9 images with a 2-second delay. `WritingPart.tsx` already has an `onError` fallback that shows `pic.text`; the offline test exercises that path.

**Tech Stack:** Vitest, `@testing-library/react`, `fireEvent`, `vi.mock`, `vi.stubGlobal`, fake timers

## Global Constraints

- All tests run with `npm test` (Vitest); no new test dependencies
- No changes to App.tsx, types.ts, or the service-worker config
- `prefetchImages` must be fire-and-forget — callers never await it
- `schedulePrefetch` must do nothing when given an empty array
- The `saveData` guard uses `(navigator as any).connection?.saveData ?? false`; falsy → prefetch

---

### Task 1: `src/prefetch.ts` — prefetch utility + unit tests

**Files:**
- Create: `src/prefetch.ts`
- Create: `src/prefetch.test.ts`

**Interfaces:**
- Produces:
  - `prefetchImages(paths: string[]): void` — for each path, fires `fetch(BASE + path)`, swallows errors
  - `schedulePrefetch(paths: string[], delayMs: number): void` — `setTimeout` wrapper; no-ops on empty array

- [ ] **Step 1: Write the failing tests**

Create `src/prefetch.test.ts`:

```ts
import { vi, test, expect, describe, afterEach } from 'vitest'
import { prefetchImages, schedulePrefetch } from './prefetch'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('prefetchImages', () => {
  test('fetches each path prefixed with BASE', () => {
    const mockFetch = vi.fn().mockResolvedValue({})
    vi.stubGlobal('fetch', mockFetch)

    prefetchImages(['images/part7/foo_p1.webp', 'images/part7/foo_p2.webp'])

    // BASE in test env is '/'
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch).toHaveBeenCalledWith('/images/part7/foo_p1.webp')
    expect(mockFetch).toHaveBeenCalledWith('/images/part7/foo_p2.webp')
  })

  test('does nothing for an empty array', () => {
    const mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)

    prefetchImages([])

    expect(mockFetch).not.toHaveBeenCalled()
  })

  test('swallows fetch errors silently', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    expect(() => prefetchImages(['images/part7/foo_p1.webp'])).not.toThrow()
    // Let the rejected promise settle without an unhandled-rejection
    await new Promise(resolve => setTimeout(resolve, 0))
  })
})

describe('schedulePrefetch', () => {
  test('calls prefetchImages after the specified delay', () => {
    vi.useFakeTimers()
    const mockFetch = vi.fn().mockResolvedValue({})
    vi.stubGlobal('fetch', mockFetch)

    schedulePrefetch(['images/part7/foo_p1.webp'], 2000)

    expect(mockFetch).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2000)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith('/images/part7/foo_p1.webp')
  })

  test('does nothing for an empty array (no setTimeout scheduled)', () => {
    vi.useFakeTimers()
    const mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)

    schedulePrefetch([], 2000)
    vi.advanceTimersByTime(5000)

    expect(mockFetch).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- src/prefetch.test.ts
```

Expected: `Cannot find module './prefetch'`

- [ ] **Step 3: Implement `src/prefetch.ts`**

```ts
import { BASE } from './constants'

export function prefetchImages(paths: string[]): void {
  for (const path of paths) {
    fetch(`${BASE}${path}`).catch(() => {})
  }
}

export function schedulePrefetch(paths: string[], delayMs: number): void {
  if (paths.length === 0) return
  setTimeout(() => prefetchImages(paths), delayMs)
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- src/prefetch.test.ts
```

Expected: 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/prefetch.ts src/prefetch.test.ts
git commit -m "feat: add prefetchImages and schedulePrefetch utilities"
```

---

### Task 2: Wire prefetch into `src/loadBanks.ts` + integration tests

**Files:**
- Modify: `src/loadBanks.ts`
- Create: `src/loadBanks.test.ts`

**Interfaces:**
- Consumes: `prefetchImages`, `schedulePrefetch` from `./prefetch` (Task 1)
- `loadBanks(): Promise<ActiveTest>` — return type unchanged

- [ ] **Step 1: Write the failing integration tests**

Create `src/loadBanks.test.ts`:

```ts
import { vi, test, expect, describe, beforeEach, afterEach } from 'vitest'
import { loadBanks } from './loadBanks'
import { prefetchImages, schedulePrefetch } from './prefetch'

vi.mock('./prefetch', () => ({
  prefetchImages: vi.fn(),
  schedulePrefetch: vi.fn(),
}))

// ── Minimal bank fixtures ────────────────────────────────────────────────────

const PIC = (story: string, n: number) => ({
  label: `Picture ${n}`,
  text: `${story} scene ${n}`,
  image: `images/part7/${story}_p${n}.webp`,
})
const PROMPT = (story: string) => ({
  intro: 'Write a story.',
  storyArc: 'arc',
  characters: [{ name: 'Tom', description: 'a boy' }],
  pics: [PIC(story, 1), PIC(story, 2), PIC(story, 3)],
  minWords: 35,
})
const STORIES = ['cafe-rain', 'lost-dog', 'swim-lesson', 'birthday-gift']

const BANKS: Record<string, unknown> = {
  'part1.json': { items: Array.from({ length: 6 }, () => ({ tag: 'A', text: 't', prompt: 'p', opts: ['a','b','c'], answer: 0 })) },
  'part2.json': { sets: [{ people: [{ letter:'A', name:'N', text:'t' }, { letter:'B', name:'N', text:'t' }, { letter:'C', name:'N', text:'t' }], questions: [{ prompt:'q', answer:0 }] }] },
  'part3.json': { sets: [{ title:'T', paragraphs:['p'], questions:[{ prompt:'q', opts:['a','b','c'], answer:0 }] }] },
  'part4.json': { sets: [{ title:'T', paragraphs:['p'], questions:[{ opts:['a','b','c'], answer:0 }] }] },
  'part5.json': { sets: [{ title:'T', paragraphs:['p'], gaps:[{ accept:['the'] }] }] },
  'part6.json': { prompts:[{ intro:'i', bullets:['a','b','c'], minWords:25 }] },
  'part7.json': { prompts: STORIES.map(PROMPT) },
}

function makeFetch() {
  return vi.fn((url: string) => {
    const key = Object.keys(BANKS).find(k => url.includes(k))
    if (!key) return Promise.reject(new Error(`unexpected url: ${url}`))
    return Promise.resolve({ ok: true, json: () => Promise.resolve(BANKS[key]) })
  })
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('loadBanks prefetch integration', () => {
  beforeEach(() => {
    vi.mocked(prefetchImages).mockClear()
    vi.mocked(schedulePrefetch).mockClear()
    vi.stubGlobal('fetch', makeFetch())
    Object.defineProperty(navigator, 'connection', {
      value: { saveData: false },
      configurable: true,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('prefetches the 3 selected Part 7 images immediately', async () => {
    await loadBanks()

    expect(vi.mocked(prefetchImages)).toHaveBeenCalledOnce()
    const [paths] = vi.mocked(prefetchImages).mock.calls[0]
    expect(paths).toHaveLength(3)
    expect(paths.every((p: string) => /images\/part7\/.+\.webp/.test(p))).toBe(true)
  })

  test('schedules background prefetch for the remaining 9 images when saveData is off', async () => {
    await loadBanks()

    expect(vi.mocked(schedulePrefetch)).toHaveBeenCalledOnce()
    const [paths, delay] = vi.mocked(schedulePrefetch).mock.calls[0]
    expect(paths).toHaveLength(9)
    expect(delay).toBe(2000)
    expect(paths.every((p: string) => /images\/part7\/.+\.webp/.test(p))).toBe(true)
  })

  test('selected images are not in the background batch', async () => {
    await loadBanks()

    const [selectedPaths] = vi.mocked(prefetchImages).mock.calls[0]
    const [remainingPaths] = vi.mocked(schedulePrefetch).mock.calls[0]
    const overlap = (selectedPaths as string[]).filter((p: string) => (remainingPaths as string[]).includes(p))
    expect(overlap).toHaveLength(0)
  })

  test('skips background prefetch when saveData is on', async () => {
    Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true })

    await loadBanks()

    expect(vi.mocked(schedulePrefetch)).not.toHaveBeenCalled()
  })

  test('still prefetches selected images when saveData is on', async () => {
    Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true })

    await loadBanks()

    expect(vi.mocked(prefetchImages)).toHaveBeenCalledOnce()
    const [paths] = vi.mocked(prefetchImages).mock.calls[0]
    expect(paths).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- src/loadBanks.test.ts
```

Expected: 5 tests fail — `prefetchImages` and `schedulePrefetch` are never called

- [ ] **Step 3: Modify `src/loadBanks.ts`**

Replace the file contents with:

```ts
import type { ActiveTest, Part1Bank, Part2Bank, Part3Bank, Part4Bank, Part5Bank, Part6Bank, Part7Bank } from './types'
import { BASE } from './constants'
import { prefetchImages, schedulePrefetch } from './prefetch'

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
  const res = await fetch(`${BASE}questions/schools/${path}`)
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

  const selectedPart7 = pick(b7.prompts)

  // Always prefetch the 3 selected images — test must work offline from the start
  prefetchImages(selectedPart7.pics.map(p => p.image))

  // Background-warm the remaining prompts' images unless Data Saver is on
  const saveData = (navigator as any).connection?.saveData ?? false
  if (!saveData) {
    const remaining = b7.prompts
      .filter(p => p !== selectedPart7)
      .flatMap(p => p.pics.map(pc => pc.image))
    schedulePrefetch(remaining, 2000)
  }

  return {
    part1: shuffle(b1.items).slice(0, 6),
    part2: pick(b2.sets),
    part3: pick(b3.sets),
    part4: pick(b4.sets),
    part5: pick(b5.sets),
    part6: pick(b6.prompts),
    part7: selectedPart7,
  }
}
```

- [ ] **Step 4: Run all tests — expect pass**

```bash
npm test -- src/loadBanks.test.ts src/prefetch.test.ts
```

Expected: 10 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/loadBanks.ts src/loadBanks.test.ts
git commit -m "feat: prefetch Part 7 images on test start, background-cache remaining"
```

---

### Task 3: Offline image fallback test in `WritingPart.test.tsx`

**Files:**
- Modify: `src/components/parts/WritingPart.test.tsx`

**Context:** `PicCard` (internal to `WritingPart.tsx`) already handles `onError` by replacing the `<img>` with a `<div>` containing `pic.text`. This task adds a test that exercises that path, proving the offline scenario degrades gracefully.

- [ ] **Step 1: Edit `src/components/parts/WritingPart.test.tsx`**

Change the import at line 2 from:
```tsx
import { render, screen, cleanup } from '@testing-library/react'
```
to:
```tsx
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
```

Append after the closing brace of the existing `Part7Writing` describe block (after line 75):

```tsx
describe('Part7Writing — offline image fallback', () => {
  test('replaces each failed image with its description text', () => {
    render(<Part7Writing prompt={part7Prompt} value="" review={false} onChange={noop} />)

    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(3)

    // Simulate all three images failing to load (offline / broken URL)
    for (const img of imgs) {
      fireEvent.error(img)
    }

    // Each PicCard shows its text description instead
    expect(screen.getByText('bike / sunny')).toBeInTheDocument()
    expect(screen.getByText('rain / bus stop')).toBeInTheDocument()
    expect(screen.getByText('café / cakes')).toBeInTheDocument()

    // No img elements remain
    expect(screen.queryAllByRole('img')).toHaveLength(0)
  })

  test('only replaces the image that failed, leaving others intact', () => {
    render(<Part7Writing prompt={part7Prompt} value="" review={false} onChange={noop} />)

    const imgs = screen.getAllByRole('img')
    fireEvent.error(imgs[0])

    // First pic degraded to text
    expect(screen.getByText('bike / sunny')).toBeInTheDocument()
    // Other two images still present
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run tests — expect pass**

The `onError` fallback already exists in `WritingPart.tsx`, so both new tests should pass immediately.

```bash
npm test -- src/components/parts/WritingPart.test.tsx
```

Expected: 8 tests pass (6 existing + 2 new)

- [ ] **Step 3: Run full test suite — confirm no regressions**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/parts/WritingPart.test.tsx
git commit -m "test: verify Part 7 image offline fallback behavior"
```
