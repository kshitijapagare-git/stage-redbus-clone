import { Link, useSearchParams } from 'react-router-dom'
import BoardingPointList from '../components/BoardingPointList'
import { boardingPoints, cities, routes } from '../data'
import { formatShortDate, parseSearchQuery } from '../lib/searchQuery'
import { getRouteBoardingPoints } from '../lib/results'

function ResultsPage() {
  const [searchParams] = useSearchParams()
  const result = parseSearchQuery(searchParams, cities)

  const modifySearchParams = searchParams.toString()
  const modifySearchHref = modifySearchParams ? `/?${modifySearchParams}` : '/'

  if (!result.ok) {
    return (
      <main className="container section">
        <div className="results-error" role="alert">
          <strong>{result.error.message}</strong>
          <p>We couldn't load your search results. Please try your search again.</p>
          <Link to={modifySearchHref}>Modify search</Link>
        </div>
      </main>
    )
  }

  const { fromCityId, toCityId, date } = result.value
  const fromCity = cities.find((c) => c.id === fromCityId)
  const toCity = cities.find((c) => c.id === toCityId)

  const dateParts = date.split('-').map(Number)
  const displayDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])

  const matchingBoardingPoints = getRouteBoardingPoints(routes, boardingPoints, fromCityId, toCityId)

  return (
    <main className="container section">
      <div className="results-head">
        <h2>
          {fromCity?.name} → {toCity?.name} · {formatShortDate(displayDate)}
        </h2>
        <Link to={modifySearchHref}>Modify search</Link>
      </div>
      {matchingBoardingPoints.length > 0 ? (
        <BoardingPointList cities={cities} boardingPoints={matchingBoardingPoints} />
      ) : (
        <p className="results-empty">No routes found</p>
      )}
    </main>
  )
}

export default ResultsPage
