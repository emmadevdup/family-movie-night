'use client'

import { useState, useEffect } from 'react'

export function useActiveUser() {
  const [activeUserId, setActiveUserId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setActiveUserId(localStorage.getItem('activeUserId'))
    setHydrated(true)
  }, [])

  function setUser(id: string) {
    localStorage.setItem('activeUserId', id)
    setActiveUserId(id)
  }

  return { activeUserId, setUser, hydrated }
}
