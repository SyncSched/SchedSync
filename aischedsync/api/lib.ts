import Cookies from 'js-cookie';
// /lib/api.ts
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
    time: string;    // Time in "HH:MM" format
    duration: number; // Duration in minutes
    scheduleId: string;
    isEmailEnabled: boolean;
    isWhatsAppEnabled: boolean;
    isTelegramEnabled: boolean;
    isCallEnabled: boolean;
  }

  export interface TaskFormData {
    name: string;
    time: string;
    duration: number;
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

  export const getTodaySchedule = async (): Promise<Schedule> => {
    try {
      const res = await fetch(`${API_URL}/getSchedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredAuthToken()}`
        },
        body: JSON.stringify({ date: new Date().toISOString() })
      });
  
      if (res.ok) {
        return res.json();
      }
  
      // If not found, try generating a new schedulee
      if (!isGeneratingSchedule) {
        isGeneratingSchedule = true; // Lock to prevent duplicate calls
  
        const createRes = await fetch(`${API_URL}/generateSchedule`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${getStoredAuthToken()}`
          }
        });
  
        isGeneratingSchedule = false; // Unlock after response
  
        if (!createRes.ok) {
          throw new Error("Failed to create today's schedule");
        }
        return createRes.json();
      } else {
        console.warn("Schedule generation already in progress. Skipping duplicate request.");
        throw new Error("Duplicate schedule generation request blocked.");
      }
    } catch (error) {
      isGeneratingSchedule = false; // Ensure it's unlocked in case of errors
      console.error("Error in getTodaySchedule:", error);
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
