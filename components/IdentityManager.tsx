'use client'

import { useEffect, useState } from 'react'
import { useActiveUser } from '@/hooks/useActiveUser'
import { supabase } from '@/lib/supabase'
import Avatar from '@/components/Avatar'
import type { Tables } from '@/types/database'

type FamilyMember = Tables<'family_members'>

export default function IdentityManager() {
  const { activeUserId, setUser, hydrated } = useActiveUser()
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    supabase
      .from('family_members')
      .select('*')
      .order('created_at')
      .then(({ data }) => setMembers(data ?? []))
  }, [])

  // Show overlay on every app load once we know localStorage state
  useEffect(() => {
    if (hydrated) setShowOverlay(true)
  }, [hydrated])

  function selectUser(id: string) {
    setUser(id)
    setShowOverlay(false)
  }

  const activeUser = members.find((m) => m.id === activeUserId)

  return (
    <>
      {/* ── Persistent header avatar button ── */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200">
        <span className="font-semibold text-gray-900">🎬 Movie Night</span>
        <button
          onClick={() => setShowOverlay(true)}
          aria-label="Switch user"
          className="min-w-11 min-h-11 flex items-center justify-center"
          data-testid="header-avatar-btn"
        >
          {activeUser ? (
            <Avatar avatarId={activeUser.avatar_id} size="sm" />
          ) : (
            <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">?</span>
          )}
        </button>
      </header>

      {/* ── "Who's watching?" overlay ── */}
      {showOverlay && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-white"
          data-testid="whos-watching-overlay"
        >
          <div className="flex-1 overflow-y-auto px-6 py-10">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Who's watching?</h1>
            <p className="text-gray-500 text-center mb-8 text-sm">Tap your avatar to continue</p>

            {members.length === 0 ? (
              <p className="text-center text-gray-400 mt-16">
                No family members yet — add some in Settings first.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto">
                {members.map((member) => {
                  const isActive = member.id === activeUserId
                  return (
                    <button
                      key={member.id}
                      onClick={() => selectUser(member.id)}
                      data-testid={`member-btn-${member.id}`}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl min-h-11 transition-colors ${
                        isActive ? 'bg-indigo-50 ring-2 ring-indigo-400' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Avatar avatarId={member.avatar_id} size="lg" />
                      <span className="text-sm font-medium text-gray-800 text-center leading-tight">
                        {member.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* "Stay as [Name]" shortcut — only shown when a user is already active */}
          {activeUser && (
            <div className="px-6 pb-10 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowOverlay(false)}
                data-testid="stay-as-btn"
                className="w-full py-3 rounded-xl text-indigo-600 font-medium text-sm hover:bg-indigo-50 transition-colors min-h-11"
              >
                Stay as {activeUser.name}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
