import { ReactNode } from 'react'

interface GlassmorphicCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: 'primary' | 'cyan' | 'light' | 'none'
  variant?: 'default' | 'dark' | 'lg'
  onClick?: () => void
}

export default function GlassmorphicCard({
  children,
  className = '',
  hover = false,
  glow = 'none',
  variant = 'default',
  onClick,
}: GlassmorphicCardProps) {
  const baseClasses = {
    default: 'glass',
    dark: 'glass-dark',
    lg: 'glass-lg',
  }

  const glowClasses = {
    primary: 'glow-primary',
    cyan: 'glow-cyan',
    light: 'glow-light',
    none: '',
  }

  const hoverClasses = hover
    ? 'transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10'
    : ''

  return (
    <div
      className={`${baseClasses[variant]} ${glowClasses[glow]} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    >
      {children}
    </div>
  )
}
