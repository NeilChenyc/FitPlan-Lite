'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plan, PlanCreate, DayCreate, ExerciseCreate } from '@/types';
import { planAPI } from '@/services/api';
import Skeleton from '@/components/Skeleton';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';

export default function PlanBuilder() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [days, setDays] = useState<DayCreate[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const EXERCISE_TYPES = [
    'Full Body',
    'Push',
    'Pull',
    'Legs',
    'Core',
  ];

  const EXERCISE_SUGGESTIONS = {
    'Full Body': ['Squat', 'Push-up', 'Row', 'Plank'],
    'Push': ['Push-up', 'Dumbbell Press', 'Triceps Dip', 'Shoulder Press'],
    'Pull': ['Pull-up', 'Dumbbell Row', 'Biceps Curl', 'Face Pull'],
    'Legs': ['Squat', 'Lunge', 'Calf Raise', 'Glute Bridge'],
    'Core': ['Plank', 'Crunch', 'Dead Bug', 'Leg Raise'],
  };

  useEffect(() => {
    initPlan();
  }, []);

  const initPlan = async () => {
    try {
      setLoading(true);
      // 尝试获取本周计划
      const currentPlan = await planAPI.getCurrent();
      setPlan(currentPlan);
      setDays(convertToDayCreate(currentPlan.days));
    } catch (error) {
      // 如果没有本周计划，创建一个新的空白计划
      createEmptyPlan();
    } finally {
      setLoading(false);
    }
  };

  const createEmptyPlan = () => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
    weekStart.setHours(0, 0, 0, 0);

    const newDays: DayCreate[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);

      newDays.push({
        date: date.toISOString().split('T')[0],
        title: i === 0 ? 'Full Body' : null,
        is_rest: i >= 5, // 周末休息
        completed: false,
        exercises: i === 0 ? EXERCISE_SUGGESTIONS['Full Body'].map(name => ({ name })) : [],
      });
    }

    setDays(newDays);
  };

  const convertToDayCreate = (days: any[]): DayCreate[] => {
    return days.map(day => ({
      date: day.date,
      title: day.title,
      is_rest: day.is_rest,
      completed: day.completed,
      exercises: day.exercises.map((ex: any) => ({ name: ex.name })),
    }));
  };

  const handleDayTypeChange = (index: number, isRest: boolean) => {
    const updatedDays = [...days];
    updatedDays[index] = {
      ...updatedDays[index],
      is_rest: isRest,
      title: isRest ? null : updatedDays[index].title || 'Full Body',
      exercises: isRest ? [] : updatedDays[index].exercises || [],
    };
    setDays(updatedDays);
  };

  const handleTitleChange = (index: number, title: string) => {
    const updatedDays = [...days];
    updatedDays[index].title = title;
    setDays(updatedDays);
  };

  const handleAddExercise = (index: number) => {
    const updatedDays = [...days];
    updatedDays[index].exercises.push({ name: '' });
    setDays(updatedDays);
  };

  const handleRemoveExercise = (dayIndex: number, exerciseIndex: number) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].exercises.splice(exerciseIndex, 1);
    setDays(updatedDays);
  };

  const handleExerciseChange = (dayIndex: number, exerciseIndex: number, name: string) => {
    const updatedDays = [...days];
    updatedDays[dayIndex].exercises[exerciseIndex].name = name;
    setDays(updatedDays);
  };

  const handleUseSuggestions = (dayIndex: number, type: string) => {
    const updatedDays = [...days];
    const suggestions = EXERCISE_SUGGESTIONS[type as keyof typeof EXERCISE_SUGGESTIONS];
    updatedDays[dayIndex].exercises = suggestions.map(name => ({ name }));
    setDays(updatedDays);
  };

  const validateForm = () => {
    // 验证训练日数量
    const trainingDays = days.filter(day => !day.is_rest);
    if (trainingDays.length < 1) {
      toast.error('每周至少需要有一天训练日');
      return false;
    }

    // 验证每个训练日的动作
    for (const day of trainingDays) {
      if (day.exercises.length < 1) {
        toast.error(`训练日 ${day.date} 至少需要有一个动作`);
        return false;
      }

      // 验证动作名称不为空
      for (const exercise of day.exercises) {
        if (!exercise.name.trim()) {
          toast.error(`训练日 ${day.date} 有动作名称为空`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const weekStart = days[0].date;

      const planData: PlanCreate = {
        week_start: weekStart,
        days: days.map(day => ({
          ...day,
          exercises: day.exercises.map(ex => ({
            name: ex.name.trim(),
          })),
        })),
      };

      if (plan) {
        await planAPI.update(plan.week_start, planData);
        toast.success('计划更新成功');
      } else {
        await planAPI.create(planData);
        toast.success('计划创建成功');
      }

      router.push('/');
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('本周计划已存在');
      } else if (error.response?.status === 422) {
        toast.error('表单验证失败，请检查输入');
      } else {
        toast.error('保存失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !days.length) {
    return <PlanBuilderSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">创建/编辑训练计划</h1>
        <p className="text-gray-400">
          为您的一周安排训练和休息时间
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {days.map((day, index) => (
          <div key={index} className="card">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="font-medium">
                    {new Date(day.date).toLocaleDateString('zh-CN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDayTypeChange(index, false)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      !day.is_rest
                        ? 'bg-primary text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    训练日
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDayTypeChange(index, true)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      day.is_rest
                        ? 'bg-primary text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    休息日
                  </button>
                </div>
              </div>

              {!day.is_rest && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                      训练类型
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {EXERCISE_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            handleTitleChange(index, type);
                            handleUseSuggestions(index, type);
                          }}
                          className={`px-3 py-1 rounded-full text-sm ${
                            day.title === type
                              ? 'bg-primary text-white'
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={day.title || ''}
                      onChange={(e) => handleTitleChange(index, e.target.value)}
                      placeholder="自定义训练类型（如：HIIT、拉伸）"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium">
                        训练动作
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAddExercise(index)}
                        className="flex items-center space-x-1 text-primary hover:underline"
                      >
                        <FaPlus className="h-4 w-4" />
                        <span>添加动作</span>
                      </button>
                    </div>

                    {day.exercises.length > 0 ? (
                      <div className="space-y-3">
                        {day.exercises.map((exercise, exIndex) => (
                          <div key={exIndex} className="flex items-center space-x-3">
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={(e) => handleExerciseChange(index, exIndex, e.target.value)}
                              placeholder="动作名称（如：俯卧撑、深蹲）"
                              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExercise(index, exIndex)}
                              className="text-red-500 hover:text-red-400 p-2"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-400">
                        还没有添加任何动作
                      </div>
                    )}
                  </div>
                </>
              )}

              {day.is_rest && (
                <div className="text-center py-4 text-gray-400">
                  今天是休息日，好好休息吧！
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            <FaSave className="h-4 w-4" />
            <span>{loading ? '保存中...' : '保存计划'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

const PlanBuilderSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Skeleton width="200px" height="28px" className="mb-2" />
        <Skeleton width="300px" height="20px" />
      </div>

      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="card mb-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <Skeleton width="250px" height="20px" />
              <div className="flex space-x-2">
                <Skeleton width="80px" height="30px" rounded />
                <Skeleton width="80px" height="30px" rounded />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Skeleton width="100px" height="20px" className="mb-2" />
                <div className="flex flex-wrap gap-2 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} width="80px" height="30px" rounded />
                  ))}
                </div>
                <Skeleton width="100%" height="40px" rounded />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <Skeleton width="100px" height="20px" />
                  <Skeleton width="100px" height="30px" rounded />
                </div>
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center space-x-3">
                    <Skeleton width="100%" height="40px" rounded />
                    <Skeleton width="40px" height="40px" rounded />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-end space-x-3">
        <Skeleton width="120px" height="44px" rounded />
        <Skeleton width="150px" height="44px" rounded />
      </div>
    </div>
  );
};
