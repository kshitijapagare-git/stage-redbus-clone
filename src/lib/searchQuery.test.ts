import { describe, expect, it } from 'vitest'
import {
  buildSearchQueryString,
  formatShortDate,
  isPastDate,
  parseSearchQuery,
  type SearchQuery,
} from './searchQuery'
import type { City } from '../types'

const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
]

function futureDateISO(daysAhead: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

describe('parseSearchQuery', () => {
  it('returns an error when from does not match any city', () => {
    const params = new URLSearchParams({ from: '999', to: '2', date: futureDateISO(1) })
    const result = parseSearchQuery(params, cities)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.field).toBe('city')
    }
  })

  it('returns an error when to does not match any city', () => {
    const params = new URLSearchParams({ from: '1', to: '999', date: futureDateISO(1) })
    const result = parseSearchQuery(params, cities)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.field).toBe('city')
    }
  })

  it('returns an error when date is not a valid date string', () => {
    const params = new URLSearchParams({ from: '1', to: '2', date: 'not-a-date' })
    const result = parseSearchQuery(params, cities)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.field).toBe('date')
    }
  })

  it('returns an error when the parsed date is earlier than today', () => {
    const params = new URLSearchParams({ from: '1', to: '2', date: futureDateISO(-1) })
    const result = parseSearchQuery(params, cities)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.field).toBe('date')
    }
  })

  it('does not return an error when the date equals today', () => {
    const params = new URLSearchParams({ from: '1', to: '2', date: futureDateISO(0) })
    const result = parseSearchQuery(params, cities)
    expect(result.ok).toBe(true)
  })

  it('round-trips with buildSearchQueryString', () => {
    const query: SearchQuery = { fromCityId: 1, toCityId: 2, date: futureDateISO(2) }
    const qs = buildSearchQueryString(query)
    const params = new URLSearchParams(qs)
    const result = parseSearchQuery(params, cities)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toEqual(query)
    }
  })
})

describe('isPastDate', () => {
  it('returns true for a date before today', () => {
    const today = new Date(2026, 9, 2)
    expect(isPastDate('2026-10-01', today)).toBe(true)
  })

  it('returns false for today', () => {
    const today = new Date(2026, 9, 2)
    expect(isPastDate('2026-10-02', today)).toBe(false)
  })

  it('returns false for a future date', () => {
    const today = new Date(2026, 9, 2)
    expect(isPastDate('2026-10-03', today)).toBe(false)
  })
})

describe('formatShortDate', () => {
  it('formats a date as DD Mon with no year', () => {
    expect(formatShortDate(new Date(2026, 9, 2))).toBe('02 Oct')
  })
})
