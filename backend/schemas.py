from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import date, datetime
from models import StatusEnum

# ── Employee ──────────────────────────────────────────────────────────────────
class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

    @field_validator("employee_id", "full_name", "department")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

    @field_validator("full_name")
    @classmethod
    def name_length(cls, v: str) -> str:
        if len(v) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return v

class EmployeeOut(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

# ── Attendance ────────────────────────────────────────────────────────────────
class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: StatusEnum

class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    date: date
    status: StatusEnum
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
