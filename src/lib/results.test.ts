import { describe, expect, it } from 'vitest'
import { getRouteBoardingPoints, resolveSelectedBoardingPoint } from './results'
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

describe('resolveSelectedBoardingPoint', () => {
  it('returns the boarding point when bp exists and belongs to fromCityId', () => {
    const result = resolveSelectedBoardingPoint(boardingPoints, 1, '2')
    expect(result).toEqual(boardingPoints[1])
  })

  it('returns null when bp does not match any boarding point id', () => {
    const result = resolveSelectedBoardingPoint(boardingPoints, 1, '99')
    expect(result).toBeNull()
  })

  it('returns null when bp matches a boarding point belonging to a different city than fromCityId', () => {
    const result = resolveSelectedBoardingPoint(boardingPoints, 1, '3')
    expect(result).toBeNull()
  })

  it('returns null for a missing bp param', () => {
    const result = resolveSelectedBoardingPoint(boardingPoints, 1, null)
    expect(result).toBeNull()
  })

  it('returns null for a non-numeric bp param', () => {
    const result = resolveSelectedBoardingPoint(boardingPoints, 1, 'abc')
    expect(result).toBeNull()
  })
})
