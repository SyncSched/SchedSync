'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { format } from 'date-fns';

interface TimeColumnProps {
  startHour?: number; // Default: 0
  endHour?: number; // Default: 24
}

const TimeColumn: React.FC<TimeColumnProps> = ({
  startHour = 0,
  endHour = 24
}) => {
  const { isDark } = useTheme();
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  return (
    <div className="w-12 sm:w-16 shrink-0 relative border-r border-gray-200 dark:border-gray-700">
      {/* Add a container with the same total height as the day columns */}
      <div className="relative" style={{ height: `${(endHour - startHour + 1) * 100}px` }}>
        {hours.map(hour => {
          const time = new Date();
          time.setHours(hour, 0, 0);

          return (
            <div
              key={hour}
              className="absolute w-full flex items-start justify-end pr-1 sm:pr-2"
              style={{
                top: `${(hour - startHour) * 100}px`,  // Updated to match new 100px height
                height: '100px' // Updated to match new height
              }}
            >
              <span className={`text-[10px] sm:text-xs -translate-y-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {format(time, 'HH:mm')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimeColumn;
