#!/usr/bin/env python3
"""生成包含本周训练计划的演示数据"""

import psycopg2
import os
from datetime import date, timedelta
from dotenv import load_dotenv

load_dotenv('.env')

def get_db_connection():
    """获取数据库连接"""
    return psycopg2.connect(
        dbname="fitplan",
        user=os.getenv("POSTGRES_USER", "postgres"),
        password=os.getenv("POSTGRES_PASSWORD", "password"),
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=os.getenv("POSTGRES_PORT", "5432")
    )

def get_current_week_start():
    """获取本周一的日期"""
    today = date.today()
    return today - timedelta(days=today.weekday())

def create_week_plan(conn, week_start):
    """创建一周训练计划"""
    cursor = conn.cursor()

    try:
        # 创建计划表记录
        cursor.execute("""
            INSERT INTO plans (week_start)
            VALUES (%s)
            ON CONFLICT DO NOTHING
            RETURNING id
        """, (week_start,))

        plan_id = cursor.fetchone()
        if not plan_id:
            print(f"本周计划已存在 (周起始: {week_start})")
            return None

        plan_id = plan_id[0]
        print(f"创建新计划成功，ID: {plan_id}，周起始: {week_start}")

        # 创建7天的训练安排
        for day_offset in range(7):
            current_date = week_start + timedelta(days=day_offset)
            day_of_week = current_date.weekday()  # 0=周一, 6=周日

            # 设置训练日和休息日
            if day_of_week in [5, 6]:  # 周六、周日休息
                is_rest = True
                title = "休息"
                exercises = []
            else:
                is_rest = False
                # 按周一到周五安排不同训练类型
                training_types = [
                    "Full Body",  # 周一
                    "Push",       # 周二
                    "Pull",       # 周三
                    "Legs",       # 周四
                    "Core"        # 周五
                ]
                title = training_types[day_of_week]

                # 为不同训练类型设置对应的动作
                exercise_library = {
                    "Full Body": ["Squat", "Push-up", "Row", "Plank"],
                    "Push": ["Push-up", "Dumbbell Press", "Triceps Dip", "Shoulder Press"],
                    "Pull": ["Pull-up", "Dumbbell Row", "Biceps Curl", "Face Pull"],
                    "Legs": ["Squat", "Lunge", "Calf Raise", "Glute Bridge"],
                    "Core": ["Plank", "Crunch", "Dead Bug", "Leg Raise"]
                }
                exercises = exercise_library[title]

            # 创建训练日记录
            cursor.execute("""
                INSERT INTO days (plan_id, date, title, is_rest, completed)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (plan_id, current_date, title if not is_rest else None, is_rest, False))

            day_id = cursor.fetchone()[0]

            # 为训练日添加动作
            for exercise_name in exercises:
                cursor.execute("""
                    INSERT INTO exercises (day_id, name)
                    VALUES (%s, %s)
                """, (day_id, exercise_name))

        conn.commit()
        print(f"成功创建本周 ({week_start} - {week_start + timedelta(days=6)}) 训练计划")
        return plan_id

    except Exception as e:
        conn.rollback()
        print(f"创建计划失败: {e}")
        return None
    finally:
        cursor.close()

def create_sample_data():
    """创建示例数据"""
    conn = get_db_connection()

    try:
        # 获取本周一日期
        week_start = get_current_week_start()
        print(f"当前本周起始日期: {week_start}")

        # 创建本周计划
        plan_id = create_week_plan(conn, week_start)

        if plan_id:
            # 创建下周计划作为演示
            next_week_start = week_start + timedelta(days=7)
            next_plan_id = create_week_plan(conn, next_week_start)

    finally:
        conn.close()

if __name__ == "__main__":
    create_sample_data()
