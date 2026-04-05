'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useActiveUser } from '@/hooks/useActiveUser'
import TMDBSearchStep from '@/components/TMDBSearchStep'
import MediaMetadataForm, { emptyFormData, type MediaFormData } from '@/components/MediaMetadataForm'
import InterestStep from '@/components/InterestStep'
import type { SearchResult, MediaDetails } from '@/lib/tmdb'
import type { Tables } from '@/types/database'
import type { InterestState } from '@/lib/interests'

type FamilyMember = Tables<'family_members'>
type Step = 'search' | 'metadata' | 'interests'

export default function AddPage() {
  const router = useRouter()
  const { activeUserId } = useActiveUser()
  const [step, setStep] = useState<Step>('search')
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [formData, setFormData] = useState<MediaFormData>(emptyFormData())
  const [interests, setInterests] = useState<Record<string, InterestState>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('family_members').select('*').order('created_at').then(({ data }) => setMembers(data ?? []))
  }, [])

  // Default suggested_by to the active user once we know who's logged in
  useEffect(() => {
    if (activeUserId) {
      setFormData((prev) => prev.suggested_by ? prev : { ...prev, suggested_by: activeUserId })
    }
  }, [activeUserId])

  async function handleTMDBSelect(result: SearchResult) {
    const res = await fetch(`/api/tmdb/details?tmdb_id=${result.tmdb_id}&type=${result.type}`)
    const details: MediaDetails = await res.json()
    setFormData({
      title: details.title,
      type: details.type,
      duration_minutes: details.duration_minutes?.toString() ?? '',
      suggested_by: activeUserId ?? '',
      platform: details.platform ?? '',
      genre: details.genre ?? '',
      notes: '',
      total_seasons: details.total_seasons?.toString() ?? '',
      total_episodes: details.total_episodes?.toString() ?? '',
      tmdb_id: details.tmdb_id,
      poster_url: details.poster_url ?? '',
      summary: details.summary,
      trailer_url: details.trailer_url ?? '',
      cast: details.cast ?? '',
      release_year: details.release_year?.toString() ?? '',
    })
    setStep('metadata')
  }

  async function handleSave() {
    setSaving(true)
    const { data: media, error } = await supabase
      .from('media')
      .insert({
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
        cast: formData.cast.trim() || null,
        release_year: formData.release_year ? parseInt(formData.release_year) : null,
      })
      .select('id')
      .single()

    if (error || !media) { setSaving(false); return }

    // Only write records for members who were explicitly tapped — others stay
    // with no record (undefined/"no vote" state) so the blue dot triggers for them
    const interestRows = members
      .filter((m) => interests[m.id] !== undefined)
      .map((m) => ({
        media_id: media.id,
        family_member_id: m.id,
        interest: interests[m.id] as InterestState,
      }))

    if (interestRows.length > 0) {
      await supabase.from('interests').insert(interestRows)
    }

    router.push('/')
  }

  const titles: Record<Step, string> = {
    search: 'Add to catalogue',
    metadata: 'Review details',
    interests: "Who wants to watch?",
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">{titles[step]}</h1>

      {step === 'search' && (
        <TMDBSearchStep
          onSelect={handleTMDBSelect}
          onManual={() => { setFormData({ ...emptyFormData(), suggested_by: activeUserId ?? '' }); setStep('metadata') }}
        />
      )}

      {step === 'metadata' && (
        <MediaMetadataForm
          data={formData}
          onChange={setFormData}
          members={members}
          onNext={() => setStep('interests')}
          onBack={() => setStep('search')}
        />
      )}

      {step === 'interests' && (
        <InterestStep
          members={members}
          interests={interests}
          onChange={setInterests}
          onSave={handleSave}
          onBack={() => setStep('metadata')}
          saving={saving}
        />
      )}
    </div>
  )
}
