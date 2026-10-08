import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MobileMenu from './MobileMenu'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">redBus</div>
        <nav className="nav-main">
          <a className="nav-item active" href="#">
            <span className="nav-icon">🚌</span>Bus tickets
          </a>
          <a className="nav-item" href="#">
            <span className="nav-icon">🚆</span>Train tickets
          </a>
          <Link className="nav-item" to="/hotels">
            <span className="nav-icon">🛏️</span>Hotels
          </Link>
        </nav>
        <nav className="nav-side">
          <a href="#">☰ Bookings</a>
          <a href="#">ⓘ Help</a>
          <a href="#">◉ Account</a>
        </nav>
        <button
          type="button"
          className="mobile-menu-btn"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu-dialog"
          ref={menuButtonRef}
          onClick={() => setIsMenuOpen(true)}
        >
          ☰
        </button>
      </div>
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        triggerRef={menuButtonRef}
        id="mobile-menu-dialog"
      />
    </header>
  )
}

export default Header
