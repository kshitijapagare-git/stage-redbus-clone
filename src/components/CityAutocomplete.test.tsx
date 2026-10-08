import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import CityAutocomplete from './CityAutocomplete'
import type { City } from '../types'

const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
]

function Harness({ onSelect }: { onSelect: (city: City) => void }) {
  const [value, setValue] = useState('')
  const [cityId, setCityId] = useState<number | null>(null)

  return (
    <CityAutocomplete
      id="from"
      label="From"
      cities={cities}
      value={value}
      cityId={cityId}
      onValueChange={setValue}
      onSelect={(city) => {
        setValue(city.name)
        setCityId(city.id)
        onSelect(city)
      }}
    />
  )
}

describe('CityAutocomplete', () => {
  it('shows no listbox when the input is empty', () => {
    render(<Harness onSelect={vi.fn()} />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('shows matching options in cities array order when typing a single character', () => {
    render(<Harness onSelect={vi.fn()} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'u' } })

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(2)
    expect(options[0]).toHaveTextContent('Pune')
    expect(options[1]).toHaveTextContent('Bengaluru')
  })

  it('suggests "Pune, Maharashtra" when typing "pu"', () => {
    render(<Harness onSelect={vi.fn()} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('Pune')
    expect(options[0]).toHaveTextContent('Maharashtra')
  })

  it('carries the ARIA combobox pattern attributes', () => {
    render(<Harness onSelect={vi.fn()} />)
    const input = screen.getByRole('combobox')
    expect(input).toHaveAttribute('aria-expanded', 'false')

    fireEvent.change(input, { target: { value: 'pu' } })
    expect(input).toHaveAttribute('aria-expanded', 'true')

    const listbox = screen.getByRole('listbox')
    expect(input.getAttribute('aria-controls')).toBe(listbox.id)
  })

  it('moves the highlighted option with ArrowDown/ArrowUp and updates aria-activedescendant', () => {
    render(<Harness onSelect={vi.fn()} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'u' } })

    const options = screen.getAllByRole('option')
    expect(input).toHaveAttribute('aria-activedescendant', options[0].id)

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input).toHaveAttribute('aria-activedescendant', options[1].id)

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input).toHaveAttribute('aria-activedescendant', options[0].id)
  })

  it('selects the highlighted option on Enter and closes the list', () => {
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'u' } })

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 2, name: 'Bengaluru' }))
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes the list on Escape and leaves the value unchanged', () => {
    render(<Harness onSelect={vi.fn()} />)
    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'u' } })
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input.value).toBe('u')
  })

  it('calls onSelect with the city whose id is 1 when choosing the "pu" suggestion', () => {
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    const input = screen.getByRole('combobox')
    fireEvent.change(input, { target: { value: 'pu' } })

    fireEvent.click(screen.getByRole('option'))

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: 'Pune', state: 'Maharashtra' }))
  })
})
