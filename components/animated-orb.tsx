export default function AnimatedOrb() {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse" />
      <div
        className="absolute inset-2 rounded-full border border-accent-cyan/20 animate-pulse"
        style={{ animationDelay: '0.5s' }}
      />
      <div
        className="absolute inset-4 rounded-full border border-accent-light/10 animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      {/* Main orb with gradient */}
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/40 via-accent-cyan/20 to-accent-light/10 blur-xl animate-glow-pulse" />

      {/* Inner bright core */}
      <div className="absolute inset-12 rounded-full bg-gradient-to-r from-accent-cyan to-accent-light blur-lg opacity-50 animate-float" />

      {/* Center point */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent-light shadow-lg shadow-primary/50" />
    </div>
  )
}
