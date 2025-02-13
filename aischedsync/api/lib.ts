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
    adjustments: Adjustment[];
    createdAt: Date;
  }

  export interface Task {
    id: string;
    name: string;
    time: string;    // Time in "HH:MM" format
    duration: number; // Duration in minutes
    scheduleId: string;
  }

  export interface Adjustment {
    id: string;
    scheduleId: string;
    userId: string;
    task_id: string;
    change_type: ChangeType;
    details: TimeAdjustmentDetails | DurationAdjustmentDetails | TaskAddedDetails | TaskRemovedDetails;
    adjustedAt: Date;
}


  export type ChangeType = 'time_adjustment' | 'duration_adjustment' | 'task_added' | 'task_removed';



  export type TimeAdjustmentDetails = {
    from_time: string;
    to_time: string;
  };
  
  export type DurationAdjustmentDetails = {
    from_duration: number;
    to_duration: number;
  };
  
  export type TaskAddedDetails = {
    name: string;
    time: string;
    duration: number;
  };
  
  export type TaskRemovedDetails = {
    name: string;
    time: string;
    duration: number;
  };

  export type CreateAdjustmentInput = {
    userId: string;
    scheduleId: string;
    task_id: string;
    change_type: ChangeType;
    details: TimeAdjustmentDetails | DurationAdjustmentDetails | TaskAddedDetails | TaskRemovedDetails;
  }

  // Define the OnboardingInput and Onboarding interfaces
  export interface OnboardingInput {
    profession: string;
    hobbies: string[];
    sleepingHours: number;
    sleepingStart: Date;
    sleepingEnd: Date;
    workingHours: number;
    workingStart: Date;
    workingEnd: Date;
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
  
  /**
   * Fetches the schedule for today.
   * If no schedule exists, it calls the schedule creation endpoint.
   */
  let isGeneratingSchedule = false; // Prevent duplicate schedule generation

  export const getTodaySchedule = async (): Promise<Schedule> => {
    try {
      const res = await fetch('http://localhost:3000/getSchedule', {
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
  
        const createRes = await fetch('http://localhost:3000/generateSchedule', {
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
   * Sends a createAdjustment API call with the updated task data.
   */
  export const createAdjustment = async (adjustmentData: CreateAdjustmentInput): Promise<Adjustment> => {
    const res = await fetch('http://localhost:3000/createAdjustment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' , 'Authorization' : `Bearer ${getStoredAuthToken()}` },
      body: JSON.stringify(adjustmentData)
    });
    if (!res.ok) {
      throw new Error('Failed to save adjustment');
    }
    return res.json();
  };
  
  /**
   * Sends a createOnboarding API call with the onboarding data.
   */
  export const createOnboarding = async (onboardingData: OnboardingInput): Promise<Onboarding> => {
    try {
      const res = await fetch('http://localhost:3000/createOnboarding', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredAuthToken()}`
        },
        body: JSON.stringify(onboardingData)
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
    const res = await fetch('http://localhost:3000/currentUser', {
      headers: {
        'Authorization': `Bearer ${getStoredAuthToken()}`
      }
    });
    
    if (!res.ok) {
      console.error('Failed to fetch user:', res.status, res.statusText);
      throw new Error('Failed to fetch current user');
    }
    
    const data = await res.json();
    // Return just the currentUser object instead of the whole response
    return data.currentUser;
  };
  

  export const getStoredAuthToken = () => localStorage.getItem('authToken');