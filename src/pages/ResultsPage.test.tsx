import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ResultsPage from './ResultsPage'

function renderResultsPage(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/search" element={<ResultsPage />} />
        <Route path="/book" element={<div>Booking page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ResultsPage boarding point selection', () => {
  it('disables Continue when nothing is selected', () => {
    renderResultsPage('/search?from=1&to=2&date=2099-01-01')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('selecting a boarding point highlights it and enables Continue', () => {
    renderResultsPage('/search?from=1&to=2&date=2099-01-01')
    const options = screen.getAllByRole('radio')
    fireEvent.click(options[0])

    expect(options[0]).toHaveAttribute('aria-checked', 'true')
    expect(options[0]).toHaveClass('bp-card-selected')
    expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled()
    expect(document.querySelector('.boarding-summary')).toHaveTextContent('Shivajinagar')
  })

  it('pre-selects the boarding point from a valid ?bp= param', () => {
    renderResultsPage('/search?from=1&to=2&date=2099-01-01&bp=2')
    const options = screen.getAllByRole('radio')
    expect(options[1]).toHaveAttribute('aria-checked', 'true')
    expect(options[1]).toHaveClass('bp-card-selected')
    expect(screen.getByRole('button', { name: 'Continue' })).not.toBeDisabled()
    expect(document.querySelector('.boarding-summary')).toHaveTextContent('Hinjewadi')
  })

  it('ignores a bp param that does not match any boarding point', () => {
    renderResultsPage('/search?from=1&to=2&date=2099-01-01&bp=999')
    const options = screen.getAllByRole('radio')
    options.forEach((option) => expect(option).toHaveAttribute('aria-checked', 'false'))
    expect(document.querySelector('.boarding-summary')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('ignores a bp param that belongs to a different city', () => {
    renderResultsPage('/search?from=1&to=2&date=2099-01-01&bp=3')
    const options = screen.getAllByRole('radio')
    options.forEach((option) => expect(option).toHaveAttribute('aria-checked', 'false'))
    expect(document.querySelector('.boarding-summary')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })

  it('navigates to /book with the selected boarding point when Continue is clicked', () => {
    renderResultsPage('/search?from=1&to=2&date=2099-01-01&bp=1')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByText('Booking page')).toBeInTheDocument()
  })
})

describe('ResultsPage booking for women label', () => {
  it('shows the "Booking for women" badge when women=1 is present', () => {
    renderResultsPage('/search?from=1&to=2&date=2099-01-01&women=1')
    expect(screen.getByText('Booking for women')).toBeInTheDocument()
  })

  it('does not show the badge when the women param is absent', () => {
    renderResultsPage('/search?from=1&to=2&date=2099-01-01')
    expect(screen.queryByText('Booking for women')).not.toBeInTheDocument()
  })

  it('does not show the badge when the women param is any value other than "1"', () => {
    renderResultsPage('/search?from=1&to=2&date=2099-01-01&women=0')
    expect(screen.queryByText('Booking for women')).not.toBeInTheDocument()
  })
})
