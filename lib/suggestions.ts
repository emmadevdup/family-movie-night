/**
 * Movie night suggestion algorithm.
 * Pure function — no side effects, no Supabase calls.
 * Input: catalogue data + session inputs → output: lists A, B, C1, C2.
 */

import type { Tables } from '@/types/database'

type Media = Tables<'media'>
type Interest = Tables<'interests'>

export type MediaWithInterests = { media: Media; interests: Interest[] }

export type ReasonTag =
  | { kind: 'away_wants'; memberId: string }
  | { kind: 'already_watched'; memberId: string }
  | { kind: 'too_long'; overageMinutes: number }

export type SuggestionEntry = {
  media: Media
  interests: Interest[]
  yesCount: number
  episodesFit?: number
  reasons?: ReasonTag[]
}

export type SuggestionResult = {
  listA: SuggestionEntry[]
  listB: SuggestionEntry[]
  listC1: SuggestionEntry[]
  listC2: SuggestionEntry[]
}

export function getSuggestions(
  catalogue: MediaWithInterests[],
  presentIds: string[],
  absentIds: string[],
  availableMinutes: number,
): SuggestionResult {
  const listA: SuggestionEntry[] = []
  const listB: SuggestionEntry[] = []
  const listC1: SuggestionEntry[] = []
  const listC2: SuggestionEntry[] = []

  for (const { media, interests } of catalogue) {
    const getInterest = (id: string) => interests.find((i) => i.family_member_id === id)

    const yesCount = presentIds.filter((id) => getInterest(id)?.interest === 'yes').length

    // Hard exclusion: any present member has interest = 'no' → C2
    const presentNos = presentIds.filter((id) => getInterest(id)?.interest === 'no')
    if (presentNos.length > 0) {
      listC2.push({ media, interests, yesCount })
      continue
    }

    // Non-duration disqualifiers for List A
    const presentWatched = presentIds.filter((id) => getInterest(id)?.watched === true)
    const absentYes = absentIds.filter((id) => getInterest(id)?.interest === 'yes')
    const hasOtherIssues = presentWatched.length > 0 || absentYes.length > 0

    // Duration check
    let fits = false
    let episodesFit: number | undefined
    let overageMinutes = 0

    if (media.type === 'movie') {
      const duration = media.duration_minutes ?? 0
      fits = duration <= availableMinutes
      overageMinutes = duration - availableMinutes
    } else {
      const epLen = media.duration_minutes ?? 30
      episodesFit = Math.floor(availableMinutes / epLen)
      fits = episodesFit >= 1
      overageMinutes = epLen - availableMinutes
    }

    if (!hasOtherIssues && fits) {
      // List A — perfect match
      listA.push({ media, interests, yesCount, episodesFit })
    } else if (!hasOtherIssues && !fits) {
      // List C1 — would be perfect but too long
      listC1.push({ media, interests, yesCount, episodesFit })
    } else {
      // List B — has other issues (± also too long)
      const reasons: ReasonTag[] = [
        ...absentYes.map((id) => ({ kind: 'away_wants' as const, memberId: id })),
        ...presentWatched.map((id) => ({ kind: 'already_watched' as const, memberId: id })),
        ...(!fits ? [{ kind: 'too_long' as const, overageMinutes: Math.ceil(overageMinutes) }] : []),
      ]
      listB.push({ media, interests, yesCount, reasons, episodesFit })
    }
  }

  const byYes = (a: SuggestionEntry, b: SuggestionEntry) => b.yesCount - a.yesCount

  return {
    listA: listA.sort(byYes),
    listB: listB.sort(byYes),
    listC1: listC1.sort(byYes),
    listC2: listC2.sort(byYes),
  }
}

/** Parse time strings like "2h", "90min", "1h30", "1h30m", "90" into minutes. */
export function parseTime(input: string): number | null {
  const s = input.trim().toLowerCase()
  const hm = s.match(/^(\d+)h(\d+)m?$/)
  if (hm) return parseInt(hm[1]) * 60 + parseInt(hm[2])
  const h = s.match(/^(\d+)h$/)
  if (h) return parseInt(h[1]) * 60
  const m = s.match(/^(\d+)m(?:in)?$/)
  if (m) return parseInt(m[1])
  const n = s.match(/^(\d+)$/)
  if (n) return parseInt(n[1])
  return null
}
