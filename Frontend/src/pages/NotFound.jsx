import { Link } from 'react-router-dom'
import { FaExclamationTriangle } from 'react-icons/fa'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="not-found">
      <FaExclamationTriangle className="nf-icon" />
      <h1>404</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-home">Go Home</Link>
    </div>
  )
}
