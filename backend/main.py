from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import models, schemas, crud
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="HRMS Lite API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "ok"}

# ── Employees ─────────────────────────────────────────────────────────────────
@app.post("/employees", response_model=schemas.EmployeeOut, status_code=201)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    if crud.get_employee_by_emp_id(db, employee.employee_id):
        raise HTTPException(status_code=409, detail="Employee ID already exists")
    if crud.get_employee_by_email(db, employee.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    return crud.create_employee(db, employee)

@app.get("/employees", response_model=List[schemas.EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    return crud.get_all_employees(db)

@app.get("/employees/{employee_id}", response_model=schemas.EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = crud.get_employee(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@app.delete("/employees/{employee_id}", status_code=204)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    emp = crud.get_employee(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    crud.delete_employee(db, employee_id)

# ── Attendance ────────────────────────────────────────────────────────────────
@app.post("/attendance", response_model=schemas.AttendanceOut, status_code=201)
def mark_attendance(record: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    emp = crud.get_employee(db, record.employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    existing = crud.get_attendance_by_date(db, record.employee_id, record.date)
    if existing:
        return crud.update_attendance(db, existing, record.status)
    return crud.create_attendance(db, record)

@app.get("/attendance", response_model=List[schemas.AttendanceOut])
def list_attendance(
    employee_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
):
    return crud.get_attendance(db, employee_id, date_from, date_to)

@app.get("/attendance/{employee_id}", response_model=List[schemas.AttendanceOut])
def get_employee_attendance(
    employee_id: int,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
):
    emp = crud.get_employee(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return crud.get_attendance(db, employee_id, date_from, date_to)

# ── Dashboard ─────────────────────────────────────────────────────────────────
@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)
