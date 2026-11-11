'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowUp, Phone, MessageCircle } from 'lucide-react'
import { SITE } from '@/lib/site'

const REVEAL_SELECTOR = '.card, .service-card, .section-title, .section-subtitle, [data-reveal]'

/**
 * Site-wide polish, mounted once in layout.js:
 *  - scroll progress bar
 *  - scroll-reveal of cards / headings / stagger grids (only elements BELOW the fold are hidden → no flash)
 *  - pointer-follow spotlight on cards (fine pointers only)
 *  - back-to-top + call + WhatsApp floating buttons
 */
export default function PageEffects() {
  const pathname = usePathname()
  const bar = useRef(null)
  const [showTop, setShowTop] = useState(false)

  // Scroll progress + back-to-top visibility
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
      setShowTop(window.scrollY > 600)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [pathname])

  // Scroll reveal (re-scans when the route changes or client-rendered content appears)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('rv-in'); io.unobserve(e.target) }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })

    const seen = new WeakSet()
    const scan = () => {
      const vh = window.innerHeight
      document.querySelectorAll('.stagger').forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        if (el.getBoundingClientRect().top > vh * 0.92) { el.classList.add('rv-wait'); io.observe(el) }
      })
      document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        if (el.parentElement?.classList.contains('stagger')) return // animated by its stagger parent
        if (el.getBoundingClientRect().top > vh * 0.92) { el.classList.add('rv'); io.observe(el) }
      })
    }
    scan()
    let t = 0
    const mo = new MutationObserver(() => { clearTimeout(t); t = setTimeout(scan, 60) })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect(); clearTimeout(t) }
  }, [pathname])

  // Spotlight that follows the pointer over cards
  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const onMove = (e) => {
      const el = e.target.closest?.('.card, .service-card')
      if (!el) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => document.removeEventListener('pointermove', onMove)
  }, [])

  const hideActions = pathname?.startsWith('/admin')
  const wa = SITE.whatsapp ? `https://wa.me/${SITE.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent("Hi! I'd like to know more about your dog services.")}` : null

  return (
    <>
      <div ref={bar} className="scroll-progress" aria-hidden="true" />
      {!hideActions && (
        <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-40 flex flex-col items-center gap-3" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <button
            type="button" aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`fab w-11 h-11 rounded-full bg-white text-brand-primary shadow-warm-lg border border-orange-100 flex items-center justify-center ${showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          >
            <ArrowUp size={20} />
          </button>
          <a href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`} aria-label={`Call ${SITE.name}`}
            className="fab md:hidden w-12 h-12 rounded-full bg-brand-dark text-white shadow-warm-lg flex items-center justify-center">
            <Phone size={20} />
          </a>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
              className="fab relative w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center" style={{ background: '#25D366' }}>
              <span className="absolute inset-0 rounded-full animate-ping-soft" style={{ background: '#25D366', opacity: .35 }} />
              <MessageCircle size={26} className="relative" />
            </a>
          )}
        </div>
      )}
    </>
  )
}
