import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import SearchCard from './SearchCard'

function renderSearchCard(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<SearchCard />} />
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
})
