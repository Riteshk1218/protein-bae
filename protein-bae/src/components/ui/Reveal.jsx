import { useReveal } from '../../hooks/useReveal'

/**
 * Wraps children in a div that fades/slides into view on scroll.
 * `delay` accepts a Tailwind-friendly ms value applied via inline style
 * so staggered reveals don't require extra utility classes.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children }) {
  const [ref, visible] = useReveal()
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  )
}
