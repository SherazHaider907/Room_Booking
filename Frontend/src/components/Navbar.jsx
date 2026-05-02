import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'
import { FaHotel, FaBars, FaTimes, FaUser } from 'react-icons/fa'
import { useState } from 'react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully.')
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <FaHotel className="brand-icon" />
        <span>RoomBook</span>
      </Link>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/rooms" onClick={() => setMenuOpen(false)}>Rooms</Link>
        {user ? (
          <>
            <Link to="/my-bookings" onClick={() => setMenuOpen(false)}>My Bookings</Link>
            <Link to="/profile" className="nav-profile" onClick={() => setMenuOpen(false)}>
              <FaUser /> {user.full_name || user.username}
            </Link>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="btn-register" onClick={() => setMenuOpen(false)}>Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}
