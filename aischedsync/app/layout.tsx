'use client';

import { useState } from 'react';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import { usePathname } from 'next/navigation';
import { getTodaySchedule, updateSchedule, type Task } from '@/api/lib';
import Header from './components/Header';

const inter = Inter({ subsets: ['latin'] });

interface NewTaskState {
  name: string;
  time: string;
  duration: number;
  isEmailEnabled: boolean;
  isWhatsAppEnabled: boolean;
  isTelegramEnabled: boolean;
  isCallEnabled: boolean;
}

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newTask, setNewTask] = useState<NewTaskState>({
    name: '',
    time: '',
    duration: 30,
    isEmailEnabled: false,
    isWhatsAppEnabled: false,
    isTelegramEnabled: false,
    isCallEnabled: false
  });

  const handleNotificationChange = (setting: keyof NewTaskState) => {
    setNewTask(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const schedule = await getTodaySchedule();
      const scheduleId = schedule?.originalData?.[0]?.scheduleId || '';
      
      let taskTime: string;
      const now = new Date();
      
      if (schedule?.originalData?.length > 0) {
        // If there are existing tasks, set time after the last task
        const lastTask = schedule.originalData[schedule.originalData.length - 1];
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

      const updatedTasks = [...(schedule?.originalData || []), newTaskObject];
      await updateSchedule(scheduleId, updatedTasks);

      setIsAddTaskModalOpen(false);
      setNewTask({
        name: '',
        time: '',
        duration: 30,
        isEmailEnabled: false,
        isWhatsAppEnabled: false,
        isTelegramEnabled: false,
        isCallEnabled: false
      });

      // Refresh the page to show the new task
      window.location.reload();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Get page title and subtitle based on pathname
  const getPageMeta = () => {
    switch (pathname) {
      case '/':
        return {
          title: "Today's Schedule",
          subtitle: "Plan your day effectively"
        };
      case '/settings':
        return {
          title: "Settings",
          subtitle: "Customize your preferences"
        };
      case '/calendar':
        return {
          title: "Calendar",
          subtitle: "View your monthly schedule"
        };
      case '/tools':
        return {
          title: "Tools",
          subtitle: "Productivity tools and integrations"
        };
      default:
        return {
          title: "SchedSync",
          subtitle: "Manage your schedule"
        };
    }
  };

  // Don't show sidebar and header on login and onboarding pages
  if (pathname === '/login' || pathname === '/onboarding') {
    return <>{children}</>;
  }

  const { title, subtitle } = getPageMeta();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white relative z-40">
        <div className="flex items-center gap-3">
          {isSidebarOpen ? (
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-black"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          ) : (
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-black"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
      </div>

      {/* Backdrop overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        user={user}
        onLogout={logout}
        onAddTask={() => setIsAddTaskModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden w-full bg-[#F8F9FA]">
        <div className="h-full flex flex-col">
          {/* Desktop Header - Fixed */}
          <div className="hidden md:block p-8 pb-0">
            <Header 
              onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              user={user}
              onProfileClick={() => setShowProfileModal(!showProfileModal)}
              showProfileModal={showProfileModal}
              onLogout={logout}
              setShowProfileModal={setShowProfileModal}
              onAddTask={() => setIsAddTaskModalOpen(true)}
              title={title}
              subtitle={subtitle}
            />
          </div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-auto p-3 md:p-8 md:pt-8">
            {children}
          </div>
        </div>
      </main>

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="_DpLsLw2ZcBy38Nj9u_6Oy6odc5K_3UXTzVnRSyQEzQ" />
        <link rel="icon" type="image/png" href="/favicon.ico" />
        <meta property="og:title" content="SchedSync - AI Task Scheduler" />
        <meta property="og:description" content="Automate and personalize your daily schedule with AI-driven task management." />
        <meta property="og:image" content="https://schedsync.com/favicon.ico" />
        <meta property="og:url" content="https://schedsync.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SchedSync - AI Task Scheduler" />
        <meta name="twitter:description" content="Automate and personalize your daily schedule with AI." />
        <meta name="twitter:image" content="https://schedsync.com/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <MainLayout>
          {children}
          </MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
