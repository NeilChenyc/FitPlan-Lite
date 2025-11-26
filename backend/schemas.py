from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class ExerciseBase(BaseModel):
    name: str = Field(min_length=1, description="动作名称不能为空")

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseResponse(ExerciseBase):
    id: int

    class Config:
        from_attributes = True

class DayBase(BaseModel):
    date: date
    title: Optional[str] = None
    is_rest: bool = False
    completed: bool = False

class DayCreate(DayBase):
    exercises: List[ExerciseCreate] = []

class DayUpdate(BaseModel):
    title: Optional[str] = None
    is_rest: Optional[bool] = None
    completed: Optional[bool] = None
    exercises: Optional[List[ExerciseCreate]] = None

class DayResponse(DayBase):
    id: int
    plan_id: int
    exercises: List[ExerciseResponse] = []

    class Config:
        from_attributes = True

class PlanBase(BaseModel):
    week_start: date

class PlanCreate(PlanBase):
    days: List[DayCreate] = Field(min_length=1, description="每周至少需要有一天安排")

class PlanResponse(PlanBase):
    id: int
    days: List[DayResponse] = []

    class Config:
        from_attributes = True

class StatsResponse(BaseModel):
    weekly_completion: float
    completed_training_days: int
    total_training_days: int
    total_exercises: int
    completed_exercises: int

class TemplatePreviewResponse(BaseModel):
    weekly_completion: float
    training_days_count: int
    next_week_start: date
    days: List[DayResponse]

class ApplyTemplateResponse(BaseModel):
    message: str
    plan_id: int