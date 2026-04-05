'use client'

export type Filters = {
  type: 'all' | 'movie' | 'series'
  platform: string
  genre: string
  interestLevel: 'all' | 'yes' | 'unvoted'
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

const btnBase = 'flex-1 px-2 py-1.5 rounded-lg text-xs font-medium min-h-11 transition-colors text-center'
const btnActive = 'bg-indigo-600 text-white'
const btnInactive = 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
const selectCls = 'flex-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 min-h-11 border-none focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:[color-scheme:dark] min-w-0'

export default function CatalogueFilters({ filters, onChange, platforms, genres }: Props) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch })

  return (
    <div className="space-y-1.5 px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      {/* Row 1: All · A→Z · Movies · Series */}
      <div className="flex gap-1.5">
        <button onClick={() => set({ type: 'all' })}
          className={`${btnBase} ${filters.type === 'all' ? btnActive : btnInactive}`}>All</button>
        <button onClick={() => set({ sort: filters.sort === 'date' ? 'alpha' : 'date' })}
          className={`${btnBase} ${filters.sort === 'alpha' ? btnActive : btnInactive}`}>A→Z</button>
        <button onClick={() => set({ type: 'movie' })}
          className={`${btnBase} ${filters.type === 'movie' ? btnActive : btnInactive}`}>Movies</button>
        <button onClick={() => set({ type: 'series' })}
          className={`${btnBase} ${filters.type === 'series' ? btnActive : btnInactive}`}>Series</button>
      </div>

      {/* Row 2: Platforms · Genres · Interested · Hide watched */}
      <div className="flex gap-1.5">
        <select value={filters.platform} onChange={(e) => set({ platform: e.target.value })} className={selectCls}>
          <option value="">All platforms</option>
          {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filters.genre} onChange={(e) => set({ genre: e.target.value })} className={selectCls}>
          <option value="">All genres</option>
          {genres.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <button onClick={() => set({ interestLevel: filters.interestLevel === 'all' ? 'yes' : filters.interestLevel === 'yes' ? 'unvoted' : 'all' })}
          className={`${btnBase} ${filters.interestLevel !== 'all' ? btnActive : btnInactive}`}>
          {filters.interestLevel === 'yes' ? '★ Yes' : filters.interestLevel === 'unvoted' ? '? Unvoted' : '★ / ?'}
        </button>
        <button onClick={() => set({ hideWatched: !filters.hideWatched })}
          className={`${btnBase} ${filters.hideWatched ? btnActive : btnInactive}`}>Seen ✓</button>
      </div>
    </div>
  )
}
