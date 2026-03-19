from sqlalchemy import Column, Integer, String, Date, Enum, ForeignKey, DateTime, Boolean, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class RoleEnum(str, enum.Enum):
    admin = "admin"
    user = "user"

class StatusEnum(str, enum.Enum):
    present = "Present"
    absent = "Absent"

class User(Base):
    __tablename__ = "users"
    id           = Column(Integer, primary_key=True, index=True)
    name         = Column(String(150), nullable=False)
    email        = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role         = Column(Enum(RoleEnum), default=RoleEnum.user, nullable=False)
    is_active    = Column(Boolean, default=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    logs         = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")

class Employee(Base):
    __tablename__ = "employees"
    id           = Column(Integer, primary_key=True, index=True)
    employee_id  = Column(String(50), unique=True, index=True, nullable=False)
    full_name    = Column(String(150), nullable=False)
    email        = Column(String(255), unique=True, index=True, nullable=False)
    department   = Column(String(100), nullable=False)
    position     = Column(String(100), nullable=True)
    phone        = Column(String(30), nullable=True)
    avatar_color = Column(String(7), nullable=True, default="#4f7ef8")
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    attendance   = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = "attendance"
    id           = Column(Integer, primary_key=True, index=True)
    employee_id  = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    date         = Column(Date, nullable=False)
    status       = Column(Enum(StatusEnum), nullable=False)
    check_in     = Column(String(10), nullable=True)
    check_out    = Column(String(10), nullable=True)
    notes        = Column(Text, nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    employee     = relationship("Employee", back_populates="attendance")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action     = Column(String(100), nullable=False)
    resource   = Column(String(100), nullable=True)
    detail     = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user       = relationship("User", back_populates="logs")
