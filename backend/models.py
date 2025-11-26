from sqlalchemy import Column, Integer, String, Boolean, Date, TIMESTAMP, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

# 计划表
class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    week_start = Column(Date, unique=True, index=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    days = relationship("Day", back_populates="plan", cascade="all, delete-orphan")

# 训练日表
class Day(Base):
    __tablename__ = "days"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    date = Column(Date, index=True, nullable=False)
    title = Column(String(100))
    is_rest = Column(Boolean, default=False)
    completed = Column(Boolean, default=False)

    plan = relationship("Plan", back_populates="days")
    exercises = relationship("Exercise", back_populates="day", cascade="all, delete-orphan")

# 动作表
class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, ForeignKey("days.id"), nullable=False)
    name = Column(String(100), nullable=False)

    day = relationship("Day", back_populates="exercises")