'use client'

import Image from 'next/image'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
import { cycleInterest } from '@/lib/interests'
import type { Tables } from '@/types/database'

type Media = Tables<'media'>
type Interest = Tables<'interests'>
type Member = Tables<'family_members'>

type Props = {
  media: Media
  interests: Interest[]
  members: Member[]
  activeUserId: string | null
  hasComments: boolean
  onToggleInterest: (mediaId: string, newInterest: Interest['interest']) => void
}

export default function MediaCard({ media, interests, members, activeUserId, hasComments, onToggleInterest }: Props) {
  const allWatched = members.length > 0 && members.every((m) => interests.find((i) => i.family_member_id === m.id)?.watched)
  const activeInterest = interests.find((i) => i.family_member_id === activeUserId)
  const userWatched = activeInterest?.watched ?? false

  const groups = {
    yes:     members.filter((m) => interests.find((i) => i.family_member_id === m.id)?.interest === 'yes'),
    neutral: members.filter((m) => interests.find((i) => i.family_member_id === m.id)?.interest === 'neutral'),
    no:      members.filter((m) => interests.find((i) => i.family_member_id === m.id)?.interest === 'no'),
    none:    members.filter((m) => !interests.find((i) => i.family_member_id === m.id)),
  }

  const dimClass = allWatched ? 'opacity-40' : userWatched ? 'opacity-70' : ''

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden flex relative ${dimClass}`}>
      {/* Poster */}
      <div className="w-20 shrink-0 bg-gray-100 dark:bg-gray-800 relative">
        {media.poster_url ? (
          <Image src={media.poster_url} alt={media.title} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🎬</div>
        )}
        {allWatched && (
          <div className="absolute inset-0 flex items-end justify-center pb-1 bg-black/30">
            <span className="text-white text-[10px] font-bold text-center leading-tight px-1">All seen ✓</span>
          </div>
        )}
      </div>

      {/* Content — tappable area for navigation */}
      <Link href={`/media/${media.id}`} className="flex-1 p-3 min-w-0 block">
        <div className="flex items-start gap-2 mb-1">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight flex-1 truncate">{media.title}</h2>
          <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded ${media.type === 'movie' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400'}`}>
            {media.type === 'movie' ? 'Movie' : 'Series'}
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {[media.duration_minutes && `${media.duration_minutes}m`, media.platform, media.genre].filter(Boolean).join(' · ')}
        </p>

        {media.summary && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{media.summary}</p>
        )}

        {/* Suggested by */}
        {media.suggested_by && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-2">
            Added by {members.find((m) => m.id === media.suggested_by)?.name ?? '—'}
          </p>
        )}

        {/* Avatar row */}
        <div className="flex items-center gap-0.5 flex-wrap">
          {[...groups.yes, ...groups.neutral, ...groups.no, ...groups.none].map((member) => {
            const interest = interests.find((i) => i.family_member_id === member.id)
            const isOwn = member.id === activeUserId
            return (
              <button
                key={member.id}
                type="button"
                onClick={(e) => {
                  if (!isOwn) return
                  e.preventDefault()
                  const current = interest?.interest ?? 'neutral'
                  onToggleInterest(media.id, cycleInterest(current))
                }}
                className={isOwn ? 'cursor-pointer' : 'cursor-default'}
                aria-label={isOwn ? `Toggle your interest` : member.name}
                data-testid={isOwn ? `quick-toggle-${media.id}` : undefined}
              >
                <Avatar
                  avatarId={member.avatar_id}
                  size="sm"
                  interestState={interest?.interest}
                  watched={interest?.watched ?? false}
                />
              </button>
            )
          })}
          {hasComments && <span className="ml-1 text-gray-400 dark:text-gray-500 text-xs">💬</span>}
        </div>
      </Link>
    </div>
  )
}
