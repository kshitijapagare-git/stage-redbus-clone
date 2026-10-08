import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import RecentSearches from './RecentSearches'
import type { City } from '../types'
import type { RecentSearch } from '../lib/recentSearches'

const cities: City[] = [
  { id: 1, name: 'Pune', state: 'Maharashtra' },
  { id: 2, name: 'Bengaluru', state: 'Karnataka' },
]

const today = new Date(2099, 0, 15)

describe('RecentSearches', () => {
  it('renders nothing when searches is empty', () => {
    const { container } = render(
      <RecentSearches cities={cities} searches={[]} today={today} onSelect={vi.fn()} onRemove={vi.fn()} onClearAll={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByText('Recent searches')).not.toBeInTheDocument()
  })

  it('renders each search formatted as "From → To · DD Mon"', () => {
    const searches: RecentSearch[] = [{ fromCityId: 1, toCityId: 2, date: '2099-10-02' }]
    render(
      <RecentSearches cities={cities} searches={searches} today={today} onSelect={vi.fn()} onRemove={vi.fn()} onClearAll={vi.fn()} />,
    )
    expect(screen.getByText('Pune → Bengaluru · 02 Oct')).toBeInTheDocument()
  })

  it('appends "(Past)" for a search whose date has passed', () => {
    const searches: RecentSearch[] = [{ fromCityId: 1, toCityId: 2, date: '2099-01-01' }]
    render(
      <RecentSearches cities={cities} searches={searches} today={today} onSelect={vi.fn()} onRemove={vi.fn()} onClearAll={vi.fn()} />,
    )
    expect(screen.getByText('Pune → Bengaluru · 01 Jan (Past)')).toBeInTheDocument()
  })

  it('calls onSelect with the search when an item is clicked', () => {
    const onSelect = vi.fn()
    const searches: RecentSearch[] = [{ fromCityId: 1, toCityId: 2, date: '2099-10-02' }]
    render(
      <RecentSearches cities={cities} searches={searches} today={today} onSelect={onSelect} onRemove={vi.fn()} onClearAll={vi.fn()} />,
    )
    fireEvent.click(screen.getByText('Pune → Bengaluru · 02 Oct'))
    expect(onSelect).toHaveBeenCalledWith(searches[0])
  })

  it('calls onRemove with the index and not onSelect when × is clicked', () => {
    const onSelect = vi.fn()
    const onRemove = vi.fn()
    const searches: RecentSearch[] = [
      { fromCityId: 1, toCityId: 2, date: '2099-10-02' },
      { fromCityId: 2, toCityId: 1, date: '2099-10-03' },
    ]
    render(
      <RecentSearches cities={cities} searches={searches} today={today} onSelect={onSelect} onRemove={onRemove} onClearAll={vi.fn()} />,
    )
    const removeButtons = screen.getAllByRole('button', { name: /^Remove / })
    fireEvent.click(removeButtons[1])
    expect(onRemove).toHaveBeenCalledWith(1)
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('calls onClearAll once when "Clear all" is clicked', () => {
    const onClearAll = vi.fn()
    const searches: RecentSearch[] = [{ fromCityId: 1, toCityId: 2, date: '2099-10-02' }]
    render(
      <RecentSearches cities={cities} searches={searches} today={today} onSelect={vi.fn()} onRemove={vi.fn()} onClearAll={onClearAll} />,
    )
    fireEvent.click(screen.getByText('Clear all'))
    expect(onClearAll).toHaveBeenCalledTimes(1)
  })
})
