import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type RefObject } from 'react'

export interface WomenInfoDialogProps {
  isOpen: boolean
  onClose: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
  id: string
}

function WomenInfoDialog({ isOpen, onClose, triggerRef, id }: WomenInfoDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const wasOpenRef = useRef(isOpen)

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
    }
  }

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="women-info-backdrop" onClick={handleBackdropClick}>
      <div
        className="women-info-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        id={id}
        tabIndex={-1}
        ref={panelRef}
        onKeyDown={handleKeyDown}
      >
        <button type="button" className="mobile-menu-close" aria-label="Close dialog" onClick={onClose}>
          ×
        </button>
        <h3 id={`${id}-title`}>Booking for women</h3>
        <p>
          When this is on, we highlight buses and seats better suited for women travelling alone, and your search
          is tagged so the results reflect your preference.
        </p>
      </div>
    </div>
  )
}

export default WomenInfoDialog
