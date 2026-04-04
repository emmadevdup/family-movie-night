'use client'

import Avatar from '@/components/Avatar'
import { cycleInterest, type InterestState } from '@/lib/interests'
import type { Tables } from '@/types/database'

type FamilyMember = Tables<'family_members'>

type Props = {
  members: FamilyMember[]
  interests: Record<string, InterestState>
  onChange: (interests: Record<string, InterestState>) => void
  onSave: () => void
  onBack: () => void
  saving: boolean
}

export default function InterestStep({ members, interests, onChange, onSave, onBack, saving }: Props) {
  function toggle(memberId: string) {
    const current = interests[memberId] ?? 'neutral'
    onChange({ ...interests, [memberId]: cycleInterest(current) })
  }

  const ringLabel: Record<InterestState, string> = {
    yes: 'Yes',
    no: 'No',
    neutral: 'Maybe',
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 text-center">
        Tap each person to set their interest. Tap again to cycle.
      </p>

      <div className="grid grid-cols-3 gap-4">
        {members.map((m) => {
          const state = interests[m.id] ?? 'neutral'
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              data-testid={`interest-btn-${m.id}`}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl min-h-11 hover:bg-gray-50 transition-colors"
            >
              <Avatar avatarId={m.avatar_id} size="lg" interestState={state} />
              <span className="text-sm font-medium text-gray-800">{m.name}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                state === 'yes' ? 'bg-green-100 text-green-700' :
                state === 'no' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {ringLabel[state]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-medium min-h-11 disabled:opacity-50 hover:bg-indigo-700 transition-colors"
        >
          {saving ? 'Saving…' : 'Save to catalogue'}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium min-h-11 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  )
}
