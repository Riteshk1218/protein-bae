import { Check } from 'lucide-react'

const STEPS = [
  { key: 'received', label: 'Order Received' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
]

function StepCircle({ done, current }) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs border-2 ${
        done
          ? 'bg-green border-green text-white'
          : current
            ? 'bg-yellow border-yellow text-navy-deep'
            : 'bg-white border-navy/20 text-navy/30'
      }`}
    >
      {done ? <Check size={16} /> : current ? '●' : '○'}
    </div>
  )
}

export default function OrderStatusTimeline({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-center">
        <p className="text-red-600 font-bold text-sm uppercase tracking-wide">Order Cancelled</p>
      </div>
    )
  }

  const currentIndex = STEPS.findIndex((s) => s.key === status)

  return (
    <>
      {/* Mobile: vertical list */}
      <ol className="sm:hidden">
        {STEPS.map((step, i) => {
          const done = i < currentIndex
          const current = i === currentIndex
          const isLast = i === STEPS.length - 1
          return (
            <li key={step.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <StepCircle done={done} current={current} />
                {!isLast && <div className={`w-0.5 h-6 ${done ? 'bg-green' : 'bg-navy/15'}`} aria-hidden="true" />}
              </div>
              <p className={`pt-1.5 text-sm font-semibold ${i > currentIndex ? 'text-navy/40' : 'text-navy'}`}>
                {step.label}
              </p>
            </li>
          )
        })}
      </ol>

      {/* Desktop: horizontal timeline */}
      <ol className="hidden sm:flex sm:items-start">
        {STEPS.map((step, i) => {
          const done = i < currentIndex
          const current = i === currentIndex
          const isLast = i === STEPS.length - 1
          return (
            <li key={step.key} className={`flex items-start ${isLast ? '' : 'flex-1'}`}>
              <div className="flex flex-col items-center" style={{ width: isLast ? 'auto' : undefined }}>
                <StepCircle done={done} current={current} />
                <p className={`text-xs font-semibold mt-2 text-center px-1 whitespace-nowrap ${i > currentIndex ? 'text-navy/40' : 'text-navy'}`}>
                  {step.label}
                </p>
              </div>
              {!isLast && <div className={`h-0.5 flex-1 mt-4 ${done ? 'bg-green' : 'bg-navy/15'}`} aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </>
  )
}
