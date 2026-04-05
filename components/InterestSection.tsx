'use client'

import Avatar from '@/components/Avatar'
import { cycleInterest } from '@/lib/interests'
import type { Tables } from '@/types/database'

type Interest = Tables<'interests'>
type Member = Tables<'family_members'>

type Props = {
  members: Member[]
  interests: Interest[]
  onCycleInterest: (memberId: string, next: Interest['interest']) => void
  onToggleWatched: (memberId: string, watched: boolean) => void
}

const GROUP_ORDER = ['yes', 'neutral', 'no'] as const

export default function InterestSection({ members, interests, onCycleInterest, onToggleWatched }: Props) {
  const allWatched = members.length > 0 && members.every((m) =>
    interests.find((i) => i.family_member_id === m.id)?.watched
  )

  const sorted = [...members].sort((a, b) => {
    const stateA = interests.find((i) => i.family_member_id === a.id)?.interest ?? 'neutral'
    const stateB = interests.find((i) => i.family_member_id === b.id)?.interest ?? 'neutral'
    return GROUP_ORDER.indexOf(stateA) - GROUP_ORDER.indexOf(stateB)
  })

  return (
    <div className="space-y-3">
      {allWatched && (
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-700 dark:text-green-400 font-medium text-sm">
          All seen ✓
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {sorted.map((member) => {
          const interest = interests.find((i) => i.family_member_id === member.id)
          const state = interest?.interest ?? 'neutral'
          const watched = interest?.watched ?? false

          return (
            <div key={member.id} className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => onCycleInterest(member.id, cycleInterest(state))}
                className="min-h-11 min-w-11 flex items-center justify-center"
                aria-label={`${member.name}: ${state} — tap to change`}
                data-testid={`interest-toggle-${member.id}`}
              >
                <Avatar avatarId={member.avatar_id} size="lg" interestState={state} watched={watched} />
              </button>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{member.name}</span>
              <button
                type="button"
                onClick={() => onToggleWatched(member.id, !watched)}
                className={`text-[10px] px-2 py-0.5 rounded-full min-h-11 transition-colors ${
                  watched ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {watched ? 'Watched ✓' : 'Mark watched'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
