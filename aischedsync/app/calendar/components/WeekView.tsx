'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { CalendarEvent as CalendarEventType, Task } from '@/api/lib';
import TimeColumn from './TimeColumn';
import CalendarEvent from './CalendarEvent';
import { format, addDays, startOfDay } from 'date-fns';

interface WeekViewProps {
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

const WeekView: React.FC<WeekViewProps> = ({
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

  // Get start of the week (Sunday)
  const weekStart = startOfDay(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Helper function to check if two events overlap
  const eventsOverlap = (event1: CalendarEventType | Task, event2: CalendarEventType | Task) => {
    const start1 = new Date('scheduleId' in event1 ? event1.time : (event1.start?.dateTime || ''));
    const end1 = new Date(start1.getTime() + ('scheduleId' in event1 ? event1.duration : calculateEventDuration(event1)) * 60000);
    const start2 = new Date('scheduleId' in event2 ? event2.time : (event2.start?.dateTime || ''));
    const end2 = new Date(start2.getTime() + ('scheduleId' in event2 ? event2.duration : calculateEventDuration(event2)) * 60000);

    return start1 < end2 && end1 > start2;
  };

  // Calculate overlapping groups and positions for events
  const getEventPositioning = (events: (CalendarEventType | Task)[]) => {
    const eventGroups: { event: CalendarEventType | Task; group: number; position: number }[] = [];
    const processedEvents = new Set<string>();

    // Sort events by start time to ensure consistent positioning
    const sortedEvents = [...events].sort((a, b) => {
      const timeA = new Date('scheduleId' in a ? a.time : (a.start?.dateTime || '')).getTime();
      const timeB = new Date('scheduleId' in b ? b.time : (b.start?.dateTime || '')).getTime();
      return timeA - timeB;
    });

    // Process each event to find overlapping groups
    sortedEvents.forEach(event1 => {
      if (processedEvents.has(getEventId(event1))) return;

      // Find all events that overlap with the current event
      const overlappingEvents = sortedEvents.filter(event2 =>
        !processedEvents.has(getEventId(event2)) && eventsOverlap(event1, event2)
      );

      // Add all overlapping events to the same group
      const groupSize = overlappingEvents.length;
      overlappingEvents.forEach((event, index) => {
        eventGroups.push({
          event,
          group: groupSize,
          position: index
        });
        processedEvents.add(getEventId(event));
      });
    });

    return eventGroups;
  };

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    // First filter events by date
    const dayEvents = events.filter(event => {
      const eventDate = new Date('scheduleId' in event ? event.time : (event.start?.dateTime || ''));
      return eventDate.toDateString() === date.toDateString();
    });

    // Then deduplicate events by ID to prevent showing the same task twice
    const uniqueEvents = [];
    const seenIds = new Set();

    for (const event of dayEvents) {
      const eventId = 'scheduleId' in event ? event.id : (event as CalendarEventType).id;
      if (!seenIds.has(eventId)) {
        seenIds.add(eventId);
        uniqueEvents.push(event);
      }
    }

    return uniqueEvents;
  };

  // Helper function to get event ID
  const getEventId = (event: CalendarEventType | Task): string => {
    return 'scheduleId' in event ? event.id : (event as CalendarEventType).id;
  };

  // Calculate event duration in minutes
  const calculateEventDuration = (event: CalendarEventType): number => {
    if (event.start?.dateTime && event.end?.dateTime) {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      return (end.getTime() - start.getTime()) / (1000 * 60);
    }
    return 60; // Default 1 hour
  };

  // Calculate event position and height
  const getEventStyle = (event: CalendarEventType | Task, dayEvents: (CalendarEventType | Task)[]): React.CSSProperties => {
    const isTask = 'scheduleId' in event;
    const startTime = new Date(isTask ? event.time : (event.start?.dateTime || ''));
    const duration = isTask ? event.duration : calculateEventDuration(event);

    // Increase the scaling factor for top positioning and height
    const hourHeight = 100; // Increased from 60 to 100 pixels per hour
    const top = (startTime.getHours() - startHour + startTime.getMinutes() / 60) * hourHeight;
    const height = (duration / 60) * hourHeight; // Convert duration to hours and multiply by hourHeight

    // Calculate event positioning within its day column
    const eventPositions = getEventPositioning(dayEvents);
    const eventPosition = eventPositions.find(e => getEventId(e.event) === getEventId(event));

    const width = eventPosition ? `calc((100% - 8px) / ${eventPosition.group})` : 'calc(100% - 8px)';
    const left = eventPosition ? `calc(${(eventPosition.position * 100) / eventPosition.group}% + 4px)` : '4px';

    return {
      position: 'absolute',
      top: `${top}px`,
      height: `${height}px`,
      width,
      left,
      zIndex: 10,
    };
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  return (
    <div className={`relative ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden transition-colors duration-300 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* Week header */}
      <div className="flex overflow-x-auto">
        <div className="w-16 shrink-0 sticky left-0 z-10" /> {/* Spacer for time column */}
        {days.map((day, index) => (
          <div
            key={index}
            className={`min-w-[100px] sm:min-w-0 sm:flex-1 p-2 text-center border-b border-r ${
              isDark
                ? `bg-gray-800 ${isToday(day) ? 'border-blue-500' : 'border-gray-700'}`
                : `bg-white ${isToday(day) ? 'border-blue-500' : 'border-gray-200'}`
            } transition-colors duration-300`}
          >
            <div className={`text-xs uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {format(day, 'EEE')}
            </div>
            <div className={`text-sm font-medium ${
              isToday(day)
                ? 'text-blue-500'
                : isDark
                ? 'text-gray-200'
                : 'text-gray-700'
            }`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex h-[calc(100vh-12rem)] overflow-y-auto overflow-x-auto">
        {/* Time column - now inside the scrollable container but sticky */}
        <div className="sticky left-0 z-10 bg-inherit">
          <TimeColumn startHour={startHour} endHour={endHour} />
        </div>

        {/* Day columns */}
        <div className="flex min-w-max sm:min-w-0 sm:flex-1">
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="min-w-[100px] sm:min-w-0 sm:flex-1 relative">
              {/* Hour grid lines */}
              {hours.map(hour => (
                <div
                  key={hour}
                  className={`absolute w-full h-[100px] ${
                    isDark
                      ? `border-gray-700/50 ${isToday(day) ? 'bg-blue-900/10' : ''}`
                      : `border-gray-200 ${isToday(day) ? 'bg-blue-50/30' : ''}`
                  } transition-colors duration-300 ${hour === 0 ? '' : 'border-t'}`}
                  style={{ top: `${(hour - startHour) * 100}px` }}
                  onDragOver={onDragOver}
                  onDrop={(e) => {
                    const date = new Date(day);
                    date.setHours(hour);
                    onDrop(e, date, hour);
                  }}
                  onClick={() => {
                    const date = new Date(day);
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

              {/* Events for this day */}
              {getEventsForDay(day).map((event, index) => {
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
                    style={getEventStyle(event, getEventsForDay(day))}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
