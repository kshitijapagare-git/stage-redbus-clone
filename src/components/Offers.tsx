import { useEffect, useMemo, useRef, useState } from 'react'

interface Offer {
  title: string
  valid: string
  code: string
  tone: string
  category: 'bus' | 'train'
}

const defaultOffers: Offer[] = [
  { title: 'Save up to Rs 300 on bus tickets', valid: '05 Oct', code: 'FESTIVE300', tone: 'peach', category: 'bus' },
  { title: 'Save up to Rs 250 on bus tickets', valid: '31 Oct', code: 'FIRST', tone: 'pink', category: 'bus' },
  { title: 'Save up to Rs 300 on bus tickets', valid: '31 Oct', code: 'BUS300', tone: 'pink', category: 'bus' },
  { title: 'Save up to Rs 200 on train tickets', valid: '31 Oct', code: 'TRAINDAY', tone: 'yellow', category: 'train' },
]

interface OffersProps {
  /** Overrides the sample offer data; used in tests to simulate different/empty data sets. */
  offers?: Offer[]
}

type CategoryFilter = 'all' | 'bus' | 'train'

const tabs: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'bus', label: 'Bus' },
  { key: 'train', label: 'Train' },
]

const categoryLabel = (category: Offer['category']) => (category === 'bus' ? 'Bus' : 'Train')

function Offers({ offers = defaultOffers }: OffersProps = {}) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all')
  const [copyStatus, setCopyStatus] = useState<{ code: string; status: 'success' | 'error' } | null>(null)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const filteredOffers = useMemo(() => {
    if (activeCategory === 'all') return offers
    return offers.filter((o) => o.category === activeCategory)
  }, [offers, activeCategory])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const handleCopyCode = (code: string) => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current)
    }

    const setStatus = (status: 'success' | 'error') => {
      setCopyStatus({ code, status })
      copyTimeoutRef.current = setTimeout(() => {
        setCopyStatus(null)
      }, 2000)
    }

    try {
      navigator.clipboard
        .writeText(code)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'))
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="container section">
      <div className="section-head">
        <h2>Offers for you</h2>
        <a href="#">View more</a>
      </div>
      <div className="tabs" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeCategory === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveCategory(tab.key)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      {filteredOffers.length > 0 ? (
        <div className="offer-grid">
          {filteredOffers.map((o) => (
            <article key={o.code} className={`offer offer-${o.tone}`}>
              <span className="badge">{categoryLabel(o.category)}</span>
              <h3>{o.title}</h3>
              <p>Valid till {o.valid}</p>
              <button type="button" className="code" onClick={() => handleCopyCode(o.code)}>
                🏷 {o.code}
              </button>
              {copyStatus && copyStatus.code === o.code && (
                <span className="copy-status" role="status" aria-live="polite">
                  {copyStatus.status === 'success'
                    ? 'Copied!'
                    : 'Could not copy. Please copy the code manually.'}
                </span>
              )}
              <span className="offer-art">🚌</span>
            </article>
          ))}
        </div>
      ) : (
        <p className="offers-empty">No offers right now</p>
      )}
    </section>
  )
}



export default Offers
