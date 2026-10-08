import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Header from './Header'

describe('Header mobile menu', () => {
  it('opens the menu and sets aria-expanded, showing a dialog named "Menu"', () => {
    render(<Header />)
    const menuButton = screen.getByRole('button', { name: '☰' })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    expect(menuButton).toHaveAttribute('aria-controls')

    fireEvent.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('id', menuButton.getAttribute('aria-controls'))
  })

  it('closes the menu via the × button and returns focus to the ☰ button', () => {
    render(<Header />)
    const menuButton = screen.getByRole('button', { name: '☰' })
    fireEvent.click(menuButton)

    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close menu' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(menuButton).toHaveFocus()
  })

  it('closes when the backdrop is clicked but not when the dialog content is clicked', () => {
    const { container } = render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: '☰' }))

    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    fireEvent.click(dialog)
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()

    const backdrop = container.querySelector('.mobile-menu-backdrop')
    expect(backdrop).not.toBeNull()
    fireEvent.click(backdrop as Element)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes when Escape is pressed', () => {
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: '☰' }))

    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    fireEvent.keyDown(dialog, { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes immediately when the Bookings, Help, or Account link is clicked', () => {
    render(<Header />)
    const menuButton = screen.getByRole('button', { name: '☰' })

    fireEvent.click(menuButton)
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Menu' })).getByRole('link', { name: /Bookings/ }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(menuButton)
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Menu' })).getByRole('link', { name: /Help/ }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(menuButton)
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Menu' })).getByRole('link', { name: /Account/ }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('traps focus inside the dialog, wrapping Tab and Shift+Tab at the boundaries', () => {
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: '☰' }))

    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    const closeButton = within(dialog).getByRole('button', { name: 'Close menu' })
    const accountLink = within(dialog).getByRole('link', { name: /Account/ })

    expect(closeButton).toHaveFocus()

    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
    expect(accountLink).toHaveFocus()

    fireEvent.keyDown(dialog, { key: 'Tab' })
    expect(closeButton).toHaveFocus()
  })
})
