'use client';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { CalendarEvent as CalendarEventType, Task } from '@/api/lib';
import TimeColumn from './TimeColumn';
import CalendarEvent from './CalendarEvent';
import { format } from 'date-fns';

interface DayViewProps {
  currentDate: Date;
  events: (CalendarEventType | Task)[];
  startHour?: number; // Default: 0
  endHour?: number; // Default: 24
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

const DayView: React.FC<DayViewProps> = ({
  currentDate,
  events,
  startHour = 0,
  endHour = 24,
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

  // Get events for the current day
  const todaysEvents = events.filter(event => {
    const eventDate = new Date('scheduleId' in event ? event.time : (event.start?.dateTime || ''));
    return eventDate.toDateString() === currentDate.toDateString();
  });

  // Calculate event position and height
  const getEventStyle = (event: CalendarEventType | Task): React.CSSProperties => {
    const isTask = 'scheduleId' in event;
    const startTime = new Date(isTask ? event.time : (event.start?.dateTime || ''));
    const duration = isTask ? event.duration : calculateEventDuration(event);

    const hourHeight = 100; // Increased from 60 to 100 pixels per hour
    const top = (startTime.getHours() - startHour + startTime.getMinutes() / 60) * hourHeight;
    const height = (duration / 60) * hourHeight; // Convert duration to hours and multiply by hourHeight

    return {
      position: 'absolute',
      top: `${top}px`,
      height: `${height}px`,
      width: 'calc(100% - 1rem)',
      left: '0.5rem',
      zIndex: 10
    };
  };

  const calculateEventDuration = (event: CalendarEventType): number => {
    if (event.start?.dateTime && event.end?.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      return (end.getTime() - start.getTime()) / (1000 * 60);
    }
    return 60; // Default 1 hour
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className={`relative ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden transition-colors duration-300 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Day header */}
      <div className="flex overflow-x-auto">
        <div className="w-16 shrink-0 sticky left-0 z-10" /> {/* Spacer for time column */}
        <div className={`flex-1 p-2 text-center border-b ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } transition-colors duration-300`}>
          <div className={`text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {format(currentDate, 'EEEE')}
          </div>
          <div className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            {format(currentDate, 'MMMM d')}
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex h-[calc(100vh-12rem)] overflow-y-auto overflow-x-auto">
        <div className="sticky left-0 z-10 bg-inherit">
          <TimeColumn startHour={startHour} endHour={endHour} />
        </div>

        {/* Day column */}
        <div className="flex-1 relative min-w-[calc(100%-4rem)]">
          {/* Hour grid lines */}
          {hours.map(hour => (
            <div
              key={hour}
              className={`absolute w-full h-[100px] ${
                isDark
                  ? `border-gray-700/50 ${isToday(currentDate) ? 'bg-blue-900/10' : ''}`
                  : `border-gray-200 ${isToday(currentDate) ? 'bg-blue-50/30' : ''}`
              } transition-colors duration-300 ${hour === 0 ? '' : 'border-t'}`}
              style={{ top: `${(hour - startHour) * 100}px` }}
              onDragOver={onDragOver}
              onDrop={(e) => {
                const date = new Date(currentDate);
                date.setHours(hour);
                onDrop(e, date, hour);
              }}
              onClick={() => {
                const date = new Date(currentDate);
                date.setHours(hour);
                onTimeSlotClick(date, hour);
              }}
            >
              {/* 30-minute marker */}
              <div
                className={`absolute top-1/2 w-full border-t ${
                  isDark ? 'border-gray-700/30' : 'border-gray-200/70'
                } transition-colors duration-300`}
              />
            </div>
          ))}

          {/* Events */}
          {todaysEvents.map((event, index) => {
            const isTask = 'scheduleId' in event;
            const eventId = isTask ? (event as Task).id : (event as CalendarEventType).id;

            return (
              <CalendarEvent
                key={`${eventId}-${index}`}
                event={event}
                isGoogleEvent={!isTask}
                isAiSuggested={aiSuggestedEvents.includes(eventId)}
                isLocked={lockedEvents.includes(eventId)}
                onClick={onEventClick}
                onEdit={onEventEdit}
                onDelete={onEventDelete}
                onLockToggle={onEventLockToggle}
                style={getEventStyle(event)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayView;
