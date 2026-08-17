/**
 * An asymmetric rim curve pulled from the bowl shape in the Protein Bae
 * mark -- used as the transition between sections instead of a generic
 * symmetrical wave. `flip` mirrors it vertically for the reverse edge,
 * `color` fills it to match the section it's introducing.
 */
export default function SwooshDivider({ color = '#FAF9F4', flip = false, className = '' }) {
  return (
    <div className={`w-full leading-none overflow-hidden ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
        className="w-full h-[52px] md:h-[78px]"
        style={flip ? { transform: 'scaleY(-1)' } : undefined}
      >
        <path
          d="M0,32 C220,90 460,8 760,44 C1040,78 1240,6 1440,40 L1440,110 L0,110 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}
