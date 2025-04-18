import React from 'react';
import { Task } from '@/api/lib';
import {  formatTimeForDisplay } from '@/app/utils/dateUtils';

interface UpcomingTasksWidgetProps {
  tasks: Task[];
  isDark: boolean;
}

export default function UpcomingTasksWidget({ tasks, isDark }: UpcomingTasksWidgetProps) {
  return (
    <div className={`p-4 rounded-xl shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
      <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
        Upcoming Tasks
      </h3>

      <div className="space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            // Convert task time to a user-friendly local format
            let displayTime = task.time;

            // If the time is in HH:MM format, convert it to a Date object first
            if (typeof task.time === 'string' && task.time.match(/^\d{2}:\d{2}$/)) {
              const [hours, minutes] = task.time.split(':').map(Number);
              const taskDate = new Date();
              taskDate.setHours(hours, minutes, 0, 0);
              displayTime = formatTimeForDisplay(taskDate);
            } else {
              // If it's already a date string, just format it
              displayTime = formatTimeForDisplay(task.time);
            }

            return (
              <div
                key={task.id}
                className={`p-3 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-medium text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                      {task.name}
                    </h4>
                    {task.description && (
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {task.description.length > 60
                          ? `${task.description.substring(0, 60)}...`
                          : task.description}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {displayTime}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className={`text-center py-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No upcoming tasks</p>
          </div>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="mt-4 text-center">
          <button
            className={`text-sm font-medium ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            } transition-colors duration-200`}
          >
            View all tasks
          </button>
        </div>
      )}
    </div>
  );
}
