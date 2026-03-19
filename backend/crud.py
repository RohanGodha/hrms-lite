from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case
from typing import Optional
from datetime import date, timedelta
import models, schemas
from auth import hash_password, verify_password

# ── Users ─────────────────────────────────────────────────────────────────────
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, data: schemas.UserRegister):
    u = models.User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
    )
    db.add(u); db.commit(); db.refresh(u)
    return u

def authenticate_user(db: Session, email: str, password: str):
    u = get_user_by_email(db, email)
    if not u or not verify_password(password, u.password_hash):
        return None
    return u

def get_all_users(db: Session):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()

def update_user_role(db: Session, user_id: int, role: models.RoleEnum):
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if u:
        u.role = role; db.commit(); db.refresh(u)
    return u

def delete_user(db: Session, user_id: int):
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if u: db.delete(u); db.commit()

# ── Activity Logs ─────────────────────────────────────────────────────────────
def log_action(db: Session, user_id: Optional[int], action: str, resource: str = None, detail: str = None):
    entry = models.ActivityLog(user_id=user_id, action=action, resource=resource, detail=detail)
    db.add(entry); db.commit()

def get_logs(db: Session, limit: int = 100):
    return (db.query(models.ActivityLog)
              .order_by(models.ActivityLog.created_at.desc())
              .limit(limit).all())

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
    db.add(db_emp); db.commit(); db.refresh(db_emp)
    return db_emp

def delete_employee(db: Session, employee_id: int):
    emp = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if emp: db.delete(emp); db.commit()

def update_employee(db: Session, emp: models.Employee, data):
    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        if v is not None:
            setattr(emp, k, v)
    db.commit(); db.refresh(emp)
    return emp

# ── Attendance ────────────────────────────────────────────────────────────────
def get_attendance_by_date(db: Session, employee_id: int, att_date: date):
    return (db.query(models.Attendance)
              .filter(models.Attendance.employee_id == employee_id,
                      models.Attendance.date == att_date)
              .first())

def create_attendance(db: Session, record: schemas.AttendanceCreate):
    db_att = models.Attendance(**record.model_dump())
    db.add(db_att); db.commit(); db.refresh(db_att)
    return db_att

def update_attendance(db: Session, existing: models.Attendance, data: schemas.AttendanceCreate):
    existing.status    = data.status
    existing.check_in  = data.check_in
    existing.check_out = data.check_out
    existing.notes     = data.notes
    db.commit(); db.refresh(existing)
    return existing

def get_attendance(db, employee_id=None, date_from=None, date_to=None):
    q = db.query(models.Attendance)
    if employee_id: q = q.filter(models.Attendance.employee_id == employee_id)
    if date_from:   q = q.filter(models.Attendance.date >= date_from)
    if date_to:     q = q.filter(models.Attendance.date <= date_to)
    return q.order_by(models.Attendance.date.desc()).all()

# ── Dashboard + KPIs ──────────────────────────────────────────────────────────
def get_dashboard_stats(db: Session):
    today = date.today()
    total_employees      = db.query(func.count(models.Employee.id)).scalar()
    total_attendance     = db.query(func.count(models.Attendance.id)).scalar()
    present_today        = db.query(func.count(models.Attendance.id)).filter(
        models.Attendance.date == today,
        models.Attendance.status == models.StatusEnum.present).scalar()
    absent_today         = db.query(func.count(models.Attendance.id)).filter(
        models.Attendance.date == today,
        models.Attendance.status == models.StatusEnum.absent).scalar()

    # Attendance rate last 30 days
    thirty_ago = today - timedelta(days=30)
    records_30 = db.query(func.count(models.Attendance.id)).filter(
        models.Attendance.date >= thirty_ago).scalar() or 1
    present_30 = db.query(func.count(models.Attendance.id)).filter(
        models.Attendance.date >= thirty_ago,
        models.Attendance.status == models.StatusEnum.present).scalar()
    attendance_rate_30 = round((present_30 / records_30) * 100, 1) if records_30 else 0

    # Last 7 days trend (for chart)
    trend = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        p = db.query(func.count(models.Attendance.id)).filter(
            models.Attendance.date == d,
            models.Attendance.status == models.StatusEnum.present).scalar()
        a = db.query(func.count(models.Attendance.id)).filter(
            models.Attendance.date == d,
            models.Attendance.status == models.StatusEnum.absent).scalar()
        trend.append({"date": str(d), "present": p, "absent": a})

    # Department breakdown
    dept_stats = (db.query(
        models.Employee.department,
        func.count(models.Employee.id).label("count"))
        .group_by(models.Employee.department).all())

    # Monthly attendance for bar chart (last 6 months)
    monthly = []
    for i in range(5, -1, -1):
        m = today.month - i
        y = today.year
        while m <= 0: m += 12; y -= 1
        p = db.query(func.count(models.Attendance.id)).filter(
            extract('month', models.Attendance.date) == m,
            extract('year', models.Attendance.date) == y,
            models.Attendance.status == models.StatusEnum.present).scalar()
        a = db.query(func.count(models.Attendance.id)).filter(
            extract('month', models.Attendance.date) == m,
            extract('year', models.Attendance.date) == y,
            models.Attendance.status == models.StatusEnum.absent).scalar()
        import calendar
        monthly.append({"month": calendar.month_abbr[m], "present": p, "absent": a})

    # Per-employee present days
    present_counts = (db.query(
        models.Employee.id, models.Employee.full_name,
        models.Employee.employee_id, models.Employee.department,
        models.Employee.avatar_color,
        func.count(models.Attendance.id).label("present_days"))
        .outerjoin(models.Attendance,
            (models.Attendance.employee_id == models.Employee.id) &
            (models.Attendance.status == models.StatusEnum.present))
        .group_by(models.Employee.id).all())

    return {
        "total_employees": total_employees,
        "total_attendance_records": total_attendance,
        "present_today": present_today,
        "absent_today": absent_today,
        "attendance_rate_30": attendance_rate_30,
        "trend_7days": trend,
        "monthly_chart": monthly,
        "department_breakdown": [{"department": r.department, "count": r.count} for r in dept_stats],
        "employee_present_days": [
            {"id": r.id, "full_name": r.full_name, "employee_id": r.employee_id,
             "department": r.department, "avatar_color": r.avatar_color,
             "present_days": r.present_days}
            for r in present_counts],
    }
