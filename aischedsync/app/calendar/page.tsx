'use client';
import { useState, useEffect } from 'react';
import { CalendarEvent as CalendarEventType, Task, getTodaySchedule, updateSchedule } from '@/api/lib';
import CalendarHeader from './components/CalendarHeader';
import DayView from './components/DayView';
import WeekView from './components/WeekView';
import { TaskForm, TaskFormData as ScheduleTaskFormData } from '@/app/components/TaskForm';
import Modal from '@/app/components/ui/Modal';
import { startOfWeek } from 'date-fns';

export interface TaskFormData {
  name: string;
  description: string;
  notes: string;
  duration: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS';
  location: string;
  isEmailEnabled: boolean;
  isWhatsAppEnabled: boolean;
  isTelegramEnabled: boolean;
  isCallEnabled: boolean;
  time?: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');
  const [events, setEvents] = useState<(CalendarEventType | Task)[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventType | Task | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [lockedEvents, setLockedEvents] = useState<string[]>([]);
  const [aiSuggestedEvents] = useState<string[]>([]);

  useEffect(() => {
    fetchEvents();
  }, [currentDate, view]);

  const fetchEvents = async () => {
    try {
      const schedule = await getTodaySchedule();
      if (schedule?.originalData) {
        setEvents(schedule.originalData);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleEventClick = (event: CalendarEventType | Task) => {
    setSelectedEvent(event);
    setModalMode('edit');
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setSelectedHour(hour);
    setSelectedEvent(null);
    setModalMode('add');
  };

  const handleEventDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleEventDrop = async (e: React.DragEvent, date: Date, hour: number) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData('text/plain');
    const event = events.find(ev => 'scheduleId' in ev && ev.id === eventId) as Task | undefined;

    if (event) {
      const newEvent = { ...event };
      const newDate = new Date(date);
      newDate.setHours(hour);
      newEvent.time = newDate.toISOString();

      const updatedEvents = events.map(ev =>
        'scheduleId' in ev && ev.id === eventId ? newEvent : ev
      );

      try {
        await updateSchedule(event.scheduleId, updatedEvents as Task[]);
        setEvents(updatedEvents);
      } catch (error) {
        console.error('Error updating event:', error);
      }
    }
  };

  const handleEventLockToggle = (event: CalendarEventType | Task, locked: boolean) => {
    if ('scheduleId' in event) {
      if (locked) {
        setLockedEvents(prev => [...prev, event.id]);
      } else {
        setLockedEvents(prev => prev.filter(id => id !== event.id));
      }
    }
  };

  const handleModalClose = () => {
    setSelectedEvent(null);
    setSelectedHour(null);
  };

  const handleModalDelete = async (task: Task) => {
    try {
      if ('scheduleId' in task) {
        const updatedEvents = events.filter(e =>
          !('scheduleId' in e) || e.id !== task.id
        ) as Task[];
        await updateSchedule(task.scheduleId, updatedEvents);
        await fetchEvents();
      }
      handleModalClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleModalSave = async (formData: TaskFormData) => {
    try {
      if (modalMode === 'add' && selectedHour !== null) {
        // Create new task
        const newDate = new Date(currentDate);
        newDate.setHours(selectedHour, 0, 0, 0);

        const newTask: Partial<Task> = {
          ...formData,
          time: newDate.toISOString()
        };

        const scheduleData = await getTodaySchedule();
        if (scheduleData) {
          const updatedTasks = [...scheduleData.originalData, newTask as Task];
          await updateSchedule(scheduleData.originalData[0].scheduleId, updatedTasks);
          await fetchEvents();
        }
      } else if (modalMode === 'edit' && selectedEvent && 'scheduleId' in selectedEvent) {
        // Update existing task
        const updatedTasks = events.map(e => {
          if ('scheduleId' in e && e.id === selectedEvent.id) {
            return {
              ...e,
              ...formData,
              time: formData.time || e.time || new Date().toISOString()
            };
          }
          return e;
        }) as Task[];
        await updateSchedule(selectedEvent.scheduleId, updatedTasks);
        await fetchEvents();
      }
      handleModalClose();
    } catch (error) {
      console.error('Error handling form submission:', error);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 pt-4 space-y-4">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onViewChange={setView}
        onDateChange={setCurrentDate}
      />

      {view === 'day' ? (
        <DayView
          currentDate={currentDate}
          events={events}
          onEventClick={handleEventClick}
          onEventEdit={event => {
            setSelectedEvent(event);
            setModalMode('edit');
          }}
          onEventDelete={async event => {
            if ('scheduleId' in event) {
              const updatedEvents = events.filter(e =>
                !('scheduleId' in e) || e.id !== event.id
              ) as Task[];
              await updateSchedule(event.scheduleId, updatedEvents);
              await fetchEvents();
            }
          }}
          onEventLockToggle={handleEventLockToggle}
          onTimeSlotClick={handleTimeSlotClick}
          onDragOver={handleEventDragOver}
          onDrop={handleEventDrop}
          lockedEvents={lockedEvents}
          aiSuggestedEvents={aiSuggestedEvents}
        />
      ) : (
        <WeekView
          currentDate={startOfWeek(currentDate)}
          events={events}
          onEventClick={handleEventClick}
          onEventEdit={event => {
            setSelectedEvent(event);
            setModalMode('edit');
          }}
          onEventDelete={async event => {
            if ('scheduleId' in event) {
              const updatedEvents = events.filter(e =>
                !('scheduleId' in e) || e.id !== event.id
              ) as Task[];
              await updateSchedule(event.scheduleId, updatedEvents);
              await fetchEvents();
            }
          }}
          onEventLockToggle={handleEventLockToggle}
          onTimeSlotClick={handleTimeSlotClick}
          onDragOver={handleEventDragOver}
          onDrop={handleEventDrop}
          lockedEvents={lockedEvents}
          aiSuggestedEvents={aiSuggestedEvents}
        />
      )}

      {(selectedEvent || selectedHour !== null) && (
        <Modal
          title={modalMode === 'add' ? 'Add Task' : 'Edit Task'}
          onClose={handleModalClose}
          size="md"
        >
          <TaskForm
            mode={modalMode}
            initialTask={{
              name: selectedEvent && 'scheduleId' in selectedEvent ? selectedEvent.name :
                    selectedEvent && 'summary' in selectedEvent ? selectedEvent.summary : '',
              description: selectedEvent && 'scheduleId' in selectedEvent ? selectedEvent.description :
                          selectedEvent && 'description' in selectedEvent ? selectedEvent.description : '',
              notes: selectedEvent && 'scheduleId' in selectedEvent ? selectedEvent.notes : '',
              time: selectedEvent && 'scheduleId' in selectedEvent ? selectedEvent.time :
                   selectedEvent && 'start' in selectedEvent && selectedEvent.start?.dateTime ?
                   selectedEvent.start.dateTime :
                   (selectedHour !== null ? new Date(new Date(currentDate).setHours(selectedHour, 0, 0, 0)).toISOString() : new Date().toISOString()),
              duration: selectedEvent && 'scheduleId' in selectedEvent ? selectedEvent.duration : 30,
              priority: selectedEvent && 'scheduleId' in selectedEvent ? selectedEvent.priority : 'MEDIUM',
              status: selectedEvent && 'scheduleId' in selectedEvent ?
                     (selectedEvent.status === 'IN_PROGRESS' ? 'PENDING' : selectedEvent.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING') : 'PENDING',
              location: selectedEvent && 'scheduleId' in selectedEvent ? selectedEvent.location :
                       selectedEvent && 'location' in selectedEvent ? selectedEvent.location : null,
              isEmailEnabled: selectedEvent && 'scheduleId' in selectedEvent ? selectedEvent.isEmailEnabled : false,
              isWhatsAppEnabled: selectedEvent && 'scheduleId' in selectedEvent ? selectedEvent.isWhatsAppEnabled : false,
              isTelegramEnabled: selectedEvent && 'scheduleId' in selectedEvent ? selectedEvent.isTelegramEnabled : false,
              isCallEnabled: selectedEvent && 'scheduleId' in selectedEvent ? selectedEvent.isCallEnabled : false
            }}
            onSubmit={(formData) => {
              // Convert ScheduleTaskFormData to TaskFormData
              const taskFormData: TaskFormData = {
                name: formData.name,
                description: formData.description,
                notes: formData.notes || '',
                duration: formData.duration,
                priority: formData.priority,
                status: formData.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
                location: formData.location || '',
                isEmailEnabled: formData.isEmailEnabled,
                isWhatsAppEnabled: formData.isWhatsAppEnabled,
                isTelegramEnabled: formData.isTelegramEnabled,
                isCallEnabled: formData.isCallEnabled,
                time: formData.time
              };
              handleModalSave(taskFormData);
            }}
            onClose={handleModalClose}
            onDelete={selectedEvent && 'scheduleId' in selectedEvent ? () => handleModalDelete(selectedEvent) : undefined}
          />
        </Modal>
      )}
    </div>
  );
}
