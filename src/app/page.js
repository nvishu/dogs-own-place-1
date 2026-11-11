import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERVICES, TESTIMONIALS, STATS, HOW_IT_WORKS, FAQS } from '@/lib/constants'
import CountUp from '@/components/effects/CountUp'
import FAQ from '@/components/ui/FAQ'
import { SITE } from '@/lib/site'
import Image from 'next/image'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      telephone: SITE.phone,
      email: SITE.email,
      priceRange: '₹₹',
      areaServed: { '@type': 'Country', name: 'India' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Dog services',
        itemListElement: SERVICES.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title, description: s.shortDesc } })),
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden bg-brand-cream dots-bg">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 hero-blob animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 hero-blob animate-pulse-slow" style={{animationDelay:'1s'}} />

        <div className="page-container relative z-10 pt-24 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="stagger">
              <div className="inline-flex items-center gap-2 bg-white border border-orange-200 rounded-full px-4 py-2 text-sm font-semibold text-brand-primary shadow-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                India&apos;s #1 Dog Service Platform
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-brand-dark leading-tight">
                Your Dog<br />
                <span className="gradient-text-animated italic">Deserves</span><br />
                The Best 🐾
              </h1>
              <p className="text-lg text-brand-brown/70 mt-6 max-w-lg leading-relaxed">
                From expert training to spa-level grooming — DOG&apos;S OWN PLACE is your one-stop destination for premium dog care. Trusted by 5,000+ happy dog parents across India.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link href="/auth/register" className="btn-primary btn-lg">
                  Get Started Free 🐾
                </Link>
                <Link href="/services" className="btn-secondary btn-lg">
                  Explore Services
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 mt-10">
                {STATS.map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="font-display font-bold text-2xl text-brand-primary"><CountUp value={stat.value} /></div>
                    <div className="text-xs text-brand-brown/60 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative w-full h-[520px]">
                <div className="absolute top-0 right-0 w-72 h-80 rounded-3xl overflow-hidden shadow-brand-lg animate-float">
                  <Image fill sizes="(max-width: 768px) 100vw, 50vw" src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&auto=format&fit=crop&q=80" alt="Happy Labrador" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-0 left-0 w-60 h-72 rounded-3xl overflow-hidden shadow-warm-lg animate-float" style={{animationDelay:'1s'}}>
                  <Image fill sizes="(max-width: 768px) 100vw, 50vw" src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&auto=format&fit=crop&q=80" alt="Dog portrait" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-32 left-16 w-44 h-52 rounded-2xl overflow-hidden shadow-warm animate-float" style={{animationDelay:'2s'}}>
                  <Image fill sizes="(max-width: 768px) 100vw, 50vw" src="https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400&auto=format&fit=crop&q=80" alt="Dog portrait" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-4 left-4 bg-white rounded-2xl shadow-warm px-4 py-3 flex items-center gap-2 animate-float" style={{animationDelay:'0.5s'}}>
                  <span className="text-2xl">⭐</span>
                  <div>
                    <div className="font-bold text-brand-dark text-sm">4.9 / 5.0</div>
                    <div className="text-xs text-gray-400">5,000+ Reviews</div>
                  </div>
                </div>
                <div className="absolute bottom-12 right-0 bg-brand-primary text-white rounded-2xl shadow-brand px-4 py-3 animate-float" style={{animationDelay:'1.5s'}}>
                  <div className="font-bold text-sm">🐾 8 Services</div>
                  <div className="text-xs text-white/80">All under one roof</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-14">
            <span className="badge bg-orange-100 text-brand-primary mb-3">🐾 Our Services</span>
            <h2 className="section-title">Everything Your Dog Needs</h2>
            <p className="section-subtitle mx-auto">8 premium services to keep your furry family member healthy, happy, and thriving.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
            {SERVICES.slice(0, 8).map(service => (
              <Link key={service.id} href={`/services/${service.id}`} className="service-card group block">
                <div className="relative h-44 overflow-hidden">
                  <Image fill sizes="(max-width: 768px) 100vw, 50vw" src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3"><span className="text-2xl">{service.icon}</span></div>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-brand-dark mb-1">{service.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{service.shortDesc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-primary font-bold">₹{service.price.basic}+</span>
                    <span className="text-xs bg-brand-light text-brand-primary font-bold px-3 py-1.5 rounded-full group-hover:bg-brand-primary group-hover:text-white transition-colors">
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services" className="btn-primary px-8 py-4">View All Services & Pricing</Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-brand-cream dots-bg">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="badge bg-orange-100 text-brand-primary mb-3">Why DOP?</span>
              <h2 className="section-title">The Place Where Dogs Come First</h2>
              <p className="section-subtitle">We built DOP with one thing in mind — your dog&apos;s happiness and health.</p>
              <div className="space-y-4 mt-8 stagger">
                {[
                  { icon: '🎓', title: 'Certified Professionals', desc: 'Every trainer, vet & walker is licensed, background-checked, and certified.' },
                  { icon: '📱', title: 'Track Everything', desc: 'Real-time GPS, health records, appointment reminders in one platform.' },
                  { icon: '❤️', title: 'Dog-Centered Care', desc: 'Positive reinforcement only. We treat your dogs like our own family.' },
                  { icon: '🏆', title: '5-Star Guarantee', desc: 'Not happy? We redo the service free of charge. Satisfaction guaranteed.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-4 card !py-4">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-brand-dark">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-brand-lg h-96 lg:h-[500px]">
                <Image fill sizes="(max-width: 768px) 100vw, 50vw" src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80" alt="Dog walking" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-warm-lg p-5">
                <div className="font-display font-bold text-3xl text-brand-primary">98%</div>
                <div className="text-sm text-gray-500 font-medium">Customer satisfaction</div>
                <div className="flex -space-x-2 mt-2">
                  {['🐕','🐩','🦮','🐈'].map((e, i) => (
                    <span key={i} className="w-7 h-7 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-sm">{e}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BANNER */}
      <section className="py-16 bg-orange-gradient-animated">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center stagger">
            {STATS.map(stat => (
              <div key={stat.label}>
                <div className="text-5xl mb-2">{stat.icon}</div>
                <div className="font-display font-bold text-4xl"><CountUp value={stat.value} /></div>
                <div className="text-white/80 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-white">
        <div className="page-container">
          <div className="text-center mb-14">
            <span className="badge bg-orange-100 text-brand-primary mb-3">❤️ Happy Families</span>
            <h2 className="section-title">What Dog Parents Say</h2>
            <p className="section-subtitle mx-auto">Thousands of dogs and their humans love us. Here are their stories.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card relative">
                <div className="text-4xl mb-4 text-brand-primary opacity-30 font-display">&ldquo;</div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">{t.text}</p>
                <div className="flex mb-3">{[...Array(t.rating)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">⭐</span>)}</div>
                <div className="flex items-center gap-3 border-t border-orange-100 pt-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{backgroundColor: t.color}}>{t.avatar}</div>
                  <div>
                    <div className="font-bold text-brand-dark text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.dog} · {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-brand-cream dots-bg">
        <div className="page-container">
          <div className="text-center mb-14">
            <span className="badge bg-orange-100 text-brand-primary mb-3">✨ Simple &amp; Fast</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle mx-auto">Book premium dog care in three easy steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="card text-center relative pt-10">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-orange-gradient text-white font-display font-bold text-lg flex items-center justify-center shadow-brand">{i + 1}</div>
                <div className="text-5xl mb-4 animate-float" style={{ animationDelay: `${i * 0.4}s` }}>{step.icon}</div>
                <h3 className="font-display font-bold text-xl text-brand-dark mb-2">{step.title}</h3>
                <p className="text-brand-brown/70 text-sm leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white" id="faq">
        <div className="page-container">
          <div className="text-center mb-12">
            <span className="badge bg-orange-100 text-brand-primary mb-3">❓ FAQ</span>
            <h2 className="section-title">Questions? We&apos;ve Got Answers</h2>
          </div>
          <FAQ items={FAQS} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-9xl">🐾</div>
          <div className="absolute bottom-10 right-10 text-9xl">🐾</div>
        </div>
        <div className="page-container text-center relative z-10">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Give Your Dog<br /><span className="text-brand-accent">The Best Life?</span>
          </h2>
          <p className="text-orange-200/70 text-lg mb-8 max-w-xl mx-auto">
            Join 5,000+ dog parents who trust DOG&apos;S OWN PLACE for all their pet care needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary btn-lg !bg-brand-accent hover:!bg-yellow-400 !text-brand-dark">
              Register Free Today 🐾
            </Link>
            <Link href="/contact" className="btn-secondary btn-lg !bg-transparent !border-white !text-white hover:!bg-white hover:!text-brand-dark">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
