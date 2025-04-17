import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface DashboardStatsProps {
  title: string;
  value: number;
  icon: string;
  change: number;
  changeLabel: string;
  positive?: boolean;
}

export default function DashboardStats({
  title,
  value,
  icon,
  change,
  changeLabel,
  positive = true
}: DashboardStatsProps) {
  const { isDark } = useTheme();

  const renderIcon = () => {
    switch (icon) {
      case 'clipboard-list':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case 'check-circle':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'clock':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'exclamation-circle':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`p-4 rounded-xl shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{title}</h3>
        <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <span className={isDark ? 'text-blue-400' : 'text-blue-500'}>{renderIcon()}</span>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          <div className="flex items-center mt-1">
            <span className={`text-xs font-medium ${
              change > 0 
                ? positive 
                  ? 'text-green-500' 
                  : 'text-red-500'
                : change < 0
                ? positive
                  ? 'text-red-500'
                  : 'text-green-500'
                : isDark
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}>
              {change > 0 ? '↑' : change < 0 ? '↓' : '•'} {Math.abs(change)}
            </span>
            <span className={`text-xs ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {changeLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
