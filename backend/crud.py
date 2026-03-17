from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
import models, schemas

# ── Employees ─────────────────────────────────────────────────────────────────
def get_employee(db: Session, employee_id: int):
    return db.query(models.Employee).filter(models.Employee.id == employee_id).first()

def get_employee_by_emp_id(db: Session, emp_id: str):
    return db.query(models.Employee).filter(models.Employee.employee_id == emp_id).first()

def get_employee_by_email(db: Session, email: str):
    return db.query(models.Employee).filter(models.Employee.email == email).first()

def get_all_employees(db: Session):
    return db.query(models.Employee).order_by(models.Employee.created_at.desc()).all()

def create_employee(db: Session, employee: schemas.EmployeeCreate):
    db_emp = models.Employee(**employee.model_dump())
    db.add(db_emp)
    db.commit()
    db.refresh(db_emp)
    return db_emp

def delete_employee(db: Session, employee_id: int):
    emp = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if emp:
        db.delete(emp)
        db.commit()

# ── Attendance ────────────────────────────────────────────────────────────────
def get_attendance_by_date(db: Session, employee_id: int, att_date: date):
    return (
        db.query(models.Attendance)
        .filter(
            models.Attendance.employee_id == employee_id,
            models.Attendance.date == att_date,
        )
        .first()
    )

def create_attendance(db: Session, record: schemas.AttendanceCreate):
    db_att = models.Attendance(**record.model_dump())
    db.add(db_att)
    db.commit()
    db.refresh(db_att)
    return db_att

def update_attendance(db: Session, existing: models.Attendance, status: models.StatusEnum):
    existing.status = status
    db.commit()
    db.refresh(existing)
    return existing

def get_attendance(
    db: Session,
    employee_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
):
    q = db.query(models.Attendance)
    if employee_id:
        q = q.filter(models.Attendance.employee_id == employee_id)
    if date_from:
        q = q.filter(models.Attendance.date >= date_from)
    if date_to:
        q = q.filter(models.Attendance.date <= date_to)
    return q.order_by(models.Attendance.date.desc()).all()

# ── Dashboard ─────────────────────────────────────────────────────────────────
def get_dashboard_stats(db: Session):
    total_employees = db.query(func.count(models.Employee.id)).scalar()
    total_attendance = db.query(func.count(models.Attendance.id)).scalar()
    present_today = (
        db.query(func.count(models.Attendance.id))
        .filter(
            models.Attendance.date == date.today(),
            models.Attendance.status == models.StatusEnum.present,
        )
        .scalar()
    )
    absent_today = (
        db.query(func.count(models.Attendance.id))
        .filter(
            models.Attendance.date == date.today(),
            models.Attendance.status == models.StatusEnum.absent,
        )
        .scalar()
    )

    # Present count per employee
    present_counts = (
        db.query(
            models.Employee.id,
            models.Employee.full_name,
            models.Employee.employee_id,
            models.Employee.department,
            func.count(models.Attendance.id).label("present_days"),
        )
        .outerjoin(
            models.Attendance,
            (models.Attendance.employee_id == models.Employee.id)
            & (models.Attendance.status == models.StatusEnum.present),
        )
        .group_by(models.Employee.id)
        .all()
    )

    return {
        "total_employees": total_employees,
        "total_attendance_records": total_attendance,
        "present_today": present_today,
        "absent_today": absent_today,
        "employee_present_days": [
            {
                "id": r.id,
                "full_name": r.full_name,
                "employee_id": r.employee_id,
                "department": r.department,
                "present_days": r.present_days,
            }
            for r in present_counts
        ],
    }
