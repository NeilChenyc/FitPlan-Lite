'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plan } from '@/types';
import { planAPI } from '@/services/api';
import Skeleton from '@/components/Skeleton';
import { FaCalendarAlt, FaList, FaCheck, FaCalendarDay } from 'react-icons/fa';

export default function Schedule() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const currentPlan = await planAPI.getCurrent();
      setPlan(currentPlan);
    } catch (error) {
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !plan) {
    return <ScheduleSkeleton />;
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <FaCalendarAlt className="text-primary text-6xl mb-4" />
        <h2 className="text-2xl font-bold mb-4">还没有创建本周计划</h2>
        <p className="text-gray-400 mb-6">请先创建训练计划</p>
        <button
          onClick={() => router.push('/plan')}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <FaCalendarDay />
          <span>创建计划</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">训练日程</h1>
          <div className="flex space-x-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FaCalendarAlt className="h-4 w-4" />
              <span>日历</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FaList className="h-4 w-4" />
              <span>列表</span>
            </button>
          </div>
        </div>
        <p className="text-gray-400 mt-1">
          {new Date(plan.week_start).toLocaleDateString('zh-CN', {
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {viewMode === 'calendar' ? (
        <CalendarView days={plan.days} onDayClick={(date) => router.push(`/day/${date}`)} />
      ) : (
        <ListView days={plan.days} onDayClick={(date) => router.push(`/day/${date}`)} />
      )}
    </>
  );
}

interface CalendarViewProps {
  days: any[];
  onDayClick: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ days, onDayClick }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date(days[0].date));
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // 计算月份的第一天和最后一天
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // 调整以周一开始显示
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // 创建日历矩阵
  const calendarDays: (Date | null)[] = [];
  const currentDate = new Date();

  // 添加前导空白
  for (let i = 0; i < adjustedFirstDay; i++) {
    calendarDays.push(null);
  }

  // 添加月份的每一天
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    calendarDays.push(new Date(year, month, i));
  }

  // 添加后续空白
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  const getDayInfo = (date: Date | null) => {
    if (!date) return null;
    return days.find(
      (day) => new Date(day.date).toDateString() === date.toDateString()
    );
  };

  const weekdays = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="card">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">
            {new Date(year, month).toLocaleDateString('zh-CN', { month: 'long' })} {year}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
              title="上个月"
            >
              ←
            </button>
            <button
              onClick={handleToday}
              className="px-2 py-1 text-sm rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              今天
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
              title="下个月"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const dayInfo = getDayInfo(date);
          const isToday = date && date.toDateString() === currentDate.toDateString();
          const isWeekend = date && (date.getDay() === 0 || date.getDay() === 6);

          if (!date) {
            return <div key={index} className="h-14" />;
          }

          const hasTraining = dayInfo && !dayInfo.is_rest;
          const isCompleted = dayInfo && dayInfo.completed;

          return (
            <button
              key={index}
              onClick={() => onDayClick(date.toISOString().split('T')[0])}
              className={`h-14 rounded-lg flex flex-col items-center justify-center transition-all duration-200 relative group overflow-hidden ${
                isToday
                  ? 'bg-primary/10 border-2 border-primary ring-2 ring-primary/20'
                  : date > new Date()
                  ? 'text-gray-600 cursor-not-allowed opacity-60'
                  : 'hover:bg-gray-700 hover:scale-105'
              } ${isWeekend && 'text-gray-500'}`}
              disabled={date > new Date()}
            >
              <span
                className={`text-sm font-medium ${
                  isToday ? 'text-primary font-bold' : ''
                }`}
              >
                {date.getDate()}
              </span>

              {hasTraining && (
                <div
                  className={`absolute bottom-1 w-2 h-2 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-primary scale-125 ring-2 ring-primary/40'
                      : 'bg-gray-500 group-hover:scale-110'
                  }`}
                />
              )}

              {isCompleted && !dayInfo?.is_rest && (
                <div className="absolute top-1 right-1 text-primary transition-transform duration-200 group-hover:scale-110">
                  <FaCheck className="h-3 w-3" />
                </div>
              )}

              {dayInfo?.is_rest && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-600"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface ListViewProps {
  days: any[];
  onDayClick: (date: string) => void;
}

const ListView: React.FC<ListViewProps> = ({ days, onDayClick }) => {
  return (
    <div className="space-y-2">
      {days.map((day, index) => (
        <button
          key={index}
          onClick={() => onDayClick(day.date)}
          className={`card flex justify-between items-center p-4 transition-all duration-200 ${
            day.completed && !day.is_rest ? 'border-l-4 border-primary' : ''
          }`}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                day.completed
                  ? 'bg-primary text-white'
                  : day.is_rest
                  ? 'bg-gray-700 text-gray-400'
                  : 'bg-gray-800 text-white'
              }`}
            >
              {new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' })}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {new Date(day.date).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                {day.completed && !day.is_rest && (
                  <span className="text-sm bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                    已完成
                  </span>
                )}
                {day.is_rest && (
                  <span className="text-sm bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
                    休息
                  </span>
                )}
              </div>
              {!day.is_rest && day.title && (
                <p className="text-sm text-gray-400">
                  {day.title} • {day.exercises.length} 个动作
                </p>
              )}
              {day.is_rest && (
                <p className="text-sm text-gray-400">好好休息</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!day.is_rest && (
              <span className="text-sm text-gray-400">
                {day.exercises.length} 个动作
              </span>
            )}
            <span className="text-gray-500">→</span>
          </div>
        </button>
      ))}
    </div>
  );
};

const ScheduleSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <Skeleton width="200px" height="28px" />
          <div className="flex space-x-2">
            <Skeleton width="120px" height="36px" rounded />
            <Skeleton width="120px" height="36px" rounded />
          </div>
        </div>
        <Skeleton width="200px" height="20px" className="mt-1" />
      </div>

      <div className="card">
        <Skeleton width="150px" height="24px" className="mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Skeleton width="40px" height="40px" circle />
                <div className="space-y-2">
                  <Skeleton width="150px" height="20px" />
                  <Skeleton width="200px" height="16px" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton width="80px" height="16px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
