import { useEffect, useState } from 'react'
import { getBookings, cancelBooking } from '../api/bookings'
import { useToast } from '../components/Toast'
import { FaCalendarAlt, FaBed, FaTimes, FaHistory, FaClock } from 'react-icons/fa'
import './MyBookings.css'

export default function MyBookings() {
  const [upcoming, setUpcoming] = useState([])
  const [past, setPast] = useState([])
  const [cancelled, setCancelled] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('upcoming')
  const toast = useToast()

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const [upRes, pastRes] = await Promise.all([
        getBookings({ period: 'upcoming' }),
        getBookings({ period: 'past' }),
      ])
      setUpcoming(upRes.data.filter(b => b.status === 'confirmed'))
      setPast(pastRes.data)
      // Get cancelled from all bookings
      const allRes = await getBookings({ status: 'cancelled' })
      setCancelled(allRes.data)
    } catch {
      toast.error('Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try {
      await cancelBooking(id)
      toast.success('Booking cancelled.')
      fetchBookings()
    } catch {
      toast.error('Failed to cancel booking.')
    }
  }

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', icon: <FaClock />, data: upcoming },
    { key: 'past', label: 'Past', icon: <FaHistory />, data: past },
    { key: 'cancelled', label: 'Cancelled', icon: <FaTimes />, data: cancelled },
  ]

  const activeTab = tabs.find(t => t.key === tab)

  return (
    <div className="bookings-page">
      <h1><FaCalendarAlt /> My Bookings</h1>

      <div className="booking-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`booking-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label} <span className="tab-count">{t.data.length}</span>
          </button>
        ))}
      </div>

      {loading && <div className="loader">Loading…</div>}

      {!loading && activeTab.data.length === 0 && (
        <div className="empty-msg">
          <FaBed size={48} />
          <p>No {tab} bookings.</p>
        </div>
      )}

      <div className="bookings-list">
        {activeTab.data.map((b) => (
          <div key={b.id} className={`booking-item ${b.status}`}>
            <div className="booking-img-wrap">
              {b.room_image ? (
                <img src={b.room_image} alt={b.room_name} className="booking-thumb" />
              ) : (
                <div className="booking-thumb-placeholder"><FaBed /></div>
              )}
            </div>
            <div className="booking-details">
              <h3>{b.room_name}</h3>
              <p className="booking-dates">
                <FaCalendarAlt /> {b.check_in} → {b.check_out} · {b.nights} night{b.nights > 1 ? 's' : ''}
              </p>
              <p className="booking-meta">
                {b.guests} guest{b.guests > 1 ? 's' : ''} · Total: {b.total_price}
              </p>
              <span className={`status-badge ${b.status}`}>{b.status}</span>
            </div>
            {b.status === 'confirmed' && tab === 'upcoming' && (
              <button className="btn-cancel" onClick={() => handleCancel(b.id)}>
                <FaTimes /> Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
