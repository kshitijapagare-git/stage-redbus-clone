import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type RefObject } from 'react'

export interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
  id: string
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

function MobileMenu({ isOpen, onClose, triggerRef, id }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const wasOpenRef = useRef(isOpen)

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const panel = panelRef.current
    if (!panel) return
    const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    if (focusable.length > 0) {
      focusable[0].focus()
    } else {
      panel.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      triggerRef.current?.focus()
    }
    wasOpenRef.current = isOpen
  }, [isOpen, triggerRef])

  if (!isOpen) return null

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }

    if (e.key === 'Tab') {
      const panel = panelRef.current
      if (!panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (focusable.length === 0) {
        e.preventDefault()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first || !panel.contains(document.activeElement)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last || !panel.contains(document.activeElement)) {
          e.preventDefault()
          first.focus()
        }
      }
    }
  }

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="mobile-menu-backdrop" onClick={handleBackdropClick}>
      <div
        className="mobile-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        id={id}
        tabIndex={-1}
        ref={panelRef}
        onKeyDown={handleKeyDown}
      >
        <button type="button" className="mobile-menu-close" aria-label="Close menu" onClick={onClose}>
          ×
        </button>
        <ul className="mobile-menu-links">
          <li>
            <a href="#" onClick={onClose}>
              ☰ Bookings
            </a>
          </li>
          <li>
            <a href="#" onClick={onClose}>
              ⓘ Help
            </a>
          </li>
          <li>
            <a href="#" onClick={onClose}>
              ◉ Account
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default MobileMenu
