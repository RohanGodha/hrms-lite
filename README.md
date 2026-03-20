# HRMS Pro

> A production-ready, full-stack Human Resource Management System with authentication, role-based access, KPI dashboards, 3D animations, and light/dark mode.

---

## Live Demo

| | URL |
|---|---|
| **Frontend** | `https://hrms-lite-rohan-git-master-rohangodha1s-projects.vercel.app/` |
| **Backend API** | `https://hrms-lite-h4ls.onrender.com` |
| **API Docs** | `https://hrms-lite-h4ls.onrender.com/docs` |

**Default Admin:** `admin@hrms.com` / `admin1234`


> ⚠️ Render free tier spins down after 15 min of inactivity — first request may take ~30 t0 ~50 seconds to wake up.

---

## Project Overview

HRMS Pro is a full-stack web application that allows HR admins and team members to manage employee records, track daily attendance, and monitor workforce KPIs — all in a clean, responsive, production-grade interface.

<img width="758" height="638" alt="image" src="https://github.com/user-attachments/assets/ffe441a2-aacf-466f-b7d5-ee485ecbf9a7" />
<img width="600" height="280" alt="image" src="https://github.com/user-attachments/assets/0ca9be55-877d-4dbe-af0a-1d74a4a33eef" />
<img width="628" height="276" alt="image" src="https://github.com/user-attachments/assets/962b79cf-a9de-4023-9070-f2ccb39cdf8a" />
<img width="1019" height="631" alt="image" src="https://github.com/user-attachments/assets/050f8893-9b8e-444b-9bd4-30e071f425a6" />
<img width="1094" height="360" alt="image" src="https://github.com/user-attachments/assets/2256d0b6-28cc-4c3b-af18-9d9feea76cbd" />
<img width="885" height="895" alt="image" src="https://github.com/user-attachments/assets/ca589c23-5ea4-4a8c-be07-ede7c4d77817" />

<img width="322" height="649" alt="image" src="https://github.com/user-attachments/assets/fdb9346d-2f03-4dd4-aca4-5d9d045981fc" />



---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6 |
| **Animations** | Framer Motion |
| **3D Graphics** | Three.js |
| **Charts** | Recharts |
| **Styling** | CSS Modules — zero external UI libraries |
| **Fonts** | Syne (display) + Inter (body) + JetBrains Mono |
| **Backend** | FastAPI (Python) |
| **Auth** | JWT (python-jose) + bcrypt (passlib) |
| **Rate Limiting** | slowapi — login limited to 5/min per IP |
| **ORM** | SQLAlchemy 2.0 |
| **Validation** | Pydantic v2 |
| **Database** | SQLite (local dev) / PostgreSQL (production) |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | Render |

---

## Features

### Authentication & Users
- ✅ JWT login and register with bcrypt password hashing
- ✅ Auto-restore session on page refresh (token in localStorage)
- ✅ Role-based access — **Admin** vs **User**
- ✅ Admin-only routes: Users page, Activity Logs
- ✅ Default admin seeded on first startup
- ✅ Session expiry toast before redirect to login
- ✅ Rate limiting on login — 5 attempts/minute per IP

### Employee Management
- ✅ Add employee — Employee ID, Full Name, Email, Department, Position, Phone, Avatar Color
- ✅ Edit employee — all fields editable inline
- ✅ Delete employee — cascades to attendance records (admin only)
- ✅ Search — by name, ID, email, department
- ✅ Pagination — 10 rows per page
- ✅ CSV Export — one-click download of employee data
- ✅ Duplicate detection — rejects duplicate Employee IDs and emails
- ✅ Field-level errors — highlights exact input on conflict

### Attendance
- ✅ Mark attendance — Present / Absent per employee per date
- ✅ Check-in / Check-out times + optional notes
- ✅ Re-marking updates existing record (no duplicates)
- ✅ Filter by employee and/or date range
- ✅ Clear filters button

### Dashboard (KPI)
- ✅ 5 live stat cards — total employees, present today, absent today, 30-day rate, total records
- ✅ Line chart — 7-day present vs absent trend
- ✅ Bar chart — 6-month monthly overview
- ✅ Pie chart — employees by department
- ✅ Present days per employee summary table

### Profile & Account
- ✅ Update name and email
- ✅ Change password with strength meter
- ✅ Field-level validation with inline errors

### Admin Tools
- ✅ User management — view all users, change roles, remove users
- ✅ Activity audit log — every action logged with user, type, and detail
- ✅ Rich `/health` endpoint — DB status, version, uptime, timestamp

### UI / UX
- ✅ Dark / Light mode toggle — persisted to localStorage
- ✅ Three.js 3D animated background on auth pages (torus knot, icosahedron, particles)
- ✅ Framer Motion animations — page loads, modals, table rows
- ✅ Collapsible sidebar on desktop
- ✅ Slide-out mobile drawer with overlay
- ✅ Fully responsive — 360px to 1920px
- ✅ Skeleton loaders — shimmer placeholder rows replace spinner on tables
- ✅ Loading, empty, and error states on every page
- ✅ Custom SVG favicon
- ✅ `robots.txt` blocking crawlers from authenticated routes

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Clone the repository

```bash
git clone https://github.com/RohanGodha/hrms-lite.git
cd hrms-lite
git checkout master
```

### 2. Run the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

- API: [http://localhost:8000](http://localhost:8000)
- Interactive Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

> **No database setup needed for local dev.** SQLite is used automatically — a `hrms.db` file is created on first run.
> A default admin is seeded automatically: `admin@hrms.com` / `admin123`

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)

> The `.env` file is pre-configured to point to `http://localhost:8000` — nothing to change.

---

## Deployment

### Backend → Render

1. Push this repo to GitHub
2. On [render.com](https://render.com): **New → PostgreSQL** → create a free database → copy the **Internal Database URL**
3. **New → Web Service** → connect your repo
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1`
4. Under **Environment Variables**, add:
   ```
   DATABASE_URL = <your postgres internal URL from step 2>
   ```
   > `SECRET_KEY` is auto-generated by `render.yaml` — do not set manually.
5. Deploy — all tables are created automatically on startup

### Frontend → Vercel

1. On [vercel.com](https://vercel.com): **New Project** → import your repo
   - **Root Directory:** `frontend`
2. Under **Environment Variables**, add:
   ```
   VITE_API_URL = https://hrms-lite-h4ls.onrender.com
   ```
3. Deploy — Vercel auto-detects Vite
4. Go to **Settings → Deployment Protection → Vercel Authentication → Off** to make the app publicly accessible

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Health check with DB status + uptime |
| `POST` | `/auth/register` | Public | Create new account |
| `POST` | `/auth/login` | Public | Login, get JWT (rate limited: 5/min) |
| `GET` | `/auth/me` | Any | Current user info |
| `POST` | `/auth/change-password` | Any | Change own password |
| `PATCH` | `/auth/profile` | Any | Update name / email |
| `GET` | `/users` | Admin | List all users |
| `PATCH` | `/users/{id}/role` | Admin | Update user role |
| `DELETE` | `/users/{id}` | Admin | Remove user |
| `POST` | `/employees` | Any | Create employee |
| `GET` | `/employees` | Any | List all employees |
| `GET` | `/employees/{id}` | Any | Get single employee |
| `PATCH` | `/employees/{id}` | Any | Edit employee |
| `DELETE` | `/employees/{id}` | Admin | Delete employee |
| `POST` | `/attendance` | Any | Mark / update attendance |
| `GET` | `/attendance` | Any | List records (filterable by employee, date range) |
| `GET` | `/attendance/{employee_id}` | Any | Records for one employee |
| `GET` | `/dashboard` | Any | KPI stats, charts data |
| `GET` | `/logs` | Admin | Activity audit log |

---

## Project Structure

```
hrms-lite/
│
├── backend/
│   ├── main.py           # All FastAPI routes
│   ├── models.py         # SQLAlchemy models — User, Employee, Attendance, ActivityLog
│   ├── schemas.py        # Pydantic schemas + validation
│   ├── crud.py           # All database operations + KPI analytics
│   ├── auth.py           # JWT + bcrypt + route guards
│   ├── database.py       # Auto-switches SQLite ↔ PostgreSQL
│   ├── requirements.txt
│   ├── Procfile
│   └── render.yaml
│
└── frontend/
    ├── public/
    │   ├── favicon.svg
    │   └── robots.txt
    └── src/
        ├── api/
        │   └── index.js              # Axios client + session expiry interceptor
        ├── context/
        │   ├── AuthContext.jsx       # JWT auth state + session management
        │   └── ThemeContext.jsx      # Dark / light toggle
        ├── components/
        │   ├── Layout.jsx            # Responsive sidebar + mobile drawer + topbar
        │   ├── ThreeBackground.jsx   # Three.js 3D animated scene
        │   ├── ThemeToggle.jsx       # Animated day/night switch
        │   ├── Modal.jsx             # Framer Motion modal wrapper
        │   ├── Skeleton.jsx          # Shimmer skeleton loaders
        │   ├── Spinner.jsx
        │   ├── ErrorState.jsx
        │   └── form.module.css       # Shared form styles
        └── pages/
            ├── Login.jsx             # Auth page with 3D background
            ├── Register.jsx
            ├── Dashboard.jsx         # KPI cards + 3 charts
            ├── Employees.jsx         # CRUD + search + pagination + CSV export
            ├── Attendance.jsx        # Mark + filter + check-in/out
            ├── Profile.jsx           # Update profile + change password
            ├── Users.jsx             # Admin user management
            ├── Logs.jsx              # Activity audit feed
            └── NotFound.jsx          # 404 page
```

---

## Assumptions & Limitations

- **Default admin** is seeded on first startup: `admin@hrms.com` / `admin1234` — change the password immediately after deploying
- **Upsert on attendance** — marking attendance for the same employee on the same date updates the existing record
- **No future dates** — the attendance date picker is capped at today
- **Free tier cold starts** — Render's free tier spins down after 15 minutes of inactivity; the first request after sleep may take ~30 seconds
- **No email verification** on register — users are active immediately
- **Out of scope** — leave management, payroll, and multi-tenant access are not implemented per spec
