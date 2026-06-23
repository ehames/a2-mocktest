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
