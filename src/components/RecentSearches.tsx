import type { City } from '../types'
import type { RecentSearch } from '../lib/recentSearches'
import { formatShortDate, isPastDate } from '../lib/searchQuery'

export interface RecentSearchesProps {
  cities: City[]
  searches: RecentSearch[]
  today: Date
  onSelect: (search: RecentSearch) => void
  onRemove: (index: number) => void
  onClearAll: () => void
}

function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function RecentSearches({ cities, searches, today, onSelect, onRemove, onClearAll }: RecentSearchesProps) {
  if (searches.length === 0) return null

  return (
    <div className="recent-searches">
      <div className="recent-searches-head">
        <h3>Recent searches</h3>
        <button type="button" className="recent-clear-all" onClick={onClearAll}>
          Clear all
        </button>
      </div>
      <ul className="recent-searches-list">
        {searches.map((search, index) => {
          const fromCity = cities.find((c) => c.id === search.fromCityId)
          const toCity = cities.find((c) => c.id === search.toCityId)
          const isPast = isPastDate(search.date, today)
          const label = `${fromCity?.name ?? ''} → ${toCity?.name ?? ''} · ${formatShortDate(parseISODate(search.date))}${isPast ? ' (Past)' : ''}`

          return (
            <li key={`${search.fromCityId}-${search.toCityId}-${index}`} className="recent-search-item">
              <button type="button" className="recent-search-label" onClick={() => onSelect(search)}>
                {label}
              </button>
              <button
                type="button"
                className="recent-search-remove"
                aria-label={`Remove ${label}`}
                onClick={() => onRemove(index)}
              >
                ×
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default RecentSearches
