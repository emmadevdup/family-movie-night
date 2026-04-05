'use client'

export type Filters = {
  type: 'all' | 'movie' | 'series'
  platform: string
  genre: string
  interestLevel: 'all' | 'yes'
  hideWatched: boolean
  sort: 'date' | 'alpha'
}

export function defaultFilters(): Filters {
  return { type: 'all', platform: '', genre: '', interestLevel: 'all', hideWatched: false, sort: 'date' }
}

type Props = {
  filters: Filters
  onChange: (f: Filters) => void
  platforms: string[]
  genres: string[]
}

const btnBase = 'px-3 py-1.5 rounded-lg text-xs font-medium min-h-11 transition-colors'
const btnActive = 'bg-indigo-600 text-white'
const btnInactive = 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'

export default function CatalogueFilters({ filters, onChange, platforms, genres }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })

  return (
    <div className="space-y-2 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'movie', 'series'] as const).map((t) => (
          <button key={t} onClick={() => set({ type: t })}
            className={`${btnBase} ${filters.type === t ? btnActive : btnInactive} capitalize`}>
            {t === 'all' ? 'All' : t === 'movie' ? 'Movies' : 'Series'}
          </button>
        ))}

        {platforms.length > 0 && (
          <select
            value={filters.platform}
            onChange={(e) => set({ platform: e.target.value })}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 min-h-11 border-none focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:[color-scheme:dark]"
          >
            <option value="">All platforms</option>
            {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        )}

        {genres.length > 0 && (
          <select
            value={filters.genre}
            onChange={(e) => set({ genre: e.target.value })}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 min-h-11 border-none focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:[color-scheme:dark]"
          >
            <option value="">All genres</option>
            {genres.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        )}

        <button onClick={() => set({ interestLevel: filters.interestLevel === 'yes' ? 'all' : 'yes' })}
          className={`${btnBase} ${filters.interestLevel === 'yes' ? btnActive : btnInactive}`}>
          ★ Interested
        </button>

        <button onClick={() => set({ hideWatched: !filters.hideWatched })}
          className={`${btnBase} ${filters.hideWatched ? btnActive : btnInactive}`}>
          Hide watched
        </button>

        <button onClick={() => set({ sort: filters.sort === 'date' ? 'alpha' : 'date' })}
          className={`${btnBase} ${btnInactive}`}>
          {filters.sort === 'date' ? 'A→Z' : 'Recent first'}
        </button>
      </div>
    </div>
  )
}
