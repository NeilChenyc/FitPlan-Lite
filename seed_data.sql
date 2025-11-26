-- 创建示例数据
INSERT INTO plans (week_start) VALUES ('2024-01-08') ON CONFLICT DO NOTHING;

-- 获取计划ID
DO $$
DECLARE
    plan_id INT;
BEGIN
    SELECT id INTO plan_id FROM plans WHERE week_start = '2024-01-08';

    -- 插入示例训练日
    INSERT INTO days (plan_id, date, title, is_rest, completed) VALUES
    (plan_id, '2024-01-08', 'Full Body', false, true),
    (plan_id, '2024-01-09', 'Rest', true, true),
    (plan_id, '2024-01-10', 'Push', false, true),
    (plan_id, '2024-01-11', 'Pull', false, false),
    (plan_id, '2024-01-12', 'Rest', true, false),
    (plan_id, '2024-01-13', 'Legs', false, false),
    (plan_id, '2024-01-14', 'Rest', true, false)
    ON CONFLICT DO NOTHING;

    -- 获取各训练日ID
    DECLARE
        day1 INT; -- 2024-01-08
        day3 INT; -- 2024-01-10
        day4 INT; -- 2024-01-11
        day6 INT; -- 2024-01-13
    BEGIN
        SELECT id INTO day1 FROM days WHERE plan_id = plan_id AND date = '2024-01-08';
        SELECT id INTO day3 FROM days WHERE plan_id = plan_id AND date = '2024-01-10';
        SELECT id INTO day4 FROM days WHERE plan_id = plan_id AND date = '2024-01-11';
        SELECT id INTO day6 FROM days WHERE plan_id = plan_id AND date = '2024-01-13';

        -- 插入示例动作
        INSERT INTO exercises (day_id, name) VALUES
        -- Full Body (已完成)
        (day1, 'Squat'),
        (day1, 'Push-up'),
        (day1, 'Row'),
        (day1, 'Plank'),
        -- Push (已完成)
        (day3, 'Push-up'),
        (day3, 'Dumbbell Press'),
        (day3, 'Triceps Dip'),
        (day3, 'Shoulder Press'),
        -- Pull (未完成)
        (day4, 'Pull-up'),
        (day4, 'Dumbbell Row'),
        (day4, 'Biceps Curl'),
        (day4, 'Face Pull'),
        -- Legs (未完成)
        (day6, 'Squat'),
        (day6, 'Lunge'),
        (day6, 'Calf Raise'),
        (day6, 'Glute Bridge')
        ON CONFLICT DO NOTHING;
    END;
END $$;

-- 创建下周计划示例
INSERT INTO plans (week_start) VALUES ('2024-01-15') ON CONFLICT DO NOTHING;

DO $$
DECLARE
    plan_id INT;
BEGIN
    SELECT id INTO plan_id FROM plans WHERE week_start = '2024-01-15';

    -- 插入示例训练日
    INSERT INTO days (plan_id, date, title, is_rest, completed) VALUES
    (plan_id, '2024-01-15', 'Push', false, false),
    (plan_id, '2024-01-16', 'Pull', false, false),
    (plan_id, '2024-01-17', 'Legs', false, false),
    (plan_id, '2024-01-18', 'Core', false, false),
    (plan_id, '2024-01-19', 'Rest', true, false),
    (plan_id, '2024-01-20', 'Rest', true, false),
    (plan_id, '2024-01-21', 'Rest', true, false)
    ON CONFLICT DO NOTHING;

    -- 获取各训练日ID
    DECLARE
        day1 INT; -- 2024-01-15
        day2 INT; -- 2024-01-16
        day3 INT; -- 2024-01-17
        day4 INT; -- 2024-01-18
    BEGIN
        SELECT id INTO day1 FROM days WHERE plan_id = plan_id AND date = '2024-01-15';
        SELECT id INTO day2 FROM days WHERE plan_id = plan_id AND date = '2024-01-16';
        SELECT id INTO day3 FROM days WHERE plan_id = plan_id AND date = '2024-01-17';
        SELECT id INTO day4 FROM days WHERE plan_id = plan_id AND date = '2024-01-18';

        -- 插入示例动作
        INSERT INTO exercises (day_id, name) VALUES
        -- Push
        (day1, 'Push-up'),
        (day1, 'Dumbbell Press'),
        (day1, 'Triceps Dip'),
        -- Pull
        (day2, 'Pull-up'),
        (day2, 'Dumbbell Row'),
        (day2, 'Biceps Curl'),
        -- Legs
        (day3, 'Squat'),
        (day3, 'Lunge'),
        (day3, 'Calf Raise'),
        -- Core
        (day4, 'Plank'),
        (day4, 'Crunch'),
        (day4, 'Dead Bug')
        ON CONFLICT DO NOTHING;
    END;
END $$;

-- 创建统计视图
CREATE VIEW weekly_stats AS
SELECT
    p.id as plan_id,
    p.week_start,
    COUNT(DISTINCT d.id) as total_days,
    COUNT(DISTINCT CASE WHEN NOT d.is_rest THEN d.id END) as training_days,
    COUNT(DISTINCT CASE WHEN NOT d.is_rest AND d.completed THEN d.id END) as completed_training_days,
    COUNT(e.id) as total_exercises,
    COUNT(CASE WHEN d.completed THEN e.id END) as completed_exercises,
    CASE
        WHEN COUNT(DISTINCT CASE WHEN NOT d.is_rest THEN d.id END) > 0
        THEN ROUND(COUNT(DISTINCT CASE WHEN NOT d.is_rest AND d.completed THEN d.id END)::numeric / COUNT(DISTINCT CASE WHEN NOT d.is_rest THEN d.id END)::numeric, 2)
        ELSE 0
    END as completion_rate
FROM
    plans p
LEFT JOIN
    days d ON p.id = d.plan_id
LEFT JOIN
    exercises e ON d.id = e.day_id
GROUP BY
    p.id, p.week_start;

echo "✅ 示例数据插入完成！"
echo ""
echo "📊 示例数据包含："
echo "- 2024-01-08 至 2024-01-14 本周计划"
echo "- 2024-01-15 至 2024-01-21 下周计划"
echo "- 部分已完成的训练日和动作"
echo ""
echo "🔍 可以通过以下方式查看数据："
echo "psql -d fitplan"
echo "SELECT * FROM weekly_stats;"
