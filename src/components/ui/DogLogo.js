export default function DogLogo({ size = 44, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 2px 6px rgba(232,98,42,0.35))' }}>
        {/* Crown base */}
        <path d="M12 30 L16 18 L22 26 L32 14 L42 26 L48 18 L52 30 Z"
          fill="url(#crownGold)" stroke="#C8891A" strokeWidth="1.2" strokeLinejoin="round"/>
        {/* Crown jewels */}
        <circle cx="32" cy="13" r="3" fill="#E8622A" />
        <circle cx="16" cy="17.5" r="2" fill="#E8622A" />
        <circle cx="48" cy="17.5" r="2" fill="#E8622A" />
        {/* Crown band */}
        <rect x="10" y="29" width="44" height="5" rx="2.5" fill="url(#crownGold)" stroke="#C8891A" strokeWidth="0.8"/>
        {/* Dog head circle */}
        <circle cx="32" cy="47" r="13" fill="url(#dogFur)"/>
        {/* Left ear */}
        <ellipse cx="22" cy="39" rx="5" ry="7" rx2="5" ry2="7"
          fill="#C8762A" transform="rotate(-20 22 39)"/>
        <ellipse cx="22" cy="39.5" rx="3" ry="5"
          fill="#E8953A" transform="rotate(-20 22 39.5)"/>
        {/* Right ear */}
        <ellipse cx="42" cy="39" rx="5" ry="7"
          fill="#C8762A" transform="rotate(20 42 39)"/>
        <ellipse cx="42" cy="39.5" rx="3" ry="5"
          fill="#E8953A" transform="rotate(20 42 39.5)"/>
        {/* Face */}
        <circle cx="32" cy="47" r="11" fill="url(#dogFace)"/>
        {/* Eyes */}
        <ellipse cx="27.5" cy="44.5" rx="2.5" ry="2.8" fill="#2D1A0A"/>
        <ellipse cx="36.5" cy="44.5" rx="2.5" ry="2.8" fill="#2D1A0A"/>
        <circle cx="28.3" cy="43.7" r="0.9" fill="white"/>
        <circle cx="37.3" cy="43.7" r="0.9" fill="white"/>
        {/* Nose */}
        <ellipse cx="32" cy="49" rx="3" ry="2" fill="#2D1A0A"/>
        <ellipse cx="31.2" cy="48.4" rx="1" ry="0.6" fill="#4D3A2A" opacity="0.5"/>
        {/* Mouth */}
        <path d="M30 51 Q32 53.5 34 51" stroke="#2D1A0A" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        {/* Forehead shine */}
        <ellipse cx="29" cy="41.5" rx="3.5" ry="2" fill="white" opacity="0.18"/>
        {/* Gradient defs */}
        <defs>
          <linearGradient id="crownGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5C842"/>
            <stop offset="50%" stopColor="#E8A820"/>
            <stop offset="100%" stopColor="#C8891A"/>
          </linearGradient>
          <radialGradient id="dogFur" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#E09050"/>
            <stop offset="100%" stopColor="#B8651E"/>
          </radialGradient>
          <radialGradient id="dogFace" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ECA060"/>
            <stop offset="100%" stopColor="#C8762A"/>
          </radialGradient>
        </defs>
      </svg>

      {showText && (
        <div>
          <div className="font-display font-bold text-xl text-brand-dark leading-none tracking-tight">
            DOG&apos;S OWN PLACE
          </div>
          <div className="text-xs text-brand-primary font-bold tracking-[0.2em] uppercase">
            Premium Pet Care
          </div>
        </div>
      )}
    </div>
  )
}
