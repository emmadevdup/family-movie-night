'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { SearchResult } from '@/lib/tmdb'

type Props = {
  onSelect: (result: SearchResult) => void
  onManual: () => void
}

export default function TMDBSearchStep({ onSelect, onManual }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    const res = await fetch('/api/tmdb/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query.trim() }),
    })
    const data: SearchResult[] = await res.json()
    setResults(data)
    setLoading(false)
    setSearched(true)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies or series…"
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-11"
          data-testid="tmdb-search-input"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-medium min-h-11 disabled:opacity-50"
          data-testid="tmdb-search-btn"
        >
          {loading ? '…' : 'Search'}
        </button>
      </form>

      {searched && results.length === 0 && (
        <p className="text-center text-gray-400 py-4">No results found.</p>
      )}

      <ul className="space-y-2" data-testid="tmdb-results">
        {results.map((r) => (
          <li key={`${r.type}-${r.tmdb_id}`}>
            <button
              onClick={() => onSelect(r)}
              data-testid={`tmdb-result-${r.tmdb_id}`}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors text-left min-h-11"
            >
              {r.poster_url ? (
                <Image
                  src={r.poster_url}
                  alt={r.title}
                  width={40}
                  height={60}
                  className="rounded object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-14 rounded bg-gray-200 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{r.title}</p>
                <p className="text-sm text-gray-500">
                  {r.year}{' '}
                  <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${r.type === 'movie' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {r.type === 'movie' ? 'Movie' : 'Series'}
                  </span>
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onManual}
        className="w-full py-3 text-sm text-indigo-600 hover:underline min-h-11"
      >
        Can't find it? Enter manually
      </button>
    </div>
  )
}
