import React from 'react';

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  adherenceRate: number;
  lastSevenDays: boolean[];
  isDark: boolean;
}

export default function StreakWidget({
  currentStreak,
  longestStreak,
  adherenceRate,
  lastSevenDays,
  isDark
}: StreakWidgetProps) {
  return (
    <div className={`p-4 rounded-xl shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
      <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
        Your Progress
      </h3>

      <div className="space-y-4">
        {/* Current Streak */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Current Streak</span>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {currentStreak} days
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${(currentStreak / longestStreak) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Longest Streak */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Longest Streak</span>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {longestStreak} days
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>

        {/* Schedule Adherence */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Schedule Adherence</span>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {adherenceRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className={`h-2.5 rounded-full ${
                adherenceRate >= 80
                  ? 'bg-green-500'
                  : adherenceRate >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${adherenceRate}%` }}
            ></div>
          </div>
        </div>

        {/* Streak Visualization */}
        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Last 7 Days</span>
          </div>
          <div className="flex justify-between">
            {/* Real data for streak visualization */}
            {lastSevenDays.map((day, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  day
                    ? isDark
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-green-100 text-green-600'
                    : isDark
                    ? 'bg-gray-700 text-gray-500'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {day ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
