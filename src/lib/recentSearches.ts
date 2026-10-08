import type { City } from '../types'

export interface RecentSearch {
  fromCityId: number
  toCityId: number
  /** ISO date string, yyyy-mm-dd */
  date: string
}

export const STORAGE_KEY = 'recentSearches'

const MAX_ENTRIES = 5

function isRecentSearch(value: unknown): value is RecentSearch {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.fromCityId === 'number' &&
    typeof candidate.toCityId === 'number' &&
    typeof candidate.date === 'string'
  )
}

export function loadRecentSearches(cities: City[]): RecentSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const cityIds = new Set(cities.map((c) => c.id))

    return parsed.filter(
      (entry): entry is RecentSearch =>
        isRecentSearch(entry) && cityIds.has(entry.fromCityId) && cityIds.has(entry.toCityId),
    )
  } catch {
    return []
  }
}

export function persistRecentSearches(searches: RecentSearch[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))
  } catch {
    // Ignore storage errors (quota exceeded, storage disabled, etc.)
  }
}

export function addRecentSearch(current: RecentSearch[], search: RecentSearch): RecentSearch[] {
  const withoutDuplicate = current.filter(
    (s) => !(s.fromCityId === search.fromCityId && s.toCityId === search.toCityId),
  )
  return [search, ...withoutDuplicate].slice(0, MAX_ENTRIES)
}

export function removeRecentSearch(current: RecentSearch[], index: number): RecentSearch[] {
  return current.filter((_, i) => i !== index)
}
