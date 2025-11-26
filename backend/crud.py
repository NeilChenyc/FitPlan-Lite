from sqlalchemy.orm import Session
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from typing import List

import models, schemas

def get_plan_by_week_start(db: Session, week_start: date):
    return db.query(models.Plan).filter(models.Plan.week_start == week_start).first()

def get_current_week_start():
    today = date.today()
    # 计算本周一的日期（ISO周一开始于周一）
    return today - timedelta(days=today.weekday())

def get_next_week_start(current_week_start: date):
    return current_week_start + timedelta(days=7)

def create_plan(db: Session, plan: schemas.PlanCreate):
    db_plan = models.Plan(week_start=plan.week_start)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)

    for day_data in plan.days:
        db_day = models.Day(
            plan_id=db_plan.id,
            date=day_data.date,
            title=day_data.title,
            is_rest=day_data.is_rest,
            completed=day_data.completed
        )
        db.add(db_day)
        db.commit()
        db.refresh(db_day)

        for exercise_data in day_data.exercises:
            db_exercise = models.Exercise(
                day_id=db_day.id,
                name=exercise_data.name.strip()
            )
            db.add(db_exercise)

    db.commit()
    return db_plan

def update_plan(db: Session, db_plan: models.Plan, plan: schemas.PlanCreate):
    db_plan.week_start = plan.week_start

    # 删除旧的训练日和动作
    db.query(models.Day).filter(models.Day.plan_id == db_plan.id).delete()

    for day_data in plan.days:
        db_day = models.Day(
            plan_id=db_plan.id,
            date=day_data.date,
            title=day_data.title,
            is_rest=day_data.is_rest,
            completed=day_data.completed
        )
        db.add(db_day)
        db.commit()
        db.refresh(db_day)

        for exercise_data in day_data.exercises:
            db_exercise = models.Exercise(
                day_id=db_day.id,
                name=exercise_data.name.strip()
            )
            db.add(db_exercise)

    db.commit()
    db.refresh(db_plan)
    return db_plan

def get_day_by_date(db: Session, date: date):
    return db.query(models.Day).filter(models.Day.date == date).first()

def update_day_completed(db: Session, db_day: models.Day, completed: bool):
    db_day.completed = completed
    db.commit()
    db.refresh(db_day)
    return db_day

def calculate_stats(db: Session, week_start: date):
    plan = get_plan_by_week_start(db, week_start)
    if not plan:
        return None

    total_training_days = 0
    completed_training_days = 0
    total_exercises = 0
    completed_exercises = 0

    for day in plan.days:
        if not day.is_rest:
            total_training_days += 1
            if day.completed:
                completed_training_days += 1

            day_exercises_count = len(day.exercises)
            total_exercises += day_exercises_count
            if day.completed:
                completed_exercises += day_exercises_count

    weekly_completion = completed_training_days / total_training_days if total_training_days > 0 else 0.0

    return schemas.StatsResponse(
        weekly_completion=weekly_completion,
        completed_training_days=completed_training_days,
        total_training_days=total_training_days,
        total_exercises=total_exercises,
        completed_exercises=completed_exercises
    )

# 固定动作库
EXERCISE_LIBRARY = {
    "Push": ["Push-up", "Dumbbell Press", "Triceps Dip", "Shoulder Press"],
    "Pull": ["Pull-up", "Dumbbell Row", "Biceps Curl", "Face Pull"],
    "Legs": ["Squat", "Lunge", "Calf Raise", "Glute Bridge"],
    "Core": ["Plank", "Crunch", "Dead Bug", "Leg Raise"],
    "Full Body": ["Squat", "Push-up", "Row", "Plank"]
}

def generate_next_week_template(db: Session, current_week_start: date):
    stats = calculate_stats(db, current_week_start)

    if stats:
        weekly_completion = stats.weekly_completion
        training_days_count = stats.total_training_days
    else:
        # 默认值
        weekly_completion = 0.0
        training_days_count = 3

    next_week_start = get_next_week_start(current_week_start)

    # 确定下周训练日数量
    if weekly_completion >= 0.8:
        next_training_days = min(training_days_count + 1, 5)
        exercises_per_day = 4
    elif 0.5 <= weekly_completion < 0.8:
        next_training_days = training_days_count
        exercises_per_day = 3
    else:
        next_training_days = 3
        exercises_per_day = 3

    # 确定训练日分配
    if next_training_days == 3:
        # 周一、周三、周五 - Full Body
        training_days = [
            (next_week_start, "Full Body"),
            (next_week_start + timedelta(days=2), "Full Body"),
            (next_week_start + timedelta(days=4), "Full Body")
        ]
    elif next_training_days == 4:
        # 周一到周四 - Push, Pull, Legs, Core
        training_days = [
            (next_week_start, "Push"),
            (next_week_start + timedelta(days=1), "Pull"),
            (next_week_start + timedelta(days=2), "Legs"),
            (next_week_start + timedelta(days=3), "Core")
        ]
    elif next_training_days == 5:
        # 周一到周五 - Push, Pull, Legs, Push, Core
        training_days = [
            (next_week_start, "Push"),
            (next_week_start + timedelta(days=1), "Pull"),
            (next_week_start + timedelta(days=2), "Legs"),
            (next_week_start + timedelta(days=3), "Push"),
            (next_week_start + timedelta(days=4), "Core")
        ]
    else:
        # 默认3天
        training_days = [
            (next_week_start, "Full Body"),
            (next_week_start + timedelta(days=2), "Full Body"),
            (next_week_start + timedelta(days=4), "Full Body")
        ]

    # 创建下周模板
    days = []
    for day_offset in range(7):
        current_date = next_week_start + timedelta(days=day_offset)
        is_training_day = any(td[0] == current_date for td in training_days)

        if is_training_day:
            # 找到对应的训练类型
            training_type = next(td[1] for td in training_days if td[0] == current_date)
            exercises = EXERCISE_LIBRARY[training_type][:exercises_per_day]

            day = schemas.DayResponse(
                id=0,  # 临时ID
                plan_id=0,  # 临时Plan ID
                date=current_date,
                title=training_type,
                is_rest=False,
                completed=False,
                exercises=[schemas.ExerciseResponse(id=i+1, name=ex) for i, ex in enumerate(exercises)]
            )
        else:
            day = schemas.DayResponse(
                id=0,
                plan_id=0,
                date=current_date,
                title="Rest",
                is_rest=True,
                completed=False,
                exercises=[]
            )

        days.append(day)

    return schemas.TemplatePreviewResponse(
        weekly_completion=weekly_completion,
        training_days_count=training_days_count,
        next_week_start=next_week_start,
        days=days
    )

def apply_template(db: Session, next_week_start: date, days: List[schemas.DayResponse]):
    # 检查下周计划是否已存在
    existing_plan = get_plan_by_week_start(db, next_week_start)
    if existing_plan:
        return None, "下周计划已存在"

    # 创建计划
    plan_create = schemas.PlanCreate(
        week_start=next_week_start,
        days=[]
    )

    for day in days:
        if not day.is_rest:
            exercises = [schemas.ExerciseCreate(name=ex.name) for ex in day.exercises]
        else:
            exercises = []

        day_create = schemas.DayCreate(
            date=day.date,
            title=day.title,
            is_rest=day.is_rest,
            completed=day.completed,
            exercises=exercises
        )
        plan_create.days.append(day_create)

    # 创建计划
    try:
        db_plan = create_plan(db, plan_create)
        return db_plan, "计划创建成功"
    except Exception as e:
        return None, f"创建计划失败: {str(e)}"