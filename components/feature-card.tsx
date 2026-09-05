import { ReactNode } from 'react'
import GlassmorphicCard from './glassmorphic-card'

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  onClick?: () => void
}

export default function FeatureCard({
  icon,
  title,
  description,
  onClick,
}: FeatureCardProps) {
  return (
    <GlassmorphicCard
      variant="dark"
      glow="primary"
      hover
      className="p-6 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="text-accent-cyan text-2xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
          <p className="text-text-muted text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </GlassmorphicCard>
  )
}
