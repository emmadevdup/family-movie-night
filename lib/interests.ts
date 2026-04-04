import type { Database } from '@/types/database'

export type InterestState = Database['public']['Enums']['interest_state']

export function cycleInterest(current: InterestState): InterestState {
  if (current === 'neutral') return 'yes'
  if (current === 'yes') return 'no'
  return 'neutral'
}
