import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addRecentSearch,
  loadRecentSearches,
  persistRecentSearches,
  removeRecentSearch,
  STORAGE_KEY,
  type RecentSearch,
} from './recentSearches'
import type { City } from '../types'

const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
  { id: 3, name: 'Mumbai', state: 'Maharashtra' },
]

describe('recentSearches', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('loadRecentSearches', () => {
    it('returns [] when nothing is stored', () => {
      expect(loadRecentSearches(cities)).toEqual([])
    })

    it('returns [] when localStorage.getItem throws', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('boom')
      })
      expect(loadRecentSearches(cities)).toEqual([])
    })

    it('returns [] when stored value is not valid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'not-json{{{')
      expect(loadRecentSearches(cities)).toEqual([])
    })

    it('returns [] when stored JSON is not an array', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }))
      expect(loadRecentSearches(cities)).toEqual([])
    })

    it('drops malformed entries missing required fields', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([{ fromCityId: 1 }, { fromCityId: 1, toCityId: 2, date: '2099-01-01' }]),
      )
      expect(loadRecentSearches(cities)).toEqual([{ fromCityId: 1, toCityId: 2, date: '2099-01-01' }])
    })

    it('drops entries referencing an unknown city id', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([
          { fromCityId: 1, toCityId: 999, date: '2099-01-01' },
          { fromCityId: 1, toCityId: 2, date: '2099-01-02' },
        ]),
      )
      expect(loadRecentSearches(cities)).toEqual([{ fromCityId: 1, toCityId: 2, date: '2099-01-02' }])
    })
  })

  describe('persistRecentSearches', () => {
    it('writes JSON to localStorage', () => {
      const searches: RecentSearch[] = [{ fromCityId: 1, toCityId: 2, date: '2099-01-01' }]
      persistRecentSearches(searches)
      expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual(searches)
    })

    it('does not throw when localStorage.setItem throws', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })
      expect(() => persistRecentSearches([{ fromCityId: 1, toCityId: 2, date: '2099-01-01' }])).not.toThrow()
    })
  })

  describe('addRecentSearch', () => {
    it('adds a new search to the front', () => {
      const current: RecentSearch[] = [{ fromCityId: 1, toCityId: 2, date: '2099-01-01' }]
      const result = addRecentSearch(current, { fromCityId: 2, toCityId: 3, date: '2099-01-02' })
      expect(result[0]).toEqual({ fromCityId: 2, toCityId: 3, date: '2099-01-02' })
      expect(result).toHaveLength(2)
    })

    it('moves a repeated route to the front instead of duplicating it', () => {
      const current: RecentSearch[] = [
        { fromCityId: 1, toCityId: 2, date: '2099-01-01' },
        { fromCityId: 2, toCityId: 3, date: '2099-01-02' },
      ]
      const result = addRecentSearch(current, { fromCityId: 1, toCityId: 2, date: '2099-01-05' })
      expect(result).toEqual([
        { fromCityId: 1, toCityId: 2, date: '2099-01-05' },
        { fromCityId: 2, toCityId: 3, date: '2099-01-02' },
      ])
    })

    it('caps the list at 5 entries', () => {
      let current: RecentSearch[] = []
      for (let i = 0; i < 6; i++) {
        current = addRecentSearch(current, { fromCityId: i, toCityId: i + 100, date: '2099-01-01' })
      }
      expect(current).toHaveLength(5)
      expect(current[0]).toEqual({ fromCityId: 5, toCityId: 105, date: '2099-01-01' })
    })
  })

  describe('removeRecentSearch', () => {
    it('removes only the entry at the given index, preserving order', () => {
      const current: RecentSearch[] = [
        { fromCityId: 1, toCityId: 2, date: '2099-01-01' },
        { fromCityId: 2, toCityId: 3, date: '2099-01-02' },
        { fromCityId: 3, toCityId: 1, date: '2099-01-03' },
      ]
      const result = removeRecentSearch(current, 1)
      expect(result).toEqual([
        { fromCityId: 1, toCityId: 2, date: '2099-01-01' },
        { fromCityId: 3, toCityId: 1, date: '2099-01-03' },
      ])
    })
  })
})
