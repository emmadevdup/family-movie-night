'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActiveUser } from '@/hooks/useActiveUser'
import { supabase } from '@/lib/supabase'
import Avatar from '@/components/Avatar'
import type { Tables } from '@/types/database'

type FamilyMember = Tables<'family_members'>

export default function IdentityManager() {
  const router = useRouter()
  const { activeUserId, setUser, hydrated } = useActiveUser()
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [showOverlay, setShowOverlay] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

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
    router.push('/')
  }

  function openOverlay() {
    setShowDropdown(false)
    setShowOverlay(true)
  }

  const activeUser = members.find((m) => m.id === activeUserId)

  return (
    <>
      {/* ── Persistent header ── */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <span className="font-semibold text-gray-900 dark:text-gray-100">🎬 Super Famille Movies</span>
        <div className="flex items-center gap-1">
          <Link
            href="/add"
            aria-label="Add movie or series"
            className="min-w-11 min-h-11 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-xl font-light"
          >
            +
          </Link>

          {/* Avatar button — opens dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown((v) => !v)}
              aria-label="Menu"
              aria-expanded={showDropdown}
              className="min-w-11 min-h-11 flex items-center justify-center"
              data-testid="header-avatar-btn"
            >
              {activeUser ? (
                <Avatar avatarId={activeUser.avatar_id} size="sm" />
              ) : (
                <span className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">?</span>
              )}
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <>
                {/* Backdrop to close on outside tap */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-gray-100 dark:border-gray-700 py-1 overflow-hidden">
                  {activeUser && (
                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                      <Avatar avatarId={activeUser.avatar_id} size="sm" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{activeUser.name}</span>
                    </div>
                  )}
                  <button
                    onClick={openOverlay}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-11 flex items-center gap-2"
                  >
                    👤 Change user
                  </button>
                  <Link
                    href="/"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-11 flex items-center gap-2"
                  >
                    🎬 Catalogue
                  </Link>
                  <Link
                    href="/movie-night"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-11 flex items-center gap-2"
                  >
                    🍿 Movie Night
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-11 flex items-center gap-2"
                  >
                    ⚙️ Settings
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── "Who's watching?" overlay ── */}
      {showOverlay && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900"
          data-testid="whos-watching-overlay"
        >
          <div className="flex-1 overflow-y-auto px-6 py-10">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">Who's watching?</h1>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm">Tap your avatar to continue</p>

            {members.length === 0 ? (
              <div className="flex flex-col items-center mt-16 gap-6">
                <p className="text-center text-gray-400 dark:text-gray-500">
                  No family members yet — add some in Settings first.
                </p>
                <Link
                  href="/settings"
                  onClick={() => setShowOverlay(false)}
                  className="min-h-11 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl text-sm hover:bg-indigo-700 transition-colors"
                >
                  ⚙️ Go to Settings
                </Link>
              </div>
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
                        isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Avatar avatarId={member.avatar_id} size="lg" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 text-center leading-tight">
                        {member.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer: "Stay as [Name]" shortcut + Settings link */}
          <div className="px-6 pb-10 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
            {activeUser && (
              <button
                onClick={() => setShowOverlay(false)}
                data-testid="stay-as-btn"
                className="w-full py-3 rounded-xl text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors min-h-11"
              >
                Stay as {activeUser.name}
              </button>
            )}
            <Link
              href="/settings"
              onClick={() => setShowOverlay(false)}
              className="w-full py-3 rounded-xl text-center text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-h-11 flex items-center justify-center gap-1"
            >
              ⚙️ Manage family members
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
