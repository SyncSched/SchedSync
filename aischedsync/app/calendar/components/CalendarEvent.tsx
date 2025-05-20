'use client';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { CalendarEvent as CalendarEventType, Task } from '@/api/lib';
import { format } from 'date-fns';
import { Trash2, Edit, Sparkles } from 'lucide-react';

interface CalendarEventProps {
  event: CalendarEventType | Task;
  isGoogleEvent?: boolean;
  isAiSuggested?: boolean;
  isLocked?: boolean;
  onClick?: (event: CalendarEventType | Task) => void;
  onEdit?: (event: CalendarEventType | Task) => void;
  onDelete?: (event: CalendarEventType | Task) => void;
  onLockToggle?: (event: CalendarEventType | Task, locked: boolean) => void;
  style?: React.CSSProperties;
}

const CalendarEvent: React.FC<CalendarEventProps> = ({
  event,
  isGoogleEvent = false,
  isAiSuggested = false,  onClick,
  onEdit,
  onDelete,
  style
}) => {
  const { isDark } = useTheme();
  const isTask = 'scheduleId' in event;

  const getEventTime = () => {
    if (isTask) {
      const taskEvent = event as Task;
      const startTime = new Date(taskEvent.time);
      const endTime = new Date(startTime.getTime() + taskEvent.duration * 60000);
      return `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`;
    } else {
      const calendarEvent = event as CalendarEventType;
      if (calendarEvent.start?.dateTime && calendarEvent.end?.dateTime) {
        const start = new Date(calendarEvent.start.dateTime);
        const end = new Date(calendarEvent.end.dateTime);
        return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
      }
      return '';
    }
  };

  const getEventColor = () => {
    if (isGoogleEvent) {
      return isDark ? 'bg-blue-900/50 hover:bg-blue-800/50' : 'bg-blue-100 hover:bg-blue-200';
    }
    if (isAiSuggested) {
      return isDark ? 'bg-purple-900/50 hover:bg-purple-800/50' : 'bg-purple-100 hover:bg-purple-200';
    }
    return isDark ? 'bg-gray-700/50 hover:bg-gray-600/50' : 'bg-gray-100 hover:bg-gray-200';
  };

  const getBorderColor = () => {
    if (isGoogleEvent) {
      return isDark ? 'border-blue-600' : 'border-blue-400';
    }
    if (isAiSuggested) {
      return isDark ? 'border-purple-600' : 'border-purple-400';
    }
    return isDark ? 'border-gray-600' : 'border-gray-400';
  };

  const getTextColor = () => {
    if (isGoogleEvent) {
      return isDark ? 'text-blue-200' : 'text-blue-700';
    }
    if (isAiSuggested) {
      return isDark ? 'text-purple-200' : 'text-purple-700';
    }
    return isDark ? 'text-gray-200' : 'text-gray-700';
  };

  return (
    <div
      className={`group absolute rounded-md border p-1 cursor-pointer text-xs transition-colors duration-150 ${getEventColor()} ${getBorderColor()} ${getTextColor()}`}
      style={style}
      onClick={() => onClick?.(event)}
    >
      {/* Event content */}
      <div className="flex flex-col h-full">
        <div className="font-medium truncate">
          {isTask ? (event as Task).name : (event as CalendarEventType).summary}
        </div>
        <div className="text-xs opacity-75 truncate">{getEventTime()}</div>

        {/* Icons overlay - visible on hover for desktop, always visible for touch devices */}
        <div className="absolute top-1 right-1 flex items-center space-x-1 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {isAiSuggested && (
            <Sparkles className="w-3 h-3" />
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
              className="p-0.5 rounded hover:bg-black/10"
            >
              <Edit className="w-3 h-3" />
            </button>
          )}          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event);
              }}
              className="p-0.5 rounded hover:bg-black/10"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarEvent;
