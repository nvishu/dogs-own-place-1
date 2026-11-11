'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERVICES } from '@/lib/constants'
import Image from 'next/image'

const SERVICE_EXTRAS = {
  training: {
    faqs: [
      { q: 'What age can my dog start training?', a: 'Puppies can start from 8 weeks with socialization classes. Formal obedience training is best from 4–6 months.' },
      { q: 'How many sessions does my dog need?', a: 'Most dogs see significant improvement in 6–8 sessions. Complex behavioral issues may need 12–16 sessions.' },
      { q: 'Do you use punishment-based methods?', a: 'Never. We exclusively use positive reinforcement — rewards, praise, and play. No prong collars or shock devices.' },
      { q: 'Can I attend my dog\'s training sessions?', a: 'Absolutely! We encourage owners to attend so they can continue training at home for best results.' },
    ],
    process: ['Initial behavior assessment', 'Customized training plan created', 'Weekly 1-on-1 sessions begin', 'Progress reports after every session', 'Graduation assessment & certificate'],
    benefits: ['Reduces destructive behavior', 'Improves recall and focus', 'Builds confidence in shy dogs', 'Strengthens your bond', 'Makes vet visits easier'],
    gallery: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548681528-6a5c45b66063?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=600&auto=format&fit=crop&q=80',
    ],
    badge: '🏆 Most Popular',
    stats: [{ v: '2,000+', l: 'Dogs Trained' }, { v: '98%', l: 'Success Rate' }, { v: '4.9★', l: 'Avg Rating' }],
  },
  walking: {
    faqs: [
      { q: 'Are your walkers background-checked?', a: 'Yes, all walkers undergo a full police background check, reference checks, and complete our 40-hour walker certification program.' },
      { q: 'How do I track my dog\'s walk?', a: 'You receive a live GPS link when the walk starts. After each walk, you get a photo report and walk summary in the app.' },
      { q: 'What if it rains?', a: 'Our walkers carry emergency rain gear. You\'ll be notified in advance about extreme weather and given the option to reschedule.' },
      { q: 'Can my dog walk with other dogs?', a: 'Yes! Group walks (max 4 dogs) are available at a lower rate. Solo walks are available for dogs who prefer one-on-one time.' },
    ],
    process: ['Walker matched based on dog profile', 'Meet & greet session first', 'GPS-tracked walk begins', 'Real-time photo updates sent', 'Post-walk report delivered'],
    benefits: ['Essential daily exercise', 'Reduces anxiety & boredom', 'Better sleep at night', 'Socialization with other dogs', 'Peace of mind at work'],
    gallery: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&auto=format&fit=crop&q=80',
    ],
    badge: '📍 GPS Tracked',
    stats: [{ v: '1,500+', l: 'Daily Walks' }, { v: '100%', l: 'GPS Coverage' }, { v: '4.8★', l: 'Avg Rating' }],
  },
  healthcheckup: {
    faqs: [
      { q: 'What does a full health checkup include?', a: 'Physical exam, weight assessment, dental check, eye & ear inspection, heart & lung auscultation, and optional blood work.' },
      { q: 'How often should my dog get a checkup?', a: 'Once a year for healthy adults. Puppies need checkups every 3–4 weeks until 16 weeks, then annually. Seniors (7+) should come every 6 months.' },
      { q: 'Do I need to bring anything?', a: 'Bring your dog\'s previous vaccination records and any medications they\'re currently on. Fasting is required only if blood work is booked.' },
      { q: 'Can I get a health certificate for travel?', a: 'Yes, our licensed vets can issue DGCA-approved health certificates needed for domestic and international travel.' },
    ],
    process: ['Appointment confirmed', 'Full physical examination', 'Blood work & tests (if needed)', 'Detailed health report issued', 'Follow-up care plan provided'],
    benefits: ['Early disease detection', 'Track weight & nutrition', 'Digital health records', 'Vet-issued travel certificates', 'Vaccination schedule management'],
    gallery: [
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?w=600&auto=format&fit=crop&q=80',
    ],
    badge: '🩺 Vet Approved',
    stats: [{ v: '3,200+', l: 'Checkups Done' }, { v: '50+', l: 'Licensed Vets' }, { v: '4.9★', l: 'Avg Rating' }],
  },
  vaccination: {
    faqs: [
      { q: 'What vaccines does my puppy need?', a: 'Core vaccines: Distemper, Parvo, Hepatitis (DHPP combo), and Rabies. Non-core includes Bordetella and Leptospirosis depending on lifestyle.' },
      { q: 'Are there any side effects?', a: 'Mild soreness or low energy for 24–48 hours is normal. Severe reactions are extremely rare. Our vets monitor your dog for 15 minutes post-vaccine.' },
      { q: 'How do you track vaccination history?', a: 'All records are stored in your secure digital dashboard. You\'ll receive automated reminders 2 weeks before each vaccine is due.' },
      { q: 'Can my dog be vaccinated at home?', a: 'Yes! Home vaccination visits are available in select cities for a ₹200 travel fee. Perfect for dogs anxious about clinic visits.' },
    ],
    process: ['Review past vaccination records', 'Vet assesses dog\'s health', 'Vaccine administered safely', 'Observation period (15 min)', 'Digital certificate issued'],
    benefits: ['Prevents deadly diseases', 'Digital reminder system', 'Government-approved records', 'Rabies certificate for travel', 'Herd immunity protection'],
    gallery: [
      'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&auto=format&fit=crop&q=80',
    ],
    badge: '💉 Certified Vets',
    stats: [{ v: '8,000+', l: 'Vaccines Given' }, { v: '100%', l: 'Safe Record' }, { v: '4.9★', l: 'Avg Rating' }],
  },
  grooming: {
    faqs: [
      { q: 'How often should I groom my dog?', a: 'Short-haired breeds: every 6–8 weeks. Long-haired and double-coated breeds: every 4–6 weeks to prevent matting.' },
      { q: 'Do you offer breed-specific styling?', a: 'Yes! Our groomers are trained in breed-standard cuts for Poodles, Shih Tzus, Cockers, Bichons, and more.' },
      { q: 'What shampoos do you use?', a: 'We use hypoallergenic, vet-approved shampoos. If your dog has a skin condition, please mention it during booking.' },
      { q: 'Can I stay and watch my dog being groomed?', a: 'Dogs tend to behave better without their owner watching, but we send live photo updates throughout the session.' },
    ],
    process: ['Pre-groom coat assessment', 'Bath with premium shampoo', 'Blow dry & de-shed', 'Haircut & breed-specific styling', 'Nail trim, ear clean, finishing spray'],
    benefits: ['Prevents painful matting', 'Early detection of skin issues', 'Reduces shedding by 70%', 'Fresh smell lasts weeks', 'Improves coat health'],
    gallery: [
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=600&auto=format&fit=crop&q=80',
    ],
    badge: '✨ Spa Level',
    stats: [{ v: '4,500+', l: 'Grooms Done' }, { v: '30+', l: 'Breed Styles' }, { v: '4.9★', l: 'Avg Rating' }],
  },
  daycare: {
    faqs: [
      { q: 'What hours is daycare open?', a: 'Monday to Saturday, 7 AM to 7 PM. We\'re closed on Sundays and national holidays. Extended hours available on request.' },
      { q: 'Is my dog\'s space secure?', a: 'Our facility is fully enclosed with CCTV monitoring in all play areas. Staff-to-dog ratio is maximum 1:5.' },
      { q: 'What do dogs do all day?', a: 'Morning play session, mid-day nap, afternoon activities (enrichment toys, splash pools in summer), and a final play session before pickup.' },
      { q: 'Can I check on my dog via camera?', a: 'Premium plan members get access to our live camera feed accessible via the app or browser throughout the day.' },
    ],
    process: ['Temperament assessment (first visit)', 'Drop-off from 7 AM', 'Supervised play & structured activities', 'Meals & nap time included', 'Pickup by 7 PM with daily report'],
    benefits: ['Eliminates separation anxiety', 'Socialization with other dogs', 'Structured schedule & meals', 'Live CCTV access (Premium)', 'Tired & happy dog at pickup'],
    gallery: [
      'https://images.unsplash.com/photo-1601758003122-53c40e686a19?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&auto=format&fit=crop&q=80',
    ],
    badge: '🏠 Full Day Care',
    stats: [{ v: '200+', l: 'Daily Capacity' }, { v: '7AM–7PM', l: 'Open Hours' }, { v: '4.8★', l: 'Avg Rating' }],
  },
  emergency: {
    faqs: [
      { q: 'What counts as an emergency?', a: 'Difficulty breathing, collapse, seizures, suspected poisoning, severe bleeding, eye injuries, prolonged vomiting/diarrhea, or any sudden distress.' },
      { q: 'How quickly can a vet reach me?', a: 'For home emergency visits in metro cities, our average response time is 28 minutes. Video consultations connect in under 2 minutes.' },
      { q: 'Is emergency care covered by pet insurance?', a: 'Most pet insurance plans cover emergency care. We provide itemized bills compatible with all major Indian pet insurance providers.' },
      { q: 'What if I need specialist referral?', a: 'We have a network of 50+ specialist veterinarians. Our team will coordinate an urgent referral and transfer all records immediately.' },
    ],
    process: ['Call or app alert sent', 'Vet triaged in under 2 minutes', 'Video consult OR home visit dispatched', 'Treatment & stabilization', 'Follow-up care planned'],
    benefits: ['24/7 round-the-clock coverage', '28-min average home response', 'Specialists on call', 'Insurance-compatible billing', 'Complete emergency records'],
    gallery: [
      'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?w=600&auto=format&fit=crop&q=80',
    ],
    badge: '🚨 24/7 Available',
    stats: [{ v: '24/7', l: 'Always Open' }, { v: '28 min', l: 'Avg Response' }, { v: '4.9★', l: 'Avg Rating' }],
  },
  nutrition: {
    faqs: [
      { q: 'Is this service online or in-person?', a: 'Both! Initial consultation is video-based (30 min). Follow-up monthly reviews can be video or in-person depending on your city.' },
      { q: 'Will you create a custom meal plan?', a: 'Yes. After assessing your dog\'s breed, age, weight, activity level, and health conditions, we create a complete 30-day meal plan.' },
      { q: 'Do you recommend homemade food or kibble?', a: 'We\'re diet-agnostic — we optimize whatever feeding style you prefer (raw, home-cooked, kibble, or hybrid) for your dog\'s specific needs.' },
      { q: 'What if my dog has allergies?', a: 'We do full allergy screening and design elimination diets to identify triggers, then create an allergen-free feeding plan.' },
    ],
    process: ['Online intake form + photo of your dog', '30-min consultation with nutritionist', 'Custom 30-day meal plan delivered', 'Weekly check-in via app', 'Monthly review & plan adjustment'],
    benefits: ['Breed-specific nutrition', 'Allergy identification & management', 'Weight & muscle optimization', 'Improves coat, energy & digestion', 'Monthly plan updates'],
    gallery: [
      'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80',
    ],
    badge: '🥗 Nutrition Expert',
    stats: [{ v: '600+', l: 'Plans Created' }, { v: '15+', l: 'Nutritionists' }, { v: '4.8★', l: 'Avg Rating' }],
  },
}

export default function ServiceDetailPage() {
  const { id } = useParams()
  const service = SERVICES.find(s => s.id === id)
  const extras = SERVICE_EXTRAS[id]
  const [activeImg, setActiveImg] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState('standard')
  const [openFaq, setOpenFaq] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => { setTimeout(() => setVisible(true), 50) }, [])

  if (!service || !extras) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream">
        <Navbar />
        <div className="text-center">
          <div className="text-6xl mb-4">🐾</div>
          <h1 className="font-display text-3xl font-bold text-brand-dark mb-4">Service Not Found</h1>
          <Link href="/services" className="btn-primary">View All Services</Link>
        </div>
      </div>
    )
  }

  const plans = [
    { key: 'basic', label: 'Basic', desc: 'Essential care', color: 'border-gray-200 bg-gray-50', badge: '' },
    { key: 'standard', label: 'Standard', desc: 'Most popular choice', color: 'border-brand-primary bg-orange-50', badge: 'Most Popular' },
    { key: 'premium', label: 'Premium', desc: 'Complete experience', color: 'border-amber-400 bg-amber-50', badge: 'Best Value' },
  ]

  const otherServices = SERVICES.filter(s => s.id !== id).slice(0, 3)

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-24 pb-0 bg-white border-b border-orange-100">
        <div className="page-container py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-brand-primary transition-colors">Services</Link>
            <span>/</span>
            <span className="text-brand-primary font-semibold">{service.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white pt-8 pb-16">
        <div className="page-container">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-start transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

            {/* Gallery */}
            <div>
              <div className="relative rounded-3xl overflow-hidden h-80 md:h-96 shadow-brand-lg group cursor-pointer"
                onClick={() => setActiveImg((activeImg + 1) % extras.gallery.length)}>
                <Image fill sizes="(max-width: 768px) 100vw, 50vw" src={extras.gallery[activeImg]} alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" key={activeImg}/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-brand-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-brand">
                    {extras.badge}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="text-white">
                    <div className="text-4xl mb-1">{service.icon}</div>
                    <div className="font-display font-bold text-2xl">{service.title}</div>
                    <div className="text-white/80 text-sm">⏱ {service.duration}</div>
                  </div>
                  <div className="flex gap-1.5">
                    {extras.gallery.map((_, i) => (
                      <button key={i} onClick={e => { e.stopPropagation(); setActiveImg(i) }}
                        className={`w-2 h-2 rounded-full transition-all ${i === activeImg ? 'bg-white w-5' : 'bg-white/50'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {extras.gallery.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`relative rounded-2xl overflow-hidden h-20 transition-all duration-200 ${i === activeImg ? 'ring-2 ring-brand-primary scale-[1.03]' : 'opacity-70 hover:opacity-100'}`}>
                    <Image fill sizes="(max-width: 768px) 100vw, 50vw" src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {extras.stats.map(stat => (
                  <div key={stat.l} className="bg-brand-light rounded-2xl p-3 text-center">
                    <div className="font-display font-bold text-xl text-brand-primary">{stat.v}</div>
                    <div className="text-xs text-gray-500 font-medium">{stat.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge bg-orange-100 text-brand-primary">🐾 Premium Service</span>
                <span className="badge bg-green-100 text-green-700">✓ Certified Professionals</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-brand-dark mb-3">{service.title}</h1>
              <p className="text-gray-600 leading-relaxed text-lg mb-6">{service.description}</p>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
                {service.features.map(f => (
                  <div key={f} className="flex items-center gap-2.5 bg-green-50 rounded-xl px-3 py-2">
                    <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs flex-shrink-0">✓</span>
                    <span className="text-sm text-gray-700 font-medium">{f}</span>
                  </div>
                ))}
              </div>

              {/* Plan Selector */}
              <div className="mb-6">
                <h3 className="font-bold text-brand-dark mb-3 text-sm uppercase tracking-wide">Choose Your Plan</h3>
                <div className="grid grid-cols-3 gap-3">
                  {plans.map(plan => (
                    <button key={plan.key} onClick={() => setSelectedPlan(plan.key)}
                      className={`relative border-2 rounded-2xl p-4 text-center transition-all duration-200 ${
                        selectedPlan === plan.key ? plan.color + ' scale-105 shadow-warm' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                      {plan.badge && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">{plan.badge}</span>}
                      <div className="text-xs font-semibold text-gray-500 mb-1">{plan.label}</div>
                      <div className={`font-display font-bold text-xl ${selectedPlan === plan.key ? 'text-brand-primary' : 'text-gray-700'}`}>
                        ₹{service.price[plan.key].toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{plan.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price summary */}
              <div className="bg-orange-gradient rounded-2xl p-5 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-sm">Selected: {plans.find(p => p.key === selectedPlan)?.label} Plan</div>
                    <div className="font-display font-bold text-4xl">₹{service.price[selectedPlan].toLocaleString()}</div>
                    <div className="text-white/70 text-xs mt-1">per session • {service.duration}</div>
                  </div>
                  <div className="text-5xl opacity-60">{service.icon}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/dashboard/appointments?service=${service.id}&plan=${selectedPlan}`}
                  className="btn-primary flex-1 justify-center text-base py-4">
                  Book Now — ₹{service.price[selectedPlan].toLocaleString()} →
                </Link>
                <Link href="/contact" className="btn-secondary px-6 py-4">Ask a Question</Link>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center">Free cancellation up to 24 hours before · Secure payment</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-brand-cream dots-bg">
        <div className="page-container">
          <div className="text-center mb-10">
            <span className="badge bg-orange-100 text-brand-primary mb-3">📋 The Process</span>
            <h2 className="section-title">How {service.title} Works</h2>
          </div>
          <div className="flex flex-col md:flex-row gap-0 md:gap-0 max-w-4xl mx-auto">
            {extras.process.map((step, i) => (
              <div key={i} className="flex md:flex-col items-center md:items-center gap-4 md:gap-2 flex-1 relative group">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-primary text-white font-bold text-lg flex items-center justify-center shadow-brand z-10 group-hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                {i < extras.process.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-orange-200" style={{ left: '50%' }} />
                )}
                <div className="md:text-center mt-0 md:mt-3 pb-6 md:pb-0">
                  <p className="text-sm font-semibold text-brand-dark">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="badge bg-green-100 text-green-700 mb-3">💚 Why It Matters</span>
              <h2 className="section-title mb-6">Benefits of {service.title}</h2>
              <div className="space-y-3">
                {extras.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-brand-light hover:bg-orange-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="font-semibold text-brand-dark">{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden h-96 shadow-brand-lg">
                <Image fill sizes="(max-width: 768px) 100vw, 50vw" src={service.image} alt={service.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-warm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-brand-dark">{service.title}</div>
                      <div className="text-sm text-gray-500">{service.shortDesc}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Starting at</div>
                      <div className="font-display font-bold text-2xl text-brand-primary">₹{service.price.basic.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-brand-cream">
        <div className="page-container max-w-3xl">
          <div className="text-center mb-10">
            <span className="badge bg-orange-100 text-brand-primary mb-3">❓ Common Questions</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {extras.faqs.map((item, i) => (
              <div key={i} className={`bg-white rounded-2xl shadow-warm overflow-hidden transition-all duration-300`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left font-bold text-brand-dark hover:text-brand-primary transition-colors">
                  <span>{item.q}</span>
                  <span className={`text-brand-primary text-xl transition-transform duration-300 flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-orange-50 pt-3 animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="section-title">Explore Other Services</h2>
            <p className="section-subtitle mx-auto">Complete care for your dog — all under one roof.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {otherServices.map(s => (
              <Link key={s.id} href={`/services/${s.id}`}
                className="service-card group block">
                <div className="relative h-44 overflow-hidden">
                  <Image fill sizes="(max-width: 768px) 100vw, 50vw" src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-2xl">{s.icon}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-brand-dark mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{s.shortDesc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-primary font-bold">₹{s.price.basic}+</span>
                    <span className="text-xs bg-brand-light text-brand-primary font-bold px-3 py-1.5 rounded-full group-hover:bg-brand-primary group-hover:text-white transition-colors">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/services" className="btn-secondary px-8 py-3">View All 8 Services</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-orange-gradient">
        <div className="page-container text-center text-white">
          <div className="text-5xl mb-4">{service.icon}</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to Book {service.title}?</h2>
          <p className="text-white/80 mb-8 text-lg">Join 5,000+ happy dog parents. Free cancellation, secure payment.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/dashboard/appointments?service=${service.id}`}
              className="inline-flex items-center gap-2 bg-white text-brand-primary font-bold px-8 py-4 rounded-full hover:bg-brand-cream transition-colors shadow-warm-lg text-base">
              Book {service.title} Now 🐾
            </Link>
            <Link href="/auth/register" className="btn-secondary border-white text-white hover:bg-white hover:text-brand-primary px-8 py-4 text-base">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
