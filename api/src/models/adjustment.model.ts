import { Schedule } from "./schedule.model";

export interface Adjustment {
    id: string;
    scheduleId: string;
    schedule: Schedule;
    delta: AdjustmentData;  // Using the type we just defined
    createdAt: Date;
}


export type CreateAdjustmentInput = Omit<Adjustment, 'id' | 'createdAt' | 'schedule'> & {
  delta: {
    user_id: string;
    schedule_id: string;
    delta: DeltaItem[];
  };
};

// Define the possible change types
export type ChangeType = 'time_adjustment' | 'duration_adjustment' | 'task_added' | 'task_removed';

// Define the different types of details based on change type
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

// Define a type for a single delta item
export type DeltaItem = {
  task_id: string;
  change_type: ChangeType;
  details: TimeAdjustmentDetails | DurationAdjustmentDetails | TaskAddedDetails | TaskRemovedDetails;
};

// Define the main adjustment type
export interface AdjustmentData {
  user_id: string;
  schedule_id: string;
  delta: DeltaItem[];
}


// Type guard functions to check the type of details
export function isTimeAdjustment(details: any): details is TimeAdjustmentDetails {
  return 'from_time' in details && 'to_time' in details;
}

export function isDurationAdjustment(details: any): details is DurationAdjustmentDetails {
  return 'from_duration' in details && 'to_duration' in details;
}

export function isTaskAdded(details: any): details is TaskAddedDetails {
  return 'name' in details && 'time' in details && 'duration' in details;
}

export function isTaskRemoved(details: any): details is TaskRemovedDetails {
  return 'name' in details && 'time' in details && 'duration' in details;
}