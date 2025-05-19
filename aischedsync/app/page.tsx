'use client';

import { useState, useEffect } from "react";
import {
  getTodaySchedule,
  updateSchedule,
  updateUserTimezone,
  rescheduleTask,
  getRescheduledTasks,
  updateRescheduledTask,
  deleteRescheduledTask,
  updateTaskStatus,
  type Task,
  type RescheduledTask
} from '../api/lib';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Modal from './components/ui/Modal';
import { TaskForm } from './components/TaskForm';
import TaskList from './components/TaskList';
import RescheduledTasks from './components/RescheduledTasks';
import { recalculateTaskTimes } from './utils/taskUtils';
import { isTaskActive, formatToHHMM } from '@/app/utils/dateUtils';
import Goals from './components/Goals';
import RescheduleTaskForm from './components/RescheduleTaskForm';
import TaskModal from './components/TaskModal';
import EditRescheduledTaskForm from './components/EditRescheduledTaskForm';
import TaskStatusModal from './components/TaskStatusModal';



export default function Home() {



  const [mainTasks, setMainTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // State for rescheduled tasks
  const [rescheduledTasks, setRescheduledTasks] = useState<RescheduledTask[]>([]);
  const [selectedRescheduledTask, setSelectedRescheduledTask] = useState<RescheduledTask | null>(null);
  const [isEditRescheduledTaskModalOpen, setIsEditRescheduledTaskModalOpen] = useState(false);
  const [showDeleteRescheduledTaskWarning, setShowDeleteRescheduledTaskWarning] = useState(false);

  // const [user, setUser] = useState<UserInfo | null>(null);
  const { isAuthenticated } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [showTaskStatusModal, setShowTaskStatusModal] = useState(false);
  const [selectedPastTask, setSelectedPastTask] = useState<Task | null>(null);
  // Goals are now managed by the Goals component
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    const updateTimezoneInfo = async () => {
      try {
        // Get timezone information
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (isAuthenticated) {
          await updateUserTimezone(timezone);
          console.log('✅ Timezone updated successfully:', timezone);
        }
      } catch (error) {
        console.error('Failed to update timezone:', error);
      }
    };

    updateTimezoneInfo();
  }, [isAuthenticated]); // Run when authentication state changes

  useEffect(() => {
    // Find the first active task
    const activeTask = mainTasks.find(task => isTaskActive(task.time, task.duration));

    if (activeTask) {
      // Find the task element and the scrollable container
      const taskElement = document.querySelector(`[data-task-id="${activeTask.id}"]`);
      const scrollContainer = document.querySelector('.scrollable');

      if (taskElement && scrollContainer) {
        // Calculate the scroll position
        const containerRect = scrollContainer.getBoundingClientRect();
        const taskRect = taskElement.getBoundingClientRect();
        const scrollTop = taskRect.top - containerRect.top - (containerRect.height / 2) + scrollContainer.scrollTop;

        // Smooth scroll the container
        scrollContainer.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, [mainTasks]); // Re-run when tasks change

  interface TaskFormData {
    name: string;
    description: string;
    notes?: string;
    time: string;
    duration: number;
    endTime: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'PENDING' | 'COMPLETED';
    location?: string| null;
    isEmailEnabled: boolean;
    isWhatsAppEnabled: boolean;
    isTelegramEnabled: boolean;
    isCallEnabled: boolean;
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch the schedule for today's tasks
        const schedule = await getTodaySchedule();
        if (schedule && schedule.originalData) {
          setMainTasks(schedule.originalData);
        }

        // Fetch rescheduled tasks separately
        const rescheduledTasksData = await getRescheduledTasks();
        setRescheduledTasks(rescheduledTasksData);
      } catch (err) {
        console.error('Error fetching schedule:', err);
        showErrorToast('Failed to fetch schedule');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleDragStart = (e: React.DragEvent, columnType: 'main' | 'quick', index: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ columnType, index }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const dragCard = target.closest('[data-draggable="true"]');
    if (dragCard) {
      dragCard.classList.add('bg-blue-50');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const dragCard = target.closest('[data-draggable="true"]');
    if (dragCard) {
      dragCard.classList.remove('bg-blue-50');
    }
  };

  const handleDrop = async (e: React.DragEvent, targetColumnType: 'main' | 'quick', targetIndex: number) => {
    e.preventDefault();

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { columnType: sourceColumnType, index: sourceIndex } = data;

      if (sourceColumnType === targetColumnType && sourceColumnType === 'main') {
        // Create a copy of the tasks
        const tasksCopy = [...mainTasks];

        // Recalculate times
        const updatedTasks = recalculateTaskTimes(tasksCopy, sourceIndex, targetIndex);

        // Update the state first
        setMainTasks(updatedTasks);

        try {
          // Then update the backend
          await updateSchedule(updatedTasks[0].scheduleId, updatedTasks);
          showSuccessToast('Schedule updated successfully');
        } catch (err) {
          // If backend update fails, revert the state
          setMainTasks(tasksCopy);
          showErrorToast('Failed to save changes. Please try again.');
          console.log(err)
        }
      }
    } catch {
      console.error('Error in handleDrop');
      showErrorToast('Failed to update task order. Please try again.');
    }
  };

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const showInfoToast = (message: string) => {
    setToastMessage(message);
    setToastType('info');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleEditTaskSubmit = async (formData: TaskFormData) => {
    try {
      console.log(selectedTask)
      if (!selectedTask) return;
      const updatedTask: Task = {
        ...selectedTask,
        name: formData.name,
        description: formData.description,
        notes: formData.notes,
        // Use the original time from selectedTask to ensure it doesn't change
        time: selectedTask.time,
        duration: formData.duration,
        status: formData.status,
        priority: formData.priority,
        location: formData.location,
        isEmailEnabled: formData.isEmailEnabled,
        isWhatsAppEnabled: formData.isWhatsAppEnabled,
        isTelegramEnabled: formData.isTelegramEnabled,
        isCallEnabled: formData.isCallEnabled
      };
      await handleTaskUpdate(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      showErrorToast('Failed to update task');
    }
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      if (!selectedTask) return;
      const currentIndex = mainTasks.findIndex(task => task.id === updatedTask.id);
      if (currentIndex === -1) return;

      const updatedTasks = [...mainTasks];

      // Check what type of update occurred
      // Time should never change during edit, but we'll keep the check for safety
      const isTimeChanged = false; // We're preventing time changes in edit mode
      const isDurationChanged = updatedTask.duration !== selectedTask.duration;
      const isNotificationSettingsChanged =
        updatedTask.isEmailEnabled !== selectedTask.isEmailEnabled ||
        updatedTask.isWhatsAppEnabled !== selectedTask.isWhatsAppEnabled ||
        updatedTask.isTelegramEnabled !== selectedTask.isTelegramEnabled ||
        updatedTask.isCallEnabled !== selectedTask.isCallEnabled;
      const isOtherFieldsChanged =
        updatedTask.name !== selectedTask.name ||
        updatedTask.description !== selectedTask.description ||
        updatedTask.notes !== selectedTask.notes ||
        updatedTask.status !== selectedTask.status ||
        updatedTask.priority !== selectedTask.priority ||
        updatedTask.location !== selectedTask.location;

      // Update the current task
      updatedTasks[currentIndex] = updatedTask;

      // If time or duration changed, update subsequent tasks
      if (isTimeChanged || isDurationChanged) {
        let currentTime = new Date(updatedTask.time);
        currentTime = new Date(currentTime.getTime() + (updatedTask.duration * 60000));

        // Update all subsequent tasks
        for (let i = currentIndex + 1; i < updatedTasks.length; i++) {
          updatedTasks[i] = {
            ...updatedTasks[i],
            time: currentTime.toISOString()
          };
          currentTime = new Date(currentTime.getTime() + (updatedTasks[i].duration * 60000));
        }
      }
      // If only notification settings or other fields changed, no need to update times
      else if (isNotificationSettingsChanged || isOtherFieldsChanged) {
        // Just update the current task with all the new values
        updatedTasks[currentIndex] = {
          ...updatedTasks[currentIndex],
          name: updatedTask.name,
          description: updatedTask.description,
          notes: updatedTask.notes,
          status: updatedTask.status,
          priority: updatedTask.priority,
          location: updatedTask.location,
          isEmailEnabled: updatedTask.isEmailEnabled,
          isWhatsAppEnabled: updatedTask.isWhatsAppEnabled,
          isTelegramEnabled: updatedTask.isTelegramEnabled,
          isCallEnabled: updatedTask.isCallEnabled
        };
      }

      // Update the schedule with all changes
      await updateSchedule(updatedTask.scheduleId, updatedTasks);

      // Update the main tasks state
      setMainTasks(updatedTasks);

      // Fetch the updated rescheduled tasks
      const rescheduledTasksData = await getRescheduledTasks();
      setRescheduledTasks(rescheduledTasksData);

      showSuccessToast('Schedule updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      showErrorToast('Failed to update task');
    }
  };

  const handleTaskDelete = async () => {
    if (!selectedTask) return;
    try {
      // Find the index of the task to be deleted
      const taskIndex = mainTasks.findIndex(task => task.id === selectedTask.id);
      if (taskIndex === -1) return;

      // Create a copy of tasks without the deleted task
      const updatedTasks = [...mainTasks];
      updatedTasks.splice(taskIndex, 1);

      // If there are tasks below the deleted task, adjust their start times
      if (taskIndex < updatedTasks.length) {
        // If the deleted task is not the last one, we need to shift up all tasks below it
        // Get the start time of the task that was deleted
        const deletedTaskTime = new Date(selectedTask.time);

        // Update all subsequent tasks to shift them up
        let currentTime = new Date(deletedTaskTime);

        for (let i = taskIndex; i < updatedTasks.length; i++) {
          // Set the start time of this task to the current time
          updatedTasks[i] = {
            ...updatedTasks[i],
            time: currentTime.toISOString()
          };

          // Move the current time forward by this task's duration
          currentTime = new Date(currentTime.getTime() + (updatedTasks[i].duration * 60000));
        }
      }

      // Update the backend
      await updateSchedule(selectedTask.scheduleId, updatedTasks);

      // Update the main tasks state
      setMainTasks(updatedTasks);

      // Fetch the updated rescheduled tasks
      const rescheduledTasksData = await getRescheduledTasks();
      setRescheduledTasks(rescheduledTasksData);

      setIsEditModalOpen(false);
      setShowDeleteWarning(false);
      showSuccessToast('Task deleted successfully!');
    } catch (error) {
      showErrorToast('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);

    // Parse the task time correctly
    const now = new Date();
    let taskTime: Date;

    try {
      // Check if time is in HH:MM format or ISO format
      if (typeof task.time === 'string' && task.time.includes(':') && !task.time.includes('T')) {
        // Time is in HH:MM format, convert to today's date with this time
        const [hours, minutes] = task.time.split(':').map(Number);
        taskTime = new Date();
        taskTime.setHours(hours, minutes, 0, 0);
      } else {
        // Time is in ISO format
        taskTime = new Date(task.time);
      }

      console.log('Current time:', now);
      console.log('Task time:', taskTime);

      const taskEnd = new Date(taskTime.getTime() + task.duration * 60000);
      console.log('Task end time:', taskEnd);
      console.log('Is task completed?', now > taskEnd);

      // Only show the task status modal for tasks whose time interval has completed
      // AND only if they don't already have a status set (other than PENDING or IN_PROGRESS)
      if (now > taskEnd &&
          (task.status === 'PENDING' || task.status === 'IN_PROGRESS')) {
        console.log('Showing task status modal');
        setSelectedPastTask(task);
        setShowTaskStatusModal(true);
      } else if (task.status === 'COMPLETED' || task.status === 'OVERDUE' || task.status === 'RESCHEDULED') {
        // Don't show any modal for tasks that already have a status
        console.log('Task already has a status, not showing any modal');
        // Optionally show a toast to inform the user
        showInfoToast(`This task is already marked as ${task.status.toLowerCase()}`);
      } else {
        console.log('Showing regular edit modal');
        // For tasks that are not yet completed or don't have a final status, show the regular edit modal
        setSelectedTask(task);
        setSelectedRescheduledTask(null); // Clear any previously selected rescheduled task
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error('Error parsing task time:', error);
      // If there's an error parsing the time, default to showing the edit modal
      setSelectedTask(task);
      setSelectedRescheduledTask(null);
      setIsEditModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
    setSelectedRescheduledTask(null);
  };

  const handleOpenRescheduleModal = () => {
    setIsEditModalOpen(false);
    setIsRescheduleModalOpen(true);
  };

  const handleCloseRescheduleModal = () => {
    setIsRescheduleModalOpen(false);
  };

  const handleViewRelatedTask = async (taskId: string) => {
    try {
      // Find the task in the current tasks list
      const relatedTask = mainTasks.find(task => task.id === taskId);

      if (relatedTask) {
        // If the task is in the current list, just select it
        setSelectedTask(relatedTask);
        setIsEditModalOpen(true);
      } else {
        // If not found, we might need to fetch it from the server
        // For now, just show a toast message
        showErrorToast('Task not found in current view');
      }
    } catch (error) {
      console.error('Error viewing related task:', error);
      showErrorToast('Failed to view related task');
    }
  };

  const handleRescheduleSuccess = async (rescheduledTask: RescheduledTask) => {
    try {
      // Log the rescheduled task for debugging
      console.log('Task rescheduled:', rescheduledTask);

      // Fetch the updated schedule to get all tasks
      const schedule = await getTodaySchedule();
      if (schedule && schedule.originalData) {
        setMainTasks(schedule.originalData);
      }

      // Fetch the updated rescheduled tasks
      const rescheduledTasksData = await getRescheduledTasks();
      setRescheduledTasks(rescheduledTasksData);

      showSuccessToast('Task rescheduled successfully');
    } catch (error) {
      console.error('Error fetching updated schedule:', error);
      showErrorToast('Task was rescheduled but failed to refresh schedule');
    }
  };

  // Handle editing a rescheduled task
  const handleEditRescheduledTask = (rescheduledTask: RescheduledTask) => {
    setSelectedRescheduledTask(rescheduledTask);
    setIsEditRescheduledTaskModalOpen(true);
    setIsEditModalOpen(false);
  };

  // Handle closing the edit rescheduled task modal
  const handleCloseEditRescheduledTaskModal = () => {
    setIsEditRescheduledTaskModalOpen(false);
    setSelectedRescheduledTask(null);
  };

  // Handle saving edited rescheduled task
  const handleSaveEditedRescheduledTask = async (data: { newDate: string; newTime: string; reason?: string }) => {
    try {
      if (!selectedRescheduledTask) return;

      // Call the API to update the rescheduled task
      await updateRescheduledTask(
        selectedRescheduledTask.id,
        data.newDate,
        data.newTime,
        data.reason
      );

      // Fetch the updated rescheduled tasks
      const rescheduledTasksData = await getRescheduledTasks();
      setRescheduledTasks(rescheduledTasksData);

      setIsEditRescheduledTaskModalOpen(false);
      showSuccessToast('Rescheduled task updated successfully');
    } catch (error) {
      console.error('Error updating rescheduled task:', error);
      showErrorToast('Failed to update rescheduled task');
    }
  };

  // Handle deleting a rescheduled task
  const handleDeleteRescheduledTask = (rescheduledTask: RescheduledTask) => {
    setSelectedRescheduledTask(rescheduledTask);
    setShowDeleteRescheduledTaskWarning(true);
    setIsEditModalOpen(false);
  };

  // Handle confirming delete of rescheduled task
  const handleConfirmDeleteRescheduledTask = async () => {
    try {
      if (!selectedRescheduledTask) return;

      // Call the API to delete the rescheduled task
      await deleteRescheduledTask(selectedRescheduledTask.id);

      // Fetch the updated rescheduled tasks
      const rescheduledTasksData = await getRescheduledTasks();
      setRescheduledTasks(rescheduledTasksData);

      setShowDeleteRescheduledTaskWarning(false);
      setSelectedRescheduledTask(null);
      showSuccessToast('Rescheduled task deleted successfully');
    } catch (error) {
      console.error('Error deleting rescheduled task:', error);
      showErrorToast('Failed to delete rescheduled task');
    }
  };

  // Handle canceling delete of rescheduled task
  const handleCancelDeleteRescheduledTask = () => {
    setShowDeleteRescheduledTaskWarning(false);
    setSelectedRescheduledTask(null);
  };

  // Goal handlers are now managed by the Goals component

  const renderTaskTime = (task: Task) => {
    return formatToHHMM(task.time);
  };

  return (
    <div className={`flex flex-col md:flex-row h-full min-h-screen w-full md:-mt-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Main Content */}
      <div className={`flex-1 h-full min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300 p-4`}>
        {/* Task List and Side Cards */}
        <div className={`h-full space-y-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
          <div className={`flex flex-col md:flex-row gap-4 md:gap-6 h-full ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
            <div className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
              <TaskList
                tasks={mainTasks}
                isLoading={isLoading}
                onTaskClick={handleTaskClick}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            </div>

            <div className={`w-full md:w-80 space-y-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
              <Goals />

              <RescheduledTasks
                rescheduledTasks={rescheduledTasks}
                onTaskClick={(task, rescheduledTask) => {
                  setSelectedTask(task);
                  setSelectedRescheduledTask(rescheduledTask);
                  setIsEditModalOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && selectedTask && (
        selectedRescheduledTask ? (
          // Use TaskModal for tasks with rescheduled details
          <TaskModal
            task={selectedTask}
            onClose={handleCloseModal}
            rescheduledTask={selectedRescheduledTask}
            initialTab="rescheduled"
            onEdit={handleEditRescheduledTask}
            onDelete={handleDeleteRescheduledTask}
          />
        ) : (
          // Use the regular edit form for normal tasks
          <Modal
            title="Edit Task"
            onClose={handleCloseModal}
            size="md"
          >
            <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} transition-colors duration-300`}>
              <TaskForm
                mode="edit"
                onSubmit={handleEditTaskSubmit}
                onClose={handleCloseModal}
                onDelete={() => setShowDeleteWarning(true)}
                onReschedule={handleOpenRescheduleModal}
                onViewRelatedTask={handleViewRelatedTask}
                initialTask={{
                  name: selectedTask!.name,
                  description: selectedTask!.description || '',
                  notes: selectedTask!.notes || '',
                  time: renderTaskTime(selectedTask!),
                  duration: selectedTask!.duration,
                  priority: selectedTask!.priority || 'MEDIUM',
                  status: (selectedTask!.status === 'PENDING' || selectedTask!.status === 'COMPLETED') ? selectedTask!.status : 'PENDING',
                  location: selectedTask!.location,
                  isEmailEnabled: selectedTask!.isEmailEnabled,
                  isWhatsAppEnabled: selectedTask!.isWhatsAppEnabled,
                  isTelegramEnabled: selectedTask!.isTelegramEnabled,
                  isCallEnabled: selectedTask!.isCallEnabled
                }}
              />
            </div>
          </Modal>
        )
      )}

      {showDeleteWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-sm mx-4 transition-colors duration-300`}>
            <h3 className={`text-lg font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4 transition-colors duration-300`}>Delete Task</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6 transition-colors duration-300`}>
              Are you sure you want to delete this task? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteWarning(false)}
                className={`inline-flex items-center px-4 py-2 border ${
                  isDark ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                } text-sm font-medium rounded-md transition-colors duration-300`}
              >
                Cancel
              </button>

              <button
                onClick={handleTaskDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isRescheduleModalOpen && selectedTask && (
        <Modal
          title="Reschedule Task"
          onClose={handleCloseRescheduleModal}
          size="md"
        >
          <RescheduleTaskForm
            task={selectedTask}
            onClose={handleCloseRescheduleModal}
            onSuccess={handleRescheduleSuccess}
          />
        </Modal>
      )}

      {/* Edit Rescheduled Task Modal */}
      {isEditRescheduledTaskModalOpen && selectedRescheduledTask && (
        <Modal
          title="Edit Rescheduled Task"
          onClose={handleCloseEditRescheduledTaskModal}
          size="md"
        >
          <EditRescheduledTaskForm
            rescheduledTask={selectedRescheduledTask}
            onClose={handleCloseEditRescheduledTaskModal}
            onSave={handleSaveEditedRescheduledTask}
          />
        </Modal>
      )}

      {/* Delete Rescheduled Task Warning */}
      {showDeleteRescheduledTaskWarning && selectedRescheduledTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-sm mx-4 transition-colors duration-300`}>
            <h3 className={`text-lg font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4 transition-colors duration-300`}>Delete Rescheduled Task</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6 transition-colors duration-300`}>
              Are you sure you want to delete this rescheduled task? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelDeleteRescheduledTask}
                className={`inline-flex items-center px-4 py-2 border ${
                  isDark ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                } text-sm font-medium rounded-md transition-colors duration-300`}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDeleteRescheduledTask}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Status Modal - Highest z-index to ensure it's on top */}
      {showTaskStatusModal && selectedPastTask && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
          <TaskStatusModal
            task={selectedPastTask}
            onClose={() => {
              console.log('Closing task status modal');
              setShowTaskStatusModal(false);
            }}
            onComplete={async (task) => {
              try {
                console.log('Marking task as completed:', task.id);
                await updateTaskStatus(task.id, 'COMPLETED');
                setShowTaskStatusModal(false);
                showSuccessToast('Task marked as completed');

                // Refresh the task list
                const schedule = await getTodaySchedule();
                if (schedule && schedule.originalData) {
                  setMainTasks(schedule.originalData);
                }
              } catch (error) {
                console.error('Error marking task as completed:', error);
                showErrorToast('Failed to update task status');
              }
            }}
            onNotComplete={async (task) => {
              try {
                // Check if the task has a specific status (like OVERDUE)
                const status = task.status || 'PENDING';
                console.log(`Marking task as ${status}:`, task.id);

                await updateTaskStatus(task.id, status);
                setShowTaskStatusModal(false);

                if (status === 'OVERDUE') {
                  showErrorToast('Task marked as overdue');
                } else if (status === 'RESCHEDULED') {
                  showSuccessToast('Task marked as rescheduled');
                } else {
                  showErrorToast('Task marked as not completed');
                }

                // Refresh the task list
                const schedule = await getTodaySchedule();
                if (schedule && schedule.originalData) {
                  setMainTasks(schedule.originalData);
                }
              } catch (error) {
                console.error('Error updating task status:', error);
                showErrorToast('Failed to update task status');
              }
            }}
            onReschedule={(task) => {
              console.log('Rescheduling task:', task.id);
              setSelectedTask(task);
              setShowTaskStatusModal(false);
              setIsRescheduleModalOpen(true);
            }}
          />
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${
          toastType === 'success'
            ? 'bg-green-500'
            : toastType === 'error'
              ? 'bg-red-500'
              : 'bg-blue-500'  // info toast
        } transition-opacity duration-300`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
