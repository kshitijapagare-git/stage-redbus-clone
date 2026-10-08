import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ResultsPage from './ResultsPage'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/search" element={<ResultsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function futureDateISO(daysAhead: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

describe('ResultsPage', () => {
  it('shows the header and only the boarding points for the matching route', () => {
    renderAt(`/search?from=1&to=2&date=${futureDateISO(1)}`)

    expect(screen.getByRole('heading')).toHaveTextContent('Pune → Bengaluru')
    expect(screen.getByText(/Shivajinagar/)).toBeInTheDocument()
    expect(screen.getByText(/Hinjewadi/)).toBeInTheDocument()
    expect(screen.queryByText(/Majestic/)).not.toBeInTheDocument()
  })

  it('shows a "No routes found" empty state and still shows the header when no route connects the cities', () => {
    renderAt(`/search?from=2&to=1&date=${futureDateISO(1)}`)

    expect(screen.getByRole('heading')).toHaveTextContent('Bengaluru → Pune')
    expect(screen.getByText('No routes found')).toBeInTheDocument()
  })

  it('shows an invalid city error and hides the header for an unknown city id', () => {
    renderAt(`/search?from=999&to=2&date=${futureDateISO(1)}`)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid city')
  })

  it('shows an invalid date error and hides the header for a past date', () => {
    renderAt(`/search?from=1&to=2&date=${futureDateISO(-5)}`)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid date')
  })
})
