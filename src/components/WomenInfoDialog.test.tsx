import { useRef, useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import WomenInfoDialog from './WomenInfoDialog'

function Harness({ initialOpen = true }: { initialOpen?: boolean }) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = useState(initialOpen)

  return (
    <div>
      <button type="button" ref={triggerRef} onClick={() => setIsOpen(true)}>
        Know more
      </button>
      <WomenInfoDialog isOpen={isOpen} onClose={() => setIsOpen(false)} triggerRef={triggerRef} id="women-info" />
    </div>
  )
}

describe('WomenInfoDialog', () => {
  it('renders a dialog with accessible name "Booking for women" and an explanatory paragraph when open', () => {
    render(<Harness />)

    const dialog = screen.getByRole('dialog', { name: 'Booking for women' })
    expect(dialog).toBeInTheDocument()
    expect(dialog.querySelector('p')).not.toBeNull()
  })

  it('renders nothing when isOpen is false', () => {
    render(<Harness initialOpen={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes and restores focus to the trigger when the × button is clicked', () => {
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Know more' })

    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes and restores focus to the trigger when Escape is pressed', () => {
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Know more' })
    const dialog = screen.getByRole('dialog', { name: 'Booking for women' })

    fireEvent.keyDown(dialog, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes and restores focus to the trigger when the backdrop is clicked', () => {
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Know more' })
    const dialog = screen.getByRole('dialog', { name: 'Booking for women' })
    const backdrop = dialog.parentElement as HTMLElement

    fireEvent.click(backdrop)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('does not close when clicking inside the panel', () => {
    render(<Harness />)

    fireEvent.click(screen.getByText('Booking for women'))

    expect(screen.getByRole('dialog', { name: 'Booking for women' })).toBeInTheDocument()
  })
})
