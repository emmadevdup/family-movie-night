import { describe, it, expect } from 'vitest'
import { nextEpisode, isFinished, toAbsolute } from './seriesProgress'

// Helper: 3 seasons, 30 episodes total (10 per season)
const S = { seasons: 3, episodes: 30 }

describe('nextEpisode', () => {
  it('increments episode within the same season', () => {
    expect(nextEpisode({ season: 1, episode: 4 }, S.seasons, S.episodes)).toEqual({ season: 1, episode: 5 })
  })

  it('auto-advances to next season at end of season', () => {
    expect(nextEpisode({ season: 1, episode: 10 }, S.seasons, S.episodes)).toEqual({ season: 2, episode: 1 })
  })

  it('does not advance past last season', () => {
    expect(nextEpisode({ season: 3, episode: 9 }, S.seasons, S.episodes)).toEqual({ season: 3, episode: 10 })
  })

  it('stays at final episode when already there', () => {
    expect(nextEpisode({ season: 3, episode: 10 }, S.seasons, S.episodes)).toEqual({ season: 3, episode: 10 })
  })

  it('works for a single-season series', () => {
    expect(nextEpisode({ season: 1, episode: 5 }, 1, 8)).toEqual({ season: 1, episode: 6 })
  })
})

describe('isFinished', () => {
  it('returns false before the last episode', () => {
    expect(isFinished({ season: 3, episode: 9 }, S.seasons, S.episodes)).toBe(false)
  })

  it('returns true at the last episode', () => {
    expect(isFinished({ season: 3, episode: 10 }, S.seasons, S.episodes)).toBe(true)
  })

  it('returns false at the very start', () => {
    expect(isFinished({ season: 1, episode: 1 }, S.seasons, S.episodes)).toBe(false)
  })
})

describe('toAbsolute', () => {
  it('S1E1 = 1', () => {
    expect(toAbsolute({ season: 1, episode: 1 }, S.seasons, S.episodes)).toBe(1)
  })

  it('S2E1 = 11', () => {
    expect(toAbsolute({ season: 2, episode: 1 }, S.seasons, S.episodes)).toBe(11)
  })

  it('S3E10 = 30', () => {
    expect(toAbsolute({ season: 3, episode: 10 }, S.seasons, S.episodes)).toBe(30)
  })
})
