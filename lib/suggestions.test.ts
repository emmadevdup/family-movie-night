import { describe, it, expect } from 'vitest'
import { getSuggestions, parseTime } from './suggestions'
import type { MediaWithInterests } from './suggestions'
import type { Tables } from '@/types/database'

type Interest = Tables<'interests'>

// --- Helpers ---

function makeMedia(overrides: Partial<Tables<'media'>>): Tables<'media'> {
  return {
    id: 'media-1',
    title: 'Test Movie',
    type: 'movie',
    duration_minutes: 90,
    suggested_by: null,
    platform: null,
    genre: null,
    notes: null,
    total_seasons: null,
    total_episodes: null,
    tmdb_id: null,
    poster_url: null,
    summary: null,
    trailer_url: null,
    created_at: '',
    ...overrides,
  }
}

function makeInterest(overrides: Partial<Interest>): Interest {
  return {
    id: '',
    media_id: 'media-1',
    family_member_id: 'member-1',
    interest: 'neutral',
    watched: false,
    created_at: '',
    ...overrides,
  }
}

function makeEntry(
  mediaOverrides: Partial<Tables<'media'>>,
  interests: Interest[],
): MediaWithInterests {
  return { media: makeMedia(mediaOverrides), interests }
}

// Standard members
const A = 'member-a'
const B = 'member-b'
const C = 'member-c'

// --- parseTime ---

describe('parseTime', () => {
  it('parses "2h" → 120', () => expect(parseTime('2h')).toBe(120))
  it('parses "90min" → 90', () => expect(parseTime('90min')).toBe(90))
  it('parses "90m" → 90', () => expect(parseTime('90m')).toBe(90))
  it('parses "1h30" → 90', () => expect(parseTime('1h30')).toBe(90))
  it('parses "1h30m" → 90', () => expect(parseTime('1h30m')).toBe(90))
  it('parses bare number "90" → 90', () => expect(parseTime('90')).toBe(90))
  it('parses "3h" → 180', () => expect(parseTime('3h')).toBe(180))
  it('parses "2h15m" → 135', () => expect(parseTime('2h15m')).toBe(135))
  it('trims whitespace', () => expect(parseTime('  90  ')).toBe(90))
  it('is case-insensitive', () => expect(parseTime('90MIN')).toBe(90))
  it('returns null for invalid input', () => expect(parseTime('abc')).toBeNull())
  it('returns null for empty string', () => expect(parseTime('')).toBeNull())
})

// --- getSuggestions: List A ---

describe('getSuggestions — List A (perfect match)', () => {
  it('places a movie in List A when all present say yes and it fits', () => {
    const catalogue = [
      makeEntry({ id: 'media-1', duration_minutes: 90 }, [
        makeInterest({ media_id: 'media-1', family_member_id: A, interest: 'yes' }),
        makeInterest({ media_id: 'media-1', family_member_id: B, interest: 'yes' }),
      ]),
    ]
    const result = getSuggestions(catalogue, [A, B], [], 120)
    expect(result.listA).toHaveLength(1)
    expect(result.listA[0].media.id).toBe('media-1')
    expect(result.listB).toHaveLength(0)
    expect(result.listC1).toHaveLength(0)
    expect(result.listC2).toHaveLength(0)
  })

  it('places a neutral-interest movie in List A (neutral is willing)', () => {
    const catalogue = [
      makeEntry({ id: 'media-1', duration_minutes: 60 }, [
        makeInterest({ media_id: 'media-1', family_member_id: A, interest: 'neutral' }),
      ]),
    ]
    const result = getSuggestions(catalogue, [A], [], 90)
    expect(result.listA).toHaveLength(1)
  })

  it('places an entry with no interests at all in List A (everyone neutral by default)', () => {
    const catalogue = [makeEntry({ id: 'media-1', duration_minutes: 60 }, [])]
    const result = getSuggestions(catalogue, [A, B], [], 90)
    expect(result.listA).toHaveLength(1)
  })

  it('sorts List A by yesCount descending', () => {
    const catalogue = [
      makeEntry({ id: 'low', duration_minutes: 90 }, [
        makeInterest({ media_id: 'low', family_member_id: A, interest: 'yes' }),
      ]),
      makeEntry({ id: 'high', duration_minutes: 90 }, [
        makeInterest({ media_id: 'high', family_member_id: A, interest: 'yes' }),
        makeInterest({ media_id: 'high', family_member_id: B, interest: 'yes' }),
      ]),
    ]
    const result = getSuggestions(catalogue, [A, B], [], 120)
    expect(result.listA[0].media.id).toBe('high')
    expect(result.listA[1].media.id).toBe('low')
  })

  it('fits a series entry in List A when at least one episode fits', () => {
    const catalogue = [
      makeEntry(
        { id: 'series-1', type: 'series', duration_minutes: 45, total_seasons: 2, total_episodes: 20 },
        [makeInterest({ media_id: 'series-1', family_member_id: A, interest: 'yes' })],
      ),
    ]
    const result = getSuggestions(catalogue, [A], [], 60)
    expect(result.listA).toHaveLength(1)
    expect(result.listA[0].episodesFit).toBe(1)
  })

  it('reports correct episodesFit for series', () => {
    const catalogue = [
      makeEntry(
        { id: 'series-1', type: 'series', duration_minutes: 30, total_seasons: 1, total_episodes: 10 },
        [],
      ),
    ]
    const result = getSuggestions(catalogue, [A], [], 90)
    expect(result.listA[0].episodesFit).toBe(3)
  })
})

// --- getSuggestions: List C2 ---

describe('getSuggestions — List C2 (present member says no)', () => {
  it('moves to C2 when any present member says no', () => {
    const catalogue = [
      makeEntry({ id: 'media-1', duration_minutes: 90 }, [
        makeInterest({ media_id: 'media-1', family_member_id: A, interest: 'yes' }),
        makeInterest({ media_id: 'media-1', family_member_id: B, interest: 'no' }),
      ]),
    ]
    const result = getSuggestions(catalogue, [A, B], [], 120)
    expect(result.listC2).toHaveLength(1)
    expect(result.listA).toHaveLength(0)
    expect(result.listB).toHaveLength(0)
  })

  it('does NOT move to C2 if the no-voter is absent', () => {
    const catalogue = [
      makeEntry({ id: 'media-1', duration_minutes: 90 }, [
        makeInterest({ media_id: 'media-1', family_member_id: A, interest: 'yes' }),
        makeInterest({ media_id: 'media-1', family_member_id: B, interest: 'no' }),
      ]),
    ]
    // B is absent
    const result = getSuggestions(catalogue, [A], [B], 120)
    expect(result.listC2).toHaveLength(0)
    expect(result.listA).toHaveLength(1)
  })

  it('C2 is sorted by yesCount descending', () => {
    const catalogue = [
      makeEntry({ id: 'low', duration_minutes: 90 }, [
        makeInterest({ media_id: 'low', family_member_id: A, interest: 'no' }),
      ]),
      makeEntry({ id: 'high', duration_minutes: 90 }, [
        makeInterest({ media_id: 'high', family_member_id: A, interest: 'yes' }),
        makeInterest({ media_id: 'high', family_member_id: B, interest: 'yes' }),
        makeInterest({ media_id: 'high', family_member_id: C, interest: 'no' }),
      ]),
    ]
    const result = getSuggestions(catalogue, [A, B, C], [], 120)
    expect(result.listC2[0].media.id).toBe('high')
  })
})

// --- getSuggestions: List C1 ---

describe('getSuggestions — List C1 (too long, no other issues)', () => {
  it('places movie in C1 when it exceeds available time and has no other issues', () => {
    const catalogue = [
      makeEntry({ id: 'media-1', duration_minutes: 180 }, [
        makeInterest({ media_id: 'media-1', family_member_id: A, interest: 'yes' }),
      ]),
    ]
    const result = getSuggestions(catalogue, [A], [], 90)
    expect(result.listC1).toHaveLength(1)
    expect(result.listA).toHaveLength(0)
    expect(result.listB).toHaveLength(0)
  })

  it('places series in C1 when zero episodes fit', () => {
    const catalogue = [
      makeEntry(
        { id: 'series-1', type: 'series', duration_minutes: 60, total_seasons: 1, total_episodes: 10 },
        [],
      ),
    ]
    const result = getSuggestions(catalogue, [A], [], 30)
    expect(result.listC1).toHaveLength(1)
    expect(result.listC1[0].episodesFit).toBe(0)
  })

  it('does NOT place in C1 if entry also has other issues', () => {
    const catalogue = [
      makeEntry({ id: 'media-1', duration_minutes: 180 }, [
        makeInterest({ media_id: 'media-1', family_member_id: A, interest: 'yes', watched: true }),
      ]),
    ]
    // watched=true by present member AND too long → List B, not C1
    const result = getSuggestions(catalogue, [A], [], 90)
    expect(result.listC1).toHaveLength(0)
    expect(result.listB).toHaveLength(1)
  })
})

// --- getSuggestions: List B ---

describe('getSuggestions — List B (other issues)', () => {
  it('places in B when a present member has already watched', () => {
    const catalogue = [
      makeEntry({ id: 'media-1', duration_minutes: 90 }, [
        makeInterest({ media_id: 'media-1', family_member_id: A, interest: 'yes', watched: true }),
        makeInterest({ media_id: 'media-1', family_member_id: B, interest: 'yes' }),
      ]),
    ]
    const result = getSuggestions(catalogue, [A, B], [], 120)
    expect(result.listB).toHaveLength(1)
    const entry = result.listB[0]
    const watchedTag = entry.reasons?.find((r) => r.kind === 'already_watched')
    expect(watchedTag).toBeDefined()
    expect((watchedTag as { kind: 'already_watched'; memberId: string }).memberId).toBe(A)
  })

  it('places in B when an absent member has interest=yes', () => {
    const catalogue = [
      makeEntry({ id: 'media-1', duration_minutes: 90 }, [
        makeInterest({ media_id: 'media-1', family_member_id: A, interest: 'yes' }),
        makeInterest({ media_id: 'media-1', family_member_id: B, interest: 'yes' }),
      ]),
    ]
    // B is absent but wants to see it
    const result = getSuggestions(catalogue, [A], [B], 120)
    expect(result.listB).toHaveLength(1)
    const awayTag = result.listB[0].reasons?.find((r) => r.kind === 'away_wants')
    expect(awayTag).toBeDefined()
  })

  it('includes too_long reason tag when also over duration', () => {
    const catalogue = [
      makeEntry({ id: 'media-1', duration_minutes: 180 }, [
        makeInterest({ media_id: 'media-1', family_member_id: A, interest: 'yes', watched: true }),
      ]),
    ]
    const result = getSuggestions(catalogue, [A], [], 90)
    expect(result.listB).toHaveLength(1)
    const reasons = result.listB[0].reasons ?? []
    expect(reasons.some((r) => r.kind === 'too_long')).toBe(true)
    expect(reasons.some((r) => r.kind === 'already_watched')).toBe(true)
  })

  it('too_long reason overageMinutes is correct for movie', () => {
    const catalogue = [
      makeEntry({ id: 'media-1', duration_minutes: 120 }, [
        makeInterest({ media_id: 'media-1', family_member_id: A, watched: true }),
      ]),
    ]
    const result = getSuggestions(catalogue, [A], [], 90)
    const tooLong = result.listB[0].reasons?.find((r) => r.kind === 'too_long') as
      | { kind: 'too_long'; overageMinutes: number }
      | undefined
    expect(tooLong?.overageMinutes).toBe(30)
  })

  it('multiple reason tags can coexist on one entry', () => {
    const catalogue = [
      makeEntry({ id: 'media-1', duration_minutes: 180 }, [
        makeInterest({ media_id: 'media-1', family_member_id: A, interest: 'yes', watched: true }),
        makeInterest({ media_id: 'media-1', family_member_id: B, interest: 'yes' }),
      ]),
    ]
    // C is absent and wants to watch
    const result = getSuggestions(catalogue, [A, B], [C], 90)
    // Only A+B present, C absent. A has watched=true, duration too long, C is away with yes
    // But C's interest is not set in this entry — let's add it
    const catalogue2 = [
      makeEntry({ id: 'media-1', duration_minutes: 180 }, [
        makeInterest({ media_id: 'media-1', family_member_id: A, interest: 'yes', watched: true }),
        makeInterest({ media_id: 'media-1', family_member_id: B, interest: 'yes' }),
        makeInterest({ media_id: 'media-1', family_member_id: C, interest: 'yes' }),
      ]),
    ]
    const result2 = getSuggestions(catalogue2, [A, B], [C], 90)
    const reasons = result2.listB[0].reasons ?? []
    expect(reasons.some((r) => r.kind === 'already_watched')).toBe(true)
    expect(reasons.some((r) => r.kind === 'away_wants')).toBe(true)
    expect(reasons.some((r) => r.kind === 'too_long')).toBe(true)
  })

  it('B is sorted by yesCount descending', () => {
    const catalogue = [
      makeEntry({ id: 'low', duration_minutes: 90 }, [
        makeInterest({ media_id: 'low', family_member_id: A, interest: 'yes', watched: true }),
      ]),
      makeEntry({ id: 'high', duration_minutes: 90 }, [
        makeInterest({ media_id: 'high', family_member_id: A, interest: 'yes', watched: true }),
        makeInterest({ media_id: 'high', family_member_id: B, interest: 'yes' }),
      ]),
    ]
    const result = getSuggestions(catalogue, [A, B], [], 120)
    expect(result.listB[0].media.id).toBe('high')
  })
})

// --- getSuggestions: edge cases ---

describe('getSuggestions — edge cases', () => {
  it('returns all empty lists for an empty catalogue', () => {
    const result = getSuggestions([], [A], [], 120)
    expect(result.listA).toHaveLength(0)
    expect(result.listB).toHaveLength(0)
    expect(result.listC1).toHaveLength(0)
    expect(result.listC2).toHaveLength(0)
  })

  it('movie exactly at available time goes to List A', () => {
    const catalogue = [makeEntry({ id: 'media-1', duration_minutes: 90 }, [])]
    const result = getSuggestions(catalogue, [A], [], 90)
    expect(result.listA).toHaveLength(1)
  })

  it('movie one minute over time goes to List C1', () => {
    const catalogue = [makeEntry({ id: 'media-1', duration_minutes: 91 }, [])]
    const result = getSuggestions(catalogue, [A], [], 90)
    expect(result.listC1).toHaveLength(1)
  })

  it('absent member neutral interest is not treated as away_wants', () => {
    const catalogue = [
      makeEntry({ id: 'media-1', duration_minutes: 90 }, [
        makeInterest({ media_id: 'media-1', family_member_id: B, interest: 'neutral' }),
      ]),
    ]
    // B absent but neutral — should not block
    const result = getSuggestions(catalogue, [A], [B], 120)
    expect(result.listA).toHaveLength(1)
    expect(result.listB).toHaveLength(0)
  })

  it('present member with watched=true but interest=no → C2 (no takes priority)', () => {
    const catalogue = [
      makeEntry({ id: 'media-1', duration_minutes: 90 }, [
        makeInterest({ media_id: 'media-1', family_member_id: A, interest: 'no', watched: true }),
      ]),
    ]
    const result = getSuggestions(catalogue, [A], [], 120)
    expect(result.listC2).toHaveLength(1)
    expect(result.listB).toHaveLength(0)
  })

  it('series with no duration_minutes defaults to 30 min/ep', () => {
    const catalogue = [
      makeEntry(
        { id: 'series-1', type: 'series', duration_minutes: null, total_seasons: 1, total_episodes: 10 },
        [],
      ),
    ]
    const result = getSuggestions(catalogue, [A], [], 90)
    expect(result.listA).toHaveLength(1)
    expect(result.listA[0].episodesFit).toBe(3)
  })
})
