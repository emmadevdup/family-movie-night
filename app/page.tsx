'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useActiveUser } from '@/hooks/useActiveUser'
import MediaCard from '@/components/MediaCard'
import CatalogueFilters, { defaultFilters, type Filters } from '@/components/CatalogueFilters'
import type { Tables } from '@/types/database'

type Media = Tables<'media'>
type Interest = Tables<'interests'>
type Member = Tables<'family_members'>

type MediaEntry = Media & {
  interests: Interest[]
  comments: { id: string }[]
}

export default function CataloguePage() {
  const { activeUserId } = useActiveUser()
  const [entries, setEntries] = useState<MediaEntry[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [filters, setFilters] = useState<Filters>(defaultFilters())

  async function load() {
    const [{ data: media }, { data: mems }] = await Promise.all([
      supabase.from('media').select('*, interests(*), comments(id)').order('created_at', { ascending: false }),
      supabase.from('family_members').select('*').order('created_at'),
    ])
    setEntries((media as MediaEntry[]) ?? [])
    setMembers(mems ?? [])
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('interests-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interests' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function handleToggleInterest(mediaId: string, newInterest: Interest['interest']) {
    if (!activeUserId) return
    await supabase.from('interests').upsert(
      { media_id: mediaId, family_member_id: activeUserId, interest: newInterest },
      { onConflict: 'media_id,family_member_id' }
    )
    setEntries((prev) => prev.map((e) => {
      if (e.id !== mediaId) return e
      const existing = e.interests.find((i) => i.family_member_id === activeUserId)
      const updated = existing
        ? e.interests.map((i) => i.family_member_id === activeUserId ? { ...i, interest: newInterest } : i)
        : [...e.interests, { media_id: mediaId, family_member_id: activeUserId, interest: newInterest, watched: false, id: '', created_at: '' } as Interest]
      return { ...e, interests: updated }
    }))
  }

  const platforms = [...new Set(entries.map((e) => e.platform).filter(Boolean) as string[])].sort()

  const visible = entries.filter((e) => {
    if (filters.type !== 'all' && e.type !== filters.type) return false
    if (filters.platform && e.platform !== filters.platform) return false
    if (filters.interestLevel === 'yes') {
      const userInterest = e.interests.find((i) => i.family_member_id === activeUserId)?.interest
      if (userInterest !== 'yes') return false
    }
    if (filters.hideWatched) {
      const allWatched = members.length > 0 && members.every((m) =>
        e.interests.find((i) => i.family_member_id === m.id)?.watched
      )
      if (allWatched) return false
    }
    return true
  })

  return (
    <div className="pb-8">
      <div className="px-4 pt-3">
        <Link
          href="/movie-night"
          data-testid="movie-night-button"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-base min-h-11 hover:bg-indigo-700 transition-colors"
        >
          🎬 Movie Night
        </Link>
      </div>
      <CatalogueFilters filters={filters} onChange={setFilters} platforms={platforms} />

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <p className="text-4xl mb-4">🎬</p>
          <p className="text-gray-500">
            {entries.length === 0
              ? 'No movies or series yet — tap + to add one!'
              : 'No entries match your filters.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3 px-4 pt-4">
          {visible.map((entry) => (
            <li key={entry.id}>
              <MediaCard
                media={entry}
                interests={entry.interests}
                members={members}
                activeUserId={activeUserId}
                hasComments={entry.comments.length > 0}
                onToggleInterest={handleToggleInterest}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
