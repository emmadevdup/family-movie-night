'use client'

import Image from 'next/image'
import { AVATAR_LIST } from '@/lib/avatars'
import type { Database } from '@/types/database'

type InterestState = Database['public']['Enums']['interest_state']

type Props = {
  avatarId: string
  size?: 'sm' | 'md' | 'lg'
  interestState?: InterestState | null  // null = no vote (dimmed); undefined = context has no interest concept
  watched?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-11 h-11',
  lg: 'w-16 h-16',
}

const sizePx = { sm: 32, md: 44, lg: 64 }

const ringClasses: Record<InterestState, string> = {
  yes:     'ring-2 ring-green-500',
  no:      'ring-2 ring-red-400',
  neutral: 'ring-2 ring-gray-300',
}

export default function Avatar({ avatarId, size = 'md', interestState, watched }: Props) {
  const meta = AVATAR_LIST[avatarId]
  const px = sizePx[size]
  const ring = interestState ? ringClasses[interestState] : ''
  const opacity = interestState === null ? 'opacity-50' : ''

  if (!meta) return null

  return (
    <span className={`relative inline-flex shrink-0 ${sizeClasses[size]} ${opacity}`}>
      <Image
        src={meta.path}
        alt={meta.name}
        width={px}
        height={px}
        className={`rounded-full object-cover w-full h-full ${ring}`}
      />
      {watched && (
        <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-white text-[9px] leading-none">
          ✓
        </span>
      )}
    </span>
  )
}
