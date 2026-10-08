import type { BoardingPoint, City } from '../types'

interface Props {
  cities: City[]
  boardingPoint: BoardingPoint | null
}

function BoardingPointSummary({ cities, boardingPoint }: Props) {
  if (!boardingPoint) return null

  const city = cities.find((c) => c.id === boardingPoint.cityId)

  return (
    <div className="boarding-summary">
      <h3>Boarding Point</h3>
      <p>
        <strong>{boardingPoint.name}</strong> — {boardingPoint.address}, {boardingPoint.landmark}
        {city && ` (${city.name}, ${city.state})`}
      </p>
    </div>
  )
}

export default BoardingPointSummary
