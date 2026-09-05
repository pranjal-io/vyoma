'use client'

import BrandLogo from './brand-logo'

interface HeaderProps {
  activeSection?: string
  onNavigate?: (section: string) => void
}

export default function Header({ activeSection = 'landing', onNavigate }: HeaderProps) {
  const handleNav = (section: string, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(section)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-dark border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <a 
          href="#landing" 
          onClick={(e) => handleNav('landing', e)} 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <BrandLogo />
          <span className="text-lg font-bold text-text">Vyoma</span>
        </a>
        
        <nav className="flex items-center gap-4 md:gap-6">
          <a
            href="#dashboard"
            onClick={(e) => handleNav('dashboard', e)}
            className={`transition-colors font-medium text-sm md:text-base ${
              activeSection === 'dashboard' ? 'text-primary' : 'text-text-muted hover:text-text'
            }`}
          >
            Dashboard
          </a>
          <a
            href="#chat"
            onClick={(e) => handleNav('chat', e)}
            className={`transition-colors font-medium text-sm md:text-base ${
              activeSection === 'chat' ? 'text-primary' : 'text-text-muted hover:text-text'
            }`}
          >
            Chat
          </a>
          <a
            href="#settings"
            onClick={(e) => handleNav('settings', e)}
            className={`transition-colors font-medium text-sm md:text-base ${
              activeSection === 'settings' ? 'text-primary' : 'text-text-muted hover:text-text'
            }`}
          >
            Settings
          </a>
        </nav>
      </div>
    </header>
  )
}
