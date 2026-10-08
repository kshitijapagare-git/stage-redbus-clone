import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BoardingPointSummary from './BoardingPointSummary'
import type { BoardingPoint, City } from '../types'

const cities: City[] = [{ id: 1, name: 'Pune', state: 'Maharashtra' }]
const boardingPoint: BoardingPoint = {
  id: 1,
  name: 'Shivajinagar',
  address: 'FC Road',
  landmark: 'Near Modern Cafe',
  cityId: 1,
}

describe('BoardingPointSummary', () => {
  it('displays the boarding point name, address, landmark, and resolved city', () => {
    render(<BoardingPointSummary cities={cities} boardingPoint={boardingPoint} />)
    const panel = document.querySelector('.boarding-summary')
    expect(panel).toHaveTextContent('Shivajinagar')
    expect(panel).toHaveTextContent('FC Road')
    expect(panel).toHaveTextContent('Near Modern Cafe')
    expect(panel).toHaveTextContent('Pune')
    expect(panel).toHaveTextContent('Maharashtra')
  })

  it('renders nothing when boardingPoint is null', () => {
    const { container } = render(<BoardingPointSummary cities={cities} boardingPoint={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('has the boarding-summary CSS class', () => {
    render(<BoardingPointSummary cities={cities} boardingPoint={boardingPoint} />)
    expect(document.querySelector('.boarding-summary')).toBeInTheDocument()
  })
})
