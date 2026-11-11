'use client'
import { useEffect, useRef, useState } from 'react'

// Animates "5,000+", "98%", "50+" from 0 when scrolled into view. Server renders the final value (SEO / no-JS safe).
export default function CountUp({ value, duration = 1600, className = '' }) {
  const ref = useRef(null)
  const m = String(value).match(/^([^\d]*)([\d,.]+)(.*)$/)
  const target = m ? parseFloat(m[2].replace(/,/g, '')) : NaN
  const [text, setText] = useState(String(value))

  useEffect(() => {
    if (!m || Number.isNaN(target)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const [, pre, num, post] = m
    const decimals = num.includes('.') ? num.split('.')[1].length : 0
    const fmt = (n) => pre + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + post
    setText(fmt(0))
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        setText(fmt(target * eased))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    if (ref.current) io.observe(ref.current)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <span ref={ref} className={className}>{text}</span>
}
