'use client';

import { useState, useEffect } from "react";
import { getTodaySchedule, locationNotify, updateSchedule, updateUserTimezone, type Task } from '../api/lib';
import { useAuth } from '@/contexts/AuthContext';
import Modal from './components/ui/Modal';
import { TaskForm } from './components/TaskForm';
import TaskList from './components/TaskList';
import QuickTasks from './components/QuickTasks';
import { recalculateTaskTimes } from './utils/taskUtils';
import { isTaskActive, formatToHHMM } from '@/app/utils/dateUtils';
import Goals from './components/Goals';

import LocationLogger from "./components/LocationLogger";



export default function Home() {


  
  const [mainTasks, setMainTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickTasks, setQuickTasks] = useState([
    { id: 1, title: "Team Meeting", time: "2:00 PM" },
    { id: 2, title: "Review PRs", time: "4:30 PM" }
  ]);

  // const [user, setUser] = useState<UserInfo | null>(null);
  const { isAuthenticated } = useAuth();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showTaskStatusModal, setShowTaskStatusModal] = useState(false);
  const [selectedPastTask, setSelectedPastTask] = useState<Task | null>(null);
  const [goals, setGoals] = useState<{ id: number; title: string; isCompleted: boolean; }[]>([]);

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
      // Find the task element
      const taskElement = document.querySelector(`[data-task-id="${activeTask.id}"]`);
      if (taskElement) {
        // Scroll the task into view with smooth behavior
        taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [mainTasks]); // Re-run when tasks change

  useEffect(() => {
    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: userLat, longitude: userLng } = position.coords;
          console.log("Current Location:", userLat, userLng);
  
          const nearbyTaskIds = mainTasks
            .filter((task) => {
              if (!task.location) return false;
              const [latStr, lngStr] = task.location.split(",");
              const taskLat = parseFloat(latStr);
              const taskLng = parseFloat(lngStr);
              if (isNaN(taskLat) || isNaN(taskLng)) return false;
  
              const distance = getDistanceInMeters(userLat, userLng, taskLat, taskLng);
              return distance <= 100;
            })
            .map((task) => task.id);
  
          if (nearbyTaskIds.length > 0) {
            locationNotify(nearbyTaskIds);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }, 60000); // every 1 minute
  
    return () => clearInterval(intervalId); // cleanup
  }, [mainTasks]);
  const toRadians = (degree: number) => degree * (Math.PI / 180);

// Haversine formula to calculate distance between two coordinates
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // radius of Earth in meters
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

  interface TaskFormData {
    name: string;
  description: string;
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
        const schedule = await getTodaySchedule();
        if (schedule && schedule.originalData) {
          setMainTasks(schedule.originalData);
        }
      } catch (err) { // Change 'error' to 'err' and use it
        console.error('Error fetching schedule:', err);
        showErrorToast('Failed to fetch schedule');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // fetchUser();
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
      } else if (sourceColumnType === targetColumnType && sourceColumnType === 'quick') {
        const newTasks = [...quickTasks];
        const [movedTask] = newTasks.splice(sourceIndex, 1);
        newTasks.splice(targetIndex, 0, movedTask);
        setQuickTasks(newTasks);
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

  const handleEditTaskSubmit = async (formData: TaskFormData) => {
    try {
      console.log(selectedTask)
      if (!selectedTask) return;
      const updatedTask: Task = {
        ...selectedTask,
        name: formData.name,
        time: formData.time,
        duration: formData.duration,
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
      const isTimeChanged = new Date(updatedTask.time).getTime() !== new Date(selectedTask.time).getTime();
      const isDurationChanged = updatedTask.duration !== selectedTask.duration;
      const isNotificationSettingsChanged = 
        updatedTask.isEmailEnabled !== selectedTask.isEmailEnabled ||
        updatedTask.isWhatsAppEnabled !== selectedTask.isWhatsAppEnabled ||
        updatedTask.isTelegramEnabled !== selectedTask.isTelegramEnabled ||
        updatedTask.isCallEnabled !== selectedTask.isCallEnabled;

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
      // If only notification settings changed, no need to update times
      else if (isNotificationSettingsChanged) {
        // Just update the current task's notification settings
        updatedTasks[currentIndex] = {
          ...updatedTasks[currentIndex],
          isEmailEnabled: updatedTask.isEmailEnabled,
          isWhatsAppEnabled: updatedTask.isWhatsAppEnabled,
          isTelegramEnabled: updatedTask.isTelegramEnabled,
          isCallEnabled: updatedTask.isCallEnabled
        };
      }

      // Update the schedule with all changes
      await updateSchedule(updatedTask.scheduleId, updatedTasks);
      setMainTasks(updatedTasks);
      showSuccessToast('Schedule updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      showErrorToast('Failed to update task');
    }
  };

  const handleTaskDelete = async () => {
    if (!selectedTask) return;
    try {
      const updatedTasks = mainTasks.filter(task => task.id !== selectedTask.id);
      await updateSchedule(selectedTask.scheduleId, updatedTasks);
      setMainTasks(updatedTasks);
      setIsEditModalOpen(false);
      setShowDeleteWarning(false);
      showSuccessToast('Task deleted successfully!');
    } catch (error) {
      showErrorToast('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  const handleTaskClick = (task: Task) => {
    const now = new Date();
    const taskStart = new Date();
    taskStart.setHours(parseInt(task.time.split(':')[0]), parseInt(task.time.split(':')[1]));
    const taskEnd = new Date(taskStart);
    taskEnd.setMinutes(taskStart.getMinutes() + task.duration);

    if (now > taskEnd) {
      setSelectedPastTask(task);
      setShowTaskStatusModal(true);
    } else {
      setSelectedTask(task);
      setIsEditModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleGoalAdd = (title: string) => {
    setGoals(prev => [...prev, {
      id: Date.now(),
      title,
      isCompleted: false
    }]);
  };

  const handleGoalDelete = (id: number) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const handleGoalEdit = (id: number, newTitle: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, title: newTitle } : goal
    ));
  };

  const handleGoalToggle = (id: number) => {
    setGoals(prev => prev.map(goal =>
      goal.id === id ? { ...goal, isCompleted: !goal.isCompleted } : goal
    ));
  };

  const renderTaskTime = (task: Task) => {
    return formatToHHMM(task.time);
  };

  return (
    <div className="flex flex-col md:flex-row h-full md:-mt-8">

      {/* Main Content */}
      <div className="flex-1">
        {/* Task List and Side Cards */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <TaskList 
              tasks={mainTasks}
              isLoading={isLoading}
              onTaskClick={handleTaskClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />

            <div className="space-y-4">
              <Goals
                goals={goals}
                onGoalAdd={handleGoalAdd}
                onGoalDelete={handleGoalDelete}
                onGoalEdit={handleGoalEdit}
                onGoalToggle={handleGoalToggle}
              />
              
              <QuickTasks 
                tasks={quickTasks}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onAddTask={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && selectedTask && ( // Add selectedTask check here
        <Modal
          title="Edit Task"
          onClose={handleCloseModal}
          size="md"
        >
          <TaskForm
            mode="edit"
            onSubmit={handleEditTaskSubmit}
            onClose={handleCloseModal}
            onDelete={() => setShowDeleteWarning(true)}
            initialTask={{
              name: selectedTask!.name,
              time: renderTaskTime(selectedTask!),
              duration: selectedTask!.duration,
              isEmailEnabled: selectedTask!.isEmailEnabled,
              isWhatsAppEnabled: selectedTask!.isWhatsAppEnabled,
              isTelegramEnabled: selectedTask!.isTelegramEnabled,
              isCallEnabled: selectedTask!.isCallEnabled
            }}
          />
        </Modal>
      )}

      {showDeleteWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Task</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteWarning(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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

      {showTaskStatusModal && selectedPastTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Task Status</h3>
            <p className="text-sm text-gray-500 mb-6">
              Was this task completed?
            </p>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowTaskStatusModal(false);
                  showErrorToast('Task marked as incomplete');
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Not Done
              </button>
              
              <button
                onClick={() => {
                  setShowTaskStatusModal(false);
                  showSuccessToast('Task marked as complete');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${
          toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } transition-opacity duration-300`}>
          {toastMessage}
        </div>
      )}
      <LocationLogger />
    </div>
  );
}
