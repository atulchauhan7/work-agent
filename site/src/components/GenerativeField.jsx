import { useEffect, useRef } from 'react'

/**
 * Ambient generative dot field — calm, no cursor interaction.
 * A slow travelling wave gently varies dot size & opacity so the
 * backdrop feels alive without being distracting. Optimized:
 * DPR-aware, pauses off-screen, static fallback for reduced-motion.
 */
export default function GenerativeField({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const GAP = 32
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0, h = 0, cols = 0, rows = 0
    let raf = 0, running = true, t = 0

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width; h = r.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(w / GAP) + 1
      rows = Math.ceil(h / GAP) + 1
    }

    const draw = () => {
      if (!running) return
      t += 0.008
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const wave = Math.sin(i * 0.3 + j * 0.22 - t * 1.2)
          const size = 0.7 + (wave + 1) * 0.35      // 0.7 .. 1.4
          const alpha = 0.05 + (wave + 1) * 0.035    // 0.05 .. 0.12
          ctx.beginPath()
          ctx.fillStyle = `rgba(255,255,255,${alpha * 0.6})`
          ctx.arc(i * GAP, j * GAP, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      raf = requestAnimationFrame(draw)
    }

    const drawStatic = () => {
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        ctx.beginPath()
        ctx.fillStyle = 'rgba(255,255,255,0.05)'
        ctx.arc(i * GAP, j * GAP, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    resize()
    if (reduce) drawStatic()
    else raf = requestAnimationFrame(draw)
    const onResize = () => { resize(); if (reduce) drawStatic() }
    window.addEventListener('resize', onResize)

    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting && !reduce
      if (running && !raf) raf = requestAnimationFrame(draw)
      if (!running) { cancelAnimationFrame(raf); raf = 0 }
    }, { threshold: 0 })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      io.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden />
}
