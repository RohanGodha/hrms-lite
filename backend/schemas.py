from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import date, datetime
from models import StatusEnum, RoleEnum

# ── Auth ──────────────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.user

    @field_validator("name")
    @classmethod
    def name_ok(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Name must be at least 2 characters")
        return v.strip()

    @field_validator("password")
    @classmethod
    def pw_ok(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    is_active: bool
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ── Point 6: Password + Profile schemas ──────────────────────────────────────
class ChangePassword(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def pw_strength(cls, v):
        if len(v) < 6:
            raise ValueError("New password must be at least 6 characters")
        return v

class UpdateProfile(BaseModel):
    name:  Optional[str]      = None
    email: Optional[EmailStr] = None

# ── Employee ──────────────────────────────────────────────────────────────────
class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str
    position: Optional[str] = None
    phone: Optional[str] = None
    avatar_color: Optional[str] = "#4f7ef8"

    @field_validator("employee_id", "full_name", "department")
    @classmethod
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

# ── Point 1: Edit employee schema ─────────────────────────────────────────────
class EmployeeUpdate(BaseModel):
    employee_id: Optional[str] = None
    full_name:   Optional[str] = None
    email:       Optional[EmailStr] = None
    department:  Optional[str] = None
    position:    Optional[str] = None
    phone:       Optional[str] = None
    avatar_color: Optional[str] = None

class EmployeeOut(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    position: Optional[str] = None
    phone: Optional[str] = None
    avatar_color: Optional[str] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

# ── Attendance ────────────────────────────────────────────────────────────────
class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: StatusEnum
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    notes: Optional[str] = None

class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    date: date
    status: StatusEnum
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    model_config = {"from_attributes": True}

# ── Activity Log ──────────────────────────────────────────────────────────────
class LogOut(BaseModel):
    id: int
    action: str
    resource: Optional[str] = None
    detail: Optional[str] = None
    created_at: Optional[datetime] = None
    user: Optional[UserOut] = None
    model_config = {"from_attributes": True}
