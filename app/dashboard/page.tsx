'use client'

import { useEffect } from 'react'

export default function DashboardRedirect() {
  useEffect(() => {
    window.location.replace('/?section=dashboard')
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-text-muted">Loading dashboard...</div>
    </div>
  )
}
