import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { formatToHHMM, formatDate } from '../utils/dateUtils';
import { Task, RescheduledTask, rescheduleTask } from '@/api/lib';

interface RescheduleTaskFormProps {
  task: Task;
  onClose: () => void;
  onSuccess: (rescheduledTask: RescheduledTask) => void;
}

export const RescheduleTaskForm: React.FC<RescheduleTaskFormProps> = ({
  task,
  onClose,
  onSuccess
}) => {
  const { isDark } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with current task date and time
  const initialDate = formatDate(task.time, 'yyyy-MM-dd');
  const initialTime = formatToHHMM(task.time);

  const [formData, setFormData] = useState({
    newDate: initialDate,
    newTime: initialTime,
    reason: ''
  });


  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get the new date and time values
      const newDate = formData.newDate;
      const newTime = formData.newTime;
      const reason = formData.reason || undefined;

      // Call the rescheduleTask API
      const rescheduledTask = await rescheduleTask(
        task.id,
        newDate,
        newTime,
        reason
      );

      onSuccess(rescheduledTask);
      onClose();
    } catch (error) {
      console.error('Error rescheduling task:', error);
      setError('Failed to reschedule task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg`}>
      <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Reschedule Task
      </h2>

      <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <h3 className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{task.name}</h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Currently scheduled for: {formatToHHMM(task.time)}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            New Date
          </label>
          <input
            type="date"
            name="newDate"
            value={formData.newDate}
            onChange={handleChange}
            required
            className={`w-full p-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 ${
              isDark ? 'focus:ring-blue-500' : 'focus:ring-blue-500'
            }`}
            min={new Date().toISOString().split('T')[0]}
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            New Time
          </label>
          <input
            type="time"
            name="newTime"
            value={formData.newTime}
            onChange={handleChange}
            required
            className={`w-full p-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 ${
              isDark ? 'focus:ring-blue-500' : 'focus:ring-blue-500'
            }`}
            placeholder={getCurrentTime()}
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Reason (Optional)
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={3}
            className={`w-full p-2 rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 ${
              isDark ? 'focus:ring-blue-500' : 'focus:ring-blue-500'
            }`}
            placeholder="Why are you rescheduling this task?"
          />
        </div>

        <div className="mb-6">
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            The original task will remain in your schedule, and this rescheduled information will be stored for reference.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
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
            className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Rescheduling...' : 'Reschedule Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RescheduleTaskForm;
