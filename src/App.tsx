import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import ResultsPage from './pages/ResultsPage'
import BookingPage from './pages/BookingPage'
import HotelsPage from './pages/HotelsPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<ResultsPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/hotels" element={<HotelsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
