import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getTodaySchedule, updateSchedule, type Task } from '@/api/lib';
import { TaskForm, TaskFormData } from './TaskForm';
import Modal from './ui/Modal';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();

  const handleAddTask = async (formData: TaskFormData) => {
    try {
      const schedule = await getTodaySchedule();
      const scheduleId = schedule?.originalData?.[0]?.scheduleId || '';

      let taskTime: string;

      if (schedule?.originalData?.length > 0) {
        // If there are existing tasks, set time after the last task
        const lastTask = schedule.originalData[schedule.originalData.length - 1];
        const lastTaskTime = new Date(lastTask.time);
        const lastTaskEndTime = new Date(lastTaskTime.getTime() + (lastTask.duration * 60000));

        // Use the end time of the last task as the start time for the new task
        taskTime = lastTaskEndTime.toISOString();
      } else {
        // If no tasks, use the current time
        const now = new Date();
        taskTime = now.toISOString();
      }

      // Create new task
      const newTaskObject: Task = {
        id: `temp-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        notes: formData.notes,
        time: taskTime,
        duration: formData.duration,
        scheduleId: scheduleId,
        priority: formData.priority,
        status: formData.status,
        location: formData.location,
        isEmailEnabled: formData.isEmailEnabled,
        // isWhatsAppEnabled: formData.isWhatsAppEnabled, // WhatsApp notification option commented out
        isTelegramEnabled: formData.isTelegramEnabled,
        // isCallEnabled: formData.isCallEnabled // Phone Call notification option commented out
      };

      const updatedTasks = [...(schedule?.originalData || []), newTaskObject];
      await updateSchedule(scheduleId, updatedTasks);

      onClose();

      // Refresh the page to show the new task
      window.location.reload();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      title="Add New Task"
      onClose={onClose}
      size="md"
    >
      <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
        <TaskForm
          mode="add"
          onSubmit={handleAddTask}
          onClose={onClose}
          initialTask={{
            name: '',
            description: '',
            notes: '',
            time: new Date().toISOString(),
            duration: 30,
            priority: 'MEDIUM',
            status: 'PENDING',
            isEmailEnabled: false,
            // isWhatsAppEnabled: false, // WhatsApp notification option commented out
            isTelegramEnabled: false,
            // isCallEnabled: false // Phone Call notification option commented out
          }}
        />
      </div>
    </Modal>
  );
};

export default AddTaskModal;
