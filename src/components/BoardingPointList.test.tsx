import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import BoardingPointList from './BoardingPointList'
import type { BoardingPoint, City } from '../types'

const cities: City[] = [{ id: 1, name: 'Pune', state: 'Maharashtra' }]
const boardingPoints: BoardingPoint[] = [
  { id: 1, name: 'Shivajinagar', address: 'FC Road', landmark: 'Near Modern Cafe', cityId: 1 },
]

const multipleBoardingPoints: BoardingPoint[] = [
  { id: 1, name: 'Shivajinagar', address: 'FC Road', landmark: 'Near Modern Cafe', cityId: 1 },
  { id: 2, name: 'Hinjewadi', address: 'Phase 1', landmark: 'Near Wipro Circle', cityId: 1 },
  { id: 3, name: 'Kothrud', address: 'Paud Road', landmark: 'Near Depot', cityId: 1 },
]

describe('BoardingPointList', () => {
  it('renders each boarding point with its fields', () => {
    render(<BoardingPointList cities={cities} boardingPoints={boardingPoints} />)
    const item = screen.getByRole('listitem')
    expect(item).toHaveTextContent('Shivajinagar')
    expect(item).toHaveTextContent('FC Road')
    expect(item).toHaveTextContent('Near Modern Cafe')
  })

  it('resolves cityId to the city name and state', () => {
    render(<BoardingPointList cities={cities} boardingPoints={boardingPoints} />)
    expect(screen.getByRole('listitem')).toHaveTextContent('(Pune, Maharashtra)')
  })

  it('renders a radiogroup with one radio option per boarding point when onSelect is provided', () => {
    render(
      <BoardingPointList
        cities={cities}
        boardingPoints={multipleBoardingPoints}
        selectedId={null}
        onSelect={() => {}}
      />,
    )
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('marks exactly one option as checked matching selectedId', () => {
    render(
      <BoardingPointList
        cities={cities}
        boardingPoints={multipleBoardingPoints}
        selectedId={2}
        onSelect={() => {}}
      />,
    )
    const options = screen.getAllByRole('radio')
    expect(options[0]).toHaveAttribute('aria-checked', 'false')
    expect(options[1]).toHaveAttribute('aria-checked', 'true')
    expect(options[2]).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onSelect with the clicked boarding point and updates checked state', () => {
    const handleSelect = vi.fn()
    const { rerender } = render(
      <BoardingPointList
        cities={cities}
        boardingPoints={multipleBoardingPoints}
        selectedId={1}
        onSelect={handleSelect}
      />,
    )

    fireEvent.click(screen.getAllByRole('radio')[1])
    expect(handleSelect).toHaveBeenCalledWith(multipleBoardingPoints[1])

    rerender(
      <BoardingPointList
        cities={cities}
        boardingPoints={multipleBoardingPoints}
        selectedId={2}
        onSelect={handleSelect}
      />,
    )
    const options = screen.getAllByRole('radio')
    expect(options[0]).toHaveAttribute('aria-checked', 'false')
    expect(options[1]).toHaveAttribute('aria-checked', 'true')
  })

  it('moves focus with ArrowDown/ArrowUp and clamps at the ends', () => {
    render(
      <BoardingPointList
        cities={cities}
        boardingPoints={multipleBoardingPoints}
        selectedId={1}
        onSelect={() => {}}
      />,
    )
    const options = screen.getAllByRole('radio')
    options[0].focus()
    expect(options[0]).toHaveFocus()

    fireEvent.keyDown(options[0], { key: 'ArrowDown' })
    expect(options[1]).toHaveFocus()

    fireEvent.keyDown(options[1], { key: 'ArrowDown' })
    expect(options[2]).toHaveFocus()

    fireEvent.keyDown(options[2], { key: 'ArrowDown' })
    expect(options[2]).toHaveFocus()

    fireEvent.keyDown(options[2], { key: 'ArrowUp' })
    expect(options[1]).toHaveFocus()

    fireEvent.keyDown(options[1], { key: 'ArrowUp' })
    expect(options[0]).toHaveFocus()

    fireEvent.keyDown(options[0], { key: 'ArrowUp' })
    expect(options[0]).toHaveFocus()
  })

  it('selects the focused option on Space or Enter', () => {
    const handleSelect = vi.fn()
    render(
      <BoardingPointList
        cities={cities}
        boardingPoints={multipleBoardingPoints}
        selectedId={1}
        onSelect={handleSelect}
      />,
    )
    const options = screen.getAllByRole('radio')
    options[1].focus()
    fireEvent.keyDown(options[1], { key: ' ' })
    expect(handleSelect).toHaveBeenCalledWith(multipleBoardingPoints[1])

    options[2].focus()
    fireEvent.keyDown(options[2], { key: 'Enter' })
    expect(handleSelect).toHaveBeenCalledWith(multipleBoardingPoints[2])
  })

  it('applies the bp-card-selected class only to the selected card', () => {
    render(
      <BoardingPointList
        cities={cities}
        boardingPoints={multipleBoardingPoints}
        selectedId={2}
        onSelect={() => {}}
      />,
    )
    const options = screen.getAllByRole('radio')
    expect(options[0]).not.toHaveClass('bp-card-selected')
    expect(options[1]).toHaveClass('bp-card-selected')
    expect(options[2]).not.toHaveClass('bp-card-selected')
  })
})
