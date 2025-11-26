'use client';

import React from 'react';
import { Day } from '@/types';

interface WeekStripProps {
  days: Day[];
  currentDate: Date;
  onDayClick: (date: string) => void;
}

const WeekStrip: React.FC<WeekStripProps> = ({ days, currentDate, onDayClick }) => {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDayStatus = (day: Day) => {
    if (!day) return 'rest';
    if (day.completed) return 'completed';
    if (day.is_rest) return 'rest';
    return 'training';
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">本周</h2>
        <span className="text-sm text-gray-400">
          {currentDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
        </span>
      </div>
      <div className="flex justify-between space-x-2">
        {weekdays.map((weekday, index) => {
          const day = days[index];
          const status = getDayStatus(day);

          return (
            <button
              key={index}
              className={`weekday-item ${status}`}
              onClick={() => day && onDayClick(day.date)}
            >
              <span className="text-xs font-medium">{weekday}</span>
              {day && !day.is_rest && (
                <span className="text-xs mt-1">
                  {day.completed ? '✓' : day.exercises.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeekStrip;
