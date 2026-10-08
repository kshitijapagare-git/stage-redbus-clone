import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import BoardingPointList from '../components/BoardingPointList'
import BoardingPointSummary from '../components/BoardingPointSummary'
import { boardingPoints, cities, routes } from '../data'
import { formatShortDate, parseSearchQuery } from '../lib/searchQuery'
import { getRouteBoardingPoints, resolveSelectedBoardingPoint } from '../lib/results'
import type { BoardingPoint } from '../types'

function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const result = parseSearchQuery(searchParams, cities)

  const modifySearchParams = searchParams.toString()
  const modifySearchHref = modifySearchParams ? `/?${modifySearchParams}` : '/'

  const fromCityId = result.ok ? result.value.fromCityId : null
  const toCityId = result.ok ? result.value.toCityId : null
  const date = result.ok ? result.value.date : null

  const [selectedBpId, setSelectedBpId] = useState<number | null>(() => {
    if (fromCityId === null) return null
    const resolved = resolveSelectedBoardingPoint(boardingPoints, fromCityId, searchParams.get('bp'))
    return resolved ? resolved.id : null
  })

  useEffect(() => {
    if (fromCityId === null) {
      setSelectedBpId(null)
      return
    }
    const resolved = resolveSelectedBoardingPoint(boardingPoints, fromCityId, searchParams.get('bp'))
    setSelectedBpId(resolved ? resolved.id : null)
    // Re-resolve selection whenever the underlying search (from/to/date) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCityId, toCityId, date])

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

  const fromCity = cities.find((c) => c.id === fromCityId)
  const toCity = cities.find((c) => c.id === toCityId)

  const dateParts = date!.split('-').map(Number)
  const displayDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2])

  const matchingBoardingPoints = getRouteBoardingPoints(routes, boardingPoints, fromCityId!, toCityId!)
  const selectedBoardingPoint =
    matchingBoardingPoints.find((bp) => bp.id === selectedBpId) ?? null

  const handleSelectBoardingPoint = (bp: BoardingPoint) => {
    setSelectedBpId(bp.id)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('bp', String(bp.id))
    setSearchParams(nextParams)
  }

  const handleContinue = () => {
    if (selectedBpId === null) return
    navigate(`/book?from=${fromCityId}&to=${toCityId}&date=${date}&bp=${selectedBpId}`)
  }

  return (
    <main className="container section">
      <div className="results-head">
        <h2>
          {fromCity?.name} → {toCity?.name} · {formatShortDate(displayDate)}
        </h2>
        <Link to={modifySearchHref}>Modify search</Link>
      </div>
      {matchingBoardingPoints.length > 0 ? (
        <>
          <BoardingPointList
            cities={cities}
            boardingPoints={matchingBoardingPoints}
            selectedId={selectedBpId}
            onSelect={handleSelectBoardingPoint}
          />
          <BoardingPointSummary cities={cities} boardingPoint={selectedBoardingPoint} />
          <button
            type="button"
            className="continue-btn"
            disabled={selectedBpId === null}
            onClick={handleContinue}
          >
            Continue
          </button>
        </>
      ) : (
        <p className="results-empty">No routes found</p>
      )}
    </main>
  )
}

export default ResultsPage
