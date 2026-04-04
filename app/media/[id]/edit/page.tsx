'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import MediaMetadataForm, { type MediaFormData } from '@/components/MediaMetadataForm'
import type { Tables } from '@/types/database'

type FamilyMember = Tables<'family_members'>

export default function EditMediaPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [formData, setFormData] = useState<MediaFormData | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('media').select('*').eq('id', id).single(),
      supabase.from('family_members').select('*').order('created_at'),
    ]).then(([{ data: media }, { data: mems }]) => {
      if (!media) { router.push('/'); return }
      setMembers(mems ?? [])
      setFormData({
        title: media.title,
        type: media.type,
        duration_minutes: media.duration_minutes?.toString() ?? '',
        suggested_by: media.suggested_by ?? '',
        platform: media.platform ?? '',
        genre: media.genre ?? '',
        notes: media.notes ?? '',
        total_seasons: media.total_seasons?.toString() ?? '',
        total_episodes: media.total_episodes?.toString() ?? '',
        tmdb_id: media.tmdb_id,
        poster_url: media.poster_url ?? '',
        summary: media.summary ?? '',
        trailer_url: media.trailer_url ?? '',
      })
    })
  }, [id, router])

  async function handleSave() {
    if (!formData) return
    await supabase.from('media').update({
      title: formData.title.trim(),
      type: formData.type,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
      suggested_by: formData.suggested_by || null,
      platform: formData.platform.trim() || null,
      genre: formData.genre.trim() || null,
      notes: formData.notes.trim() || null,
      total_seasons: formData.total_seasons ? parseInt(formData.total_seasons) : null,
      total_episodes: formData.total_episodes ? parseInt(formData.total_episodes) : null,
      tmdb_id: formData.tmdb_id,
      poster_url: formData.poster_url.trim() || null,
      summary: formData.summary.trim() || null,
      trailer_url: formData.trailer_url.trim() || null,
    }).eq('id', id)
    router.push(`/media/${id}`)
  }

  if (!formData) return <div className="p-6 text-gray-400">Loading…</div>

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Edit</h1>
      <MediaMetadataForm
        data={formData}
        onChange={setFormData}
        members={members}
        onNext={handleSave}
        onBack={() => router.push(`/media/${id}`)}
        submitLabel="Save changes"
      />
    </div>
  )
}
