# Room Booking App

A full-stack room booking system with a **Django REST Framework** backend and a **React** frontend. Users can browse rooms, make bookings, and manage their reservations, while admins control room inventory.

---

## Features

### Backend (Django REST Framework)
- User registration, login, and logout with **Token-based authentication**
- Custom user model with `full_name` and unique email
- Room listing with filtering by type, price range, occupancy, search term, and availability dates
- Booking system with **overlap validation** — prevents double bookings on the same room
- Auto-calculated total price based on number of nights
- Booking cancellation endpoint
- Room availability endpoint returning booked date ranges
- Profile view and update
- Password change with token refresh
- Role-based permissions: admins can create/edit/delete rooms, users can only read
- Admin sees all bookings; regular users see only their own

### Frontend (React + Vite)
- Browse and filter available rooms
- Room detail page with images
- My Bookings page with upcoming/past view
- User profile page
- Login and Register pages
- Protected routes for authenticated users
- Toast notifications
- Axios instance with auth token injection

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Django 6, Django REST Framework |
| Auth | Token Authentication (DRF) |
| Frontend | React 19, Vite, React Router |
| HTTP Client | Axios |
| Database | SQLite |
| Image Handling | Pillow |

---

## Project Structure

```
Room_Booking/
├── Backend/
│   ├── Booking_Backend/      # Django project settings & root URLs
│   ├── Room_Booking/         # Main app (models, views, serializers, permissions)
│   ├── manage.py
│   └── requirements.txt
│
├── Frontend/
│   ├── src/
│   │   ├── api/              # Axios calls (auth, rooms, bookings)
│   │   ├── components/       # Navbar, Footer, RoomCard, Toast, ProtectedRoute
│   │   ├── context/          # AuthContext (global auth state)
│   │   ├── pages/            # Home, Rooms, RoomDetail, MyBookings, Profile, Login, Register
│   │   └── main.jsx
│   └── package.json
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register/` | Register a new user |
| POST | `/login/` | Login and get token |
| POST | `/logout/` | Logout (delete token) |
| GET | `/profile/` | View profile |
| PATCH | `/profile/` | Update profile |
| POST | `/profile/change-password/` | Change password |
| GET | `/rooms/` | List all rooms (with filters) |
| GET | `/rooms/<id>/` | Room detail |
| GET | `/rooms/<id>/availability/` | Get booked date ranges |
| GET | `/bookings/` | List user bookings |
| POST | `/bookings/` | Create a booking |
| GET | `/bookings/<id>/` | Booking detail |
| POST | `/bookings/<id>/cancel/` | Cancel a booking |

---

## Setup & Installation

### Backend

```bash
cd Backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Run server
python manage.py runserver
```

### Frontend

```bash
cd Frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit `http://localhost:5173` in your browser.

> Make sure the backend is running on `http://localhost:8000` before starting the frontend.
