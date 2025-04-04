import { Task } from '@/api/lib';
import { isTaskActive, formatToHHMM } from '../utils/dateUtils';
import Loading from './Loading';
import { useEffect, useState } from 'react';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onTaskClick: (task: Task) => void;
  onDragStart: (e: React.DragEvent, columnType: 'main' | 'quick', index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnType: 'main' | 'quick', index: number) => void;
}

export default function TaskList({
  tasks,
  isLoading,
  onTaskClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop
}: TaskListProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Find the active task index
  const activeTaskIndex = tasks.findIndex(task => isTaskActive(task.time, task.duration));

  const handleTaskClick = (task: Task, index: number, isPastTask: boolean) => {
    if (!isPastTask) {
      onTaskClick(task);
    }
  };

  return (
    <div className="flex-1 bg-white p-6 rounded-xl shadow-sm min-h-[400px] md:min-h-[500px] overflow-y-auto max-h-[500px] scrollable">
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">
            <Loading />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Loading />
          </div>
        ) : (
          tasks.map((task, index) => {
            const taskStart = new Date();
            taskStart.setHours(parseInt(task.time.split(':')[0]), parseInt(task.time.split(':')[1]));
            const taskEnd = new Date(taskStart);
            taskEnd.setMinutes(taskStart.getMinutes() + task.duration);
            const isActive = isTaskActive(task.time, task.duration);
            const isPastTask = activeTaskIndex !== -1 && index < activeTaskIndex;

            return (
              <div 
                key={task.id} 
                data-task-id={task.id}
                draggable
                data-draggable="true"
                onDragStart={(e) => onDragStart(e, 'main', index)}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, 'main', index)}
                onClick={() => handleTaskClick(task, index, isPastTask)}
                className={`p-4 rounded-xl border shadow-sm hover:shadow transition-all ${
                  isPastTask 
                    ? 'bg-[#f5f5f5] border-gray-200 cursor-default' 
                    : 'bg-white border-gray-100 cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className={`font-medium text-sm md:text-base ${
                      isPastTask ? 'text-gray-500' : 'text-gray-900'
                    }`}>{task.name}</h3>
                    {isActive && (
                      <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium bg-green-100 text-[#22c55e] dark:bg-green-800/30 dark:text-[#22c55e] border-[0.25px] border-[#22c55e]">
                        <span className="size-1.5 inline-block rounded-full bg-[#22c55e] animate-pulse shadow-sm shadow-green-400" />
                        {currentTime}
                      </span>
                    )}
                  </div>
                  <button 
                    className={`${isPastTask ? 'text-gray-300 cursor-default' : 'text-gray-400 hover:text-gray-600'}`} 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isPastTask) {
                        onTaskClick(task);
                      }
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <svg className={`w-4 h-4 ${isPastTask ? 'text-gray-300' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className={`text-sm ${isPastTask ? 'text-gray-400' : 'text-gray-600'}`}>{formatToHHMM(task.time)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className={`w-4 h-4 ${isPastTask ? 'text-gray-300' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className={`text-sm ${isPastTask ? 'text-gray-400' : 'text-gray-600'}`}>{task.duration} min</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 