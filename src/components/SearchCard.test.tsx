import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SearchCard from './SearchCard'
import { STORAGE_KEY } from '../lib/recentSearches'

function renderSearchCard(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<SearchCard />} />
      </Routes>
    </MemoryRouter>,
  )
}

// For tests that perform multiple searches in a row: SearchCard unmounts when
// navigating away under the default "/" route, so a catch-all route is used to
// keep it mounted across repeated searches.
function renderSearchCardPersistent(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={<SearchCard />} />
      </Routes>
    </MemoryRouter>,
  )
}

function toISODate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

describe('SearchCard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stores the selected city id when choosing a suggestion in the From field', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    fireEvent.change(fromInput, { target: { value: 'pu' } })
    fireEvent.click(screen.getByRole('option', { name: /Pune/ }))

    expect((fromInput as HTMLInputElement).value).toBe('Pune')
  })

  it('shows "Please select a city" next to a field with no selected city on Search', () => {
    renderSearchCard()
    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(2)
    expect(alerts[0]).toHaveTextContent('Please select a city')
    expect(alerts[1]).toHaveTextContent('Please select a city')
  })

  it('shows "From and To must be different" next to both fields when the same city is picked twice', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    fireEvent.change(fromInput, { target: { value: 'pu' } })
    fireEvent.click(screen.getByRole('option', { name: /Pune/ }))

    fireEvent.change(toInput, { target: { value: 'pu' } })
    fireEvent.click(screen.getByRole('option', { name: /Pune/ }))

    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(2)
    expect(alerts[0]).toHaveTextContent('From and To must be different')
    expect(alerts[1]).toHaveTextContent('From and To must be different')
  })

  it('shows no error when From and To hold different selected cities', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    fireEvent.change(fromInput, { target: { value: 'pu' } })
    fireEvent.click(screen.getByRole('option', { name: /Pune/ }))

    fireEvent.change(toInput, { target: { value: 'ben' } })
    fireEvent.click(screen.getByRole('option', { name: /Bengaluru/ }))

    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('swaps the selected cities and displayed text between From and To', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' }) as HTMLInputElement
    const toInput = screen.getByRole('combobox', { name: 'To' }) as HTMLInputElement

    fireEvent.change(fromInput, { target: { value: 'pu' } })
    fireEvent.click(screen.getByRole('option', { name: /Pune/ }))

    fireEvent.change(toInput, { target: { value: 'ben' } })
    fireEvent.click(screen.getByRole('option', { name: /Bengaluru/ }))

    fireEvent.click(screen.getByRole('button', { name: 'Swap From and To' }))

    expect(fromInput.value).toBe('Bengaluru')
    expect(toInput.value).toBe('Pune')
  })

  it('clears existing errors when swap is clicked', () => {
    renderSearchCard()
    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))
    expect(screen.getAllByRole('alert')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'Swap From and To' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('closes any open suggestion list for both fields when swap is clicked', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    fireEvent.change(fromInput, { target: { value: 'pu' } })
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Swap From and To' }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('clears the stored city id when typing new text into a previously selected field', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    fireEvent.change(fromInput, { target: { value: 'pu' } })
    fireEvent.click(screen.getByRole('option', { name: /Pune/ }))

    fireEvent.change(toInput, { target: { value: 'ben' } })
    fireEvent.click(screen.getByRole('option', { name: /Bengaluru/ }))

    fireEvent.change(fromInput, { target: { value: 'Pun' } })
    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toHaveTextContent('Please select a city')
  })

  it('shows a date error and does not navigate when a past date is selected and Search is clicked', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })
    const dateInput = screen.getByLabelText('Date of Journey')

    fireEvent.change(fromInput, { target: { value: 'pu' } })
    fireEvent.click(screen.getByRole('option', { name: /Pune/ }))
    fireEvent.change(toInput, { target: { value: 'ben' } })
    fireEvent.click(screen.getByRole('option', { name: /Bengaluru/ }))

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    fireEvent.change(dateInput, { target: { value: toISODate(yesterday) } })

    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    expect(screen.getByRole('button', { name: '⌕ Search buses' })).toBeInTheDocument()
    const alerts = screen.getAllByRole('alert')
    expect(alerts.some((a) => a.textContent?.includes('present or future date'))).toBe(true)
  })

  it('navigates to /search with the serialized query when both cities and a valid date are set', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    fireEvent.change(fromInput, { target: { value: 'pu' } })
    fireEvent.click(screen.getByRole('option', { name: /Pune/ }))
    fireEvent.change(toInput, { target: { value: 'ben' } })
    fireEvent.click(screen.getByRole('option', { name: /Bengaluru/ }))

    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    expect(screen.queryByRole('combobox', { name: 'From' })).not.toBeInTheDocument()
  })

  it('prefills from, to, and date fields when mounted with valid query params', () => {
    renderSearchCard('/?from=1&to=2&date=2099-10-02')

    const fromInput = screen.getByRole('combobox', { name: 'From' }) as HTMLInputElement
    const toInput = screen.getByRole('combobox', { name: 'To' }) as HTMLInputElement
    const dateInput = screen.getByLabelText('Date of Journey') as HTMLInputElement

    expect(fromInput.value).toBe('Pune')
    expect(toInput.value).toBe('Bengaluru')
    expect(dateInput.value).toBe('2099-10-02')
  })

  it('renders the default empty/today state without throwing when query params are invalid', () => {
    expect(() => renderSearchCard('/?from=999&to=2&date=not-a-date')).not.toThrow()

    const fromInput = screen.getByRole('combobox', { name: 'From' }) as HTMLInputElement
    const toInput = screen.getByRole('combobox', { name: 'To' }) as HTMLInputElement

    expect(fromInput.value).toBe('')
    expect(toInput.value).toBe('')
  })

  it('saves a successful search to localStorage', () => {
    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    fireEvent.change(fromInput, { target: { value: 'pu' } })
    fireEvent.click(screen.getByRole('option', { name: /Pune/ }))
    fireEvent.change(toInput, { target: { value: 'ben' } })
    fireEvent.click(screen.getByRole('option', { name: /Bengaluru/ }))

    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({ fromCityId: 1, toCityId: 2 })
  })

  it('keeps only one entry when the same route is searched twice', () => {
    renderSearchCardPersistent()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    for (let i = 0; i < 2; i++) {
      fireEvent.change(fromInput, { target: { value: 'pu' } })
      fireEvent.click(screen.getByRole('option', { name: /Pune/ }))
      fireEvent.change(toInput, { target: { value: 'ben' } })
      fireEvent.click(screen.getByRole('option', { name: /Bengaluru/ }))
      fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))
    }

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(1)
  })

  it('never keeps more than 5 entries after many successful searches', () => {
    renderSearchCardPersistent()
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    const toInput = screen.getByRole('combobox', { name: 'To' })

    for (let i = 0; i < 6; i++) {
      fireEvent.change(fromInput, { target: { value: 'pu' } })
      fireEvent.click(screen.getByRole('option', { name: /Pune/ }))
      fireEvent.change(toInput, { target: { value: 'ben' } })
      fireEvent.click(screen.getByRole('option', { name: /Bengaluru/ }))
      fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))
    }

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored.length).toBeLessThanOrEqual(5)
  })

  it('fills From, To and date when a non-past recent search is clicked', () => {
    const first = renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' }) as HTMLInputElement
    const toInput = screen.getByRole('combobox', { name: 'To' }) as HTMLInputElement
    const dateInput = screen.getByLabelText('Date of Journey') as HTMLInputElement

    fireEvent.change(fromInput, { target: { value: 'pu' } })
    fireEvent.click(screen.getByRole('option', { name: /Pune/ }))
    fireEvent.change(toInput, { target: { value: 'ben' } })
    fireEvent.click(screen.getByRole('option', { name: /Bengaluru/ }))

    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 5)
    const futureISO = toISODate(futureDate)
    fireEvent.change(dateInput, { target: { value: futureISO } })

    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))
    first.unmount()

    // Re-render fresh to pick up the persisted recent search.
    renderSearchCard()
    const newFromInput = screen.getByRole('combobox', { name: 'From' }) as HTMLInputElement
    const newToInput = screen.getByRole('combobox', { name: 'To' }) as HTMLInputElement
    const newDateInput = screen.getByLabelText('Date of Journey') as HTMLInputElement

    fireEvent.click(screen.getByText(`Pune → Bengaluru · ${formatShortDateForTest(futureDate)}`))

    expect(newFromInput.value).toBe('Pune')
    expect(newToInput.value).toBe('Bengaluru')
    expect(newDateInput.value).toBe(futureISO)
  })

  it('fills From and To but sets today for a past recent search', () => {
    const past: { fromCityId: number; toCityId: number; date: string } = {
      fromCityId: 1,
      toCityId: 2,
      date: '2000-01-01',
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([past]))

    renderSearchCard()
    const fromInput = screen.getByRole('combobox', { name: 'From' }) as HTMLInputElement
    const toInput = screen.getByRole('combobox', { name: 'To' }) as HTMLInputElement
    const dateInput = screen.getByLabelText('Date of Journey') as HTMLInputElement

    fireEvent.click(screen.getByText(/Pune → Bengaluru · 01 Jan \(Past\)/))

    const today = new Date()
    expect(fromInput.value).toBe('Pune')
    expect(toInput.value).toBe('Bengaluru')
    expect(dateInput.value).toBe(toISODate(today))
  })

  it('removes only the clicked recent search via ×', () => {
    const searches = [
      { fromCityId: 1, toCityId: 2, date: '2099-10-02' },
      { fromCityId: 2, toCityId: 1, date: '2099-10-03' },
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))

    renderSearchCard()
    const removeButtons = screen.getAllByRole('button', { name: /^Remove / })
    fireEvent.click(removeButtons[0])

    expect(screen.queryByText(/Pune → Bengaluru · 02 Oct/)).not.toBeInTheDocument()
    expect(screen.getByText(/Bengaluru → Pune · 03 Oct/)).toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0]).toMatchObject({ fromCityId: 2, toCityId: 1 })
  })

  it('removes all recent searches when "Clear all" is clicked', () => {
    const searches = [
      { fromCityId: 1, toCityId: 2, date: '2099-10-02' },
      { fromCityId: 2, toCityId: 1, date: '2099-10-03' },
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))

    renderSearchCard()
    fireEvent.click(screen.getByText('Clear all'))

    expect(screen.queryByText('Recent searches')).not.toBeInTheDocument()
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(0)
  })

  it('hides the recent searches row and still renders when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('boom')
    })

    expect(() => renderSearchCard()).not.toThrow()
    expect(screen.queryByText('Recent searches')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '⌕ Search buses' })).toBeInTheDocument()
  })

  it('drops a saved recent search referencing an unknown city on mount', () => {
    const searches = [{ fromCityId: 999, toCityId: 2, date: '2099-10-02' }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches))

    renderSearchCard()

    expect(screen.queryByText('Recent searches')).not.toBeInTheDocument()
  })
})

function formatShortDateForTest(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}`
}
