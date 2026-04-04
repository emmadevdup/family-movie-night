'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useActiveUser } from '@/hooks/useActiveUser'
import InterestSection from '@/components/InterestSection'
import CommentsSection from '@/components/CommentsSection'
import SeriesTracker from '@/components/SeriesTracker'
import { isFinished } from '@/lib/seriesProgress'
import type { Tables } from '@/types/database'

type Media = Tables<'media'>
type Interest = Tables<'interests'>
type Comment = Tables<'comments'>
type Member = Tables<'family_members'>
type Progress = Tables<'series_progress'>

export default function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { activeUserId } = useActiveUser()

  const [media, setMedia] = useState<Media | null>(null)
  const [interests, setInterests] = useState<Interest[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [progress, setProgress] = useState<Progress[]>([])

  async function load() {
    const [{ data: m }, { data: i }, { data: c }, { data: mems }, { data: prog }] = await Promise.all([
      supabase.from('media').select('*').eq('id', id).single(),
      supabase.from('interests').select('*').eq('media_id', id),
      supabase.from('comments').select('*').eq('media_id', id),
      supabase.from('family_members').select('*').order('created_at'),
      supabase.from('series_progress').select('*').eq('media_id', id),
    ])
    if (!m) { router.push('/'); return }
    setMedia(m); setInterests(i ?? []); setComments(c ?? [])
    setMembers(mems ?? []); setProgress(prog ?? [])
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel(`detail-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interests', filter: `media_id=eq.${id}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `media_id=eq.${id}` }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'series_progress', filter: `media_id=eq.${id}` }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id])

  async function handleCycleInterest(memberId: string, next: Interest['interest']) {
    await supabase.from('interests').upsert(
      { media_id: id, family_member_id: memberId, interest: next },
      { onConflict: 'media_id,family_member_id' }
    )
    setInterests((prev) => {
      const existing = prev.find((i) => i.family_member_id === memberId)
      return existing
        ? prev.map((i) => i.family_member_id === memberId ? { ...i, interest: next } : i)
        : [...prev, { id: '', media_id: id, family_member_id: memberId, interest: next, watched: false, created_at: '' }]
    })
  }

  async function handleToggleWatched(memberId: string, watched: boolean) {
    await supabase.from('interests').upsert(
      { media_id: id, family_member_id: memberId, watched },
      { onConflict: 'media_id,family_member_id' }
    )
    setInterests((prev) => {
      const existing = prev.find((i) => i.family_member_id === memberId)
      return existing
        ? prev.map((i) => i.family_member_id === memberId ? { ...i, watched } : i)
        : [...prev, { id: '', media_id: id, family_member_id: memberId, interest: 'neutral', watched, created_at: '' }]
    })
  }

  async function handleSaveComment(memberId: string, body: string) {
    await supabase.from('comments').upsert(
      { media_id: id, family_member_id: memberId, body },
      { onConflict: 'media_id,family_member_id' }
    )
    setComments((prev) => {
      const existing = prev.find((c) => c.family_member_id === memberId)
      return existing
        ? prev.map((c) => c.family_member_id === memberId ? { ...c, body } : c)
        : [...prev, { id: '', media_id: id, family_member_id: memberId, body, updated_at: '' }]
    })
  }

  async function handleProgressUpdate(memberId: string, season: number, episode: number) {
    await supabase.from('series_progress').upsert(
      { media_id: id, family_member_id: memberId, season, episode },
      { onConflict: 'media_id,family_member_id' }
    )
    setProgress((prev) => {
      const existing = prev.find((p) => p.family_member_id === memberId)
      return existing
        ? prev.map((p) => p.family_member_id === memberId ? { ...p, season, episode } : p)
        : [...prev, { id: '', media_id: id, family_member_id: memberId, season, episode, updated_at: '' }]
    })
    // Auto-set watched when series is finished
    if (media?.total_seasons && media.total_episodes) {
      const finished = isFinished({ season, episode }, media.total_seasons, media.total_episodes)
      if (finished) await handleToggleWatched(memberId, true)
    }
  }

  if (!media) return <div className="p-6 text-gray-400">Loading…</div>

  const suggestedBy = members.find((m) => m.id === media.suggested_by)
  const seriesStarted = media.type === 'series' && progress.length > 0

  return (
    <div className="max-w-lg mx-auto pb-12">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/" className="text-indigo-600 text-sm font-medium min-h-11 flex items-center">← Back</Link>
        <Link href={`/media/${id}/edit`} className="text-indigo-600 text-sm font-medium min-h-11 flex items-center">Edit</Link>
      </div>

      {media.poster_url && (
        <div className="relative w-full aspect-[2/3] max-h-80 bg-gray-100">
          <Image src={media.poster_url} alt={media.title} fill className="object-contain" sizes="(max-width: 512px) 100vw, 512px" priority />
        </div>
      )}

      <div className="px-4 pt-4 space-y-5">
        <div>
          <div className="flex items-start gap-2">
            <h1 className="text-xl font-bold text-gray-900 flex-1">{media.title}</h1>
            <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${media.type === 'movie' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
              {media.type === 'movie' ? 'Movie' : 'Series'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {[media.duration_minutes && (media.type === 'movie' ? `${media.duration_minutes} min` : `${media.duration_minutes} min/ep`), media.genre, media.platform].filter(Boolean).join(' · ')}
            {suggestedBy && <span> · Added by {suggestedBy.name}</span>}
          </p>
        </div>

        {media.trailer_url && (
          <a href={media.trailer_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm min-h-11 hover:bg-gray-50 transition-colors">
            ▶ Watch trailer
          </a>
        )}

        {media.summary && <p className="text-sm text-gray-700 leading-relaxed">{media.summary}</p>}

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Interest</h2>
          <InterestSection members={members} interests={interests} onCycleInterest={handleCycleInterest} onToggleWatched={handleToggleWatched} />
        </section>

        {media.type === 'series' && media.total_seasons && media.total_episodes && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {seriesStarted ? 'Series progress' : 'Start tracking'}
            </h2>
            <SeriesTracker
              mediaId={id}
              members={members}
              progress={progress}
              totalSeasons={media.total_seasons}
              totalEpisodes={media.total_episodes}
              onUpdate={handleProgressUpdate}
            />
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Comments</h2>
          <CommentsSection mediaId={id} members={members} comments={comments} activeUserId={activeUserId} onSave={handleSaveComment} />
        </section>
      </div>
    </div>
  )
}
