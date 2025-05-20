'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Task, RescheduledTask } from '@/api/lib';
import { formatToHHMM } from '../utils/dateUtils';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  rescheduledTask?: RescheduledTask | null;
  initialTab?: 'details' | 'rescheduled';
  onEdit?: (rescheduledTask: RescheduledTask) => void;
  onDelete?: (rescheduledTask: RescheduledTask) => void;
}

export default function TaskModal({
  task,
  onClose,
  rescheduledTask = null,
  initialTab = 'details',
  onEdit,
  onDelete
}: TaskModalProps) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'details' | 'rescheduled'>(initialTab);

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Check if edit and delete functions are provided
  const canEdit = !!onEdit && !!rescheduledTask;
  const canDelete = !!onDelete && !!rescheduledTask;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`w-full max-w-md rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300 max-h-[90vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {task.name}
            </h2>
            <button
              onClick={onClose}
              className={`p-1 rounded-full hover:bg-opacity-10 ${isDark ? 'hover:bg-gray-300' : 'hover:bg-gray-700'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDark ? 'text-gray-300' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          {rescheduledTask && (
            <div className="flex mt-4 border-b border-gray-200 dark:border-gray-700">
              <button
                className={`py-2 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'details'
                    ? isDark
                      ? 'border-blue-500 text-blue-400'
                      : 'border-blue-600 text-blue-600'
                    : isDark
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('details')}
              >
                Task Details
              </button>
              <button
                className={`py-2 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'rescheduled'
                    ? isDark
                      ? 'border-blue-500 text-blue-400'
                      : 'border-blue-600 text-blue-600'
                    : isDark
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('rescheduled')}
              >
                Rescheduled Details
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'details' ? (
            <div className="space-y-4">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Time
                </p>
                <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatDisplayDate(task.time)} at {formatToHHMM(task.time)}
                </p>
              </div>

              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Duration
                </p>
                <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {task.duration} minutes
                </p>
              </div>

              {task.description && (
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Description
                  </p>
                  <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {task.description}
                  </p>
                </div>
              )}

              {task.notes && (
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Notes
                  </p>
                  <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {task.notes}
                  </p>
                </div>
              )}

              {task.location && (
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Location
                  </p>
                  <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {task.location}
                  </p>
                </div>
              )}

              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Status
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm border ${
                    task.status === 'COMPLETED'
                      ? isDark
                        ? 'bg-green-900/40 text-green-300 border-green-700/60 backdrop-blur-sm'
                        : 'bg-green-50 text-green-700 border-green-200 backdrop-blur-sm'
                      : task.status === 'IN_PROGRESS'
                      ? isDark
                        ? 'bg-blue-900/40 text-blue-300 border-blue-700/60 backdrop-blur-sm'
                        : 'bg-blue-50 text-blue-700 border-blue-200 backdrop-blur-sm'
                      : task.status === 'OVERDUE'
                      ? isDark
                        ? 'bg-red-900/40 text-red-300 border-red-700/60 backdrop-blur-sm'
                        : 'bg-red-50 text-red-700 border-red-200 backdrop-blur-sm'
                      : task.status === 'RESCHEDULED'
                      ? isDark
                        ? 'bg-purple-900/40 text-purple-300 border-purple-700/60 backdrop-blur-sm'
                        : 'bg-purple-50 text-purple-700 border-purple-200 backdrop-blur-sm'
                      : isDark
                      ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700/60 backdrop-blur-sm'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200 backdrop-blur-sm'
                  }`}>
                    {task.status === 'COMPLETED' && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="sr-only">Completed</span>
                      </div>
                    )}
                    {task.status === 'PENDING' && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="sr-only">Pending</span>
                      </div>
                    )}
                    {task.status === 'OVERDUE' && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="sr-only">Overdue</span>
                      </div>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="sr-only">In Progress</span>
                      </div>
                    )}
                    {task.status === 'RESCHEDULED' && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="sr-only">Rescheduled</span>
                      </div>
                    )}
                  </span>
                </div>
              </div>

              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Priority
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm border ${
                    task.priority === 'HIGH'
                      ? isDark
                        ? 'bg-red-900/40 text-red-300 border-red-700/60 backdrop-blur-sm'
                        : 'bg-red-50 text-red-700 border-red-200 backdrop-blur-sm'
                      : task.priority === 'MEDIUM'
                      ? isDark
                        ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700/60 backdrop-blur-sm'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200 backdrop-blur-sm'
                      : isDark
                      ? 'bg-green-900/40 text-green-300 border-green-700/60 backdrop-blur-sm'
                      : 'bg-green-50 text-green-700 border-green-200 backdrop-blur-sm'
                  }`}>
                    {task.priority === 'HIGH' && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="sr-only">High</span>
                      </div>
                    )}
                    {task.priority === 'MEDIUM' && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span className="sr-only">Medium</span>
                      </div>
                    )}
                    {task.priority === 'LOW' && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="sr-only">Low</span>
                      </div>
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {rescheduledTask && (
                <>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Original Time
                    </p>
                    <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatDisplayDate(rescheduledTask.originalTaskTime)} at {formatToHHMM(rescheduledTask.originalTaskTime)}
                    </p>
                  </div>

                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Rescheduled To
                    </p>
                    <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatDisplayDate(rescheduledTask.rescheduledDate)} at {rescheduledTask.rescheduledTime}
                    </p>
                  </div>

                  {rescheduledTask.reason && (
                    <div>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Reason for Rescheduling
                      </p>
                      <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {rescheduledTask.reason}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Rescheduled On
                    </p>
                    <p className={`text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {formatDisplayDate(rescheduledTask.createdAt)} at {formatToHHMM(rescheduledTask.createdAt)}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between`}>
          {/* Edit and Delete buttons for rescheduled tasks */}
          {activeTab === 'rescheduled' && (
            <div className="flex space-x-2">
              {canEdit && (
                <button
                  onClick={() => onEdit && rescheduledTask && onEdit(rescheduledTask)}
                  className={`px-4 py-2 rounded-md ${
                    isDark
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } transition-colors duration-200`}
                >
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => onDelete && rescheduledTask && onDelete(rescheduledTask)}
                  className={`px-4 py-2 rounded-md ${
                    isDark
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  } transition-colors duration-200`}
                >
                  Delete
                </button>
              )}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md ${
              isDark
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } transition-colors duration-200`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
