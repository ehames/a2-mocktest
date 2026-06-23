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
