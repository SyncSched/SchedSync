'use client';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { format, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import {
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface CalendarHeaderProps {
  currentDate: Date;
  view: 'day' | 'week';
  onViewChange: (view: 'day' | 'week') => void;
  onDateChange: (date: Date) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  onViewChange,
  onDateChange
}) => {
  const { isDark } = useTheme();

  const handlePrevious = () => {
    if (view === 'day') {
      onDateChange(subDays(currentDate, 1));
    } else if (view === 'week') {
      onDateChange(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      onDateChange(addDays(currentDate, 1));
    } else if (view === 'week') {
      onDateChange(addWeeks(currentDate, 1));
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between p-2 sm:p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm md:-mt-12 mb-2 transition-colors duration-300`}>
      {/* Left section - Navigation */}
      <div className="flex items-center space-x-2 sm:space-x-4 mb-2 sm:mb-0 w-full sm:w-auto">
        <button
          onClick={handleToday}
          className={`px-2 sm:px-4 py-2 rounded-md text-sm ${
            isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          } transition-colors duration-150`}
        >
          Today
        </button>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={handlePrevious}
            className={`p-1 sm:p-2 rounded-full ${
              isDark
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            } transition-colors duration-150`}
          >
            <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={handleNext}
            className={`p-1 sm:p-2 rounded-full ${
              isDark
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            } transition-colors duration-150`}
          >
            <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className={`text-sm sm:text-lg font-semibold truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {view === 'day' ? (
            format(currentDate, 'MMM d, yyyy')
          ) : (
            `${format(currentDate, 'MMM d')} - ${format(
              addDays(currentDate, 6),
              'MMM d, yyyy'
            )}`
          )}
        </div>
      </div>

      {/* Right section - View toggle */}
      <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1 w-full sm:w-auto justify-center sm:justify-start">
        <button
          onClick={() => onViewChange('day')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex-1 sm:flex-none ${
            view === 'day'
              ? isDark
                ? 'bg-gray-700 text-gray-100'
                : 'bg-white text-gray-900 shadow-sm'
              : isDark
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Day
        </button>
        <button
          onClick={() => onViewChange('week')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 flex-1 sm:flex-none ${
            view === 'week'
              ? isDark
                ? 'bg-gray-700 text-gray-100'
                : 'bg-white text-gray-900 shadow-sm'
              : isDark
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Week
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
