import { useState } from 'react'
import CityAutocomplete from './CityAutocomplete'
import { cities } from '../data'
import type { City } from '../types'

const formatDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}, ${d.getFullYear()}`

function SearchCard() {
  const [today] = useState(() => new Date())
  const [dayOffset, setDayOffset] = useState(0)
  const [forWomen, setForWomen] = useState(false)

  const [fromText, setFromText] = useState('')
  const [toText, setToText] = useState('')
  const [fromCityId, setFromCityId] = useState<number | null>(null)
  const [toCityId, setToCityId] = useState<number | null>(null)
  const [fromError, setFromError] = useState<string | undefined>(undefined)
  const [toError, setToError] = useState<string | undefined>(undefined)
  const [swapVersion, setSwapVersion] = useState(0)

  const date = new Date(today)
  date.setDate(today.getDate() + dayOffset)

  const handleFromChange = (text: string) => {
    setFromText(text)
    setFromCityId(null)
    setFromError(undefined)
  }

  const handleToChange = (text: string) => {
    setToText(text)
    setToCityId(null)
    setToError(undefined)
  }

  const handleFromSelect = (city: City) => {
    setFromText(city.name)
    setFromCityId(city.id)
    setFromError(undefined)
  }

  const handleToSelect = (city: City) => {
    setToText(city.name)
    setToCityId(city.id)
    setToError(undefined)
  }

  const handleSwap = () => {
    const prevFromText = fromText
    const prevFromCityId = fromCityId
    setFromText(toText)
    setFromCityId(toCityId)
    setToText(prevFromText)
    setToCityId(prevFromCityId)
    setFromError(undefined)
    setToError(undefined)
    setSwapVersion((v) => v + 1)
  }

  const handleSearchClick = () => {
    let nextFromError: string | undefined
    let nextToError: string | undefined

    if (fromCityId === null) {
      nextFromError = 'Please select a city'
    }
    if (toCityId === null) {
      nextToError = 'Please select a city'
    }

    if (!nextFromError && !nextToError && fromCityId === toCityId) {
      nextFromError = 'From and To must be different'
      nextToError = 'From and To must be different'
    }

    setFromError(nextFromError)
    setToError(nextToError)
  }

  return (
    <div className="search-card">
      <div className="search-row">
        <div className="search-fields">
          <CityAutocomplete
            id="from-city"
            label="From"
            placeholder="From"
            cities={cities}
            value={fromText}
            cityId={fromCityId}
            onValueChange={handleFromChange}
            onSelect={handleFromSelect}
            error={fromError}
            closeSignal={swapVersion}
          />
          <button type="button" className="swap-btn" aria-label="Swap From and To" onClick={handleSwap}>
            ⇄
          </button>
          <CityAutocomplete
            id="to-city"
            label="To"
            placeholder="To"
            cities={cities}
            value={toText}
            cityId={toCityId}
            onValueChange={handleToChange}
            onSelect={handleToSelect}
            error={toError}
            closeSignal={swapVersion}
          />
          <div className="field date-field">
            <span className="field-icon">📅</span>
            <div className="date-text">
              <small>Date of Journey</small>
              <strong>{formatDate(date)}</strong>
              <em>{dayOffset === 0 ? '(Today)' : '(Tomorrow)'}</em>
            </div>
            <button type="button" className={`chip ${dayOffset === 0 ? 'chip-active' : ''}`} onClick={() => setDayOffset(0)}>
              Today
            </button>
            <button type="button" className={`chip ${dayOffset === 1 ? 'chip-active' : ''}`} onClick={() => setDayOffset(1)}>
              Tomorrow
            </button>
          </div>
        </div>
        <div className="women-box">
          <span className="women-icon">👩</span>
          <div>
            <div>Booking for women</div>
            <a href="#">Know more</a>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={forWomen}
            aria-label="Booking for women"
            className={`toggle ${forWomen ? 'on' : ''}`}
            onClick={() => setForWomen((v) => !v)}
          />
        </div>
      </div>
      <button type="button" className="search-btn" onClick={handleSearchClick}>⌕ Search buses</button>
    </div>
  )
}

export default SearchCard
