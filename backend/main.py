from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
import time, os
import models, schemas, crud
from database import SessionLocal, engine
from auth import (get_db, get_current_user, require_admin,
                  create_access_token, hash_password)

models.Base.metadata.create_all(bind=engine)

# ── Point 11: Rate limiter ────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(title="HRMS Lite API", version="2.1.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = time.time()

# ── Seed default admin on startup ─────────────────────────────────────────────
@app.on_event("startup")
def seed_admin():
    # ── Point 12: Warn if SECRET_KEY is default ───────────────────────────────
    sk = os.getenv("SECRET_KEY", "")
    if not sk or sk == "hrms-super-secret-key-change-in-prod-2024":
        import sys
        if os.getenv("ENVIRONMENT") == "production":
            print("FATAL: SECRET_KEY env var must be set in production", file=sys.stderr)
            sys.exit(1)
        else:
            print("WARNING: Using default SECRET_KEY. Set SECRET_KEY env var before deploying.")
    db = SessionLocal()
    try:
        if not crud.get_user_by_email(db, "admin@hrms.com"):
            admin = models.User(
                name="Super Admin",
                email="admin@hrms.com",
                password_hash=hash_password("admin123"),
                role=models.RoleEnum.admin,
            )
            db.add(admin); db.commit()
    finally:
        db.close()

# ── Point 10: Rich health endpoint ───────────────────────────────────────────
@app.get("/health")
def health(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(models.Employee.__table__.select().limit(1))
    except Exception:
        db_status = "error"
    uptime_s = int(time.time() - START_TIME)
    h, r = divmod(uptime_s, 3600)
    m, s = divmod(r, 60)
    return {
        "status": "ok",
        "version": "2.1.0",
        "db": db_status,
        "uptime": f"{h}h {m}m {s}s",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }

# ── Auth ──────────────────────────────────────────────────────────────────────
@app.post("/auth/register", response_model=schemas.TokenOut, status_code=201)
def register(data: schemas.UserRegister, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, data.email):
        raise HTTPException(409, "Email already registered")
    user  = crud.create_user(db, data)
    token = create_access_token(user.id, user.role)
    crud.log_action(db, user.id, "REGISTER", "auth", f"{user.email} registered")
    return {"access_token": token, "user": user}

@app.post("/auth/login", response_model=schemas.TokenOut)
@limiter.limit("5/minute")
def login(request: Request, data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(401, "Invalid email or password")
    token = create_access_token(user.id, user.role)
    crud.log_action(db, user.id, "LOGIN", "auth", f"{user.email} logged in")
    return {"access_token": token, "user": user}

@app.get("/auth/me", response_model=schemas.UserOut)
def me(current_user=Depends(get_current_user)):
    return current_user

# ── Point 6: Change password ──────────────────────────────────────────────────
@app.post("/auth/change-password")
def change_password(data: schemas.ChangePassword,
                    db: Session = Depends(get_db),
                    current=Depends(get_current_user)):
    from auth import verify_password, hash_password as hp
    if not verify_password(data.current_password, current.password_hash):
        raise HTTPException(400, detail={"field": "current_password", "message": "Current password is incorrect"})
    current.password_hash = hp(data.new_password)
    db.commit()
    crud.log_action(db, current.id, "CHANGE_PASSWORD", "auth", "Password changed")
    return {"message": "Password updated successfully"}

# ── Point 6: Update profile ───────────────────────────────────────────────────
@app.patch("/auth/profile", response_model=schemas.UserOut)
def update_profile(data: schemas.UpdateProfile,
                   db: Session = Depends(get_db),
                   current=Depends(get_current_user)):
    if data.name:  current.name  = data.name.strip()
    if data.email and data.email != current.email:
        if crud.get_user_by_email(db, data.email):
            raise HTTPException(409, detail={"field": "email", "message": "Email already in use"})
        current.email = data.email
    db.commit(); db.refresh(current)
    crud.log_action(db, current.id, "UPDATE_PROFILE", "auth", "Profile updated")
    return current

# ── Users (admin) ─────────────────────────────────────────────────────────────
@app.get("/users", response_model=List[schemas.UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    return crud.get_all_users(db)

@app.patch("/users/{user_id}/role")
def update_role(user_id: int, role: models.RoleEnum, db: Session = Depends(get_db),
                current=Depends(require_admin)):
    u = crud.update_user_role(db, user_id, role)
    if not u: raise HTTPException(404, "User not found")
    crud.log_action(db, current.id, "UPDATE_ROLE", "users", f"Set {u.email} to {role}")
    return u

@app.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), current=Depends(require_admin)):
    if user_id == current.id:
        raise HTTPException(400, "Cannot delete yourself")
    crud.delete_user(db, user_id)
    crud.log_action(db, current.id, "DELETE_USER", "users", f"Deleted user {user_id}")

# ── Employees ─────────────────────────────────────────────────────────────────
@app.post("/employees", response_model=schemas.EmployeeOut, status_code=201)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db),
                    current=Depends(get_current_user)):
    if crud.get_employee_by_emp_id(db, employee.employee_id):
        raise HTTPException(409, detail={"field": "employee_id", "message": "Employee ID already exists"})
    if crud.get_employee_by_email(db, employee.email):
        raise HTTPException(409, detail={"field": "email", "message": "Email already registered"})
    emp = crud.create_employee(db, employee)
    crud.log_action(db, current.id, "CREATE_EMPLOYEE", "employees",
                    f"Added {emp.full_name} ({emp.employee_id})")
    return emp

@app.get("/employees", response_model=List[schemas.EmployeeOut])
def list_employees(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud.get_all_employees(db)

@app.get("/employees/{employee_id}", response_model=schemas.EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    emp = crud.get_employee(db, employee_id)
    if not emp: raise HTTPException(404, "Employee not found")
    return emp

# ── Point 1: Edit employee ────────────────────────────────────────────────────
@app.patch("/employees/{employee_id}", response_model=schemas.EmployeeOut)
def edit_employee(employee_id: int, data: schemas.EmployeeUpdate,
                  db: Session = Depends(get_db), current=Depends(get_current_user)):
    emp = crud.get_employee(db, employee_id)
    if not emp: raise HTTPException(404, "Employee not found")
    # Check duplicate employee_id (if changed)
    if data.employee_id and data.employee_id != emp.employee_id:
        if crud.get_employee_by_emp_id(db, data.employee_id):
            raise HTTPException(409, detail={"field": "employee_id", "message": "Employee ID already exists"})
    # Check duplicate email (if changed)
    if data.email and data.email != emp.email:
        if crud.get_employee_by_email(db, data.email):
            raise HTTPException(409, detail={"field": "email", "message": "Email already registered"})
    updated = crud.update_employee(db, emp, data)
    crud.log_action(db, current.id, "EDIT_EMPLOYEE", "employees",
                    f"Edited {updated.full_name} ({updated.employee_id})")
    return updated

@app.delete("/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: int, db: Session = Depends(get_db),
                    current=Depends(require_admin)):
    emp = crud.get_employee(db, employee_id)
    if not emp: raise HTTPException(404, "Employee not found")
    crud.log_action(db, current.id, "DELETE_EMPLOYEE", "employees",
                    f"Deleted {emp.full_name} ({emp.employee_id})")
    crud.delete_employee(db, employee_id)

# ── Attendance ────────────────────────────────────────────────────────────────
@app.post("/attendance", response_model=schemas.AttendanceOut, status_code=201)
def mark_attendance(record: schemas.AttendanceCreate, db: Session = Depends(get_db),
                    current=Depends(get_current_user)):
    emp = crud.get_employee(db, record.employee_id)
    if not emp: raise HTTPException(404, "Employee not found")
    existing = crud.get_attendance_by_date(db, record.employee_id, record.date)
    if existing:
        result = crud.update_attendance(db, existing, record)
    else:
        result = crud.create_attendance(db, record)
    crud.log_action(db, current.id, "MARK_ATTENDANCE", "attendance",
                    f"{emp.full_name} marked {record.status} on {record.date}")
    return result

@app.get("/attendance", response_model=List[schemas.AttendanceOut])
def list_attendance(
    employee_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return crud.get_attendance(db, employee_id, date_from, date_to)

@app.get("/attendance/{employee_id}", response_model=List[schemas.AttendanceOut])
def employee_attendance(employee_id: int, date_from: Optional[date] = None,
                        date_to: Optional[date] = None,
                        db: Session = Depends(get_db), _=Depends(get_current_user)):
    if not crud.get_employee(db, employee_id):
        raise HTTPException(404, "Employee not found")
    return crud.get_attendance(db, employee_id, date_from, date_to)

# ── Dashboard ─────────────────────────────────────────────────────────────────
@app.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return crud.get_dashboard_stats(db)

# ── Activity Logs ─────────────────────────────────────────────────────────────
@app.get("/logs", response_model=List[schemas.LogOut])
def get_logs(limit: int = Query(50, le=500),
             db: Session = Depends(get_db), _=Depends(require_admin)):
    return crud.get_logs(db, limit)
