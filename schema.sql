-- 创建数据库
CREATE DATABASE IF NOT EXISTS fitplan;

USE fitplan;

-- 计划表
CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    week_start DATE NOT NULL UNIQUE, -- 周一的日期
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 训练日表
CREATE TABLE IF NOT EXISTS days (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    title VARCHAR(100),
    is_rest BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE
);

-- 动作表
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    day_id INTEGER REFERENCES days(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

-- 创建索引
CREATE INDEX idx_days_plan_id ON days(plan_id);
CREATE INDEX idx_exercises_day_id ON exercises(day_id);

-- 插入示例数据
INSERT INTO plans (week_start) VALUES ('2024-01-08');

-- 插入示例训练日
INSERT INTO days (plan_id, date, title, is_rest, completed) VALUES
(1, '2024-01-08', 'Full Body', false, false),
(1, '2024-01-09', 'Rest', true, true),
(1, '2024-01-10', 'Push', false, false),
(1, '2024-01-11', 'Pull', false, false),
(1, '2024-01-12', 'Rest', true, false),
(1, '2024-01-13', 'Legs', false, false),
(1, '2024-01-14', 'Rest', true, false);

-- 插入示例动作
INSERT INTO exercises (day_id, name) VALUES
-- Full Body
(1, 'Squat'),
(1, 'Push-up'),
(1, 'Row'),
(1, 'Plank'),
-- Push
(3, 'Push-up'),
(3, 'Dumbbell Press'),
(3, 'Triceps Dip'),
(3, 'Shoulder Press'),
-- Pull
(4, 'Pull-up'),
(4, 'Dumbbell Row'),
(4, 'Biceps Curl'),
(4, 'Face Pull'),
-- Legs
(6, 'Squat'),
(6, 'Lunge'),
(6, 'Calf Raise'),
(6, 'Glute Bridge');