'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaDumbbell, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

const Header: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-surface border-b border-gray-700 px-4 sm:px-6 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <FaDumbbell className="text-primary text-2xl" />
          <h1 className="text-xl font-bold text-primary">FitPlan Lite</h1>
        </Link>

        <nav className="flex items-center space-x-2 sm:space-x-4">
          <Link
            href="/"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isActive('/')
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <FaChartLine className="h-4 w-4" />
            <span className="hidden sm:block">概览</span>
          </Link>
          <Link
            href="/schedule"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isActive('/schedule')
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <FaCalendarAlt className="h-4 w-4" />
            <span className="hidden sm:block">日程</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
