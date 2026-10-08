import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Offers from './Offers'

const sampleOffers = [
  { title: 'Save up to Rs 300 on bus tickets', valid: '05 Oct', code: 'FESTIVE300', tone: 'peach', category: 'bus' as const },
  { title: 'Save up to Rs 250 on bus tickets', valid: '31 Oct', code: 'FIRST', tone: 'pink', category: 'bus' as const },
  { title: 'Save up to Rs 200 on train tickets', valid: '31 Oct', code: 'TRAINDAY', tone: 'yellow', category: 'train' as const },
]

describe('Offers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows every sample offer, bus and train, on the default "All" tab', () => {
    render(<Offers offers={sampleOffers} />)

    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('FESTIVE300', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('FIRST', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('TRAINDAY', { exact: false })).toBeInTheDocument()
  })

  it('shows only bus offers when the Bus tab is clicked', () => {
    render(<Offers offers={sampleOffers} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Bus' }))

    expect(screen.getByRole('tab', { name: 'Bus' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('FESTIVE300', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('FIRST', { exact: false })).toBeInTheDocument()
    expect(screen.queryByText('TRAINDAY', { exact: false })).not.toBeInTheDocument()
  })

  it('shows only train offers when the Train tab is clicked', () => {
    render(<Offers offers={sampleOffers} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Train' }))

    expect(screen.getByRole('tab', { name: 'Train' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('TRAINDAY', { exact: false })).toBeInTheDocument()
    expect(screen.queryByText('FESTIVE300', { exact: false })).not.toBeInTheDocument()
    expect(screen.queryByText('FIRST', { exact: false })).not.toBeInTheDocument()
  })

  it('shows an empty state when a tab has no matching offers, and keeps the tabs clickable', () => {
    const busOnlyOffers = sampleOffers.filter((o) => o.category === 'bus')
    render(<Offers offers={busOnlyOffers} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Train' }))

    expect(screen.getByText('No offers right now')).toBeInTheDocument()
    const busTab = screen.getByRole('tab', { name: 'Bus' })
    expect(busTab).toBeEnabled()
    fireEvent.click(busTab)
    expect(screen.getByText('FESTIVE300', { exact: false })).toBeInTheDocument()
  })

  it('copies the code and shows "Copied!" when the clipboard write succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(<Offers offers={sampleOffers} />)
    fireEvent.click(screen.getByRole('button', { name: /FESTIVE300/ }))

    expect(writeText).toHaveBeenCalledWith('FESTIVE300')
    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent('Copied!')
  })

  it('shows a manual-copy message when the clipboard write fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.assign(navigator, { clipboard: { writeText } })

    render(<Offers offers={sampleOffers} />)
    fireEvent.click(screen.getByRole('button', { name: /FESTIVE300/ }))

    expect(writeText).toHaveBeenCalledWith('FESTIVE300')
    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent('Could not copy. Please copy the code manually.')
  })

  it('clears the "Copied!" message after about 2 seconds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(<Offers offers={sampleOffers} />)
    fireEvent.click(screen.getByRole('button', { name: /FESTIVE300/ }))

    await screen.findByRole('status')

    await waitFor(
      () => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })
})
