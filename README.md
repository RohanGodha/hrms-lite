# HRMS Lite — Human Resource Management System

A clean, production-ready full-stack HRMS application for managing employees and tracking attendance.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, React Router v6     |
| Styling    | CSS Modules (zero external UI libs) |
| Backend    | FastAPI (Python 3.11+)              |
| Database   | SQLite (local) / PostgreSQL (prod)  |
| ORM        | SQLAlchemy 2.0                      |
| Validation | Pydantic v2                         |
| Deploy FE  | Vercel                              |
| Deploy BE  | Render                              |

---

## Features

### Core
- ✅ Add employees (Employee ID, Name, Email, Department) with full validation
- ✅ View all employees with search (name / ID / email / department)
- ✅ Delete employee (cascades to attendance records)
- ✅ Mark attendance (Present / Absent) per employee per date
- ✅ View all attendance records
- ✅ Duplicate Employee ID / Email detection
- ✅ Proper HTTP status codes & error messages

### Bonus
- ✅ Filter attendance by employee and/or date range
- ✅ Dashboard summary (total employees, present/absent today, total records)
- ✅ Present days per employee table

---

## Run Locally (Zero Config)

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/hrms-lite.git
cd hrms-lite
```

### 2. Start the Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
The API will be live at **http://localhost:8000**  
Interactive docs: **http://localhost:8000/docs**

> SQLite is used automatically for local dev — no database setup needed.

### 3. Start the Frontend
```bash
cd frontend
npm install
# .env is already configured for local backend
npm run dev
```
The app will be live at **http://localhost:3000**

---

## Deployment

### Backend → Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo, set root directory to `backend`
4. Settings:
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable:
   - `DATABASE_URL` → your PostgreSQL connection string  
     *(Render can provision a free Postgres DB — use "New → PostgreSQL")*
6. Deploy — your API URL will look like `https://hrms-lite-api.onrender.com`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo, set root directory to `frontend`
3. Add environment variable:
   - `VITE_API_URL` → your Render backend URL (e.g. `https://hrms-lite-api.onrender.com`)
4. Deploy — Vercel auto-detects Vite

---

## API Reference

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | `/health`                 | Health check                       |
| POST   | `/employees`              | Create employee                    |
| GET    | `/employees`              | List all employees                 |
| GET    | `/employees/{id}`         | Get single employee                |
| DELETE | `/employees/{id}`         | Delete employee                    |
| POST   | `/attendance`             | Mark / update attendance           |
| GET    | `/attendance`             | List records (filterable)          |
| GET    | `/attendance/{emp_id}`    | Records for one employee           |
| GET    | `/dashboard`              | Aggregated stats                   |

---

## Project Structure

```
hrms-lite/
├── backend/
│   ├── main.py          # FastAPI routes
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── crud.py          # Database operations
│   ├── database.py      # DB connection (SQLite/PostgreSQL)
│   ├── requirements.txt
│   ├── Procfile
│   └── render.yaml
│
└── frontend/
    ├── src/
    │   ├── api/         # Axios client
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Dashboard, Employees, Attendance
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── vercel.json
```

---

## Assumptions & Limitations

- Single admin user — no authentication required (per spec)
- Marking attendance on the same date for the same employee **updates** the existing record rather than creating a duplicate
- Date picker is capped at today (no future attendance)
- SQLite is used for local development; PostgreSQL is used in production
- Leave management, payroll, and multi-user roles are out of scope
