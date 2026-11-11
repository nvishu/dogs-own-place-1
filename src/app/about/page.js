import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { STATS } from '@/lib/constants'
import Image from 'next/image'

export const metadata = {
  title: 'About Us',
  description: "Meet the team behind DOG'S OWN PLACE — certified trainers, vets and groomers who treat every dog like family.",
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-28 pb-16 bg-brand-cream dots-bg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 hero-blob" />
        <div className="page-container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="stagger">
              <span className="badge bg-orange-100 text-brand-primary mb-4">🐾 Our Story</span>
              <h1 className="section-title">Built by Dog Lovers,<br/><span className="text-brand-primary">For Dog Lovers</span></h1>
              <p className="text-gray-600 leading-relaxed mt-5">DOG&apos;S OWN PLACE was founded in 2020 by a group of passionate dog parents who were frustrated with the lack of quality, reliable dog care services in India. We set out to build the platform we wished existed.</p>
              <p className="text-gray-600 leading-relaxed mt-4">Today, DOP serves 5,000+ dog families across 50+ Indian cities, with a team of 500+ certified professionals dedicated to your dog&apos;s happiness and health.</p>
              <div className="flex gap-4 mt-8">
                <Link href="/services" className="btn-primary">Explore Services</Link>
                <Link href="/contact" className="btn-secondary">Contact Us</Link>
              </div>
            </div>
            <div className="relative h-80 lg:h-[450px] rounded-3xl overflow-hidden shadow-brand-lg">
              <Image fill sizes="(max-width: 768px) 100vw, 50vw" src="https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=800&auto=format&fit=crop&q=80" alt="Our team" className="w-full h-full object-cover"/>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-orange-gradient text-white">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center stagger">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-4xl mb-2">{s.icon}</div>
                <div className="font-display font-bold text-4xl">{s.value}</div>
                <div className="text-white/80 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="section-title">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger">
            {[
              {icon:'❤️',title:'Dog-First Always',desc:'Every decision puts the dog\'s safety, comfort, and happiness above everything else.'},
              {icon:'🎓',title:'Professional Excellence',desc:'Our staff are trained, certified, and continuously educated to deliver the highest standard of care.'},
              {icon:'🤝',title:'Trust & Transparency',desc:'No hidden fees, no surprises. We communicate openly with pet parents every step of the way.'},
              {icon:'🌱',title:'Continuous Innovation',desc:'We constantly update our services, tools, and training to stay at the cutting edge of pet care.'},
              {icon:'🏡',title:'Community First',desc:'We are not just a service — we are a community of dog lovers who support each other.'},
              {icon:'♻️',title:'Sustainability',desc:'We use eco-friendly products because a healthy planet means healthy dogs and people.'},
            ].map(v => (
              <div key={v.title} className="card text-center">
                <div className="text-5xl mb-4">{v.icon}</div>
                <h3 className="font-display font-bold text-xl text-brand-dark mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-cream">
        <div className="page-container">
          <div className="text-center mb-14">
            <h2 className="section-title">Leadership Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
            {[
              {name:'Dr. Priya Mehta',role:'CEO & Co-Founder',emoji:'👩‍⚕️',bg:'#E8622A',desc:'Veterinarian with 15 years experience. Dog mom to 3 Labradors.'},
              {name:'Arjun Sharma',role:'CTO & Co-Founder',emoji:'👨‍💻',bg:'#2E7D32',desc:'Tech entrepreneur. Built DOP from scratch. Golden Retriever dad.'},
              {name:'Dr. Kavita Nair',role:'Chief Vet Officer',emoji:'🩺',bg:'#1565C0',desc:'Specialist in canine behavior & nutrition with research background.'},
              {name:'Rahul Patel',role:'Head of Operations',emoji:'📋',bg:'#6A1B9A',desc:'Ex-Zomato leader. Ensures every service is delivered with perfection.'},
            ].map(p => (
              <div key={p.name} className="card text-center group">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 text-white group-hover:scale-110 transition-transform" style={{backgroundColor:p.bg}}>{p.emoji}</div>
                <h3 className="font-display font-bold text-brand-dark">{p.name}</h3>
                <p className="text-brand-primary text-sm font-semibold mb-2">{p.role}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-orange-gradient text-center">
        <div className="page-container">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Join the DOP Family Today</h2>
          <p className="text-white/80 mb-8">Be part of India&apos;s fastest-growing dog care community.</p>
          <Link href="/auth/register" className="inline-flex bg-white text-brand-primary font-bold px-8 py-4 rounded-full hover:bg-brand-cream transition-colors shadow-lg">
            Get Started Free 🐾
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}
