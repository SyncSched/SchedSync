'use client';
import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Task } from '@/api/lib';
import Modal from '@/app/components/ui/Modal';
import { Clock, MapPin, AlertTriangle } from 'lucide-react';

interface TaskModalProps {
  mode: 'add' | 'edit';
  initialTask?: Task | null;
  selectedDate?: Date;
  selectedHour?: number | null;
  onClose: () => void;
  onSave: (formData: TaskFormData) => void;
  onDelete?: (task: Task) => void;
}

interface TaskFormData {
  name: string;
  description: string;
  notes: string;
  duration: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS';
  location: string;
  isEmailEnabled: boolean;
  isWhatsAppEnabled: boolean;
  isTelegramEnabled: boolean;
  isCallEnabled: boolean;
  time?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({
  mode,
  initialTask,
  selectedDate,
  selectedHour,
  onClose,
  onSave,
  onDelete
}) => {
  const { isDark } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isGoogleEvent = initialTask ? !('scheduleId' in initialTask) : false;

  // Initialize form data with initial task or defaults
  const [formData, setFormData] = useState<TaskFormData>(() => {
    const newDate = new Date(selectedDate || new Date());
    if (typeof selectedHour === 'number') {
      newDate.setHours(selectedHour, 0, 0, 0);
    }
    
    return {
      name: initialTask?.name || '',
      description: initialTask?.description || '',
      notes: initialTask?.notes || '',
      duration: initialTask?.duration || 30,
      priority: initialTask?.priority || 'MEDIUM',
      status: (initialTask?.status || 'PENDING') as 'PENDING' | 'COMPLETED' | 'IN_PROGRESS',
      location: initialTask?.location || '',
      isEmailEnabled: initialTask?.isEmailEnabled || false,
      isWhatsAppEnabled: initialTask?.isWhatsAppEnabled || false,
      isTelegramEnabled: initialTask?.isTelegramEnabled || false,
      isCallEnabled: initialTask?.isCallEnabled || false,
      time: initialTask?.time || newDate.toISOString()
    };
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleDelete = () => {
    if (onDelete && initialTask) {
      onDelete(initialTask);
    }
    onClose();
  };

  return (
    <Modal onClose={onClose} title={mode === 'add' ? 'Add Task' : 'Edit Task'}>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {isGoogleEvent && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              isDark ? 'bg-indigo-900/30 text-indigo-200' : 'bg-indigo-50 text-indigo-800'
            }`}>
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">
                This is a Google Calendar event. You can view details but cannot edit it here.
              </p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Task Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isGoogleEvent}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Duration (minutes)</span>
              </div>
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              disabled={isGoogleEvent}
              min={5}
              max={1440}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              required
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isGoogleEvent}
              rows={3}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
          </div>

          {/* Location */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </div>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              disabled={isGoogleEvent}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={isGoogleEvent}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={isGoogleEvent}
                className={`mt-1 block w-full rounded-md shadow-sm ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-100'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={isGoogleEvent}
              rows={2}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
          </div>

          {/* Notification Settings */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Notifications
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isEmailEnabled"
                  checked={formData.isEmailEnabled}
                  onChange={handleInputChange}
                  disabled={isGoogleEvent}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Email
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isWhatsAppEnabled"
                  checked={formData.isWhatsAppEnabled}
                  onChange={handleInputChange}
                  disabled={isGoogleEvent}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  WhatsApp
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isTelegramEnabled"
                  checked={formData.isTelegramEnabled}
                  onChange={handleInputChange}
                  disabled={isGoogleEvent}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Telegram
                </span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isCallEnabled"
                  checked={formData.isCallEnabled}
                  onChange={handleInputChange}
                  disabled={isGoogleEvent}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Phone Call
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-5">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isDark
                  ? 'bg-gray-600 text-gray-100 hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition-colors duration-150`}
            >
              Cancel
            </button>

            {!isGoogleEvent && (
              <>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150"
                >
                  {mode === 'add' ? 'Add Task' : 'Save Changes'}
                </button>

                {mode === 'edit' && onDelete && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors duration-150"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-sm mx-4`}>
            <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Delete Task
            </h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isDark
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TaskModal;
