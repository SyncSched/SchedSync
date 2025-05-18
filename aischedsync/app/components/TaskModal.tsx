'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Task, RescheduledTask } from '@/api/lib';
import { formatToHHMM, formatDate } from '../utils/dateUtils';

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
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    task.status === 'COMPLETED'
                      ? isDark
                        ? 'bg-green-900 text-green-200'
                        : 'bg-green-100 text-green-800'
                      : task.status === 'IN_PROGRESS'
                      ? isDark
                        ? 'bg-blue-900 text-blue-200'
                        : 'bg-blue-100 text-blue-800'
                      : task.status === 'OVERDUE'
                      ? isDark
                        ? 'bg-red-900 text-red-200'
                        : 'bg-red-100 text-red-800'
                      : isDark
                      ? 'bg-yellow-900 text-yellow-200'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>

              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Priority
                </p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    task.priority === 'HIGH'
                      ? isDark
                        ? 'bg-red-900 text-red-200'
                        : 'bg-red-100 text-red-800'
                      : task.priority === 'MEDIUM'
                      ? isDark
                        ? 'bg-yellow-900 text-yellow-200'
                        : 'bg-yellow-100 text-yellow-800'
                      : isDark
                      ? 'bg-green-900 text-green-200'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
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
