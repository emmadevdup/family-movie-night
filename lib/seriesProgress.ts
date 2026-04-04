/**
 * Pure helpers for series episode tracking.
 * Uses an even distribution of episodes across seasons as an approximation
 * (good enough for most shows; manual set is the escape hatch for irregular seasons).
 */

export type Position = { season: number; episode: number }

/** Episodes per season estimate — rounds so all seasons get approximately equal share. */
function epsPerSeason(totalSeasons: number, totalEpisodes: number): number {
  return Math.max(1, Math.round(totalEpisodes / totalSeasons))
}

/**
 * Given a current position, returns the next episode position.
 * Auto-advances to the next season when the current season is exhausted.
 */
export function nextEpisode(
  pos: Position,
  totalSeasons: number,
  totalEpisodes: number,
): Position {
  const eps = epsPerSeason(totalSeasons, totalEpisodes)
  const nextEp = pos.episode + 1
  if (nextEp > eps && pos.season < totalSeasons) {
    return { season: pos.season + 1, episode: 1 }
  }
  // Cap at the absolute end
  const absolute = (pos.season - 1) * eps + nextEp
  if (absolute >= totalEpisodes) {
    return absoluteToPosition(totalEpisodes, totalSeasons, totalEpisodes)
  }
  return { season: pos.season, episode: nextEp }
}

/** Converts an absolute episode number (1-based) to a season/episode position. */
function absoluteToPosition(
  absoluteEp: number,
  totalSeasons: number,
  totalEpisodes: number,
): Position {
  const eps = epsPerSeason(totalSeasons, totalEpisodes)
  const season = Math.min(Math.ceil(absoluteEp / eps), totalSeasons)
  const episode = absoluteEp - (season - 1) * eps
  return { season, episode }
}

/** Absolute episode count for a position (used for comparison and finished detection). */
export function toAbsolute(
  pos: Position,
  totalSeasons: number,
  totalEpisodes: number,
): number {
  const eps = epsPerSeason(totalSeasons, totalEpisodes)
  return Math.min((pos.season - 1) * eps + pos.episode, totalEpisodes)
}

/** Returns true when the position represents the final episode. */
export function isFinished(
  pos: Position,
  totalSeasons: number,
  totalEpisodes: number,
): boolean {
  return toAbsolute(pos, totalSeasons, totalEpisodes) >= totalEpisodes
}
