import React, { useState } from 'react';

interface TaskFormProps {
  onSubmit: (task: TaskFormData) => void;
  onClose: () => void;
}

// Add export to the interface
export interface TaskFormData {
  name: string;
  time: string;
  duration: number;
  isEmailEnabled: boolean;
  isWhatsAppEnabled: boolean;
  isTelegramEnabled: boolean;
  isCallEnabled: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    time: '',
    duration: 30,
    isEmailEnabled: false,
    isWhatsAppEnabled: false,
    isTelegramEnabled: false,
    isCallEnabled: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Debug log
    console.log(`Field ${name} changed:`, type === 'checkbox' ? checked : value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData); // Debug log
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Task Name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Time
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Duration (minutes)
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isEmailEnabled"
            checked={formData.isEmailEnabled}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Email Notifications</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isWhatsAppEnabled"
            checked={formData.isWhatsAppEnabled}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">WhatsApp Notifications</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isTelegramEnabled"
            checked={formData.isTelegramEnabled}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Telegram Notifications</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isCallEnabled"
            checked={formData.isCallEnabled}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Phone Call Notifications</span>
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>
    </form>
  );
};
