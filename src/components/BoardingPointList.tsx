import { useRef, type KeyboardEvent } from 'react'
import type { BoardingPoint, City } from '../types'

interface Props {
  cities: City[]
  boardingPoints: BoardingPoint[]
  selectedId?: number | null
  onSelect?: (bp: BoardingPoint) => void
}

function BoardingPointList({ cities, boardingPoints, selectedId, onSelect }: Props) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  if (!onSelect) {
    return (
      <ul className="bp-grid">
        {boardingPoints.map((bp) => {
          const city = cities.find((c) => c.id === bp.cityId)
          return (
            <li key={bp.id} className="bp-card">
              <strong>{bp.name}</strong> — {bp.address}, {bp.landmark}
              {city && ` (${city.name}, ${city.state})`}
            </li>
          )
        })}
      </ul>
    )
  }

  const focusIndex = (index: number) => {
    const el = itemRefs.current[index]
    if (el) el.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number, bp: BoardingPoint) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = Math.min(index + 1, boardingPoints.length - 1)
      focusIndex(nextIndex)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const nextIndex = Math.max(index - 1, 0)
      focusIndex(nextIndex)
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onSelect(bp)
    }
  }

  return (
    <ul className="bp-grid" role="radiogroup">
      {boardingPoints.map((bp, index) => {
        const city = cities.find((c) => c.id === bp.cityId)
        const isSelected = bp.id === selectedId
        const isTabbable = selectedId != null ? isSelected : index === 0

        return (
          <li key={bp.id} className="bp-card-wrapper">
            <button
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isTabbable ? 0 : -1}
              ref={(el) => {
                itemRefs.current[index] = el
              }}
              className={`bp-card ${isSelected ? 'bp-card-selected' : ''}`}
              onClick={() => onSelect(bp)}
              onKeyDown={(e) => handleKeyDown(e, index, bp)}
            >
              <strong>{bp.name}</strong> — {bp.address}, {bp.landmark}
              {city && ` (${city.name}, ${city.state})`}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default BoardingPointList
