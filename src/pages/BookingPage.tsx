import { useSearchParams } from 'react-router-dom'

function BookingPage() {
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const date = searchParams.get('date')
  const bp = searchParams.get('bp')

  return (
    <main className="container section">
      <h2>Booking</h2>
      <p>From city: {from}</p>
      <p>To city: {to}</p>
      <p>Date: {date}</p>
      <p>Boarding point: {bp}</p>
    </main>
  )
}

export default BookingPage
