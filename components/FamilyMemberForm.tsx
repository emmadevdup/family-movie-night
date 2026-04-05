'use client'

import { useState } from 'react'
import AvatarPicker from '@/components/AvatarPicker'
import type { Tables } from '@/types/database'

type FamilyMember = Tables<'family_members'>

type Props = {
  initial?: FamilyMember
  onSave: (name: string, avatarId: string) => Promise<void>
  onCancel: () => void
}

export default function FamilyMemberForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [avatarId, setAvatarId] = useState(initial?.avatar_id ?? 'fox')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Name is required'); return }
    setSaving(true)
    await onSave(trimmed, avatarId)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="member-name">
          Name
        </label>
        <input
          id="member-name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          placeholder="e.g. Sofia"
          maxLength={40}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-11"
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      <div>
        <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Choose an avatar</p>
        <AvatarPicker selected={avatarId} onSelect={setAvatarId} />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium min-h-11 disabled:opacity-50 hover:bg-indigo-700 transition-colors"
        >
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Add member'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium min-h-11 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
