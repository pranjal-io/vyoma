export default function FloatingParticles() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float-particles"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`cyan-${i}`}
          className="absolute w-0.5 h-0.5 bg-accent-cyan/20 rounded-full animate-float-particles"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.8 + 1}s`,
          }}
        />
      ))}
    </div>
  )
}
