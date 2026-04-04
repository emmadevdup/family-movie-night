// ─── Types ────────────────────────────────────────────────────────────────────

type TMDBVideo = {
  key: string
  site: string
  type: string
}

type TMDBSearchMovie = {
  id: number
  title: string
  release_date: string
  poster_path: string | null
}

type TMDBSearchTV = {
  id: number
  name: string
  first_air_date: string
  poster_path: string | null
}

type TMDBMovieDetail = {
  id: number
  title: string
  runtime: number | null
  genres: { name: string }[]
  poster_path: string | null
  overview: string
}

type TMDBTVDetail = {
  id: number
  name: string
  episode_run_time: number[]
  genres: { name: string }[]
  poster_path: string | null
  overview: string
  number_of_seasons: number
  number_of_episodes: number
}

export type SearchResult = {
  tmdb_id: number
  title: string
  year: string
  type: 'movie' | 'series'
  poster_url: string | null
}

export type MediaDetails = {
  tmdb_id: number
  title: string
  type: 'movie' | 'series'
  duration_minutes: number | null
  genre: string | null
  poster_url: string | null
  summary: string
  trailer_url: string | null
  total_seasons: number | null
  total_episodes: number | null
}

// ─── Pure utilities ───────────────────────────────────────────────────────────

export function posterUrl(path: string | null, size: 'w500' | 'w780'): string | null {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export function selectTrailer(videos: TMDBVideo[]): string | null {
  const trailer = videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube')
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
}

// ─── TMDB API fetchers (server-side only) ─────────────────────────────────────

const BASE = 'https://api.themoviedb.org/3'

function apiKey() {
  return process.env.TMDB_API_KEY!
}

async function tmdbFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}&api_key=${apiKey()}`)
  if (!res.ok) throw new Error(`TMDB error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export async function searchTMDB(query: string): Promise<SearchResult[]> {
  const q = encodeURIComponent(query)

  const [movies, tv] = await Promise.all([
    tmdbFetch<{ results: TMDBSearchMovie[] }>(`/search/movie?query=${q}`),
    tmdbFetch<{ results: TMDBSearchTV[] }>(`/search/tv?query=${q}`),
  ])

  const movieResults: SearchResult[] = movies.results.slice(0, 5).map((m) => ({
    tmdb_id: m.id,
    title: m.title,
    year: m.release_date?.slice(0, 4) ?? '',
    type: 'movie',
    poster_url: posterUrl(m.poster_path, 'w500'),
  }))

  const tvResults: SearchResult[] = tv.results.slice(0, 5).map((s) => ({
    tmdb_id: s.id,
    title: s.name,
    year: s.first_air_date?.slice(0, 4) ?? '',
    type: 'series',
    poster_url: posterUrl(s.poster_path, 'w500'),
  }))

  // Interleave so results feel mixed rather than all movies then all series
  const combined: SearchResult[] = []
  const max = Math.max(movieResults.length, tvResults.length)
  for (let i = 0; i < max; i++) {
    if (movieResults[i]) combined.push(movieResults[i])
    if (tvResults[i]) combined.push(tvResults[i])
  }
  return combined
}

export async function getTMDBDetails(tmdbId: number, type: 'movie' | 'series'): Promise<MediaDetails> {
  const endpoint = type === 'movie' ? `/movie/${tmdbId}` : `/tv/${tmdbId}`
  const videosEndpoint = `${endpoint}/videos`

  const [detail, videosData] = await Promise.all([
    type === 'movie'
      ? tmdbFetch<TMDBMovieDetail>(`${endpoint}?`)
      : tmdbFetch<TMDBTVDetail>(`${endpoint}?`),
    tmdbFetch<{ results: TMDBVideo[] }>(`${videosEndpoint}?`),
  ])

  if (type === 'movie') {
    const m = detail as TMDBMovieDetail
    return {
      tmdb_id: m.id,
      title: m.title,
      type: 'movie',
      duration_minutes: m.runtime ?? null,
      genre: m.genres[0]?.name ?? null,
      poster_url: posterUrl(m.poster_path, 'w780'),
      summary: m.overview,
      trailer_url: selectTrailer(videosData.results),
      total_seasons: null,
      total_episodes: null,
    }
  } else {
    const s = detail as TMDBTVDetail
    return {
      tmdb_id: s.id,
      title: s.name,
      type: 'series',
      duration_minutes: s.episode_run_time[0] ?? null,
      genre: s.genres[0]?.name ?? null,
      poster_url: posterUrl(s.poster_path, 'w780'),
      summary: s.overview,
      trailer_url: selectTrailer(videosData.results),
      total_seasons: s.number_of_seasons,
      total_episodes: s.number_of_episodes,
    }
  }
}
