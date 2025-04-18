import Cookies from 'js-cookie';

// Calendar event interface
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  status: string;
  htmlLink: string;
  creator?: {
    email: string;
    displayName?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
}

export interface UserSettings {
  timezone: string;
  isEmailEnabled: boolean;
  isWhatsAppEnabled: boolean;
  isTelegramEnabled: boolean;
  isCallEnabled: boolean;
  notifyBeforeMinutes: number;
  phoneNumber?: string | null;
  telegramChatId?: string | null;
  onboardingData?: {
    profession: string;
    hobbies: string[];
    sleepingHours: number;
    sleepingStart: string;
    sleepingEnd: string;
    workingHours: number;
    workingStart: string;
    workingEnd: string;
  } | null;
}

export interface User {
    id?: string;
    email: string;
    name: string ;
    avatarUrl: string;
    googleId: string;
    schedules?: Schedule[];
    createdAt: Date;
}

export interface UserInfo{
    id?: string;
    email: string;
    name: string ;
    avatarUrl: string;
    exp: number;
    iat: number;
}

export interface Schedule {
    id: string;
    userId: string;
    user: User;
    originalData: Task[];
    createdAt: Date;
  }

  export interface Task {
    id: string;
    name: string;
    description?: string;
    notes?: string;
    time: string;    // ISO format string
    duration: number;
    status?: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS' | 'OVERDUE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    location?: string | null;
    scheduleId: string;
    isEmailEnabled: boolean;
    isWhatsAppEnabled: boolean;
    isTelegramEnabled: boolean;
    isCallEnabled: boolean;
  }

  export interface TaskFormData {
    name: string;
    description: string;
    notes?: string;
    time: string;
    duration: number;
    endTime: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'PENDING' | 'COMPLETED';
    location?: string | null;
    isEmailEnabled: boolean;
    isWhatsAppEnabled: boolean;
    isTelegramEnabled: boolean;
    isCallEnabled: boolean;
  }

  // Define the OnboardingInput and Onboarding interfaces
  export interface OnboardingInput {
    profession: string;
    hobbies: string[];
    sleepingHours: number;
    sleepingStart: string;
    sleepingEnd: string;
    workingHours: number;
    workingStart: string;
    workingEnd: string;
    userId: string;
  }

  export interface Onboarding {
    id: string;
    profession: string;
    hobbies: string[];
    sleepingHours: number;
    sleepingStart: Date;
    sleepingEnd: Date;
    workingHours: number;
    workingStart: Date;
    workingEnd: Date;
    userId: string;
    createdAt: Date;
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  /**
   * Fetches the schedule for today.
   * If no schedule exists, it calls the schedule creation endpoint.
   */
  let isGeneratingSchedule = false; // Prevent duplicate schedule generation
  let scheduleGenerationTimeout: NodeJS.Timeout | null = null;

  /**
   * Cleans up any pending schedules for the current user
   */
  const cleanupPendingSchedules = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/cleanupPendingSchedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredAuthToken()}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.deletedCount > 0) {
          console.log(`Cleaned up ${result.deletedCount} pending schedules`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up pending schedules:', error);
    } finally {
      isGeneratingSchedule = false;
    }
  };

  export const getTodaySchedule = async (): Promise<Schedule> => {
    try {
      const now = new Date();
      const timezoneOffset = now.getTimezoneOffset();

      const res = await fetch(`${API_URL}/getSchedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredAuthToken()}`
        },
        body: JSON.stringify({
          date: now.toISOString(),
          timezoneOffset: timezoneOffset
        })
      });

      if (res.ok) {
        return res.json();
      }

      // Check if this is a 'schedule not found' error
      if (res.status === 404) {
        const errorData = await res.json();
        if (errorData.error === 'SCHEDULE_NOT_FOUND') {
          console.log('No schedule found, generating a new one...');

          // If not found, try generating a new schedule
          if (!isGeneratingSchedule) {
            isGeneratingSchedule = true;

            // Set a timeout to clean up pending schedules if generation takes too long
            if (scheduleGenerationTimeout) {
              clearTimeout(scheduleGenerationTimeout);
            }

            // After 30 seconds, clean up any pending schedules
            scheduleGenerationTimeout = setTimeout(() => {
              console.warn('Schedule generation timeout reached, cleaning up pending schedules');
              cleanupPendingSchedules();
            }, 30000); // 30 seconds timeout

            try {
              const createRes = await fetch(`${API_URL}/generateSchedule`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${getStoredAuthToken()}`
                },
                body: JSON.stringify({
                  date: now.toISOString(),
                  timezoneOffset: timezoneOffset
                })
              });

              // Clear the timeout since we got a response
              if (scheduleGenerationTimeout) {
                clearTimeout(scheduleGenerationTimeout);
                scheduleGenerationTimeout = null;
              }

              if (!createRes.ok) {
                const errorText = await createRes.text();
                console.error('Schedule generation failed:', errorText);
                // Clean up any pending schedules
                await cleanupPendingSchedules();
                throw new Error(`Failed to create today's schedule: ${createRes.status} ${createRes.statusText}`);
              }

              isGeneratingSchedule = false;
              return createRes.json();
            } catch (genError) {
              console.error('Error during schedule generation:', genError);
              // Clean up any pending schedules
              await cleanupPendingSchedules();
              throw genError;
            }
          } else {
            console.warn("Schedule generation already in progress");
            throw new Error("Duplicate schedule generation request blocked");
          }
        }
      }

      // For other errors
      throw new Error(`Failed to fetch schedule: ${res.status} ${res.statusText}`);
    } catch (error) {
      isGeneratingSchedule = false;
      console.error('Error fetching schedule:', error);
      throw error;
    }
  };

  /**
 * Checks if the user has completed onboarding
 * @param token - The authentication token
 * @returns Promise<boolean> - True if onboarding exists, false otherwise
 */
export const checkOnboardingStatus = async (token: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/checkonboardingdata`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error('Failed to check onboarding status');
    }

    const data = await res.json();
    return data.hasOnboardingData;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

  /**
   * Sends a createOnboarding API call with the onboarding data.
   */
  export const createOnboarding = async (onboardingData: OnboardingInput): Promise<Onboarding> => {
    try {

      const formattedData = {
        ...onboardingData,
        sleepingStart: onboardingData.sleepingStart,
        sleepingEnd: onboardingData.sleepingEnd,
        workingStart: onboardingData.workingStart,
        workingEnd: onboardingData.workingEnd
      };

      console.log(onboardingData.sleepingStart, formattedData.sleepingStart);
      console.log(formattedData, "before calling api, checking the onboarding data");
      const res = await fetch(`${API_URL}/createOnboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredAuthToken()}`
        },
        body: JSON.stringify(formattedData)
      });

      if (!res.ok) {
        console.error('Failed to save onboarding data:', res.status, res.statusText);
        throw new Error('Failed to save onboarding data');
      }

      return res.json();
    } catch (error) {
      console.error('Error during createOnboarding:', error);
      throw error;
    }
  };

  /**
   * Retrieves the current logged-in user.
   */
  export const getCurrentUser = async (): Promise<UserInfo> => {
    const token = getStoredAuthToken();

    // Check token validity before making the request
    if (token && !isTokenValid(token)) {
      throw new Error('Token expired');
    }

    const res = await fetch(`${API_URL}/currentUser`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch current user');
    }

    const data = await res.json();
    return data.currentUser;
  };

  export const isTokenValid = (token: string): boolean => {
    try {
      // JWT tokens are in format: header.payload.signature
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime;
    } catch {
      return false;
    }
  };

  export const getStoredAuthToken = () => Cookies.get('authToken');

/**
 * Updates the schedule with new tasks
 */
export const updateSchedule = async (scheduleId: string, tasks: Task[]): Promise<Schedule> => {
  try {
    const response = await fetch(`${API_URL}/schedule/${scheduleId}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getStoredAuthToken()}`
      },
      body: JSON.stringify({
        originalData: tasks.map(task => ({
          ...task,
          // Ensure boolean values are properly set
          isEmailEnabled: task.isEmailEnabled === true,
          isWhatsAppEnabled: task.isWhatsAppEnabled === true,
          isTelegramEnabled: task.isTelegramEnabled === true,
          isCallEnabled: task.isCallEnabled === true
        }))
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update schedule tasks');
    }

    return response.json();
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
};

export interface NotificationSettings {
  timezone: string;
  isEmailEnabled: boolean;
  isWhatsAppEnabled: boolean;
  isTelegramEnabled: boolean;
  isCallEnabled: boolean;
  notifyBeforeMinutes: number;
  phoneNumber?: string;
  onboardingData?: {
    profession: string;
    hobbies: string[];
    sleepingHours: number;
    sleepingStart: string;
    sleepingEnd: string;
    workingHours: number;
    workingStart: string;
    workingEnd: string;
  };
}

/**
 * Updates the user's notification settings
 */
export const updateUserSettings = async (settings: NotificationSettings): Promise<void> => {
  const token = getStoredAuthToken();

  if (token && !isTokenValid(token)) {
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_URL}/user/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      timezone: settings.timezone,
      notificationPreferences: {
        isEmailEnabled: settings.isEmailEnabled,
        isWhatsAppEnabled: settings.isWhatsAppEnabled,
        isTelegramEnabled: settings.isTelegramEnabled,
        isCallEnabled: settings.isCallEnabled,
        notifyBeforeMinutes: settings.notifyBeforeMinutes,
        phoneNumber: settings.phoneNumber
      },
      onboardingData: settings.onboardingData
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update settings');
  }

  return await response.json();
};

/**
 * Gets the user's settings
 */
export const getUserSettings = async (): Promise<UserSettings> => {
  const token = getStoredAuthToken();

  if (token && !isTokenValid(token)) {
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_URL}/user/settings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user settings');
  }

  return await response.json();
};

export const updateUserTimezone = async (timezone: string): Promise<void> => {
  const token = getStoredAuthToken();

  if (token && !isTokenValid(token)) {
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_URL}/user/timezone`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ timezone })
  });

  if (!response.ok) {
    throw new Error('Failed to update timezone');
  }
};

export const getTelegramAuthLink = async (userId: string): Promise<{ authLink: string }> => {
  const response = await fetch(`${API_URL}/users/${userId}/telegram-auth`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getStoredAuthToken()}`
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate Telegram auth link');
  }

  return response.json();
};

export interface NotificationTask {
  id: string;
  name: string;
  time: string;
  duration: number;
}

export interface Notification {
  id: string;
  taskId: string;
  userId: string;
  channel: 'email' | 'whatsapp' | 'telegram' | 'call';
  status: 'pending' | 'sent' | 'failed';
  notifyAt: string;
  createdAt: string;
  task: NotificationTask;
}

// Dashboard interfaces
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  missed: number;
  adherenceRate: number;
}

export interface CategoryBreakdown {
  work: number;
  personal: number;
  health: number;
  learning: number;
  other: number;
}

export interface TaskCompletionData {
  labels: string[];
  completed: number[];
  total: number[];
}

export interface ProductivityTrend {
  labels: string[];
  productivityScore: number[];
  completionRate: number[];
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  adherenceRate: number;
  lastSevenDays: boolean[];
}

export interface DashboardData {
  taskStats: TaskStats;
  categoryBreakdown: CategoryBreakdown;
  taskCompletion: TaskCompletionData;
  productivityTrend: ProductivityTrend;
  streakData: StreakData;
  upcomingTasks: Task[];
  mostActiveHour: string;
}

/**
 * Gets upcoming notifications for the user
 */
export const getUpcomingNotifications = async (): Promise<Notification[]> => {
  const token = getStoredAuthToken();

  if (token && !isTokenValid(token)) {
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_URL}/notifications/upcoming`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch upcoming notifications');
  }

  return await response.json();
};

/**
 * Gets all dashboard data for the user
 */
export const getDashboardData = async (timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<DashboardData> => {
  const token = getStoredAuthToken();

  if (token && !isTokenValid(token)) {
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_URL}/dashboard/data?timeframe=${timeframe}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }

  return await response.json();
};

/**
 * Gets task statistics for the user
 */
export const getTaskStats = async (timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<TaskStats> => {
  const token = getStoredAuthToken();

  if (token && !isTokenValid(token)) {
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_URL}/dashboard/task-stats?timeframe=${timeframe}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch task statistics');
  }

  return await response.json();
};

/**
 * Gets category breakdown for the user
 */
export const getCategoryBreakdown = async (timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<CategoryBreakdown> => {
  const token = getStoredAuthToken();

  if (token && !isTokenValid(token)) {
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_URL}/dashboard/category-breakdown?timeframe=${timeframe}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch category breakdown');
  }

  return await response.json();
};

/**
 * Gets task completion data for the user
 */
export const getTaskCompletionData = async (timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<TaskCompletionData> => {
  const token = getStoredAuthToken();

  if (token && !isTokenValid(token)) {
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_URL}/dashboard/task-completion?timeframe=${timeframe}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch task completion data');
  }

  return await response.json();
};

/**
 * Gets productivity trend data for the user
 */
export const getProductivityTrend = async (timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<ProductivityTrend> => {
  const token = getStoredAuthToken();

  if (token && !isTokenValid(token)) {
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_URL}/dashboard/productivity-trend?timeframe=${timeframe}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch productivity trend');
  }

  return await response.json();
};

/**
 * Gets streak data for the user
 */
export const getStreakData = async (): Promise<StreakData> => {
  const token = getStoredAuthToken();

  if (token && !isTokenValid(token)) {
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_URL}/dashboard/streak-data`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch streak data');
  }

  return await response.json();
};

/**
 * Gets upcoming tasks for the user
 */
export const getDashboardUpcomingTasks = async (limit: number = 5): Promise<Task[]> => {
  const token = getStoredAuthToken();

  if (token && !isTokenValid(token)) {
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_URL}/dashboard/upcoming-tasks?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch upcoming tasks');
  }

  return await response.json();
};

/**
 * Gets most active hour for the user
 */
export const getMostActiveHour = async (): Promise<string> => {
  const token = getStoredAuthToken();

  if (token && !isTokenValid(token)) {
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_URL}/dashboard/most-active-hour`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch most active hour');
  }

  const data = await response.json();
  return data.mostActiveHour;
};

/**
 * Updates a notification's time
 */
export const updateNotificationTime = async (notificationId: string, newTime: string): Promise<Notification> => {
  const token = getStoredAuthToken();

  if (token && !isTokenValid(token)) {
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ notifyAt: newTime })
  });

  if (!response.ok) {
    throw new Error('Failed to update notification time');
  }

  return response.json();
};

/**
 * Get user's calendar events
 */
export const getCalendarEvents = async (timeMin?: Date, timeMax?: Date): Promise<CalendarEvent[]> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (timeMin) params.append('timeMin', timeMin.toISOString());
    if (timeMax) params.append('timeMax', timeMax.toISOString());

    const response = await fetch(`${API_URL}/calendar/events?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getStoredAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}

/**
 * Check if user has calendar integration
 */
export const hasCalendarIntegration = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/calendar/integration`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${getStoredAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check calendar integration');
    }

    const data = await response.json();
    return data.data.hasCalendarIntegration;
  } catch (error) {
    console.error('Error checking calendar integration:', error);
    return false;
  }
}

/**
 * Remove calendar integration
 */
export const removeCalendarIntegration = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/calendar/integration`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getStoredAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to remove calendar integration');
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error removing calendar integration:', error);
    return false;
  }
}

/**
 * Deletes a notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const token = getStoredAuthToken();

  if (token && !isTokenValid(token)) {
    throw new Error('Token expired');
  }

  const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }
};
