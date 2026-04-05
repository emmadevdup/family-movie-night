'use client'

export type Filters = {
  type: 'all' | 'movie' | 'series'
  platform: string
  interestLevel: 'all' | 'yes'
  hideWatched: boolean
}

export function defaultFilters(): Filters {
  return { type: 'all', platform: '', interestLevel: 'all', hideWatched: false }
}

type Props = {
  filters: Filters
  onChange: (f: Filters) => void
  platforms: string[]
}

const btnBase = 'px-3 py-1.5 rounded-lg text-xs font-medium min-h-11 transition-colors'
const btnActive = 'bg-indigo-600 text-white'
const btnInactive = 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'

export default function CatalogueFilters({ filters, onChange, platforms }: Props) {
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

        <button onClick={() => set({ interestLevel: filters.interestLevel === 'yes' ? 'all' : 'yes' })}
          className={`${btnBase} ${filters.interestLevel === 'yes' ? btnActive : btnInactive}`}>
          ★ Interested
        </button>

        <button onClick={() => set({ hideWatched: !filters.hideWatched })}
          className={`${btnBase} ${filters.hideWatched ? btnActive : btnInactive}`}>
          Hide watched
        </button>
      </div>
    </div>
  )
}
