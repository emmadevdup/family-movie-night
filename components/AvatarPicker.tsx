'use client'

import Avatar from '@/components/Avatar'
import { AVATAR_LIST } from '@/lib/avatars'

const EMOJI_KEYS = ['fox', 'wolf', 'dragon', 'unicorn', 'fish', 'owl', 'elf', 'astronaut', 'princess']
const ILLUSTRATED_KEYS = ['braids', 'curls', 'ponytail', 'cap', 'headphones', 'fringe', 'cat-face', 'fox-face', 'astronaut-face', 'wizard-face', 'robot-face']

type Props = {
  selected: string
  onSelect: (avatarId: string) => void
}

function Group({ title, keys, selected, onSelect }: { title: string; keys: string[]; selected: string; onSelect: (id: string) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">{title}</p>
      <div className="grid grid-cols-5 gap-3">
        {keys.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            aria-label={AVATAR_LIST[id]?.name}
            className={`flex flex-col items-center gap-1 p-1 rounded-xl min-h-11 min-w-11 transition-colors ${
              selected === id ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Avatar avatarId={id} size="md" />
            <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center leading-tight">{AVATAR_LIST[id]?.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AvatarPicker({ selected, onSelect }: Props) {
  return (
    <div className="space-y-6">
      <Group title="Emoji" keys={EMOJI_KEYS} selected={selected} onSelect={onSelect} />
      <Group title="Illustrated" keys={ILLUSTRATED_KEYS} selected={selected} onSelect={onSelect} />
    </div>
  )
}
