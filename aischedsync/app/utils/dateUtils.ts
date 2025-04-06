export const parseTimeString = (timeStr: string | Date): Date => {
  if (timeStr instanceof Date) return timeStr;
  return new Date(timeStr);
};

export const formatTimeString = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

// Updated formatToHHMM function to handle HH:mm format
export const formatToHHMM = (isoString: string | Date): string => {
  try {
    // If input is already in HH:mm format, return it
    if (typeof isoString === 'string' && isoString.match(/^\d{2}:\d{2}$/)) {
      return isoString;
    }

    // Handle Date object or ISO string
    const date = isoString instanceof Date ? isoString : new Date(isoString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date input:', isoString);
      const now = new Date();
      return now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
};

// Updated convertHHMMToISO function
export const convertHHMMToISO = (timeStr: string): string => {
  try {
    // If already in ISO format, return as is
    if (timeStr.includes('T')) {
      return timeStr;
    }

    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  } catch (error) {
    console.error('Error converting time to ISO:', error);
    return new Date().toISOString();
  }
};

export const addMinutesToTime = (timeStr: string, minutes: number): string => {
  const date = new Date();
  const [hours, mins] = timeStr.split(':').map(Number);
  date.setHours(hours, mins);
  date.setMinutes(date.getMinutes() + minutes);

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const getTimeDifferenceInMinutes = (time1: Date | string, time2: Date | string): number => {
  const date1 = time1 instanceof Date ? time1 : new Date(time1);
  const date2 = time2 instanceof Date ? time2 : new Date(time2);
  return Math.round((date2.getTime() - date1.getTime()) / (1000 * 60));
};

export const isTaskActive = (taskTime: Date | string, taskDuration: number): boolean => {
  const now = new Date();
  const taskStart = taskTime instanceof Date ? taskTime : new Date(taskTime);
  const taskEnd = new Date(taskStart.getTime());
  taskEnd.setMinutes(taskEnd.getMinutes() + taskDuration);
  return now >= taskStart && now <= taskEnd;
};

// Helper function to format time for display with AM/PM
export const formatTimeForDisplay = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Helper function to get current time in ISO format
export const getCurrentTimeISO = (): string => {
  return new Date().toISOString();
};

// Convert UTC date string to local date for display
export const utcToLocal = (dateString: string): Date => {
  const date = new Date(dateString);
  return date;
};

// Convert local date to UTC for storage
export const localToUTC = (localDate: Date): string => {
  return localDate.toISOString();
};

// Format date for datetime-local input in local timezone
export const formatDateForDatetimeLocal = (dateString: string): string => {
  const date = new Date(dateString);

  // Format to YYYY-MM-DDThh:mm format required by datetime-local input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
