'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { RescheduledTask } from '@/api/lib';
import { formatToHHMM, formatDate } from '../utils/dateUtils';

interface EditRescheduledTaskFormProps {
  rescheduledTask: RescheduledTask;
  onClose: () => void;
  onSave: (updatedTask: { newDate: string; newTime: string; reason?: string }) => void;
}

export default function EditRescheduledTaskForm({
  rescheduledTask,
  onClose,
  onSave
}: EditRescheduledTaskFormProps) {
  const { isDark } = useTheme();
  
  // Initialize form data with current values
  const [formData, setFormData] = useState({
    newDate: formatDate(rescheduledTask.rescheduledDate, 'yyyy-MM-dd'),
    newTime: rescheduledTask.rescheduledTime,
    reason: rescheduledTask.reason || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Call the onSave function with the updated data
      await onSave({
        newDate: formData.newDate,
        newTime: formData.newTime,
        reason: formData.reason || undefined
      });
      
      onClose();
    } catch (err) {
      console.error('Error updating rescheduled task:', err);
      setError('Failed to update rescheduled task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg`}>
      <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      </h2>

      <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          {rescheduledTask.task?.name || 'Task'}
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Originally scheduled for: {formatToHHMM(rescheduledTask.originalTaskTime)}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label 
            htmlFor="newDate" 
            className={`block mb-1 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            New Date
          </label>
          <input
            type="date"
            id="newDate"
            name="newDate"
            value={formData.newDate}
            onChange={handleChange}
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500'
            } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
            required
          />
        </div>

        <div className="mb-4">
          <label 
            htmlFor="newTime" 
            className={`block mb-1 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            New Time
          </label>
          <input
            type="time"
            id="newTime"
            name="newTime"
            value={formData.newTime}
            onChange={handleChange}
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500'
            } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
            required
          />
        </div>

        <div className="mb-4">
          <label 
            htmlFor="reason" 
            className={`block mb-1 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            Reason (Optional)
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className={`w-full p-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500' 
                : 'bg-white text-gray-900 border-gray-300 focus:border-blue-500'
            } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
            rows={3}
          />
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-md ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } transition-colors`}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-md ${
              isDark 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } transition-colors`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
