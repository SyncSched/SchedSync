'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { CalendarEvent as CalendarEventType, Task } from '@/api/lib';
import CalendarEvent from './CalendarEvent';

interface DayColumnProps {
  date: Date;
  events: (CalendarEventType | Task)[];
  isToday?: boolean;
  startHour?: number;
  endHour?: number;
  onEventClick: (event: CalendarEventType | Task) => void;
  onEventEdit?: (event: CalendarEventType | Task) => void;
  onEventDelete?: (event: CalendarEventType | Task) => void;
  onEventLockToggle?: (event: CalendarEventType | Task, locked: boolean) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, date: Date, hour: number) => void;
  lockedEvents: string[];
  aiSuggestedEvents: string[];
}

const DayColumn: React.FC<DayColumnProps> = ({
  date,
  events,
  isToday = false,
  startHour = 0,
  endHour = 23,
  onEventClick,
  onEventEdit,
  onEventDelete,
  onEventLockToggle,
  onTimeSlotClick,
  onDragOver,
  onDrop,
  lockedEvents,
  aiSuggestedEvents
}) => {
  const { isDark } = useTheme();
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  
  // Format the day for display (e.g., "Mon 5")
  const formatDay = () => {
    const day = date.toLocaleString('en-US', { weekday: 'short' });
    const dayNum = date.getDate();
    return `${day} ${dayNum}`;
  };

  // Check if an event is a Google Calendar event
  const isGoogleEvent = (event: CalendarEventType | Task): boolean => {
    return 'htmlLink' in event;
  };

  // Check if an event is locked
  const isEventLocked = (event: CalendarEventType | Task): boolean => {
    const id = 'id' in event ? event.id : '';
    return lockedEvents.includes(id);
  };

  // Check if an event is AI suggested
  const isAiSuggested = (event: CalendarEventType | Task): boolean => {
    const id = 'id' in event ? event.id : '';
    return aiSuggestedEvents.includes(id);
  };

  // Position events in the grid based on their time
  const getEventsByHour = (hour: number) => {
    return events.filter(event => {
      const eventTime = 'time' in event 
        ? new Date(event.time) 
        : event.start?.dateTime 
          ? new Date(event.start.dateTime) 
          : null;
      
      if (!eventTime) return false;
      
      return eventTime.getHours() === hour;
    });
  };

  // Create a new date object for a specific hour
  const getDateWithHour = (hour: number) => {
    const newDate = new Date(date);
    newDate.setHours(hour, 0, 0, 0);
    return newDate;
  };

  return (
    <div className={`flex-1 min-w-[120px] border-l ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Day header */}
      <div className={`h-12 flex flex-col items-center justify-center ${
        isToday 
          ? isDark 
            ? 'bg-blue-900/20 text-blue-300' 
            : 'bg-blue-50 text-blue-800'
          : ''
      }`}>
        <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {formatDay()}
        </div>
        {isToday && (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mt-1 ${
            isDark ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white'
          }`}>
            {date.getDate()}
          </div>
        )}
      </div>
      
      {/* Hour cells */}
      {hours.map((hour) => {
        const hourEvents = getEventsByHour(hour);
        const hourDate = getDateWithHour(hour);
        
        return (
          <div 
            key={hour}
            className={`relative h-16 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} ${
              hour === new Date().getHours() && isToday
                ? isDark
                  ? 'bg-blue-900/10'
                  : 'bg-blue-50/50'
                : ''
            }`}
            onClick={() => onTimeSlotClick(hourDate, hour)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, date, hour)}
          >
            {/* Current time indicator */}
            {hour === new Date().getHours() && isToday && (
              <div className={`absolute left-0 right-0 border-t-2 ${
                isDark ? 'border-red-500' : 'border-red-500'
              }`} style={{ top: `${(new Date().getMinutes() / 60) * 100}%` }}></div>
            )}
            
            {/* Events in this hour */}
            <div className="p-1 space-y-1">
              {hourEvents.map((event, index) => (
                <CalendarEvent
                  key={`event-${index}-${hour}`}
                  event={event}
                  isGoogleEvent={isGoogleEvent(event)}
                  isAiSuggested={isAiSuggested(event)}
                  isLocked={isEventLocked(event)}
                  onClick={onEventClick}
                  onEdit={onEventEdit}
                  onDelete={onEventDelete}
                  onLockToggle={onEventLockToggle}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DayColumn;
