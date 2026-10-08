import type { City } from '../types'

export interface SearchQuery {
  fromCityId: number
  toCityId: number
  /** ISO date string, yyyy-mm-dd */
  date: string
}

export interface SearchQueryError {
  field: 'city' | 'date'
  message: string
}

export type ParseSearchQueryResult =
  | { ok: true; value: SearchQuery }
  | { ok: false; error: SearchQueryError }

interface DateParts {
  year: number
  month: number
  day: number
}

function parseISODateParts(dateStr: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return { year, month, day }
}

function toLocalMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function isPastDate(dateStr: string, today: Date): boolean {
  const parts = parseISODateParts(dateStr)
  if (!parts) return false

  const target = new Date(parts.year, parts.month - 1, parts.day)
  const todayMidnight = toLocalMidnight(today)

  return target.getTime() < todayMidnight.getTime()
}

export function parseSearchQuery(params: URLSearchParams, cities: City[]): ParseSearchQueryResult {
  const fromStr = params.get('from')
  const toStr = params.get('to')
  const dateStr = params.get('date')

  if (!fromStr || !toStr) {
    return { ok: false, error: { field: 'city', message: 'Invalid city' } }
  }

  const fromCityId = Number(fromStr)
  const toCityId = Number(toStr)

  if (!Number.isFinite(fromCityId) || !Number.isFinite(toCityId)) {
    return { ok: false, error: { field: 'city', message: 'Invalid city' } }
  }

  const fromCity = cities.find((c) => c.id === fromCityId)
  const toCity = cities.find((c) => c.id === toCityId)

  if (!fromCity || !toCity) {
    return { ok: false, error: { field: 'city', message: 'Invalid city' } }
  }

  if (!dateStr || !parseISODateParts(dateStr)) {
    return { ok: false, error: { field: 'date', message: 'Invalid date' } }
  }

  if (isPastDate(dateStr, new Date())) {
    return { ok: false, error: { field: 'date', message: 'Invalid date' } }
  }

  return { ok: true, value: { fromCityId, toCityId, date: dateStr } }
}

export function buildSearchQueryString(query: SearchQuery): string {
  return `from=${query.fromCityId}&to=${query.toCityId}&date=${query.date}`
}

export function formatShortDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}`
}
