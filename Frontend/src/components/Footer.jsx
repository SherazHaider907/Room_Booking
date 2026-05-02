import { FaHotel, FaGithub } from 'react-icons/fa'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <FaHotel /> <span>RoomBook</span>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} RoomBook. All rights reserved.</p>
        <div className="footer-links">
          <a href="https://github.com/SherazHaider907/Room_Booking" target="_blank" rel="noopener noreferrer">
            <FaGithub /> GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
