'use client';

import { useState, useEffect } from "react";
import { getTodaySchedule, updateSchedule, getCurrentUser, type UserInfo, type Task } from '../api/lib';
import { useAuth } from '@/contexts/AuthContext';
import Modal from './components/ui/Modal';
import { TaskForm } from './components/TaskForm';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskList from './components/TaskList';
import QuickTasks from './components/QuickTasks';
import { recalculateTaskTimes } from './utils/taskUtils';
import { isTaskActive, formatToHHMM, addMinutesToTime , formatTimeString } from '@/app/utils/dateUtils';
import Goals from './components/Goals';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mainTasks, setMainTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickTasks, setQuickTasks] = useState([
    { id: 1, title: "Team Meeting", time: "2:00 PM" },
    { id: 2, title: "Review PRs", time: "4:30 PM" }
  ]);

  const [user, setUser] = useState<UserInfo | null>(null);
  const { isAuthenticated, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showTaskStatusModal, setShowTaskStatusModal] = useState(false);
  const [selectedPastTask, setSelectedPastTask] = useState<Task | null>(null);

  useEffect(() => {
    // Get timezone information
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = new Date();
    const offset = date.getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offset / 60));
    const offsetMinutes = Math.abs(offset % 60);
    const offsetString = `${offset <= 0 ? '+' : '-'}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;

    console.log('🌍 Timezone Details:');
    console.log('Timezone:', timezone);
    console.log('UTC Offset:', offsetString);
    console.log('Current Local Time:', date.toLocaleString());
  }, []);

  // Add this useEffect after other useEffect hooks
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

  // Add these new state variables at the top with other state declarations
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [goals, setGoals] = useState<{ id: number; title: string; isCompleted: boolean; }[]>([]);

  interface NewTaskState {
    name: string;
    time: string;
    duration: number;
    isEmailEnabled: boolean;
    isWhatsAppEnabled: boolean;
    isTelegramEnabled: boolean;
    isCallEnabled: boolean;
  }

  const [newTask, setNewTask] = useState<NewTaskState>({
    name: '',
    time: '',
    duration: 30,
    isEmailEnabled: false,
    isWhatsAppEnabled: false,
    isTelegramEnabled: false,
    isCallEnabled: false
  });

  interface TaskFormData {
    name: string;
    time: string;
    duration: number;
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
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUser = async () => {
      if (isAuthenticated) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    };

    fetchData();
    fetchUser();
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
        } catch (error) {
          // If backend update fails, revert the state
          setMainTasks(tasksCopy);
          showErrorToast('Failed to save changes. Please try again.');
        }
      } else if (sourceColumnType === targetColumnType && sourceColumnType === 'quick') {
        const newTasks = [...quickTasks];
        const [movedTask] = newTasks.splice(sourceIndex, 1);
        newTasks.splice(targetIndex, 0, movedTask);
        setQuickTasks(newTasks);
      }
    } catch (error) {
      console.error('Error in handleDrop:', error);
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

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const scheduleId = mainTasks[0]?.scheduleId || '';
      
      let taskTime: string;
      const now = new Date();
      
      if (mainTasks.length > 0) {
        // If there are existing tasks, set time after the last task
        const lastTask = mainTasks[mainTasks.length - 1];
        console.log(lastTask)
        const lastTaskTime = new Date(lastTask.time);
        const lastTaskEndTime = new Date(lastTaskTime.getTime() + (lastTask.duration * 60000));
        taskTime = lastTaskEndTime.toISOString();
      } else {
        // If no tasks, handle the new task time
        if (newTask.time) {
          // Handle both 24-hour and 12-hour formats
          let hours: number;
          let minutes: number;
          
          if (newTask.time.includes('AM') || newTask.time.includes('PM')) {
            // 12-hour format
            const [timeStr, period] = newTask.time.split(' ');
            const [h, m] = timeStr.split(':').map(Number);
            hours = h;
            minutes = m;
            
            if (period === 'PM' && hours !== 12) {
              hours += 12;
            } else if (period === 'AM' && hours === 12) {
              hours = 0;
            }
          } else {
            // 24-hour format
            [hours, minutes] = newTask.time.split(':').map(Number);
          }

          const selectedTime = new Date();
          selectedTime.setHours(hours, minutes, 0, 0);
          
          // If the time is in the past, move it to tomorrow
          if (selectedTime < now) {
            selectedTime.setDate(selectedTime.getDate() + 1);
          }
          taskTime = selectedTime.toISOString();
        } else {
          // Round current time to nearest 5 minutes
          const roundedMinutes = Math.ceil(now.getMinutes() / 5) * 5;
          now.setMinutes(roundedMinutes, 0, 0);
          taskTime = now.toISOString();
        }
      }

      // Create new task
      const newTaskObject: Task = {
        id: `temp-${Date.now()}`,
        name: newTask.name,
        time: taskTime,
        duration: Number(newTask.duration),
        scheduleId: scheduleId,
        isEmailEnabled: newTask.isEmailEnabled,
        isWhatsAppEnabled: newTask.isWhatsAppEnabled,
        isTelegramEnabled: newTask.isTelegramEnabled,
        isCallEnabled: newTask.isCallEnabled
      };

      const updatedTasks = [...mainTasks, newTaskObject];
      await updateSchedule(scheduleId, updatedTasks);

      const latestSchedule = await getTodaySchedule();
      if (latestSchedule && latestSchedule.originalData) {
        setMainTasks(latestSchedule.originalData);
      }

      setIsAddTaskModalOpen(false);
      showSuccessToast('Task added successfully!');
      setNewTask({
        name: '',
        time: '',
        duration: 30,
        isEmailEnabled: false,
        isWhatsAppEnabled: false,
        isTelegramEnabled: false,
        isCallEnabled: false
      });
    } catch (error) {
      console.error('Error adding task:', error);
      showErrorToast('Failed to add task');
    }
  };

  const handleNotificationChange = (setting: keyof NewTaskState) => {
    setNewTask(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
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
    <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-black"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Today&apos;s Schedule</h1>
            <p className="text-xs text-gray-500">Plan your day effectively</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddTaskModalOpen(true)}
            className="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            Add New Task
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg text-black">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </button>
        </div>
      </div>

      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        user={user}
        onLogout={logout}
      />

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full bg-[#F8F9FA]">
        <div className="p-3 md:p-8">
          {/* Desktop Header - Hide on Mobile */}
          <div className="hidden md:block">
            <Header 
              onAddTask={() => setIsAddTaskModalOpen(true)}
              onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              user={user}
              onProfileClick={() => setShowProfileModal(!showProfileModal)}
              showProfileModal={showProfileModal}
              onLogout={logout}
              setShowProfileModal={setShowProfileModal}
            />
          </div>

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
                  onAddTask={() => setIsAddTaskModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {isEditModalOpen && (
        <Modal
          title="Edit Task"
          onClose={() => setIsEditModalOpen(false)}
          size="md"
        >
          <TaskForm
            mode="edit"
            onSubmit={handleEditTaskSubmit}
            onClose={() => setIsEditModalOpen(false)}
            onDelete={() => setShowDeleteWarning(true)}
            initialTask={{
              name: selectedTask.name,
              time: renderTaskTime(selectedTask),
              duration: selectedTask.duration,
              isEmailEnabled: selectedTask.isEmailEnabled,
              isWhatsAppEnabled: selectedTask.isWhatsAppEnabled,
              isTelegramEnabled: selectedTask.isTelegramEnabled,
              isCallEnabled: selectedTask.isCallEnabled
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

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Task</h3>
              <button 
                onClick={() => setIsAddTaskModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddTask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Task Name</label>
                  <input
                    type="text"
                    required
                    value={newTask.name}
                    onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter task name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <input
                    type="time"
                    required
                    value={newTask.time}
                    onChange={(e) => setNewTask({...newTask, time: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newTask.duration}
                    onChange={(e) => setNewTask({...newTask, duration: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Notification Settings</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newTask.isEmailEnabled}
                        onChange={() => handleNotificationChange('isEmailEnabled')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Email Notifications</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newTask.isWhatsAppEnabled}
                        onChange={() => handleNotificationChange('isWhatsAppEnabled')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">WhatsApp Notifications</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newTask.isTelegramEnabled}
                        onChange={() => handleNotificationChange('isTelegramEnabled')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Telegram Notifications</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newTask.isCallEnabled}
                        onChange={() => handleNotificationChange('isCallEnabled')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Phone Call Notifications</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}