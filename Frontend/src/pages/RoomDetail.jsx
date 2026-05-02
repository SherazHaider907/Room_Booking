import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRoomById, getRoomAvailability } from '../api/rooms'
import { createBooking } from '../api/bookings'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { FaBed, FaUsers, FaTag, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import './RoomDetail.css'

export default function RoomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [booking, setBooking] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [bookedRanges, setBookedRanges] = useState([])
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    getRoomById(id)
      .then((res) => setRoom(res.data))
      .catch(() => setError('Room not found.'))
      .finally(() => setLoading(false))

    getRoomAvailability(id)
      .then((res) => setBookedRanges(res.data))
      .catch(() => {})
  }, [id])

  const today = new Date().toISOString().split('T')[0]
  const nights = checkIn && checkOut ? Math.max(0, (new Date(checkOut) - new Date(checkIn)) / 86400000) : 0
  const totalPrice = room ? (nights * parseFloat(room.price_per_night)).toFixed(2) : '0.00'

  const handleBooking = async () => {
    if (!user) { navigate('/login'); return }
    setBooking(true)
    try {
      await createBooking({ room: room.id, check_in: checkIn, check_out: checkOut, guests })
      toast.success(`Booked ${room.name} for ${nights} night${nights > 1 ? 's' : ''}!`)
      setShowConfirm(false)
      setCheckIn('')
      setCheckOut('')
      setGuests(1)
      // Refresh availability
      const res = await getRoomAvailability(id)
      setBookedRanges(res.data)
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0]
        || (typeof err.response?.data === 'object' ? Object.values(err.response.data).flat().join(' ') : '')
        || 'Booking failed.'
      toast.error(msg)
    } finally {
      setBooking(false)
    }
  }

  const prevImg = () => setActiveImg((i) => (i === 0 ? room.images.length - 1 : i - 1))
  const nextImg = () => setActiveImg((i) => (i === room.images.length - 1 ? 0 : i + 1))

  if (loading) return <div className="loader">Loading…</div>
  if (error) return <div className="error-msg">{error}</div>

  return (
    <div className="room-detail-page">
      {/* Image Gallery */}
      <div className="room-gallery">
        {room.images && room.images.length > 0 ? (
          <div className="gallery-wrapper">
            <img src={room.images[activeImg].image} alt={room.images[activeImg].caption || room.name} />
            {room.images.length > 1 && (
              <>
                <button className="gallery-btn left" onClick={prevImg}><FaChevronLeft /></button>
                <button className="gallery-btn right" onClick={nextImg}><FaChevronRight /></button>
                <div className="gallery-dots">
                  {room.images.map((_, i) => (
                    <span key={i} className={`dot ${i === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(i)} />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="room-detail-placeholder"><FaBed size={80} /></div>
        )}
      </div>

      <div className="room-detail-content">
        <div className="room-detail-info">
          <span className="room-badge">{room.type}</span>
          <h1>{room.name}</h1>
          <p className="room-desc">{room.description}</p>
          <div className="room-meta">
            <span><FaUsers /> {room.max_occupancy} guests max</span>
            <span><FaTag /> {room.currency} {room.price_per_night} / night</span>
          </div>
        </div>

        {/* Booked Dates Info */}
        {bookedRanges.length > 0 && (
          <div className="booked-dates-info">
            <h3><FaCalendarAlt /> Unavailable Dates</h3>
            <div className="booked-list">
              {bookedRanges.map((r, i) => (
                <span key={i} className="booked-range">{r.check_in} → {r.check_out}</span>
              ))}
            </div>
          </div>
        )}

        {/* Booking Card */}
        <div className="booking-card">
          <h2><FaCalendarAlt /> Book This Room</h2>
          {user ? (
            !showConfirm ? (
              <form onSubmit={(e) => { e.preventDefault(); if (nights > 0) setShowConfirm(true) }} className="booking-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Check-in</label>
                    <input type="date" value={checkIn} min={today} onChange={(e) => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut('') }} required />
                  </div>
                  <div className="form-group">
                    <label>Check-out</label>
                    <input type="date" value={checkOut} min={checkIn || today} onChange={(e) => setCheckOut(e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Guests</label>
                  <input type="number" value={guests} min={1} max={room.max_occupancy} onChange={(e) => setGuests(parseInt(e.target.value) || 1)} />
                </div>
                {nights > 0 && (
                  <div className="price-preview">
                    <span>{nights} night{nights > 1 ? 's' : ''} × {room.currency} {room.price_per_night}</span>
                    <strong>{room.currency} {totalPrice}</strong>
                  </div>
                )}
                <button type="submit" className="btn-book" disabled={nights === 0}>Continue to Book</button>
              </form>
            ) : (
              <div className="confirm-panel">
                <h3>Confirm Your Booking</h3>
                <div className="confirm-details">
                  <p><strong>Room:</strong> {room.name}</p>
                  <p><strong>Check-in:</strong> {checkIn}</p>
                  <p><strong>Check-out:</strong> {checkOut}</p>
                  <p><strong>Guests:</strong> {guests}</p>
                  <p><strong>Nights:</strong> {nights}</p>
                  <p className="confirm-total"><strong>Total: {room.currency} {totalPrice}</strong></p>
                </div>
                <div className="confirm-actions">
                  <button className="btn-book" onClick={handleBooking} disabled={booking}>
                    {booking ? 'Booking…' : '✓ Confirm & Book'}
                  </button>
                  <button className="btn-back" onClick={() => setShowConfirm(false)}>← Go Back</button>
                </div>
              </div>
            )
          ) : (
            <div className="login-prompt">
              <p>Please log in to book this room.</p>
              <button className="btn-book" onClick={() => navigate('/login')}>Login to Book</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
