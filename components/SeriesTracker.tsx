'use client'

import { useState } from 'react'
import Avatar from '@/components/Avatar'
import { nextEpisode, isFinished, toAbsolute } from '@/lib/seriesProgress'
import type { Tables } from '@/types/database'

type Progress = Tables<'series_progress'>
type Member = Tables<'family_members'>

type Props = {
  mediaId: string
  members: Member[]
  progress: Progress[]
  totalSeasons: number
  totalEpisodes: number
  onUpdate: (memberId: string, season: number, episode: number) => Promise<void>
}

type ManualEdit = { memberId: string; season: string; episode: string }

export default function SeriesTracker({ members, progress, totalSeasons, totalEpisodes, onUpdate }: Props) {
  const [manualEdit, setManualEdit] = useState<ManualEdit | null>(null)

  // Absolute position for relative comparison
  const absolutes = members.map((m) => {
    const p = progress.find((p) => p.family_member_id === m.id)
    return p ? toAbsolute({ season: p.season, episode: p.episode }, totalSeasons, totalEpisodes) : 0
  })
  const maxAbsolute = Math.max(...absolutes)

  async function handleIncrement(member: Member) {
    const p = progress.find((p) => p.family_member_id === member.id)
    const current = p ? { season: p.season, episode: p.episode } : { season: 1, episode: 0 }
    const next = nextEpisode(current, totalSeasons, totalEpisodes)
    await onUpdate(member.id, next.season, next.episode)
  }

  async function handleManualSave() {
    if (!manualEdit) return
    const s = parseInt(manualEdit.season)
    const e = parseInt(manualEdit.episode)
    if (!s || !e || s < 1 || e < 1 || s > totalSeasons) return
    await onUpdate(manualEdit.memberId, s, e)
    setManualEdit(null)
  }

  return (
    <div className="space-y-3">
      {members.map((member, idx) => {
        const p = progress.find((pr) => pr.family_member_id === member.id)
        const pos = p ? { season: p.season, episode: p.episode } : null
        const finished = pos ? isFinished(pos, totalSeasons, totalEpisodes) : false
        const absolute = absolutes[idx]
        const isEditing = manualEdit?.memberId === member.id

        let relativeLabel = ''
        if (pos && absolutes.filter(Boolean).length > 1) {
          if (absolute === maxAbsolute) relativeLabel = '🏆 Ahead'
          else if (absolute === 0) relativeLabel = ''
          else relativeLabel = `${maxAbsolute - absolute} ep behind`
        }

        return (
          <div key={member.id} className="flex items-center gap-3">
            <Avatar avatarId={member.avatar_id} size="sm" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 w-16 shrink-0">{member.name}</span>

            {isEditing ? (
              <div className="flex items-center gap-1 flex-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">S</span>
                <input type="number" value={manualEdit.season} onChange={(e) => setManualEdit({ ...manualEdit, season: e.target.value })}
                  min={1} max={totalSeasons} className="w-10 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                <span className="text-xs text-gray-500 dark:text-gray-400">E</span>
                <input type="number" value={manualEdit.episode} onChange={(e) => setManualEdit({ ...manualEdit, episode: e.target.value })}
                  min={1} className="w-10 px-1 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                <button onClick={handleManualSave} className="px-2 py-1 rounded bg-indigo-600 text-white text-xs min-h-11">OK</button>
                <button onClick={() => setManualEdit(null)} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs min-h-11">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                {finished ? (
                  <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-medium">Finished ✓</span>
                ) : (
                  <>
                    <button
                      onClick={() => setManualEdit({ memberId: member.id, season: String(pos?.season ?? 1), episode: String(pos?.episode ?? 0) })}
                      className="text-sm font-mono text-gray-700 dark:text-gray-300 min-h-11 px-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                      data-testid={`series-position-${member.id}`}
                    >
                      {pos ? `S${pos.season} E${pos.episode}` : '—'}
                    </button>
                    <button
                      onClick={() => handleIncrement(member)}
                      className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center hover:bg-indigo-200 transition-colors"
                      aria-label="Next episode"
                      data-testid={`series-increment-${member.id}`}
                    >
                      +
                    </button>
                  </>
                )}
                {relativeLabel && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">{relativeLabel}</span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
