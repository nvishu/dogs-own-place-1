'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FAQ({ items }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {items.map((it, i) => {
        const isOpen = open === i
        return (
          <div key={it.q} className={`rounded-2xl bg-white border transition-all duration-300 ${isOpen ? 'border-brand-primary/40 shadow-brand' : 'border-orange-100 shadow-warm hover:border-orange-200'}`}>
            <h3>
              <button type="button" aria-expanded={isOpen} aria-controls={`faq-${i}`} onClick={() => setOpen(isOpen ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 sm:px-6 sm:py-5 font-bold text-brand-dark">
                <span>{it.q}</span>
                <ChevronDown size={20} className={`shrink-0 text-brand-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
            </h3>
            <div id={`faq-${i}`} role="region" className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
              <div className="overflow-hidden">
                <p className="px-5 sm:px-6 pb-5 text-brand-brown/80 leading-relaxed">{it.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
