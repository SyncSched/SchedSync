import { TaskForm, TaskFormData } from './TaskForm';
import Modal from './ui/Modal';
import { useState } from 'react';
import { Task, updateSchedule } from '@/api/lib';

const Schedule: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTaskSubmit = async (formData: TaskFormData) => {
    try {
      console.log('Form data received:', formData);

      const newTask: Task = {
        id: `temp-${Date.now()}`,
        scheduleId: tasks[0]?.scheduleId || '',
        ...formData
      };

      console.log('New task object:', newTask);

      const updatedTasks = [...tasks, newTask];
      const result = await updateSchedule(newTask.scheduleId, updatedTasks);
      
      console.log('API response:', result);
      
      setTasks(updatedTasks);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  return (
    <div>
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <TaskForm
            onSubmit={handleTaskSubmit}
            onClose={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default Schedule;
