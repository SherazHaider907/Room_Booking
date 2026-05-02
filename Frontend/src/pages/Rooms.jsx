import { useEffect, useState } from 'react'
import { getRooms } from '../api/rooms'
import RoomCard from '../components/RoomCard'
import { FaSearch, FaSlidersH } from 'react-icons/fa'
import './Rooms.css'

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [occupancy, setOccupancy] = useState('')
  const [availFrom, setAvailFrom] = useState('')
  const [availTo, setAvailTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const fetchRooms = () => {
    setLoading(true)
    setError('')
    const params = {}
    if (filter !== 'All') params.type = filter
    if (search) params.search = search
    if (maxPrice) params.max_price = maxPrice
    if (occupancy) params.occupancy = occupancy
    if (availFrom && availTo) {
      params.available_from = availFrom
      params.available_to = availTo
    }
    getRooms(params)
      .then((res) => setRooms(res.data))
      .catch(() => setError('Failed to load rooms. Make sure the backend is running.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRooms() }, [filter])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchRooms()
  }

  const clearFilters = () => {
    setSearch('')
    setMaxPrice('')
    setOccupancy('')
    setAvailFrom('')
    setAvailTo('')
    setFilter('All')
  }

  const types = ['All', 'Single', 'Double', 'Suite']
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <h1>Available Rooms</h1>
        <button className="btn-toggle-filters" onClick={() => setShowFilters(!showFilters)}>
          <FaSlidersH /> {showFilters ? 'Hide Filters' : 'Filters'}
        </button>
      </div>

      {/* Search & Filters */}
      <div className={`filters-panel ${showFilters ? 'open' : ''}`}>
        <form onSubmit={handleSearch} className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search rooms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="filter-row">
          <div className="filter-group">
            <label>Max Price / Night</label>
            <input
              type="number"
              placeholder="e.g. 200"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
            />
          </div>
          <div className="filter-group">
            <label>Min Guests</label>
            <input
              type="number"
              placeholder="e.g. 2"
              value={occupancy}
              onChange={(e) => setOccupancy(e.target.value)}
              min="1"
            />
          </div>
          <div className="filter-group">
            <label>Available From</label>
            <input type="date" value={availFrom} min={today} onChange={(e) => setAvailFrom(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Available To</label>
            <input type="date" value={availTo} min={availFrom || today} onChange={(e) => setAvailTo(e.target.value)} />
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn-apply" onClick={fetchRooms}>Apply Filters</button>
          <button className="btn-clear" onClick={clearFilters}>Clear All</button>
        </div>
      </div>

      {/* Type Tabs */}
      <div className="filter-tabs">
        {types.map((t) => (
          <button
            key={t}
            className={`filter-tab ${filter === t ? 'active' : ''}`}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <div className="loader">Loading rooms…</div>}
      {error && <div className="error-msg">{error}</div>}

      {!loading && !error && rooms.length === 0 && (
        <div className="empty-msg">No rooms found. Try adjusting your filters.</div>
      )}

      <div className="rooms-grid">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  )
}
