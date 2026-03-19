# HRMS Lite

> A lightweight, production-ready Human Resource Management System for managing employees and tracking daily attendance.

---

## Live Demo

| | URL |
|---|---|
| **Frontend** | `https://hrms-lite-rohan.vercel.app` |
| **Backend API** | `https://hrms-lite-h4ls.onrender.com` |
| **API Docs** | `https://hrms-lite-h4ls.onrender.com/docs` |

---

## Project Overview

HRMS Lite is a full-stack web application that allows an HR admin to manage employee records and track daily attendance. Built with a focus on clean code, modular architecture, and a professional UI — not just a demo, but a realistically usable internal tool.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6 |
| **Styling** | CSS Modules — zero external UI libraries |
| **Backend** | FastAPI (Python) |
| **ORM** | SQLAlchemy 2.0 |
| **Validation** | Pydantic v2 |
| **Database** | SQLite (local dev) / PostgreSQL (production) |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | Render |

---

## Features

### Core Requirements
- ✅ **Add Employee** — Employee ID, Full Name, Email, Department with full server-side validation
- ✅ **View Employees** — Searchable table (by name, ID, email, department)
- ✅ **Delete Employee** — Cascades to all attendance records
- ✅ **Mark Attendance** — Present / Absent per employee per date (re-marking updates existing record)
- ✅ **View Attendance** — Full records table with employee details
- ✅ **Duplicate Detection** — Rejects duplicate Employee IDs and emails
- ✅ **Error Handling** — Proper HTTP status codes and meaningful error messages throughout

### Bonus Features
- ✅ **Filter Attendance** — By employee and/or date range
- ✅ **Dashboard Summary** — Total employees, present today, absent today, total records
- ✅ **Present Days Counter** — Total present days per employee across all time

### UI States
- ✅ Loading state (spinner)
- ✅ Empty state (with contextual call-to-action)
- ✅ Error state (with retry button)

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/hrms-lite.git
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
2. On [render.com](https://render.com): **New → PostgreSQL** — create a free database and copy the **Internal Database URL**
3. **New → Web Service** → connect your repo
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1`
4. Under **Environment Variables**, add:
   ```
   DATABASE_URL = <your postgres internal URL from step 2>
   ```
5. Deploy — all tables are created automatically on startup

### Frontend → Vercel

1. On [vercel.com](https://vercel.com): **New Project** → import your repo
   - **Root Directory:** `frontend`
2. Under **Environment Variables**, add:
   ```
   VITE_API_URL=https://hrms-lite-h4ls.onrender.com

   ```
3. Deploy — Vercel auto-detects Vite

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/employees` | Create a new employee |
| `GET` | `/employees` | List all employees |
| `GET` | `/employees/{id}` | Get a single employee |
| `DELETE` | `/employees/{id}` | Delete an employee |
| `POST` | `/attendance` | Mark or update attendance |
| `GET` | `/attendance` | List all records (supports `employee_id`, `date_from`, `date_to` filters) |
| `GET` | `/attendance/{employee_id}` | Get attendance for one employee |
| `GET` | `/dashboard` | Aggregated stats for the dashboard |

---

## Project Structure

```
hrms-lite/
│
├── backend/
│   ├── main.py          # All FastAPI routes
│   ├── models.py        # SQLAlchemy DB models (Employee, Attendance)
│   ├── schemas.py       # Pydantic request/response schemas + validation
│   ├── crud.py          # All database operations
│   ├── database.py      # DB engine — auto-switches SQLite ↔ PostgreSQL
│   ├── requirements.txt
│   ├── Procfile         # Render start command
│   └── render.yaml      # Render infrastructure config
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── index.js              # Axios client with error interceptor
    │   ├── components/
    │   │   ├── AddEmployeeModal.jsx — Form to add a new employee
    │   │   ├── Badge.jsx — Present/Absent status pill indicator
    │   │   ├── Badge.module.css — Styles for the badge pill
    │   │   ├── ConfirmModal.jsx — Delete confirmation dialog box
    │   │   ├── ConfirmModal.module.css — Styles for confirm modal
    │   │   ├── EmptyState.jsx — Shown when a list is empty
    │   │   ├── EmptyState.module.css — Styles for empty state screen
    │   │   ├── ErrorState.jsx — Shown when an API call fails
    │   │   ├── ErrorState.module.css — Styles for the error screen
    │   │   ├── form.module.css — Shared styles for all form fields
    │   │   ├── Layout.jsx — Sidebar and main content wrapper
    │   │   ├── Layout.module.css — Styles for sidebar and layout
    │   │   ├── MarkAttendanceModal.jsx — Form to mark employee attendance
    │   │   ├── Modal.jsx — Reusable modal dialog wrapper component
    │   │   ├── Modal.module.css — Styles for the modal overlay
    │   │   ├── PageHeader.jsx — Title, subtitle, and action button row
    │   │   ├── PageHeader.module.css — Styles for the page header
    │   │   ├── Spinner.jsx — Loading spinner shown during API calls
    │   │   ├── Spinner.module.css — Styles for the loading spinner
    │   │   ├── StatCard.jsx — Dashboard metric card with icon
    │   │   └── StatCard.module.css — Styles for the stat card
    │   ├── pages/
    │   │   ├── Attendance.jsx — Attendance records table with filters
    │   │   ├── Attendance.module.css — Styles for the attendance page
    │   │   ├── Dashboard.jsx — Overview stats and summary table
    │   │   ├── Dashboard.module.css — Styles for the dashboard page
    │   │   ├── Employees.jsx — Employee list with search and delete
    │   │   └── Employees.module.css — Styles for the employees page
    │   ├── App.jsx                   # Router setup
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── vercel.json
```

---

## Assumptions & Limitations

- **Single admin user** — no authentication is required per the spec
- **Upsert on attendance** — marking attendance for the same employee on the same date updates the existing record rather than creating a duplicate
- **No future dates** — the attendance date picker is capped at today
- **Free tier cold starts** — Render's free tier spins down after 15 minutes of inactivity; the first request after sleep may take ~30 seconds to respond
- **Out of scope** — leave management, payroll, and multi-role access are not implemented per spec
