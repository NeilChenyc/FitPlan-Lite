'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Plan, Stats, TemplatePreview } from '@/types';
import { planAPI, statsAPI, templateAPI } from '@/services/api';
import WeekStrip from '@/components/WeekStrip';
import ProgressBar from '@/components/ProgressBar';
import Skeleton from '@/components/Skeleton';
import { FaCalendarAlt, FaPlay, FaCheckDouble, FaThumbsUp } from 'react-icons/fa';

export default function Dashboard() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templatePreview, setTemplatePreview] = useState<TemplatePreview | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [planData, statsData] = await Promise.all([
        planAPI.getCurrent(),
        statsAPI.getCurrent(),
      ]);
      setPlan(planData);
      setStats(statsData);
    } catch (error) {
      toast.error('加载数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTemplate = async () => {
    if (!plan) return;

    try {
      setLoading(true);
      const template = await templateAPI.getPreview(plan.week_start);
      setTemplatePreview(template);
      setShowTemplateModal(true);
    } catch (error) {
      toast.error('生成模板失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async () => {
    if (!templatePreview) return;

    try {
      setLoading(true);
      const response = await templateAPI.apply(templatePreview);
      toast.success(response.message);
      setShowTemplateModal(false);
      // 刷新数据
      await fetchData();
      // 跳转到新计划
      router.push(`/plan/${templatePreview.next_week_start}`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('下周计划已存在，请前往编辑');
      } else {
        toast.error('应用模板失败');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !plan) {
    return <DashboardSkeleton />;
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <FaCalendarAlt className="text-primary text-6xl mb-4" />
        <h2 className="text-2xl font-bold mb-4">还没有创建本周计划</h2>
        <p className="text-gray-400 mb-6">开始创建您的第一份训练计划吧！</p>
        <Link href="/plan" className="btn-primary inline-flex items-center space-x-2">
          <FaPlay />
          <span>创建计划</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <WeekStrip
          days={plan.days}
          currentDate={new Date(plan.week_start)}
          onDayClick={(date) => router.push(`/day/${date}`)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">本周完成率</h2>
          <div className="relative mb-4">
            <ProgressBar
              value={stats?.completed_training_days || 0}
              maxValue={stats?.total_training_days || 1}
              label={`${stats?.completed_training_days || 0}/${stats?.total_training_days || 0} 天`}
              showPercentage={true}
              className="h-4"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">总训练日</span>
            <span>{stats?.total_training_days || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">已完成</span>
            <span className="text-primary font-medium">
              {stats?.completed_training_days || 0}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">完成率</span>
            <span className="font-medium">
              {Math.round((stats?.weekly_completion || 0) * 100)}%
            </span>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">动作统计</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">本周总动作数</span>
              <span className="text-xl font-bold">{stats?.total_exercises || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">已完成动作数</span>
              <span className="text-xl font-bold text-primary">
                {stats?.completed_exercises || 0}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <span className="text-sm text-gray-400">平均每天动作数</span>
              <p className="text-lg font-medium">
                {stats && stats.total_training_days > 0
                  ? Math.round(stats.total_exercises / stats.total_training_days)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/plan"
          className="card card-hover hover:shadow-lg transition-all duration-300"
        >
          <div className="flex flex-col items-center text-center py-8">
            <div className="bg-primary/20 p-3 rounded-full mb-4 transition-all duration-200 hover:scale-110">
              <FaCalendarAlt className="text-primary text-3xl" />
            </div>
            <h3 className="text-lg font-semibold mb-2">创建/编辑计划</h3>
            <p className="text-sm text-gray-400">管理您的训练安排</p>
          </div>
        </Link>

        <Link
          href="/schedule"
          className="card card-hover hover:shadow-lg transition-all duration-300"
        >
          <div className="flex flex-col items-center text-center py-8">
            <div className="bg-secondary/20 p-3 rounded-full mb-4 transition-all duration-200 hover:scale-110">
              <FaCalendarAlt className="text-secondary text-3xl" />
            </div>
            <h3 className="text-lg font-semibold mb-2">查看日程</h3>
            <p className="text-sm text-gray-400">日历视图查看训练安排</p>
          </div>
        </Link>

        <button
          onClick={handleGenerateTemplate}
          className="card card-hover hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          disabled={!stats || stats.total_training_days === 0}
        >
          <div className="flex flex-col items-center text-center py-8">
            <div
              className={`p-3 rounded-full mb-4 transition-all duration-200 hover:scale-110 ${
                stats && stats.total_training_days > 0
                  ? 'bg-primary/20'
                  : 'bg-gray-700'
              }`}
            >
              <FaThumbsUp
                className={`text-3xl transition-all duration-200 ${
                  stats && stats.total_training_days > 0
                    ? 'text-primary hover:rotate-12'
                    : 'text-gray-400'
                }`}
              />
            </div>
            <h3 className="text-lg font-semibold mb-2">生成下周模板</h3>
            <p className="text-sm text-gray-400">
              {stats && stats.total_training_days > 0
                ? '根据本周表现生成'
                : '完成本周训练后生成'}
            </p>
          </div>
        </button>
      </div>

      {/* Template Modal */}
      {showTemplateModal && templatePreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold">下周训练模板</h2>
              <p className="text-gray-400 text-sm mt-1">
                基于本周表现自动生成的训练计划
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card bg-gray-800">
                  <h3 className="text-sm font-semibold mb-2">本周表现</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">完成率</span>
                      <span>{Math.round(templatePreview.weekly_completion * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">训练日数</span>
                      <span>{templatePreview.training_days_count}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">下周安排</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {templatePreview.days.map((day, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg flex justify-between items-center ${
                        day.is_rest
                          ? 'bg-gray-800 text-gray-400'
                          : 'bg-gray-800 text-white'
                      }`}
                    >
                      <div>
                        <span className="font-medium">
                          {new Date(day.date).toLocaleDateString('zh-CN', {
                            weekday: 'short',
                          })}
                        </span>
                        <span className="ml-2">
                          {day.is_rest ? '休息' : day.title}
                        </span>
                      </div>
                      {!day.is_rest && (
                        <span className="text-sm bg-gray-700 px-2 py-1 rounded-full">
                          {day.exercises.length} 个动作
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleApplyTemplate}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? '应用中...' : '应用模板'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const DashboardSkeleton = () => {
  return (
    <>
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton width="100px" height="20px" />
          <Skeleton width="150px" height="20px" />
        </div>
        <div className="flex justify-between space-x-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} width="50px" height="50px" circle />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <Skeleton width="150px" height="20px" className="mb-4" />
          <Skeleton width="100%" height="24px" className="mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton width="80px" height="20px" />
                <Skeleton width="40px" height="20px" />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <Skeleton width="150px" height="20px" className="mb-4" />
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton width="120px" height="20px" />
              <Skeleton width="60px" height="24px" />
            </div>
            <div className="flex justify-between">
              <Skeleton width="120px" height="20px" />
              <Skeleton width="60px" height="24px" />
            </div>
            <div className="pt-2 border-t border-gray-700">
              <Skeleton width="120px" height="16px" className="mb-2" />
              <Skeleton width="60px" height="24px" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card">
            <div className="flex flex-col items-center text-center py-8">
              <Skeleton width="60px" height="60px" circle className="mb-4" />
              <Skeleton width="150px" height="20px" className="mb-2" />
              <Skeleton width="180px" height="16px" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
