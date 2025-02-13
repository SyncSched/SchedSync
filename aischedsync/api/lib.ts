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
  export const getTodaySchedule = async (): Promise<Schedule> => {
    // Try to get today's schedule
    const res = await fetch('http://localhost:3000/getSchedule',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization' : `Bearer ${getStoredAuthToken()}`
      },
      body: JSON.stringify({ date: new Date().toISOString() })
    });
    if (!res.ok) {
      // If not found (or error), create today's schedule
      const createRes = await fetch('http://localhost:3000/generateSchedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' , 'Authorization' : `Bearer ${getStoredAuthToken()}` }
        // Include any necessary body data if required by your API.
      });
      if (!createRes.ok) {
        throw new Error("Failed to create today's schedule");
      }
      return createRes.json();
    }
    return res.json();
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
    console.log("first");
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
  
      console.log("second");
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
    console.log('Getting stored auth token:', getStoredAuthToken());
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