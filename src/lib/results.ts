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

export function resolveSelectedBoardingPoint(
  boardingPoints: BoardingPoint[],
  fromCityId: number,
  bpParam: string | null,
): BoardingPoint | null {
  if (!bpParam) return null

  const bpId = Number(bpParam)
  if (!Number.isFinite(bpId)) return null

  const boardingPoint = boardingPoints.find((bp) => bp.id === bpId)
  if (!boardingPoint) return null
  if (boardingPoint.cityId !== fromCityId) return null

  return boardingPoint
}
