const KEY = (userId: string) => `lastSeen_${userId}`

export function getLastSeen(userId: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(KEY(userId))
}

export function setLastSeen(userId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY(userId), new Date().toISOString())
}
