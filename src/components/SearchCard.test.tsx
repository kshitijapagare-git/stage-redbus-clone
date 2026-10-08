import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SearchCard from './SearchCard'

describe('SearchCard', () => {
  it('stores the selected city id when choosing a suggestion in the From field', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    fireEvent.change(fromInput, { target: { value: 'pu' } })
    fireEvent.click(screen.getByRole('option', { name: /Pune/ }))

    expect((fromInput as HTMLInputElement).value).toBe('Pune')
  })

  it('shows "Please select a city" next to a field with no selected city on Search', () => {
    render(<SearchCard />)
    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(2)
    expect(alerts[0]).toHaveTextContent('Please select a city')
    expect(alerts[1]).toHaveTextContent('Please select a city')
  })

  it('shows "From and To must be different" next to both fields when the same city is picked twice', () => {
    render(<SearchCard />)
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
    render(<SearchCard />)
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
    render(<SearchCard />)
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
    render(<SearchCard />)
    fireEvent.click(screen.getByRole('button', { name: '⌕ Search buses' }))
    expect(screen.getAllByRole('alert')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'Swap From and To' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('closes any open suggestion list for both fields when swap is clicked', () => {
    render(<SearchCard />)
    const fromInput = screen.getByRole('combobox', { name: 'From' })
    fireEvent.change(fromInput, { target: { value: 'pu' } })
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Swap From and To' }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('clears the stored city id when typing new text into a previously selected field', () => {
    render(<SearchCard />)
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
})
