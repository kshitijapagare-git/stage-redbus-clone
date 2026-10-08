import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import CityAutocomplete from './CityAutocomplete'
import RecentSearches from './RecentSearches'
import { cities } from '../data'
import { buildSearchQueryString, isPastDate, parseSearchQuery } from '../lib/searchQuery'
import {
  addRecentSearch,
  loadRecentSearches,
  persistRecentSearches,
  removeRecentSearch,
  type RecentSearch,
} from '../lib/recentSearches'
import type { City } from '../types'

const toISODate = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function SearchCard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [today] = useState(() => new Date())
  const todayISO = toISODate(today)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const tomorrowISO = toISODate(tomorrow)

  const [forWomen, setForWomen] = useState(false)

  const [fromText, setFromText] = useState('')
  const [toText, setToText] = useState('')
  const [fromCityId, setFromCityId] = useState<number | null>(null)
  const [toCityId, setToCityId] = useState<number | null>(null)
  const [fromError, setFromError] = useState<string | undefined>(undefined)
  const [toError, setToError] = useState<string | undefined>(undefined)
  const [swapVersion, setSwapVersion] = useState(0)

  const [dateValue, setDateValue] = useState(todayISO)
  const [dateError, setDateError] = useState<string | undefined>(undefined)

  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])

  useEffect(() => {
    const result = parseSearchQuery(searchParams, cities)
    if (!result.ok) return

    const fromCity = cities.find((c) => c.id === result.value.fromCityId)
    const toCity = cities.find((c) => c.id === result.value.toCityId)

    if (fromCity) {
      setFromText(fromCity.name)
      setFromCityId(fromCity.id)
    }
    if (toCity) {
      setToText(toCity.name)
      setToCityId(toCity.id)
    }
    setDateValue(result.value.date)
    // Prefill only on mount, from whatever query params are present at that time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setRecentSearches(loadRecentSearches(cities))
    // Load once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const handleDateChange = (value: string) => {
    setDateValue(value)
    if (!value) {
      setDateError('Please select a date')
    } else if (isPastDate(value, today)) {
      setDateError('Please select a present or future date')
    } else {
      setDateError(undefined)
    }
  }

  const handleSearchClick = () => {
    let nextFromError: string | undefined
    let nextToError: string | undefined
    let nextDateError: string | undefined

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

    if (!dateValue) {
      nextDateError = 'Please select a date'
    } else if (isPastDate(dateValue, today)) {
      nextDateError = 'Please select a present or future date'
    }

    setFromError(nextFromError)
    setToError(nextToError)
    setDateError(nextDateError)

    if (!nextFromError && !nextToError && !nextDateError && fromCityId !== null && toCityId !== null) {
      const qs = buildSearchQueryString({ fromCityId, toCityId, date: dateValue })
      const updatedRecentSearches = addRecentSearch(recentSearches, { fromCityId, toCityId, date: dateValue })
      setRecentSearches(updatedRecentSearches)
      persistRecentSearches(updatedRecentSearches)
      navigate(`/search?${qs}`)
    }
  }

  const handleRecentSelect = (search: RecentSearch) => {
    const fromCity = cities.find((c) => c.id === search.fromCityId)
    const toCity = cities.find((c) => c.id === search.toCityId)

    if (fromCity) {
      setFromText(fromCity.name)
      setFromCityId(fromCity.id)
    }
    if (toCity) {
      setToText(toCity.name)
      setToCityId(toCity.id)
    }
    setFromError(undefined)
    setToError(undefined)

    if (isPastDate(search.date, today)) {
      setDateValue(todayISO)
    } else {
      setDateValue(search.date)
    }
    setDateError(undefined)
  }

  const handleRemoveRecent = (index: number) => {
    const updated = removeRecentSearch(recentSearches, index)
    setRecentSearches(updated)
    persistRecentSearches(updated)
  }

  const handleClearAllRecent = () => {
    setRecentSearches([])
    persistRecentSearches([])
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
              <input
                type="date"
                aria-label="Date of Journey"
                value={dateValue}
                min={todayISO}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>
            <button
              type="button"
              className={`chip ${dateValue === todayISO ? 'chip-active' : ''}`}
              onClick={() => handleDateChange(todayISO)}
            >
              Today
            </button>
            <button
              type="button"
              className={`chip ${dateValue === tomorrowISO ? 'chip-active' : ''}`}
              onClick={() => handleDateChange(tomorrowISO)}
            >
              Tomorrow
            </button>
            {dateError && (
              <span className="field-error" role="alert">
                {dateError}
              </span>
            )}
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
      <RecentSearches
        cities={cities}
        searches={recentSearches}
        today={today}
        onSelect={handleRecentSelect}
        onRemove={handleRemoveRecent}
        onClearAll={handleClearAllRecent}
      />
    </div>
  )
}

export default SearchCard
