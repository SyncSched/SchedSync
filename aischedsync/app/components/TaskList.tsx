import { Task } from '@/api/lib';
import { isTaskActive, formatToHHMM } from '../utils/dateUtils';
import Loading from './Loading';
import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onTaskClick: (task: Task) => void;
  onDragStart: (e: React.DragEvent, columnType: 'main' | 'quick', index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnType: 'main' | 'quick', index: number) => void;
}

export default function TaskList({
  tasks,
  isLoading,
  onTaskClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop
}: TaskListProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const { isDark } = useTheme();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Find the active task index
  const activeTaskIndex = tasks.findIndex(task => isTaskActive(task.time, task.duration));

  const handleTaskClick = (task: Task, index: number, isPastTask: boolean) => {
    // Only allow clicking on tasks that are PENDING or IN_PROGRESS
    // Tasks with other statuses (COMPLETED, OVERDUE, RESCHEDULED) should not be clickable
    if (task.status === 'PENDING' || task.status === 'IN_PROGRESS' || !task.status) {
      onTaskClick(task);
    }
  };

  return (
    <div className={`flex-1 ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm min-h-[400px] md:min-h-[500px] overflow-y-auto max-h-[500px] scrollable transition-colors duration-300`}>
      <div className="space-y-4">
        {isLoading ? (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
            <Loading />
          </div>
        ) : tasks.length === 0 ? (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
            <Loading />
          </div>
        ) : (
          tasks.map((task, index) => {
            const taskStart = new Date();
            taskStart.setHours(parseInt(task.time.split(':')[0]), parseInt(task.time.split(':')[1]));
            const taskEnd = new Date(taskStart);
            taskEnd.setMinutes(taskStart.getMinutes() + task.duration);
            const isActive = isTaskActive(task.time, task.duration);
            const isPastTask = activeTaskIndex !== -1 && index < activeTaskIndex;

            return (
              <div
                key={task.id}
                data-task-id={task.id}
                draggable
                data-draggable="true"
                onDragStart={(e) => onDragStart(e, 'main', index)}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, 'main', index)}
                onClick={() => handleTaskClick(task, index, isPastTask)}
                className={`p-4 rounded-xl border shadow-sm transition-all ${
                  // Make tasks with statuses not appear clickable
                  task.status === 'COMPLETED' || task.status === 'OVERDUE' || task.status === 'RESCHEDULED'
                    ? 'cursor-default'
                    : 'cursor-pointer hover:shadow'
                } ${
                  isPastTask
                    ? isDark
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      : 'bg-[#f5f5f5] border-gray-200 hover:bg-gray-100'
                    : isDark
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                      : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className={`font-medium text-sm md:text-base ${
                      // Add visual indicator for tasks with statuses (dimmer text)
                      task.status === 'COMPLETED' || task.status === 'OVERDUE' || task.status === 'RESCHEDULED'
                        ? isDark ? 'text-gray-500' : 'text-gray-500'
                        : isPastTask
                          ? isDark ? 'text-gray-400' : 'text-gray-500'
                          : isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}>{task.name}</h3>
                    {isActive && (
                      <span className={`inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium ${
                        isDark
                          ? 'bg-green-800/30 text-[#22c55e] border-[0.25px] border-[#22c55e]'
                          : 'bg-green-100 text-[#22c55e] border-[0.25px] border-[#22c55e]'
                      }`}>
                        <span className="size-1.5 inline-block rounded-full bg-[#22c55e] animate-pulse shadow-sm shadow-green-400" />
                        {currentTime}
                      </span>
                    )}
                  </div>
                  <button
                    className={`${
                      task.status === 'COMPLETED' || task.status === 'OVERDUE' || task.status === 'RESCHEDULED'
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                    } ${
                      isPastTask
                        ? isDark ? 'text-gray-500 hover:text-gray-400' : 'text-gray-300 hover:text-gray-500'
                        : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Only allow clicking on tasks that are PENDING or IN_PROGRESS
                      if (task.status === 'PENDING' || task.status === 'IN_PROGRESS' || !task.status) {
                        onTaskClick(task);
                      }
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <svg className={`w-4 h-4 ${
                        isPastTask
                          ? isDark ? 'text-gray-500' : 'text-gray-300'
                          : isDark ? 'text-gray-400' : 'text-gray-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span className={`text-sm ${
                        isPastTask
                          ? isDark ? 'text-gray-500' : 'text-gray-400'
                          : isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>{formatToHHMM(task.time)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className={`w-4 h-4 ${
                        isPastTask
                          ? isDark ? 'text-gray-500' : 'text-gray-300'
                          : isDark ? 'text-gray-400' : 'text-gray-400'
                      }`} viewBox="0 0 16 16" fill="currentColor">
                        <path d="M6.16 4.6A4.054 4.054 0 0 1 8 7.994v0c0-1.415.726-2.66 1.825-3.384.23-.199.426-.395.609-.602L5.56 4.001c.19.214.386.41.593.594z"/>
                        <path d="M11.18 6.06A4.399 4.399 0 0 0 13 2.5V2h1V0H2v2h1v.5a4.391 4.391 0 0 0 1.808 3.551A2.564 2.564 0 0 1 6 7.99a2.755 2.755 0 0 1-1.209 2.003 4.441 4.441 0 0 0-1.79 3.503v.503h-1v2h12v-2h-1v-.5a4.435 4.435 0 0 0-1.769-3.492 2.762 2.762 0 0 1-1.23-1.996 2.551 2.551 0 0 1 1.169-1.946zM9 8a3.693 3.693 0 0 0 1.519 2.763A3.477 3.477 0 0 1 12 13.495V14h-1.77c-.7-.87-1.71-2-2.23-2s-1.53 1.13-2.23 2H4v-.5a3.472 3.472 0 0 1 1.459-2.723 3.698 3.698 0 0 0 1.54-2.766 3.482 3.482 0 0 0-1.498-2.683 3.438 3.438 0 0 1-1.502-2.827v-.5h8v.5a3.426 3.426 0 0 1-1.479 2.813 3.487 3.487 0 0 0-1.521 2.678z"/>
                      </svg>
                      <span className={`text-sm ${
                        isPastTask
                          ? isDark ? 'text-gray-500' : 'text-gray-400'
                          : isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {Math.floor(task.duration / 60) > 0 ? `${Math.floor(task.duration / 60)} hour ` : ''}
                        {task.duration % 60 > 0 ? `${task.duration % 60} min` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Task Status Badge - Only show for tasks up to the current running task */}
                  {task.status && (index <= activeTaskIndex || isPastTask) && (
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm transition-all duration-200 ${
                      task.status === 'COMPLETED'
                        ? isDark
                          ? 'bg-green-900/40 text-green-300 border border-green-700/60 backdrop-blur-sm'
                          : 'bg-green-50 text-green-700 border border-green-200 backdrop-blur-sm'
                        : task.status === 'PENDING'
                          ? isDark
                            ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/60 backdrop-blur-sm'
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200 backdrop-blur-sm'
                          : task.status === 'OVERDUE'
                            ? isDark
                              ? 'bg-red-900/40 text-red-300 border border-red-700/60 backdrop-blur-sm'
                              : 'bg-red-50 text-red-700 border border-red-200 backdrop-blur-sm'
                            : task.status === 'RESCHEDULED'
                              ? isDark
                                ? 'bg-purple-900/40 text-purple-300 border border-purple-700/60 backdrop-blur-sm'
                                : 'bg-purple-50 text-purple-700 border border-purple-200 backdrop-blur-sm'
                              : isDark
                                ? 'bg-blue-900/40 text-blue-300 border border-blue-700/60 backdrop-blur-sm'
                                : 'bg-blue-50 text-blue-700 border border-blue-200 backdrop-blur-sm'
                    }`}>
                      {task.status === 'COMPLETED' && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-medium">Completed</span>
                        </div>
                      )}
                      {task.status === 'PENDING' && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Pending</span>
                        </div>
                      )}
                      {task.status === 'OVERDUE' && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="font-medium">Overdue</span>
                        </div>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="font-medium">In Progress</span>
                        </div>
                      )}
                      {task.status === 'RESCHEDULED' && (
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">Rescheduled</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}