/**
 * Placeholder dish art in the Protein Bae palette, standing in for real
 * food photography until the brand shoot is ready to drop in (see the
 * `image` field on each menu item in src/data/menu.js).
 * Every variant reuses the same visual language as the logo: a navy
 * vessel, a green leaf swoop, a small yellow sprout accent.
 */
const palette = {
  navy: '#172A63',
  green: '#087334',
  greenDeep: '#05531F',
  yellow: '#F2C21A',
  offwhite: '#FAF9F4',
  lightgreen: '#EAF4E8',
}

function Bowl({ children, rim = palette.navy }) {
  return (
    <>
      <ellipse cx="200" cy="150" rx="150" ry="26" fill={rim} opacity="0.12" />
      <path
        d="M60 150 C60 210 130 246 200 246 C270 246 340 210 340 150 Z"
        fill={rim}
      />
      <ellipse cx="200" cy="150" rx="140" ry="24" fill={palette.offwhite} />
      {children}
    </>
  )
}

export default function DishArt({ variant = 'bowl', className = '' }) {
  const common = 'w-full h-full'
  if (variant === 'salad') {
    return (
      <svg viewBox="0 0 400 300" className={`${common} ${className}`} role="img" aria-label="Protein salad bowl illustration">
        <Bowl rim={palette.navy}>
          <circle cx="150" cy="132" r="30" fill={palette.green} />
          <circle cx="205" cy="118" r="24" fill={palette.greenDeep} />
          <circle cx="245" cy="140" r="20" fill={palette.yellow} />
          <circle cx="180" cy="150" r="16" fill="#E8785A" />
          <circle cx="255" cy="112" r="12" fill={palette.lightgreen} />
        </Bowl>
      </svg>
    )
  }
  if (variant === 'grain') {
    return (
      <svg viewBox="0 0 400 300" className={`${common} ${className}`} role="img" aria-label="Protein meal bowl illustration">
        <Bowl rim={palette.navy}>
          <path d="M110 150 a90 30 0 0 1 180 0 Z" fill={palette.yellow} opacity="0.35" />
          <circle cx="160" cy="138" r="26" fill={palette.green} />
          <circle cx="230" cy="130" r="22" fill="#E8785A" />
          <circle cx="200" cy="150" r="14" fill={palette.greenDeep} />
          <rect x="150" y="150" width="60" height="14" rx="7" fill={palette.yellow} />
        </Bowl>
      </svg>
    )
  }
  if (variant === 'wrap') {
    return (
      <svg viewBox="0 0 400 300" className={common} role="img" aria-label="Protein wrap illustration">
        <ellipse cx="200" cy="245" rx="140" ry="18" fill={palette.navy} opacity="0.1" />
        <path
          d="M110 90 C110 60 290 60 290 90 L275 220 C275 245 125 245 125 220 Z"
          fill={palette.yellow}
        />
        <path
          d="M126 120 C200 105 260 118 274 132"
          stroke={palette.offwhite}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M122 160 C200 145 262 158 278 172"
          stroke={palette.offwhite}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="170" cy="140" r="10" fill={palette.green} />
        <circle cx="220" cy="150" r="8" fill={palette.greenDeep} />
        <circle cx="195" cy="185" r="9" fill="#E8785A" />
      </svg>
    )
  }
  // shake
  return (
    <svg viewBox="0 0 400 300" className={common} role="img" aria-label="Protein shake illustration">
      <path d="M155 70 L245 70 L232 250 C232 262 168 262 168 250 Z" fill={palette.navy} />
      <path d="M164 130 L236 130 L226 244 C226 254 174 254 174 244 Z" fill={palette.green} />
      <rect x="150" y="60" width="100" height="18" rx="6" fill={palette.yellow} />
      <path d="M195 30 C205 45 185 55 195 68" stroke={palette.green} strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  )
}
