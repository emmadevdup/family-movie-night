import { describe, it, expect } from 'vitest'
import { selectTrailer, posterUrl } from './tmdb'

describe('selectTrailer', () => {
  it('returns YouTube trailer URL for first matching video', () => {
    const videos = [
      { key: 'abc123', site: 'YouTube', type: 'Trailer' },
    ]
    expect(selectTrailer(videos)).toBe('https://www.youtube.com/watch?v=abc123')
  })

  it('ignores non-Trailer types', () => {
    const videos = [
      { key: 'clip1', site: 'YouTube', type: 'Clip' },
      { key: 'trailer1', site: 'YouTube', type: 'Trailer' },
    ]
    expect(selectTrailer(videos)).toBe('https://www.youtube.com/watch?v=trailer1')
  })

  it('ignores non-YouTube sites', () => {
    const videos = [
      { key: 'vimeo1', site: 'Vimeo', type: 'Trailer' },
      { key: 'yt1', site: 'YouTube', type: 'Trailer' },
    ]
    expect(selectTrailer(videos)).toBe('https://www.youtube.com/watch?v=yt1')
  })

  it('returns null when no matching video exists', () => {
    const videos = [
      { key: 'clip1', site: 'YouTube', type: 'Clip' },
      { key: 'vimeo1', site: 'Vimeo', type: 'Trailer' },
    ]
    expect(selectTrailer(videos)).toBeNull()
  })

  it('returns null for empty array', () => {
    expect(selectTrailer([])).toBeNull()
  })

  it('picks the first trailer when multiple exist', () => {
    const videos = [
      { key: 'first', site: 'YouTube', type: 'Trailer' },
      { key: 'second', site: 'YouTube', type: 'Trailer' },
    ]
    expect(selectTrailer(videos)).toBe('https://www.youtube.com/watch?v=first')
  })
})

describe('posterUrl', () => {
  it('constructs w500 URL', () => {
    expect(posterUrl('/abc.jpg', 'w500')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg')
  })

  it('constructs w780 URL', () => {
    expect(posterUrl('/abc.jpg', 'w780')).toBe('https://image.tmdb.org/t/p/w780/abc.jpg')
  })

  it('returns null when path is null', () => {
    expect(posterUrl(null, 'w500')).toBeNull()
  })
})
