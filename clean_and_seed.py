#!/usr/bin/env python3
"""清理并重新生成演示数据"""

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

def clean_database(conn):
    """清理数据库中的旧数据"""
    cursor = conn.cursor()

    try:
        print("清理旧数据...")

        # 删除所有数据（按外键顺序）
        cursor.execute("DELETE FROM exercises")
        cursor.execute("DELETE FROM days")
        cursor.execute("DELETE FROM plans")

        conn.commit()
        print("清理完成")

    except Exception as e:
        conn.rollback()
        print(f"清理失败: {e}")
        raise
    finally:
        cursor.close()

def create_week_plan(conn, week_start, is_current_week=True):
    """创建一周训练计划"""
    cursor = conn.cursor()

    try:
        # 创建计划表记录
        cursor.execute("""
            INSERT INTO plans (week_start)
            VALUES (%s)
            RETURNING id
        """, (week_start,))

        plan_id = cursor.fetchone()[0]
        print(f"\n创建计划成功，ID: {plan_id}，周起始: {week_start}")

        # 创建7天的训练安排
        for day_offset in range(7):
            current_date = week_start + timedelta(days=day_offset)
            day_of_week = current_date.weekday()  # 0=周一, 6=周日

            # 设置训练日和休息日
            if day_of_week in [5, 6]:  # 周六、周日休息
                is_rest = True
                title = None
                exercises = []
                completed = is_current_week and (day_of_week == 6 and current_date < date.today())
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

                # 设置部分已完成状态（仅当前周）
                completed = is_current_week and (day_offset < 3)  # 前3天已完成

            # 创建训练日记录
            cursor.execute("""
                INSERT INTO days (plan_id, date, title, is_rest, completed)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (plan_id, current_date, title, is_rest, completed))

            day_id = cursor.fetchone()[0]

            # 为训练日添加动作
            for exercise_name in exercises:
                cursor.execute("""
                    INSERT INTO exercises (day_id, name)
                    VALUES (%s, %s)
                """, (day_id, exercise_name))

            # 打印训练日信息
            status = "已完成" if completed else "未完成"
            type_str = "休息" if is_rest else f"{title} ({len(exercises)}个动作)"
            print(f"  {current_date.strftime('%Y-%m-%d')} ({['周一','周二','周三','周四','周五','周六','周日'][day_of_week]}): {type_str} - {status}")

        conn.commit()
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
        # 清理旧数据
        clean_database(conn)

        # 获取本周一日期
        week_start = get_current_week_start()
        print(f"\n当前本周起始日期: {week_start}")

        # 创建本周计划
        print("\n创建本周训练计划:")
        current_plan_id = create_week_plan(conn, week_start, is_current_week=True)

        if current_plan_id:
            # 创建下周计划作为演示
            next_week_start = week_start + timedelta(days=7)
            print("\n创建下周训练计划:")
            next_plan_id = create_week_plan(conn, next_week_start, is_current_week=False)

        print(f"\n🎉 数据生成完成！")
        print(f"📊 当前周: {week_start} - {week_start + timedelta(days=6)}")
        print(f"📅 下周: {next_week_start} - {next_week_start + timedelta(days=6)}")
        print(f"\n🚀 现在可以启动前端查看数据了:")
        print(f"   cd frontend")
        print(f"   npm install")
        print(f"   npm run dev")

    finally:
        conn.close()

if __name__ == "__main__":
    create_sample_data()
