import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { City } from '../types'

export interface CityAutocompleteProps {
  cities: City[]
  value: string
  cityId: number | null
  onValueChange: (value: string) => void
  onSelect: (city: City) => void
  error?: string
  closeSignal?: number
  id: string
  label: string
  placeholder?: string
}

function CityAutocomplete(props: CityAutocompleteProps) {
  const { cities, value, onValueChange, onSelect, error, closeSignal, id, label, placeholder } = props

  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const skipAutoOpenRef = useRef(false)

  const trimmed = value.trim()
  const matches = useMemo(() => {
    if (!trimmed) return []
    const query = trimmed.toLowerCase()
    return cities.filter((city) => city.name.toLowerCase().includes(query))
  }, [cities, trimmed])

  useEffect(() => {
    if (skipAutoOpenRef.current) {
      skipAutoOpenRef.current = false
      setHighlightedIndex(0)
      return
    }
    setHighlightedIndex(0)
    setIsOpen(trimmed.length > 0 && matches.length > 0)
  }, [trimmed, matches.length])

  useEffect(() => {
    if (closeSignal !== undefined) {
      setIsOpen(false)
    }
  }, [closeSignal])

  const listboxId = `${id}-listbox`
  const getOptionId = (city: City) => `${id}-option-${city.id}`
  const activeDescendant =
    isOpen && matches[highlightedIndex] ? getOptionId(matches[highlightedIndex]) : undefined

  const handleSelect = (city: City) => {
    skipAutoOpenRef.current = true
    setIsOpen(false)
    onSelect(city)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        if (matches.length > 0) {
          setIsOpen(true)
          setHighlightedIndex(0)
        }
        return
      }
      setHighlightedIndex((i) => Math.min(i + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        if (matches.length > 0) {
          setIsOpen(true)
          setHighlightedIndex(matches.length - 1)
        }
        return
      }
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      if (isOpen && matches[highlightedIndex]) {
        e.preventDefault()
        handleSelect(matches[highlightedIndex])
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault()
        setIsOpen(false)
      }
    }
  }

  return (
    <div className="field city-field">
      <span className="field-icon" aria-hidden="true">
        🚌
      </span>
      <div className="city-field-body">
        <input
          id={id}
          role="combobox"
          type="text"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-label={label}
          placeholder={placeholder ?? label}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {isOpen && matches.length > 0 && (
          <ul className="autocomplete-list" role="listbox" id={listboxId}>
            {matches.map((city, index) => (
              <li
                key={city.id}
                id={getOptionId(city)}
                role="option"
                aria-selected={index === highlightedIndex}
                className={`autocomplete-option ${index === highlightedIndex ? 'option-highlighted' : ''}`}
                onClick={() => handleSelect(city)}
              >
                <span className="option-name">{city.name}</span>
                <span className="option-state">{city.state}</span>
              </li>
            ))}
          </ul>
        )}
        {error && (
          <span className="field-error" role="alert">
            {error}
          </span>
        )}
      </div>
    </div>
  )
}

export default CityAutocomplete
