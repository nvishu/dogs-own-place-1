import Link from 'next/link'
import Image from 'next/image'

export default function ServiceCard({ service, compact = false }) {
  return (
    <div className="service-card group hover:-translate-y-2 transition-all duration-300">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <span className="text-3xl">{service.icon}</span>
          <span className="text-white font-bold text-lg font-display">{service.title}</span>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full px-3 py-1 text-xs font-bold text-brand-dark">
          ⏱ {service.duration}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{service.shortDesc}</p>

        {!compact && (
          <ul className="space-y-1.5 mb-4">
            {service.features.slice(0, 3).map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</span>
                {f}
              </li>
            ))}
          </ul>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400">Starting from</div>
            <div className="font-display font-bold text-2xl text-brand-primary">
              ₹{service.price.basic.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Premium</div>
            <div className="font-bold text-brand-dark">₹{service.price.premium.toLocaleString()}</div>
          </div>
        </div>

        <Link
          href={`/dashboard/appointments?service=${service.id}`}
          className="btn-primary w-full justify-center text-sm py-2.5"
        >
          Book Now →
        </Link>
      </div>
    </div>
  )
}
