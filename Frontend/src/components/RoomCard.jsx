import { Link } from 'react-router-dom'
import { FaBed, FaUsers, FaTag } from 'react-icons/fa'
import './RoomCard.css'

export default function RoomCard({ room }) {
  const image = room.images?.[0]?.image

  return (
    <div className="room-card">
      <div className="room-card-img">
        {image ? (
          <img src={image} alt={room.name} />
        ) : (
          <div className="room-card-placeholder">
            <FaBed size={48} />
          </div>
        )}
        <span className="room-badge">{room.type}</span>
      </div>
      <div className="room-card-body">
        <h3>{room.name}</h3>
        <p className="room-desc">{room.description?.slice(0, 100)}{room.description?.length > 100 ? '…' : ''}</p>
        <div className="room-meta">
          <span><FaUsers /> {room.max_occupancy} guests</span>
          <span><FaTag /> {room.currency} {room.price_per_night}/night</span>
        </div>
        <Link to={`/rooms/${room.id}`} className="btn-view">View Room</Link>
      </div>
    </div>
  )
}
