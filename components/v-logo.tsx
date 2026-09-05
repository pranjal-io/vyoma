'use client'

export default function VLogo() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Subtle monochrome nebula background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-grey-700/10 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-grey-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Floating white particles around logo */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              left: `${50 + 40 * Math.cos((i / 12) * Math.PI * 2)}%`,
              top: `${50 + 40 * Math.sin((i / 12) * Math.PI * 2)}%`,
              animation: `float${(i % 3) + 1} ${3 + (i % 3) * 0.5}s ease-in-out infinite`,
              opacity: 0.4 + (i % 3) * 0.2,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Main V Logo */}
      <div className="relative z-10">
        {/* Outer subtle glow layers - monochrome */}
        <div className="absolute inset-0 rounded-full blur-3xl bg-white opacity-5 animate-pulse" />
        <div className="absolute inset-0 rounded-full blur-2xl bg-gradient-to-r from-grey-300/20 to-white/20 opacity-10 animate-glow-pulse" style={{ animationDelay: '0.5s' }} />

        {/* Inner glassmorphic container - premium monochrome */}
        <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full glass border-2 border-white/20 flex items-center justify-center overflow-hidden group backdrop-blur-md">
          {/* Subtle background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-grey-500/5 to-black/20 group-hover:from-white/12 group-hover:via-grey-400/8 group-hover:to-black/25 transition-all duration-1000" />

          {/* Inner subtle ring */}
          <div className="absolute inset-2 rounded-full border border-white/15 animate-spin" style={{ animationDuration: '10s' }} />

          {/* V Letter - Premium monochrome */}
          <svg
            viewBox="0 0 100 100"
            className="relative w-20 h-20 md:w-32 md:h-32"
          >
            <defs>
              {/* Soft white glow filter */}
              <filter id="monoVGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* V shape - bright white */}
            <path
              d="M 20 10 L 50 90 L 80 10"
              stroke="#ffffff"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              filter="url(#monoVGlow)"
              opacity="0.95"
            />

            {/* V outer glow - subtle white */}
            <path
              d="M 20 10 L 50 90 L 80 10"
              stroke="#ffffff"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.15"
            />
          </svg>

          {/* Rotating subtle ring */}
          <div className="absolute inset-0 rounded-full border border-transparent bg-gradient-to-r from-white/20 via-transparent to-grey-400/20 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
        </div>

        {/* Outer pulsing rings - monochrome */}
        <div className="absolute -inset-4 rounded-full border border-white/10 animate-pulse" style={{ animationDuration: '2.5s' }} />
        <div className="absolute -inset-8 rounded-full border border-white/5 animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(3px, -3px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-4px, 2px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(2px, 3px); }
        }
      `}</style>
    </div>
  )
}
