export const parseTimeString = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const formatTimeString = (date: Date): string => {
  return date.toTimeString().substring(0, 5);
};

export const addMinutesToTime = (timeStr: string, minutes: number): string => {
  const date = parseTimeString(timeStr);
  date.setMinutes(date.getMinutes() + minutes);
  return formatTimeString(date);
};

export const getTimeDifferenceInMinutes = (time1: string, time2: string): number => {
  const date1 = parseTimeString(time1);
  const date2 = parseTimeString(time2);
  return Math.round((date2.getTime() - date1.getTime()) / (1000 * 60));
};

export const isTaskActive = (taskTime: string, taskDuration: number): boolean => {
  const now = new Date();
  const taskStart = parseTimeString(taskTime);
  const taskEnd = new Date(taskStart);
  taskEnd.setMinutes(taskStart.getMinutes() + taskDuration);
  return now >= taskStart && now <= taskEnd;
}; 