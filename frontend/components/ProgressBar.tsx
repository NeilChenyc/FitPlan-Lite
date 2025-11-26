'use client';

import React from 'react';

interface ProgressBarProps {
  value: number;
  maxValue: number;
  label: string;
  showPercentage?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  maxValue,
  label,
  showPercentage = true,
  className = '',
}) => {
  const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

  return (
    <div className={`progress-bar ${className}`}>
      <div
        className="progress-fill"
        style={{ width: `${percentage}%` }}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={maxValue}
      />
      <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-white">
        <span>{label}</span>
        {showPercentage && (
          <span className="font-medium">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
