import os
import sys
import traceback
from datetime import date
from typing import List

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

import models, schemas, crud, database

app = FastAPI(title="FitPlan Lite API", version="1.0.0")

# CORS配置
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    os.getenv("FRONTEND_URL", "http://localhost:3000")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局错误处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理"""
    print(f"未捕获的异常: {exc}")
    traceback.print_exc()

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "服务器内部错误"},
    )

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    """数据库完整性错误处理"""
    print(f"数据库完整性错误: {exc}")

    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": "数据冲突，请检查输入"},
    )

# 依赖项
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", tags=["Root"])
async def root():
    return {"message": "FitPlan Lite API is running"}

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}

# 计划相关API
@app.post("/plans/", response_model=schemas.PlanResponse, status_code=status.HTTP_201_CREATED, tags=["Plans"])
def create_plan(plan: schemas.PlanCreate, db: Session = Depends(get_db)):
    """创建新计划"""
    # 检查计划是否已存在
    db_plan = crud.get_plan_by_week_start(db, week_start=plan.week_start)
    if db_plan:
        raise HTTPException(status_code=409, detail="计划已存在")

    # 验证训练日数量
    training_days = [day for day in plan.days if not day.is_rest]
    if len(training_days) < 1:
        raise HTTPException(status_code=422, detail="每周至少需要有一天训练日")

    # 验证每个训练日至少有一个动作
    for day in training_days:
        if len(day.exercises) < 1:
            raise HTTPException(status_code=422, detail=f"训练日 {day.date} 至少需要有一个动作")

    return crud.create_plan(db=db, plan=plan)

@app.get("/plans/{week_start}", response_model=schemas.PlanResponse, tags=["Plans"])
def get_plan(week_start: date, db: Session = Depends(get_db)):
    """获取指定周的计划"""
    db_plan = crud.get_plan_by_week_start(db, week_start=week_start)
    if db_plan is None:
        raise HTTPException(status_code=404, detail="计划不存在")
    return db_plan

@app.get("/plans/current/", response_model=schemas.PlanResponse, tags=["Plans"])
def get_current_plan(db: Session = Depends(get_db)):
    """获取本周计划"""
    current_week_start = crud.get_current_week_start()
    db_plan = crud.get_plan_by_week_start(db, week_start=current_week_start)
    if db_plan is None:
        raise HTTPException(status_code=404, detail="本周计划不存在")
    return db_plan

@app.put("/plans/{week_start}", response_model=schemas.PlanResponse, tags=["Plans"])
def update_plan(week_start: date, plan: schemas.PlanCreate, db: Session = Depends(get_db)):
    """更新指定周的计划"""
    db_plan = crud.get_plan_by_week_start(db, week_start=week_start)
    if db_plan is None:
        raise HTTPException(status_code=404, detail="计划不存在")

    # 验证训练日数量
    training_days = [day for day in plan.days if not day.is_rest]
    if len(training_days) < 1:
        raise HTTPException(status_code=422, detail="每周至少需要有一天训练日")

    # 验证每个训练日至少有一个动作
    for day in training_days:
        if len(day.exercises) < 1:
            raise HTTPException(status_code=422, detail=f"训练日 {day.date} 至少需要有一个动作")

    return crud.update_plan(db=db, db_plan=db_plan, plan=plan)

# 训练日相关API
@app.get("/days/{date}", response_model=schemas.DayResponse, tags=["Days"])
def get_day(date: date, db: Session = Depends(get_db)):
    """获取指定日期的训练日详情"""
    db_day = crud.get_day_by_date(db, date=date)
    if db_day is None:
        raise HTTPException(status_code=404, detail="该日期无训练安排")
    return db_day

@app.patch("/days/{date}/completed", response_model=schemas.DayResponse, tags=["Days"])
def update_day_completed(date: date, completed: bool, db: Session = Depends(get_db)):
    """更新训练日完成状态"""
    db_day = crud.get_day_by_date(db, date=date)
    if db_day is None:
        raise HTTPException(status_code=404, detail="该日期无训练安排")

    return crud.update_day_completed(db=db, db_day=db_day, completed=completed)

# 统计相关API
@app.get("/stats/{week_start}", response_model=schemas.StatsResponse, tags=["Stats"])
def get_stats(week_start: date, db: Session = Depends(get_db)):
    """获取指定周的统计数据"""
    stats = crud.calculate_stats(db, week_start=week_start)
    if stats is None:
        raise HTTPException(status_code=404, detail="计划不存在")
    return stats

@app.get("/stats/current/", response_model=schemas.StatsResponse, tags=["Stats"])
def get_current_stats(db: Session = Depends(get_db)):
    """获取本周统计数据"""
    current_week_start = crud.get_current_week_start()
    stats = crud.calculate_stats(db, week_start=current_week_start)
    if stats is None:
        raise HTTPException(status_code=404, detail="本周计划不存在")
    return stats

# 模板相关API
@app.get("/template/preview/{current_week_start}", response_model=schemas.TemplatePreviewResponse, tags=["Template"])
def get_template_preview(current_week_start: date, db: Session = Depends(get_db)):
    """生成下周模板预览"""
    return crud.generate_next_week_template(db, current_week_start=current_week_start)

@app.post("/template/apply/", response_model=schemas.ApplyTemplateResponse, tags=["Template"])
def apply_template(template: schemas.TemplatePreviewResponse, db: Session = Depends(get_db)):
    """应用模板创建下周计划"""
    db_plan, message = crud.apply_template(db, next_week_start=template.next_week_start, days=template.days)
    if not db_plan:
        raise HTTPException(status_code=409, detail=message)

    return schemas.ApplyTemplateResponse(message=message, plan_id=db_plan.id)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)