'use client';
import { useState, useEffect } from 'react';
import { CalendarEvent as CalendarEventType, Task, getTodaySchedule, getWeekSchedule, updateSchedule, rescheduleTask, RescheduledTask } from '@/api/lib';
import CalendarHeader from './components/CalendarHeader';
import DayView from './components/DayView';
import WeekView from './components/WeekView';
import { TaskForm, TaskFormData as ScheduleTaskFormData } from '@/app/components/TaskForm';
import RescheduleTaskForm from '@/app/components/RescheduleTaskForm';
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

  // Reschedule related state
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentDate, view]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEvents = async () => {
    try {
      if (view === 'day') {
        // For day view, fetch today's schedule
        const schedule = await getTodaySchedule();
        if (schedule?.originalData) {
          setEvents(schedule.originalData);
        }
      } else {
        // For week view, fetch the entire week's schedule
        // Calculate start and end dates for the week
        const weekStart = startOfWeek(currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // 7 days total (0-6)

        console.log(`Fetching week schedule from ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);

        try {
          const weekSchedules = await getWeekSchedule(weekStart, weekEnd);

          // Combine all tasks from all schedules
          const allTasks: Task[] = [];
          weekSchedules.forEach(schedule => {
            if (schedule?.originalData && schedule.originalData.length > 0) {
              console.log(`Adding ${schedule.originalData.length} tasks from schedule ${schedule.id}`);
              allTasks.push(...schedule.originalData);
            }
          });

          console.log(`Total tasks for week view: ${allTasks.length}`);
          setEvents(allTasks);
        } catch (weekError) {
          console.error('Error fetching week schedule:', weekError);
          // If week schedule fails, try to at least show today's schedule
          const schedule = await getTodaySchedule();
          if (schedule?.originalData) {
            setEvents(schedule.originalData);
          }
        }
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

      // Get all tasks from the same schedule as the dragged event
      const tasksFromSameSchedule = events.filter(ev =>
        'scheduleId' in ev && ev.scheduleId === event.scheduleId
      ) as Task[];

      // Update the dragged event in the list of tasks from the same schedule
      const updatedScheduleTasks = tasksFromSameSchedule.map(task =>
        task.id === eventId ? newEvent : task
      );

      try {
        // Update only the tasks from the same schedule
        await updateSchedule(event.scheduleId, updatedScheduleTasks);

        // Update the events in the state by replacing the dragged event
        const updatedEvents = events.map(ev =>
          'scheduleId' in ev && ev.id === eventId ? newEvent : ev
        );
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
    setIsRescheduleModalOpen(false);
  };

  const handleOpenRescheduleModal = () => {
    if (selectedEvent && 'scheduleId' in selectedEvent) {
      setIsRescheduleModalOpen(true);
    }
  };

  const handleRescheduleSuccess = async (rescheduledTask: RescheduledTask) => {
    // Close the reschedule modal
    setIsRescheduleModalOpen(false);

    // Refresh the events to show the updated schedule
    await fetchEvents();
  };

  const handleViewRelatedTask = async (taskId: string) => {
    try {
      // Find the task in the current events list
      const relatedTask = events.find(event =>
        'scheduleId' in event && event.id === taskId
      ) as Task | undefined;

      if (relatedTask) {
        // If the task is in the current list, just select it
        setSelectedEvent(relatedTask);
        setModalMode('edit');
      } else {
        // If not found, we could fetch it from the server
        // For now, just show an alert
        alert('Task not found in current view. Try looking for it in the main schedule.');
      }
    } catch (error) {
      console.error('Error viewing related task:', error);
      alert('Failed to view related task');
    }
  };

  const handleModalDelete = async (task: Task) => {
    try {
      if ('scheduleId' in task) {
        // Get all tasks from the same schedule as the task to be deleted
        const tasksFromSameSchedule = events.filter(e =>
          'scheduleId' in e && e.scheduleId === task.scheduleId
        ) as Task[];

        // Remove the task from its schedule's tasks
        const updatedScheduleTasks = tasksFromSameSchedule.filter(t =>
          t.id !== task.id
        );

        await updateSchedule(task.scheduleId, updatedScheduleTasks);
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

        // Determine which schedule to update based on the selected date
        let scheduleToUpdate;

        if (view === 'day') {
          // For day view, use today's schedule
          scheduleToUpdate = await getTodaySchedule();
        } else {
          // For week view, we need to find the correct schedule for the selected date
          const selectedDay = new Date(newDate);

          // Get the week's schedules
          const weekStart = startOfWeek(currentDate);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);

          console.log(`Finding schedule for task on ${selectedDay.toISOString()}`);

          const weekSchedules = await getWeekSchedule(weekStart, weekEnd);

          // First, try to find a schedule that has tasks on the same day
          const selectedDayString = selectedDay.toDateString();
          scheduleToUpdate = weekSchedules.find(schedule => {
            return schedule.originalData.some(task => {
              const taskDate = new Date(task.time);
              return taskDate.toDateString() === selectedDayString;
            });
          });

          console.log(`Found schedule with tasks on the same day: ${scheduleToUpdate ? 'Yes' : 'No'}`);

          // If no schedule found with tasks on the same day, try to find any schedule with tasks
          if (!scheduleToUpdate && weekSchedules.length > 0) {
            // Use the first schedule that has tasks
            scheduleToUpdate = weekSchedules.find(schedule => schedule.originalData.length > 0);
            console.log(`Using first schedule with tasks: ${scheduleToUpdate ? scheduleToUpdate.id : 'None found'}`);
          }

          // If still no schedule found, fall back to today's schedule
          if (!scheduleToUpdate) {
            console.log('No suitable schedule found in week view, falling back to today\'s schedule');
            scheduleToUpdate = await getTodaySchedule();
          }
        }

        if (scheduleToUpdate) {
          const updatedTasks = [...scheduleToUpdate.originalData, newTask as Task];
          await updateSchedule(scheduleToUpdate.originalData[0].scheduleId, updatedTasks);
          await fetchEvents();
        }
      } else if (modalMode === 'edit' && selectedEvent && 'scheduleId' in selectedEvent) {
        // Update existing task - this works the same for both day and week views
        // since we already have the scheduleId from the selected event
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
    <div className="flex flex-col h-full p-2 sm:p-6 pt-2 sm:pt-4 space-y-2 sm:space-y-4">
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
              // Get all tasks from the same schedule as the event to be deleted
              const tasksFromSameSchedule = events.filter(e =>
                'scheduleId' in e && e.scheduleId === event.scheduleId
              ) as Task[];

              // Remove the event from its schedule's tasks
              const updatedScheduleTasks = tasksFromSameSchedule.filter(task =>
                task.id !== event.id
              );

              await updateSchedule(event.scheduleId, updatedScheduleTasks);
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
              // Get all tasks from the same schedule as the event to be deleted
              const tasksFromSameSchedule = events.filter(e =>
                'scheduleId' in e && e.scheduleId === event.scheduleId
              ) as Task[];

              // Remove the event from its schedule's tasks
              const updatedScheduleTasks = tasksFromSameSchedule.filter(task =>
                task.id !== event.id
              );

              await updateSchedule(event.scheduleId, updatedScheduleTasks);
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
            onViewRelatedTask={handleViewRelatedTask}
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
              isCallEnabled: selectedEvent && 'scheduleId' in selectedEvent ? selectedEvent.isCallEnabled : false,
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
            onReschedule={selectedEvent && 'scheduleId' in selectedEvent ? handleOpenRescheduleModal : undefined}
          />
        </Modal>
      )}

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && selectedEvent && 'scheduleId' in selectedEvent && (
        <Modal
          title="Reschedule Task"
          onClose={() => setIsRescheduleModalOpen(false)}
          size="md"
        >
          <RescheduleTaskForm
            task={selectedEvent as Task}
            onClose={() => setIsRescheduleModalOpen(false)}
            onSuccess={handleRescheduleSuccess}
          />
        </Modal>
      )}
    </div>
  );
}
