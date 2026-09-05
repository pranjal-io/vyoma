'use client'

import { useEffect } from 'react'

export default function ChatRedirect() {
  useEffect(() => {
    window.location.replace('/?section=chat')
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-text-muted">Loading chat...</div>
    </div>
  )
}
