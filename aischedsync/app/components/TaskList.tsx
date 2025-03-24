import { Task } from '@/api/lib';
import { isTaskActive, formatToHHMM } from '../utils/dateUtils';
import Loading from './Loading';

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
          tasks.map((task, index) => (
            <div 
              key={task.id} 
              data-task-id={task.id}
              draggable
              data-draggable="true"
              onDragStart={(e) => onDragStart(e, 'main', index)}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, 'main', index)}
              onClick={() => onTaskClick(task)}
              className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow transition-all cursor-pointer ${
                (() => {
                  const now = new Date();
                  const taskStart = new Date();
                  taskStart.setHours(parseInt(task.time.split(':')[0]), parseInt(task.time.split(':')[1]));
                  const taskEnd = new Date(taskStart);
                  taskEnd.setMinutes(taskStart.getMinutes() + task.duration);
                  return now > taskEnd ? 'opacity-60 hover:opacity-100 transition-all duration-200' : '';
                })()
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-gray-900 text-sm md:text-base">{task.name}</h3>
                  <span className="text-gray-600">
                    {formatToHHMM(task.time)}
                  </span>
                  {isTaskActive(task.time, task.duration) && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </div>
                <button className="text-gray-400 hover:text-gray-600" onClick={() => onTaskClick(task)}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-sm text-gray-600">{task.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-sm text-gray-600">{task.duration} min</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
