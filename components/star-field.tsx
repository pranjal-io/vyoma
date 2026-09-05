'use client'

import { useEffect, useRef } from 'react'

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    interface Star {
      x: number
      y: number
      radius: number
      opacity: number
      twinkleDuration: number
      twinkclePhase: number
      vx: number
      vy: number
    }

    // Generate stars
    const stars: Star[] = []
    const starCount = 100

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random() * 0.7 + 0.3,
        twinkleDuration: Math.random() * 3 + 2,
        twinkclePhase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
      })
    }

    interface ShootingStar {
      x: number
      y: number
      length: number
      speed: number
      angle: number
      life: number
    }

    let shootingStars: ShootingStar[] = []

    const drawStar = (star: Star, time: number) => {
      const phase = (time / (star.twinkleDuration * 1000)) * Math.PI * 2 + star.twinkclePhase
      const twinkle = Math.sin(phase) * 0.3 + 0.7

      ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`
      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawShootingStar = (star: ShootingStar) => {
      const tailLength = star.length
      const headX = star.x
      const headY = star.y
      const tailX = headX - Math.cos(star.angle) * tailLength
      const tailY = headY - Math.sin(star.angle) * tailLength

      const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY)
      gradient.addColorStop(0, `rgba(79, 195, 247, 0)`)
      gradient.addColorStop(0.5, `rgba(79, 195, 247, ${star.life * 0.5})`)
      gradient.addColorStop(1, `rgba(79, 195, 247, ${star.life})`)

      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(tailX, tailY)
      ctx.lineTo(headX, headY)
      ctx.stroke()
    }

    let lastShootingStarTime = 0
    let animationFrameId: number

    const animate = (time: number) => {
      // Clear canvas with slight trail effect
      ctx.fillStyle = 'rgba(9, 9, 11, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw and update regular stars
      stars.forEach((star) => {
        // Slow parallax movement
        star.x += star.vx
        star.y += star.vy

        // Wrap around edges
        if (star.x < 0) star.x = canvas.width
        if (star.x > canvas.width) star.x = 0
        if (star.y < 0) star.y = canvas.height
        if (star.y > canvas.height) star.y = 0

        drawStar(star, time)
      })

      // Draw and update shooting stars
      shootingStars = shootingStars.filter((star) => {
        star.life -= 0.01
        star.x += Math.cos(star.angle) * star.speed
        star.y += Math.sin(star.angle) * star.speed
        drawShootingStar(star)
        return star.life > 0
      })

      // Occasionally create shooting stars
      if (time - lastShootingStarTime > Math.random() * 3000 + 2000) {
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * (canvas.height * 0.6),
          length: Math.random() * 100 + 50,
          speed: Math.random() * 3 + 5,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.5,
          life: 1,
        })
        lastShootingStarTime = time
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animationFrameId = requestAnimationFrame(animate)

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
