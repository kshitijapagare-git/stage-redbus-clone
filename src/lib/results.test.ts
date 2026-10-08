import { describe, expect, it } from 'vitest'
import { getRouteBoardingPoints } from './results'
import type { BoardingPoint, Route } from '../types'

const boardingPoints: BoardingPoint[] = [
  { id: 1, name: 'Shivajinagar', address: 'FC Road', landmark: 'Near Modern Cafe', cityId: 1 },
  { id: 2, name: 'Hinjewadi', address: 'Phase 1', landmark: 'Near Wipro Circle', cityId: 1 },
  { id: 3, name: 'Majestic', address: 'Kempegowda Bus Station', landmark: 'Opp. Railway Station', cityId: 2 },
]

const routes: Route[] = [{ id: 1, fromCityId: 1, toCityId: 2 }]

describe('getRouteBoardingPoints', () => {
  it('returns boarding points in fromCityId when a matching route exists', () => {
    const result = getRouteBoardingPoints(routes, boardingPoints, 1, 2)
    expect(result.map((bp) => bp.name)).toEqual(['Shivajinagar', 'Hinjewadi'])
  })

  it('returns an empty array when no route matches fromCityId/toCityId exactly', () => {
    const result = getRouteBoardingPoints(routes, boardingPoints, 2, 1)
    expect(result).toEqual([])
  })

  it('returns an empty array when boarding points exist for fromCityId but no route connects the cities', () => {
    const result = getRouteBoardingPoints([], boardingPoints, 1, 2)
    expect(result).toEqual([])
  })
})
