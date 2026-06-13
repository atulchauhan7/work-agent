import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function Cursor() {
  const [enabled, setEnabled] = useState(false)
  const [hover, setHover] = useState(false)
  const [down, setDown] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 400, damping: 32, mass: 0.5 })
  const ringY = useSpring(y, { stiffness: 400, damping: 32, mass: 0.5 })

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    setEnabled(true)
    document.documentElement.classList.add('has-cursor')

    const move = e => { x.set(e.clientX); y.set(e.clientY) }
    const over = e => {
      const t = e.target.closest && e.target.closest('a, button, [data-hover], input, textarea, select')
      setHover(!!t)
    }
    const dn = () => setDown(true)
    const up = () => setDown(false)
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    window.addEventListener('mousedown', dn)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      window.removeEventListener('mousedown', dn)
      window.removeEventListener('mouseup', up)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [x, y])

  if (!enabled) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" style={{ mixBlendMode: 'difference' }} aria-hidden>
      <motion.div style={{ x: ringX, y: ringY }} className="absolute top-0 left-0">
        <motion.div
          animate={{ scale: hover ? 2.6 : down ? 0.7 : 1, opacity: hover ? 1 : 0.85 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="-ml-4 -mt-4 h-8 w-8 rounded-full border border-white"
        />
      </motion.div>
      <motion.div style={{ x, y }} className="absolute top-0 left-0">
        <div className="-ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-white" />
      </motion.div>
    </div>
  )
}
