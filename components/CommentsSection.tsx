'use client'

import { useState } from 'react'
import Avatar from '@/components/Avatar'
import type { Tables } from '@/types/database'

type Comment = Tables<'comments'>
type Member = Tables<'family_members'>

type Props = {
  mediaId: string
  members: Member[]
  comments: Comment[]
  activeUserId: string | null
  onSave: (memberId: string, body: string) => Promise<void>
}

export default function CommentsSection({ members, comments, activeUserId, onSave }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave(memberId: string) {
    setSaving(true)
    await onSave(memberId, draft.trim())
    setSaving(false)
    setEditingId(null)
  }

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const comment = comments.find((c) => c.family_member_id === member.id)
        const isOwn = member.id === activeUserId
        const isEditing = editingId === member.id

        return (
          <div key={member.id} className="flex gap-3">
            <Avatar avatarId={member.avatar_id} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 mb-0.5">{member.name}</p>

              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a comment…"
                    rows={3}
                    maxLength={2000}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(member.id)}
                      disabled={saving}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium min-h-8 disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium min-h-8"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={isOwn ? () => { setDraft(comment?.body ?? ''); setEditingId(member.id) } : undefined}
                  disabled={!isOwn}
                  className={`text-sm text-left w-full ${
                    comment ? 'text-gray-700' : 'text-gray-400 italic'
                  } ${isOwn ? 'hover:text-indigo-600 cursor-pointer' : 'cursor-default'}`}
                  data-testid={isOwn ? 'own-comment-btn' : undefined}
                >
                  {comment?.body || (isOwn ? 'Add a comment…' : '—')}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
