'use client'

import type { Tables } from '@/types/database'

type FamilyMember = Tables<'family_members'>

export type MediaFormData = {
  title: string
  type: 'movie' | 'series'
  duration_minutes: string
  suggested_by: string
  platform: string
  genre: string
  notes: string
  total_seasons: string
  total_episodes: string
  tmdb_id: number | null
  poster_url: string
  summary: string
  trailer_url: string
}

export function emptyFormData(): MediaFormData {
  return {
    title: '', type: 'movie', duration_minutes: '', suggested_by: '',
    platform: '', genre: '', notes: '', total_seasons: '', total_episodes: '',
    tmdb_id: null, poster_url: '', summary: '', trailer_url: '',
  }
}

type Props = {
  data: MediaFormData
  onChange: (data: MediaFormData) => void
  members: FamilyMember[]
  onNext: () => void
  onBack?: () => void
  submitLabel?: string
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-11'

export default function MediaMetadataForm({ data, onChange, members, onNext, onBack, submitLabel = 'Next' }: Props) {
  const set = (key: keyof MediaFormData, val: string) => onChange({ ...data, [key]: val })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.title.trim()) return
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Title *">
        <input type="text" value={data.title} onChange={(e) => set('title', e.target.value)} required maxLength={200} className={inputCls} />
      </Field>

      <Field label="Type">
        <div className="flex gap-3">
          {(['movie', 'series'] as const).map((t) => (
            <button key={t} type="button" onClick={() => onChange({ ...data, type: t })}
              className={`flex-1 py-3 rounded-xl border font-medium min-h-11 capitalize transition-colors ${data.type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              {t === 'movie' ? 'Movie' : 'Series'}
            </button>
          ))}
        </div>
      </Field>

      <Field label={data.type === 'movie' ? 'Runtime (minutes)' : 'Episode length (minutes)'}>
        <input type="number" value={data.duration_minutes} onChange={(e) => set('duration_minutes', e.target.value)} min={1} max={999} className={inputCls} />
      </Field>

      {data.type === 'series' && (
        <div className="flex gap-3">
          <Field label="Total seasons">
            <input type="number" value={data.total_seasons} onChange={(e) => set('total_seasons', e.target.value)} min={1} className={inputCls} />
          </Field>
          <Field label="Total episodes">
            <input type="number" value={data.total_episodes} onChange={(e) => set('total_episodes', e.target.value)} min={1} className={inputCls} />
          </Field>
        </div>
      )}

      <Field label="Suggested by">
        <select value={data.suggested_by} onChange={(e) => set('suggested_by', e.target.value)} className={inputCls}>
          <option value="">— select —</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </Field>

      <Field label="Platform">
        <input type="text" value={data.platform} onChange={(e) => set('platform', e.target.value)} placeholder="e.g. Netflix" maxLength={100} className={inputCls} />
      </Field>

      <Field label="Genre">
        <input type="text" value={data.genre} onChange={(e) => set('genre', e.target.value)} maxLength={100} className={inputCls} />
      </Field>

      <Field label="Summary">
        <textarea value={data.summary} onChange={(e) => set('summary', e.target.value)} rows={3} maxLength={2000} className={`${inputCls} resize-none`} />
      </Field>

      <Field label="Notes">
        <textarea value={data.notes} onChange={(e) => set('notes', e.target.value)} rows={2} maxLength={1000} className={`${inputCls} resize-none`} />
      </Field>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium min-h-11 hover:bg-indigo-700 transition-colors">
          {submitLabel}
        </button>
        {onBack && (
          <button type="button" onClick={onBack} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium min-h-11 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Back
          </button>
        )}
      </div>
    </form>
  )
}
