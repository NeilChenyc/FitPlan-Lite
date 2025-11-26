'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Day } from '@/types';
import { dayAPI } from '@/services/api';
import Skeleton from '@/components/Skeleton';
import { FaCheck, FaCalendarAlt, FaArrowLeft } from 'react-icons/fa';

export default function DayDetail() {
  const params = useParams();
  const router = useRouter();
  const [day, setDay] = useState<Day | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const date = params.date as string;

  useEffect(() => {
    fetchDayDetails();
  }, [date]);

  const fetchDayDetails = async () => {
    try {
      setLoading(true);
      const dayData = await dayAPI.getByDate(date);
      setDay(dayData);
    } catch (error) {
      toast.error('加载训练日详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompleted = async () => {
    if (!day) return;

    try {
      setUpdating(true);
      const updatedDay = await dayAPI.updateCompleted(
        date,
        !day.completed
      );
      setDay(updatedDay);
      toast.success(
        updatedDay.completed ? '已标记为完成' : '已取消完成标记'
      );
    } catch (error) {
      toast.error('更新状态失败');
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !day) {
    return <DayDetailSkeleton />;
  }

  if (!day) {
    return (
      <div className="text-center py-12">
        <FaCalendarAlt className="text-primary text-6xl mb-4" />
        <h2 className="text-2xl font-bold mb-4">未找到训练日</h2>
        <p className="text-gray-400 mb-6">该日期没有训练安排</p>
        <button
          onClick={() => router.back()}
          className="btn-secondary inline-flex items-center space-x-2"
        >
          <FaArrowLeft />
          <span>返回</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-4"
        >
          <FaArrowLeft className="h-4 w-4" />
          <span>返回</span>
        </button>

        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {new Date(day.date).toLocaleDateString('zh-CN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h1>
              {!day.is_rest && day.title && (
                <p className="text-primary text-lg font-medium">{day.title}</p>
              )}
            </div>
            <div
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
                day.is_rest
                  ? 'bg-gray-700 text-gray-400'
                  : day.completed
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-white'
              }`}
            >
              {day.is_rest ? '休息' : day.completed ? '已完成' : '未完成'}
            </div>
          </div>

          <button
            onClick={handleToggleCompleted}
            disabled={updating}
            className={`w-full btn-primary ${
              day.is_rest ? 'bg-gray-700 hover:bg-gray-600' : ''
            }`}
          >
            <FaCheck className="h-4 w-4 inline-block mr-2" />
            {updating
              ? '更新中...'
              : day.completed
              ? '已完成'
              : '标记为完成'}
          </button>
        </div>

        {!day.is_rest ? (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">训练动作</h2>
            {day.exercises.length > 0 ? (
              <div className="space-y-3">
                {day.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      day.completed
                        ? 'bg-primary/10 border border-primary'
                        : 'bg-gray-800'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        day.completed
                          ? 'bg-primary text-white'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`flex-1 ${
                        day.completed ? 'line-through text-gray-500' : ''
                      }`}
                    >
                      {exercise.name}
                    </span>
                    {day.completed && (
                      <div className="text-primary">
                        <FaCheck className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                今天没有安排训练动作
              </div>
            )}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FaCalendarAlt className="text-gray-600 text-6xl mb-4" />
            <h2 className="text-xl font-bold mb-2">休息日</h2>
            <p className="text-gray-400">今天好好休息，为明天的训练养精蓄锐！</p>
          </div>
        )}
      </div>
    </div>
  );
}

const DayDetailSkeleton = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Skeleton width="100px" height="24px" className="mb-4" />

        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <Skeleton width="250px" height="28px" className="mb-2" />
              <Skeleton width="150px" height="24px" />
            </div>
            <Skeleton width="80px" height="36px" rounded />
          </div>
          <Skeleton width="100%" height="44px" rounded />
        </div>

        <div className="card">
          <Skeleton width="150px" height="24px" className="mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton width="40px" height="40px" circle />
                <Skeleton width="100%" height="40px" rounded />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
