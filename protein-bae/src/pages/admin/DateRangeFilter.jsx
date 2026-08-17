const FILTERS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
]

export default function DateRangeFilter({ filter, onFilterChange, startDate, endDate, onStartDateChange, onEndDateChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onFilterChange(f.id)}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
            filter === f.id ? 'bg-navy text-white' : 'bg-white text-navy/60 hover:text-navy shadow-card'
          }`}
        >
          {f.label}
        </button>
      ))}

      {filter === 'custom' && (
        <div className="flex items-center gap-2 ml-1">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="rounded-full border border-navy/15 px-3 py-2 text-xs focus:border-green outline-none"
          />
          <span className="text-navy/40 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="rounded-full border border-navy/15 px-3 py-2 text-xs focus:border-green outline-none"
          />
        </div>
      )}
    </div>
  )
}
