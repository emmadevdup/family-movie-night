'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Avatar from '@/components/Avatar'
import FamilyMemberForm from '@/components/FamilyMemberForm'
import type { Tables } from '@/types/database'

type FamilyMember = Tables<'family_members'>
type Mode = 'list' | 'add' | { type: 'edit'; member: FamilyMember }

export default function SettingsPage() {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [mode, setMode] = useState<Mode>('list')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  async function loadMembers() {
    const { data } = await supabase.from('family_members').select('*').order('created_at')
    setMembers(data ?? [])
  }

  useEffect(() => { loadMembers() }, [])

  async function handleAdd(name: string, avatarId: string) {
    await supabase.from('family_members').insert({ name, avatar_id: avatarId })
    await loadMembers()
    setMode('list')
  }

  async function handleEdit(member: FamilyMember, name: string, avatarId: string) {
    await supabase.from('family_members').update({ name, avatar_id: avatarId }).eq('id', member.id)
    await loadMembers()
    setMode('list')
  }

  async function handleDelete(id: string) {
    await supabase.from('family_members').delete().eq('id', id)
    await loadMembers()
    setConfirmDeleteId(null)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Family members</h1>

      {mode === 'list' && (
        <>
          <ul className="space-y-3 mb-6">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
                <Avatar avatarId={m.avatar_id} size="md" />
                <span className="flex-1 font-medium text-gray-900">{m.name}</span>
                <button
                  onClick={() => setMode({ type: 'edit', member: m })}
                  className="min-h-11 min-w-11 flex items-center justify-center text-indigo-600 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDeleteId(m.id)}
                  className="min-h-11 min-w-11 flex items-center justify-center text-red-500 text-sm font-medium"
                >
                  Remove
                </button>
              </li>
            ))}
            {members.length === 0 && (
              <li className="text-center text-gray-400 py-10">No family members yet.</li>
            )}
          </ul>

          <button
            onClick={() => setMode('add')}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium min-h-11 hover:bg-indigo-700 transition-colors"
          >
            + Add family member
          </button>
        </>
      )}

      {mode === 'add' && (
        <FamilyMemberForm
          onSave={handleAdd}
          onCancel={() => setMode('list')}
        />
      )}

      {typeof mode === 'object' && mode.type === 'edit' && (
        <FamilyMemberForm
          initial={mode.member}
          onSave={(name, avatarId) => handleEdit(mode.member, name, avatarId)}
          onCancel={() => setMode('list')}
        />
      )}

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4">
            <p className="font-semibold text-gray-900 text-center">Remove this family member?</p>
            <p className="text-sm text-gray-500 text-center">
              Their interests, comments, and progress will be removed too.
            </p>
            <button
              onClick={() => handleDelete(confirmDeleteId)}
              className="w-full py-3 rounded-xl bg-red-500 text-white font-medium min-h-11"
            >
              Remove
            </button>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-medium min-h-11"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
