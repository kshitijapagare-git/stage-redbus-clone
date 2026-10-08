import type { BoardingPoint, Route } from '../types'

export function getRouteBoardingPoints(
  routes: Route[],
  boardingPoints: BoardingPoint[],
  fromCityId: number,
  toCityId: number,
): BoardingPoint[] {
  const hasRoute = routes.some((r) => r.fromCityId === fromCityId && r.toCityId === toCityId)
  if (!hasRoute) return []

  return boardingPoints.filter((bp) => bp.cityId === fromCityId)
}
