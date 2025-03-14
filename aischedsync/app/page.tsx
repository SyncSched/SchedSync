'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { getTodaySchedule, updateSchedule, getCurrentUser, type UserInfo, type Task } from '../api/lib'
import { useAuth } from '@/contexts/AuthContext';
import Loading from '../components/Loading';

// Add these utility functions after the imports and before the Home component
const parseTimeString = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const formatTimeString = (date: Date): string => {
  return date.toTimeString().substring(0, 5);
};

const addMinutesToTime = (timeStr: string, minutes: number): string => {
  const date = parseTimeString(timeStr);
  date.setMinutes(date.getMinutes() + minutes);
  return formatTimeString(date);
};

const getTimeDifferenceInMinutes = (time1: string, time2: string): number => {
  const date1 = parseTimeString(time1);
  const date2 = parseTimeString(time2);
  return Math.round((date2.getTime() - date1.getTime()) / (1000 * 60));
};

const isTaskActive = (taskTime: string, taskDuration: number): boolean => {
  const now = new Date();
  const taskStart = parseTimeString(taskTime);
  const taskEnd = new Date(taskStart);
  taskEnd.setMinutes(taskStart.getMinutes() + taskDuration);
  return now >= taskStart && now <= taskEnd;
};

const TimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const time = new Date().toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setCurrentTime(time);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return currentTime;
};

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mainTasks, setMainTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [quickTasks, setQuickTasks] = useState([
    {
      id: 1,
      title: "Team Meeting",
      time: "2:00 PM"
    },
    {
      id: 2,
      title: "Review PRs",
      time: "4:30 PM"
    }
  ]);

  const [user, setUser] = useState<UserInfo | null>(null);
  const { isAuthenticated, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Add these state declarations at the top
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showTaskStatusModal, setShowTaskStatusModal] = useState(false);
  const [selectedPastTask, setSelectedPastTask] = useState<Task | null>(null);

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
  // First, define a proper interface for the task state
  interface NewTaskState {
    name: string;
    time: string;
    duration: number;
    isEmailEnabled: boolean;
    isWhatsAppEnabled: boolean;
    isTelegramEnabled: boolean;
    isCallEnabled: boolean;
  }

  // Initialize the state with proper types
  const [newTask, setNewTask] = useState<NewTaskState>({
    name: '',
    time: '',
    duration: 30,
    isEmailEnabled: false,
    isWhatsAppEnabled: false,
    isTelegramEnabled: false,
    isCallEnabled: false
  });

  // On mount, fetch today's schedule and current user info
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const schedule = await getTodaySchedule();
        console.log('Fetched schedule:', schedule);
        // Update tasks with the originalData from schedule
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
          console.log('Fetched user data:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      }
    };

    fetchData();
    fetchUser();
  }, [isAuthenticated]);

  // Add a separate useEffect to log user state changes
  useEffect(() => {
    console.log('User state updated:', user);
  }, [user]);

  // Called when a drag is started
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

  // Add this function inside the Home component, before the handleDrop function
  const recalculateTaskTimes = (
    tasks: Task[],
    sourceIndex: number,
    targetIndex: number
  ): Task[] => {
    if (sourceIndex === targetIndex) return [...tasks];
    
    const updatedTasks = [...tasks];
    const movedTask = { ...tasks[sourceIndex] };
    const isMovingUp = targetIndex < sourceIndex;
    
    // Determine the range of tasks affected
    const startIndex = Math.min(sourceIndex, targetIndex);
    const endIndex = Math.max(sourceIndex, targetIndex);
    
    // Store the original start time of the first task and end time of last task in range
    const originalStartTime = tasks[startIndex].time;
    const lastTask = tasks[endIndex];
    const originalEndTime = addMinutesToTime(lastTask.time, lastTask.duration);
    
    if (isMovingUp) {
      // Moving task earlier in schedule
      let currentTime = originalStartTime; // Always start with original start time
      
      // Place moved task at target position
      movedTask.time = currentTime;
      currentTime = addMinutesToTime(currentTime, movedTask.duration);
      
      // Shift affected tasks after moved task
      for (let i = targetIndex; i < sourceIndex; i++) {
        const nextTask = { ...tasks[i] };
        nextTask.time = currentTime;
        currentTime = addMinutesToTime(currentTime, nextTask.duration);
        updatedTasks[i + 1] = nextTask;
      }
      
      updatedTasks[targetIndex] = movedTask;
    } else {
      // Moving task later in schedule
      let currentTime = originalStartTime; // Always start with original start time
      
      // Shift affected tasks up first
      for (let i = startIndex; i < targetIndex; i++) {
        const task = { ...tasks[i + 1] };
        task.time = currentTime;
        currentTime = addMinutesToTime(currentTime, task.duration);
        updatedTasks[i] = task;
      }
      
      // Place moved task at target position
      movedTask.time = currentTime;
      updatedTasks[targetIndex] = movedTask;
    }

    // Verify and adjust to maintain the original time window
    const newLastTask = updatedTasks[endIndex];
    const newEndTime = addMinutesToTime(newLastTask.time, newLastTask.duration);
    
    if (newEndTime !== originalEndTime) {
      // If there's any drift, adjust all tasks proportionally
      const timeDiff = getTimeDifferenceInMinutes(originalEndTime, newEndTime);
      if (timeDiff !== 0) {        
        let currentTime = originalStartTime;
        for (let i = startIndex; i <= endIndex; i++) {
          updatedTasks[i].time = currentTime;
          currentTime = addMinutesToTime(currentTime, updatedTasks[i].duration);
        }
      }
    }

    return updatedTasks;
  };

  // When a drop occurs, update the order and call createAdjustment
  const handleDrop = async (e: React.DragEvent, targetColumnType: 'main' | 'quick', targetIndex: number) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const dragCard = target.closest('[data-draggable="true"]');
    if (dragCard) {
      dragCard.classList.remove('bg-blue-50');
    }

    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { columnType: sourceColumnType, index: sourceIndex } = data;

    if (sourceColumnType === targetColumnType) {
      try {
        if (sourceColumnType === 'main') {
          // Recalculate times
          const updatedTasks = recalculateTaskTimes(mainTasks, sourceIndex, targetIndex);
          
          // Update schedule with reordered tasks
          await updateSchedule(updatedTasks[0].scheduleId, updatedTasks);

          setMainTasks(updatedTasks);
          showSuccessToast('Schedule updated successfully');
        } else {
          // Handle quick tasks reordering
          const newTasks = [...quickTasks];
          const [movedTask] = newTasks.splice(sourceIndex, 1);
          newTasks.splice(targetIndex, 0, movedTask);
          setQuickTasks(newTasks);
        }
      } catch (error) {
        console.error('Error updating task order:', error);
        showErrorToast('Failed to update schedule');
      }
    }
  };

  // Add these helper functions
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

  // Add the handleTaskUpdate function
  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      if (!selectedTask) return;

      const currentIndex = mainTasks.findIndex(task => task.id === updatedTask.id);
      if (currentIndex === -1) return;

      const updatedTasks = [...mainTasks];
      
      // Case 1: Time changed
      if (updatedTask.time !== selectedTask.time) {
        updatedTasks[currentIndex] = updatedTask;
        
        // Adjust all subsequent tasks based on the new time
        let currentTime = addMinutesToTime(updatedTask.time, updatedTask.duration);
        
        // Update times for all tasks after the modified task
        for (let i = currentIndex + 1; i < updatedTasks.length; i++) {
          updatedTasks[i] = {
            ...updatedTasks[i],
            time: currentTime
          };
          currentTime = addMinutesToTime(currentTime, updatedTasks[i].duration);
        }
      }
      // Case 2: Duration changed
      else if (updatedTask.duration !== selectedTask.duration) {
        updatedTasks[currentIndex] = updatedTask;
        
        // Adjust all subsequent tasks
        let currentTime = addMinutesToTime(updatedTask.time, updatedTask.duration);
        
        // Update times for all tasks after the modified task
        for (let i = currentIndex + 1; i < updatedTasks.length; i++) {
          updatedTasks[i] = {
            ...updatedTasks[i],
            time: currentTime
          };
          currentTime = addMinutesToTime(currentTime, updatedTasks[i].duration);
        }
      }
      // Case 3: Only name changed
      else {
        updatedTasks[currentIndex] = updatedTask;
      }

      // Call updateSchedule with all tasks
      await updateSchedule(updatedTask.scheduleId, updatedTasks);

      // Update local state
      setMainTasks(updatedTasks);
      setIsEditModalOpen(false);
      showSuccessToast('Task updated successfully!');
    } catch (error) {
      showErrorToast('Failed to update task');
      console.error('Error updating task:', error);
    }
  };

  // Add the handleTaskDelete function
  const handleTaskDelete = async () => {
    if (!selectedTask) return;
    
    try {
      // Filter out the deleted task
      const updatedTasks = mainTasks.filter(task => task.id !== selectedTask.id);
      
      // Update the schedule with the filtered tasks
      await updateSchedule(selectedTask.scheduleId, updatedTasks);
      
      // Update local state
      setMainTasks(updatedTasks);
      setIsEditModalOpen(false);
      setShowDeleteWarning(false);
      showSuccessToast('Task deleted successfully!');
    } catch (error) {
      showErrorToast('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  // Modify the task card click handler
  const handleTaskClick = (task: Task) => {
    const now = new Date();
    const taskStart = parseTimeString(task.time);
    const taskEnd = new Date(taskStart);
    taskEnd.setMinutes(taskStart.getMinutes() + task.duration);

    if (now > taskEnd) {
      // Past task - show status modal
      setSelectedPastTask(task);
      setShowTaskStatusModal(true);
    } else {
      // Current or future task - show edit modal
      setSelectedTask(task);
      setIsEditModalOpen(true);
    }
  };

  // Add this new function before the return statement
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const scheduleId = mainTasks[0]?.scheduleId || '';
      
      // Create the task object with explicit boolean values
      const newTaskObject: Task = {
        id: `temp-${Date.now()}`,
        name: newTask.name,
        time: newTask.time,
        duration: Number(newTask.duration),
        scheduleId: scheduleId,
        isEmailEnabled: newTask.isEmailEnabled,
        isWhatsAppEnabled: newTask.isWhatsAppEnabled,
        isTelegramEnabled: newTask.isTelegramEnabled,
        isCallEnabled: newTask.isCallEnabled
      };

      // Debug logs
      console.log('New task before API call:', newTaskObject);
      
      const updatedTasks = [...mainTasks, newTaskObject];
      const result = await updateSchedule(scheduleId, updatedTasks);
      
      console.log('API response:', result);

      setMainTasks(updatedTasks);
      setIsAddTaskModalOpen(false);
      showSuccessToast('Task added successfully!');
      
      // Reset form
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

  // Update the notification change handler to be more explicit
  const handleNotificationChange = (setting: keyof NewTaskState) => {
    console.log(`Changing ${setting} from ${newTask[setting]} to ${!newTask[setting]}`); // Debug log
    setNewTask(prev => {
      const updated = {
        ...prev,
        [setting]: !prev[setting]
      };
      console.log('Updated task state:', updated); // Debug log
      return updated;
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#212121] overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xl text-white font-semibold">
          <Image 
            src="/favicon.ico"
            width={36}
            height={36}
            alt="SchedSync Logo"
            className="mix-blend-luminosity"
          />
          <span>SchedSync</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:relative w-[280px] md:w-56 h-full bg-[#171717] border-r border-gray-700 
        transform transition-transform duration-300 ease-in-out z-30
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-4">
          <div className="hidden md:flex md:items-center md:gap-2 text-xl text-white font-semibold mb-8">
            <Image 
              src="/favicon.ico"
              width={36}
              height={36}
              alt="SchedSync Logo"
              className="mix-blend-luminosity"
            />
            <span>SchedSync</span>
          </div>
          
          <nav className="flex flex-col space-y-2 flex-grow">
            <button className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-gray-800 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
              <span>Dashboard</span>
            </button>
            
            <button className="flex items-center space-x-3 px-3 py-2 bg-[#2f2f2f] text-white rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
              <span>Schedule</span>
            </button>
            
            <button className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-gray-800 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span>Calendar</span>
            </button>
            
            <button className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-gray-800 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
              <span>Tools</span>
            </button>
            
            <button className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-gray-800 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Remainder</span>
            </button>
            
            <button className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-gray-800 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
              <span>Share</span>
            </button>
          </nav>
          
          <div className="mt-auto space-y-2">
            <button className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span>Settings</span>
            </button>
            
            <div className="relative">
              <button 
                className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden"
                onClick={() => {
                  console.log('Current user state:', user);
                  setShowProfileModal(!showProfileModal);
                }}
              >
                {user?.avatarUrl ? (
                  <Image 
                    src={user.avatarUrl}
                    width={40}
                    height={40}
                    alt={user.name || 'Profile'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Anonymous')}&background=0D8ABC&color=fff`}
                    width={40}
                    height={40}
                    alt={user?.name || 'Profile'} 
                    className="w-full h-full object-cover"
                  />
                )}
              </button>

              {showProfileModal && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowProfileModal(false)}
                  />
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                    <div className="p-3 border-b border-gray-200">
                      <p className="font-medium text-sm text-gray-900">
                        {user?.name || 'Anonymous User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || 'No email available'}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileModal(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-semibold text-white">Schedule</h1>
            
            {/* User Actions */}
            <div className="flex items-center space-x-3 md:space-x-4">
              <button className="p-1.5 md:p-2 hover:bg-none rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
</svg>

              </button>
              
              <div className="relative">
                <button 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden"
                  onClick={() => {
                    console.log('Current user state:', user);
                    setShowProfileModal(!showProfileModal);
                  }}
                >
                  {user?.avatarUrl ? (
                    <Image 
                      src={user.avatarUrl}
                      width={40}
                      height={40}
                      alt={user.name || 'Profile'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Anonymous')}&background=0D8ABC&color=fff`}
                      width={40}
                      height={40}
                      alt={user?.name || 'Profile'} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>

                {showProfileModal && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setShowProfileModal(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                      <div className="p-3 border-b border-gray-200">
                        <p className="font-medium text-sm text-gray-900">
                          {user?.name || 'Anonymous User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email || 'No email available'}
                        </p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            logout();
                            setShowProfileModal(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base md:text-lg font-medium text-white sticky top-0 bg-none z-10">Tasks</h2>
            </div>

            {/* Main Kanban Column */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              <div className="flex-1 bg-none p-3 md:p-4 rounded-lg min-h-[400px] md:min-h-[500px] overflow-y-auto max-h-[500px] scrollable">
                {/* Kanban Cards */}
                <div className="space-y-3 md:space-y-4">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-400">
                    
                    <Loading />
                  </div>
                ) : mainTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                     <Loading />
                  </div>
                ) : (
                  mainTasks.map((task, index) => (
                    <div 
                      key={task.id} 
                      data-task-id={task.id}
                      draggable
                      data-draggable="true"
                      onDragStart={(e) => handleDragStart(e, 'main', index)}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'main', index)}
                      onClick={() => handleTaskClick(task)}
                      className={`bg-[#303030] p-3 md:p-4 rounded-lg border-[0px] border-gray-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 ${
                        (() => {
                          const now = new Date();
                          const taskStart = parseTimeString(task.time);
                          const taskEnd = new Date(taskStart);
                          taskEnd.setMinutes(taskStart.getMinutes() + task.duration);
                          return now > taskEnd ? 'opacity-60 hover:opacity-100 transition-all duration-200' : '';
                        })()
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white text-sm md:text-base">{task.name}</h3>
                          {isTaskActive(task.time, task.duration) && (
                            <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-green-100 text-[#22c55e] dark:bg-green-800/30 dark:text-[#22c55e] border-[0.25px] border-[#22c55e]">
                              <span className="size-1.5 inline-block rounded-full bg-[#22c55e] animate-pulse shadow-sm shadow-green-400" />
                              <TimeDisplay />
                            </span>
                          )}
                        </div>
                        <button className="text-[#95A5A6] hover:text-[#7F8C8D]" onClick={() => handleTaskClick(task)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span className="text-xs text-[#8d8d8d]">{task.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span className="text-xs text-[#8d8d8d]">{task.duration} min</span>
                        </div>
                      </div>
                    </div>
                  )))
                }
              </div>
              </div>

              {/* Secondary Column (Quick Tasks) */}
              <div className="w-full md:w-80 bg-[#292929] p-3 md:p-4 rounded-lg h-[200px] md:h-[250px]">
                <h3 className="text-base md:text-lg font-medium text-white mb-3 md:mb-4">Quick Tasks</h3>
                <div className="space-y-2 md:space-y-3">
                  {quickTasks.map((task, index) => (
                    <div 
                      key={task.id} 
                      draggable
                      data-draggable="true"
                      onDragStart={(e) => handleDragStart(e, 'quick', index)}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'quick', index)}
                      className="bg-[#303030] p-2 md:p-3 rounded-lg border-[0px] border-gray-200 shadow-sm cursor-move"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-white">{task.title}</span>
                        <span className="text-xs text-[#95A5A6]">{task.time}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
                <button 
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="bg-blue-500 mt-3 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Task</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleTaskUpdate({
                ...selectedTask,
                name: (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value,
                time: (e.currentTarget.elements.namedItem('time') as HTMLInputElement).value,
                duration: parseInt((e.currentTarget.elements.namedItem('duration') as HTMLInputElement).value)
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Task Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedTask.name}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <input
                    type="time"
                    name="time"
                    defaultValue={selectedTask.time}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                       
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    defaultValue={selectedTask.duration}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowDeleteWarning(true)}
                  className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
                
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Warning Dialog */}
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

      {/* Task Status Modal */}
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
                  // Handle task not done
                  setShowTaskStatusModal(false);
                  showErrorToast('Task marked as incomplete');
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Not Done
              </button>
              
              <button
                onClick={() => {
                  // Handle task done
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
