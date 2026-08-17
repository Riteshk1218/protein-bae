/**
 * The circular yellow ring from the Protein Bae mark, reused as a
 * recurring container for numbers, icons and stats throughout the site.
 * This is the site's signature device -- it ties every section back to
 * the actual logo instead of a generic shape.
 */
export default function RingBadge({ children, tone = 'yellow', size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-12 h-12 border-[3px] text-base',
    md: 'w-16 h-16 border-[3px] text-xl',
    lg: 'w-20 h-20 border-4 text-2xl',
  }
  const tones = {
    yellow: 'border-yellow text-navy',
    navy: 'border-navy text-navy',
    green: 'border-green text-green',
    white: 'border-white text-white',
  }
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-display font-bold ${sizes[size]} ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  )
}
