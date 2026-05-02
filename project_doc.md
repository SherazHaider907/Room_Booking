# 🏨 Room Booking App — Complete Project Documentation

> **Author:** Sheraz Haider  
> **Repo:** [SherazHaider907/Room_Booking](https://github.com/SherazHaider907/Room_Booking)  
> **Tech Stack:** Django REST Framework (Backend) + React 19 + Vite 8 (Frontend)  
> **Last Updated:** May 2, 2026

---

## 📁 Full Project Structure

```
Booking_App/
│
├── Backend/                          # Django Backend (API Server)
│   ├── manage.py                     # Django CLI entry point
│   ├── db.sqlite3                    # SQLite database file
│   ├── requirements.txt              # Python dependencies
│   ├── room_images/                  # Uploaded room images (media files)
│   │
│   ├── Booking_Backend/              # Django Project Config (settings)
│   │   ├── __init__.py
│   │   ├── settings.py               # All Django settings (DB, auth, CORS, etc.)
│   │   ├── urls.py                   # Root URL config → includes Room_Booking.urls
│   │   ├── wsgi.py                   # WSGI server entry point (production)
│   │   └── asgi.py                   # ASGI server entry point (async production)
│   │
│   └── Room_Booking/                 # Main Django App (all the logic)
│       ├── __init__.py
│       ├── models.py                 # Database models (Room, Booking, User, etc.)
│       ├── serializers.py            # DRF serializers (JSON ↔ Python objects)
│       ├── views.py                  # API views/endpoints (business logic)
│       ├── urls.py                   # App URL routing (all API endpoints)
│       ├── permissions.py            # Custom permission classes
│       ├── auth_backend.py           # Custom auth backend (email login)
│       ├── admin.py                  # Django admin panel config
│       ├── apps.py                   # App configuration
│       ├── tests.py                  # Unit tests (empty)
│       └── migrations/               # Database migration files
│
├── Frontend/                         # React Frontend (User Interface)
│   ├── index.html                    # HTML entry point
│   ├── vite.config.js                # Vite config (dev server, proxy to Django)
│   ├── package.json                  # Node.js dependencies & scripts
│   ├── eslint.config.js              # Linting rules
│   ├── public/                       # Static public files
│   │   ├── favicon.svg
│   │   └── icons.svg
│   │
│   └── src/                          # React source code
│       ├── main.jsx                  # React entry point (renders App)
│       ├── index.css                 # Global design system (CSS variables, reset)
│       ├── App.jsx                   # Root component (routes, providers)
│       │
│       ├── api/                      # API layer (talks to Django backend)
│       │   ├── axiosInstance.js       # Axios config (base URL, token interceptor)
│       │   ├── auth.js               # Login, register, logout, profile APIs
│       │   ├── rooms.js              # Room list, detail, availability APIs
│       │   └── bookings.js           # Booking CRUD + cancel APIs
│       │
│       ├── context/                  # React Context (global state)
│       │   └── AuthContext.jsx       # Auth state (user, token, login/logout)
│       │
│       ├── components/               # Reusable UI components
│       │   ├── Navbar.jsx + .css     # Navigation bar (sticky, responsive)
│       │   ├── Footer.jsx + .css     # Page footer
│       │   ├── RoomCard.jsx + .css   # Room card (used in rooms listing)
│       │   ├── ProtectedRoute.jsx    # Route guard (redirects if not logged in)
│       │   └── Toast.jsx + .css      # Toast notification system
│       │
│       └── pages/                    # Full page components (one per route)
│           ├── Home.jsx + .css       # Landing page (hero + features)
│           ├── Rooms.jsx + .css      # Room listing (search, filter, grid)
│           ├── RoomDetail.jsx + .css # Single room (gallery, booking form)
│           ├── Login.jsx             # Login page
│           ├── Register.jsx          # Registration page
│           ├── Auth.css              # Shared styles for Login and Register
│           ├── MyBookings.jsx + .css # User bookings (upcoming/past/cancelled)
│           ├── Profile.jsx + .css    # User profile + password change
│           └── NotFound.jsx + .css   # 404 error page
│
├── venv/                             # Python virtual environment
└── requirements.txt                  # Root-level Python dependencies
```

---

## 🔷 BACKEND — Detailed Breakdown

### settings.py — Django Configuration
**What it does:** Central config file for the entire backend.

| Setting | What it controls |
|---|---|
| `SECRET_KEY` | Cryptographic signing key (change in production!) |
| `INSTALLED_APPS` | All apps: `rest_framework`, `corsheaders`, `Room_Booking`, `authtoken` |
| `MIDDLEWARE` | Request pipeline. `CorsMiddleware` is first (enables frontend to call backend) |
| `DATABASES` | Uses SQLite (`db.sqlite3`) for development |
| `AUTH_USER_MODEL` | Points to custom `Room_Booking.User` model |
| `AUTHENTICATION_BACKENDS` | Custom `EmailBackend` so users can login with email |
| `REST_FRAMEWORK` | Token + Session + Basic auth enabled |
| `CORS_ALLOWED_ORIGINS` | Allows `http://localhost:5173` (React dev server) |
| `MEDIA_URL / MEDIA_ROOT` | Uploaded room images stored in `room_images/` |

---

### models.py — Database Models

#### 1. User (Custom User)
```
Extends Django's AbstractUser
Fields: username, email (unique), full_name, password
Purpose: Custom user model so email is unique and we have full_name
```

#### 2. Room
```
Fields: name, type (Single/Double/Suite), price_per_night, currency (USD/EUR/GBP),
        max_occupancy, description
Purpose: Represents a hotel room that can be booked
Relationships: Has many RoomImages, has many Bookings
```

#### 3. RoomImage
```
Fields: room (FK to Room), image (file upload), caption
Purpose: Multiple photos per room, stored in room_images/ folder
```

#### 4. Booking ⭐ (Core Model)
```
Fields: room (FK to Room), user (FK to User), check_in, check_out,
        total_price (auto-calculated), status (confirmed/cancelled/completed),
        guests, created_at
Purpose: Core booking record. Has validation to:
  - Prevent check_out before check_in
  - Prevent exceeding max occupancy
  - Prevent overlapping bookings on the same room
  - Auto-calculate total_price = nights x price_per_night
```

#### 5. OccupiedDates (Legacy)
```
Fields: room (FK to Room), user (FK to User), date
Purpose: Old single-date booking system. Kept for backward compatibility.
```

---

### serializers.py — Data Conversion (JSON to Python)

| Serializer | What it does |
|---|---|
| `RoomSerializer` | Converts Room + its images to JSON. Used for room listing/detail. |
| `RoomImageSerializer` | Converts RoomImage to JSON (id, image URL, caption). |
| `BookingSerializer` | Converts Booking to JSON. Includes `room_name`, `room_type`, `room_image`, `nights` (computed). Validates no overlapping dates. |
| `OccupiedDatesSerializer` | Legacy serializer for old single-date bookings. |
| `UserSerializer` | For registration — password is **write-only** (never returned in responses). |
| `UserProfileSerializer` | For viewing/editing profile — email and full_name only. |
| `PasswordChangeSerializer` | Validates old_password and new_password for password changes. |

---

### views.py — All API Endpoints

#### Room Endpoints
| View | Method | URL | Auth | What it does |
|---|---|---|---|---|
| `RoomList` | GET | `/rooms/` | Public | List rooms. Filters: `?type=`, `?max_price=`, `?min_price=`, `?occupancy=`, `?search=`, `?available_from=&available_to=` |
| `RoomList` | POST | `/rooms/` | Admin only | Create a new room |
| `RoomDetail` | GET/PUT/DELETE | `/rooms/<id>/` | Public read / Admin write | Get, update, or delete a room |
| `RoomAvailability` | GET | `/rooms/<id>/availability/` | Public | Returns booked date ranges for a room |

#### Booking Endpoints
| View | Method | URL | Auth | What it does |
|---|---|---|---|---|
| `BookingList` | GET | `/bookings/` | Authenticated | List user's bookings. Filters: `?status=`, `?period=upcoming/past` |
| `BookingList` | POST | `/bookings/` | Authenticated | Create booking. Auto-assigns user + calculates total_price |
| `BookingDetail` | GET | `/bookings/<id>/` | Authenticated | Get booking details (own or admin) |
| `BookingCancel` | POST | `/bookings/<id>/cancel/` | Authenticated | Cancel a booking (status → cancelled) |

#### Auth Endpoints
| View | Method | URL | Auth | What it does |
|---|---|---|---|---|
| `RegisterView` | POST | `/register/` | Public | Create account → returns user + auth token |
| `Login` | POST | `/login/` | Public | Authenticate → returns user + auth token |
| `Logout` | POST | `/logout/` | Authenticated | Deletes the auth token from server |

#### Profile Endpoints
| View | Method | URL | Auth | What it does |
|---|---|---|---|---|
| `ProfileView` | GET | `/profile/` | Authenticated | Get current user's profile |
| `ProfileView` | PATCH | `/profile/` | Authenticated | Update email and/or full_name |
| `PasswordChangeView` | POST | `/password-change/` | Authenticated | Change password, refreshes token |

---

### permissions.py — Access Control

| Permission | Rule |
|---|---|
| `IsAdminOrReadOnly` | Anyone can **read** (GET). Only **superusers** can create/update/delete. Used on Room endpoints. |
| `IsOwnerOrReadOnly` | Anyone can **read**. Only the **owner** can modify. (Defined, not actively used yet.) |

---

### auth_backend.py — Custom Authentication
Allows users to log in using their **email address** instead of username.

---

### admin.py — Django Admin Panel
- **RoomAdmin** — Shows name, type, price. Includes inline image upload.
- **BookingAdmin** — Shows room, user, dates, price, status.
- Access at: `http://localhost:8000/admin/`

---

## 🔶 FRONTEND — Detailed Breakdown

### vite.config.js — Dev Server Config
Configures Vite with a proxy:
- `/api/*` requests → forwarded to Django at `http://localhost:8000`
- `/media/*` requests → also proxied to Django
- Eliminates CORS issues during development

---

### App.jsx — Root Component
Wraps the entire app with:
1. `AuthProvider` — Global auth state
2. `ToastProvider` — Global toast notifications
3. `BrowserRouter` — Client-side routing
4. `Navbar` — Always visible at top
5. `Routes` — All page routes
6. `Footer` — Always visible at bottom

**Routes:**
| Path | Component | Protected? |
|---|---|---|
| `/` | Home | No |
| `/rooms` | Rooms | No |
| `/rooms/:id` | RoomDetail | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/my-bookings` | MyBookings | Yes |
| `/profile` | Profile | Yes |
| `*` | NotFound (404) | No |

---

### api/ — API Communication Layer

#### axiosInstance.js
- Base URL: `/api` (proxied to Django)
- Auto-attaches `Token <token>` header from localStorage on every request

#### auth.js
| Function | What it does |
|---|---|
| `loginUser(credentials)` | POST `/login/` |
| `registerUser(data)` | POST `/register/` |
| `logoutUser()` | POST `/logout/` + clears localStorage |
| `getProfile()` | GET `/profile/` |
| `updateProfile(data)` | PATCH `/profile/` |
| `changePassword(data)` | POST `/password-change/` |

#### rooms.js
| Function | What it does |
|---|---|
| `getRooms(params)` | GET `/rooms/` with query params |
| `getRoomById(id)` | GET `/rooms/<id>/` |
| `getRoomAvailability(id)` | GET `/rooms/<id>/availability/` |

#### bookings.js
| Function | What it does |
|---|---|
| `getBookings(params)` | GET `/bookings/` with filters |
| `createBooking(data)` | POST `/bookings/` |
| `getBookingById(id)` | GET `/bookings/<id>/` |
| `cancelBooking(id)` | POST `/bookings/<id>/cancel/` |

---

### context/AuthContext.jsx — Global Auth State

| Value/Function | Purpose |
|---|---|
| `user` | Current logged-in user object (or null) |
| `token` | Auth token string (or null) |
| `login(credentials)` | Calls API, stores token + user in localStorage |
| `register(data)` | Calls API, stores token + user in localStorage |
| `logout()` | Calls server logout, clears localStorage |
| `updateUser(fields)` | Updates user after profile edit |
| `updateToken(newToken)` | Updates token after password change |

---

### components/ — Reusable UI Pieces

| Component | What it does |
|---|---|
| **Navbar** | Sticky top bar. Different links for logged-in vs logged-out. Hamburger on mobile. |
| **Footer** | Bottom bar with branding and GitHub link. |
| **RoomCard** | Card: room image, name, type badge, description, price, occupancy, "View Room" link. |
| **ProtectedRoute** | Redirects to `/login` if user not authenticated. |
| **Toast** | Slide-in notifications (green=success, red=error, purple=info). Auto-dismisses. |

---

### pages/ — Full Page Components

#### Home.jsx
- Hero section with "Find Your Perfect Room" headline
- 3 feature cards: Easy Booking, Secure & Trusted, Premium Quality

#### Rooms.jsx
- Text search bar for names/descriptions
- Expandable filter panel: max price, min guests, available dates
- Type tabs: All / Single / Double / Suite
- Room card grid from backend API

#### RoomDetail.jsx
- Image carousel with arrows and dot navigation
- Room info: name, type, description, occupancy, price
- Booked dates display (red badges showing unavailable ranges)
- Booking form: check-in/check-out dates, guest count
- Price preview: "X nights × price = total"
- Confirmation step before final booking
- Toast notifications on success/error

#### Login.jsx
- Username/email + password form
- Error display, link to register

#### Register.jsx
- Full name, username, email, password form
- Validation errors, link to login

#### MyBookings.jsx
- 3 tabs: Upcoming (with cancel), Past, Cancelled
- Each shows: room thumbnail, name, dates, nights, guests, total, status badge

#### Profile.jsx
- Account card: avatar, editable name + email
- Password change card: current + new password

#### NotFound.jsx
- Animated 404 with gradient text and "Go Home" button

---

## 🔗 How Frontend Connects to Backend

```
User Browser (localhost:5173)
    ↓
Vite Dev Server (proxy: /api → localhost:8000)
    ↓
Django REST Framework (localhost:8000)
    ↓
SQLite Database (db.sqlite3)
```

1. User action in React → API call via `axios`
2. Axios adds `Token xxxxx` header from localStorage
3. Vite proxy forwards request to Django at port 8000
4. Django authenticates token, runs view logic
5. Django returns JSON response
6. React updates UI with response data

---

## 🔐 Authentication Flow

```
1. Register → POST /register/ → server returns user + token
2. Token stored in localStorage
3. Every API request includes: Authorization: Token xxxxx
4. Protected pages check if user exists in AuthContext
5. Not logged in → redirected to /login
6. Logout → POST /logout/ (server deletes token) → clears localStorage
7. Password change → old token deleted → new token created
```

---

## 📊 Database Schema

```
┌──────────┐     ┌────────────┐     ┌──────────┐
│   User   │     │  Booking   │     │   Room   │
├──────────┤     ├────────────┤     ├──────────┤
│ id       │◄────│ user_id    │     │ id       │
│ username │     │ room_id    │────►│ name     │
│ email    │     │ check_in   │     │ type     │
│ password │     │ check_out  │     │ price    │
│ full_name│     │ total_price│     │ currency │
└──────────┘     │ status     │     │ max_occ  │
                 │ guests     │     │ desc     │
                 │ created_at │     └────┬─────┘
                 └────────────┘          │
                                    ┌────┴─────┐
                                    │RoomImage │
                                    ├──────────┤
                                    │ id       │
                                    │ room_id  │
                                    │ image    │
                                    │ caption  │
                                    └──────────┘
```

---

## 🚀 How to Run

### Backend
```bash
cd Booking_App
venv\Scripts\activate
cd Backend
python manage.py runserver      # http://localhost:8000
```

### Frontend
```bash
cd Booking_App/Frontend
npm run dev                     # http://localhost:5173
```

### Admin Panel
```
URL: http://localhost:8000/admin/
```

---

## 📦 Dependencies

### Backend (Python)
| Package | Purpose |
|---|---|
| Django 6 | Web framework |
| djangorestframework | REST API toolkit |
| django-cors-headers | Allows frontend to call backend (CORS) |
| Pillow | Image handling for room photos |

### Frontend (Node.js)
| Package | Purpose |
|---|---|
| react 19 | UI library |
| react-dom 19 | React DOM renderer |
| react-router-dom 7 | Client-side routing |
| react-icons 5 | Icon library |
| axios | HTTP client for API calls |
| vite 8 | Dev server + bundler |
