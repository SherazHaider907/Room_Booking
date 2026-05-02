import { Link } from 'react-router-dom'
import { FaCalendarCheck, FaShieldAlt, FaStar } from 'react-icons/fa'
import './Home.css'

export default function Home() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Perfect Room</h1>
          <p>Luxury stays tailored to your needs. Browse, book, and enjoy.</p>
          <Link to="/rooms" className="btn-hero">Browse Rooms</Link>
        </div>
        <div className="hero-overlay" />
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-card">
          <FaCalendarCheck className="feature-icon" />
          <h3>Easy Booking</h3>
          <p>Reserve your room in seconds with our seamless booking system.</p>
        </div>
        <div className="feature-card">
          <FaShieldAlt className="feature-icon" />
          <h3>Secure & Trusted</h3>
          <p>Your data and payments are always protected.</p>
        </div>
        <div className="feature-card">
          <FaStar className="feature-icon" />
          <h3>Premium Quality</h3>
          <p>Every room is verified for quality and comfort.</p>
        </div>
      </section>
    </div>
  )
}
