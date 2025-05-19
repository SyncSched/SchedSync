import { useTheme } from '@/contexts/ThemeContext';
import { Task } from '@/api/lib';

interface TaskStatusModalProps {
  task: Task;
  onClose: () => void;
  onComplete: (task: Task) => void;
  onNotComplete: (task: Task) => void;
  onReschedule: (task: Task) => void;
}

export default function TaskStatusModal({
  task,
  onClose,
  onComplete,
  onNotComplete,
  onReschedule
}: TaskStatusModalProps) {
  const { isDark } = useTheme();

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl overflow-hidden max-w-md w-full`}>
      <div className={`p-4 ${isDark ? 'bg-gray-700' : 'bg-blue-500'} flex justify-between items-center`}>
        <h2 className="text-white font-bold text-lg">Task Status</h2>
        <button
          onClick={onClose}
          className="text-white hover:bg-opacity-20 hover:bg-white p-1 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className={`p-6 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">"{task.name}"</h3>
          <p className="text-sm mb-4">
            This task's scheduled time has passed. Was it completed?
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          <button
            onClick={() => onComplete(task)}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center shadow-md ${
              isDark
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-base font-medium">Completed</span>
          </button>

          <button
            onClick={() => onNotComplete(task)}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center shadow-md ${
              isDark
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-base font-medium">Not Completed</span>
          </button>

          <button
            onClick={() => {
              // Mark the task as overdue
              onNotComplete({ ...task, status: 'OVERDUE' });
            }}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center shadow-md ${
              isDark
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-base font-medium">Overdue</span>
          </button>

          <button
            onClick={() => {
              // Mark the task as rescheduled
              onNotComplete({ ...task, status: 'RESCHEDULED' });
              // Then open the reschedule modal
              onReschedule(task);
            }}
            className={`w-full py-3 px-4 rounded-md flex items-center justify-center shadow-md ${
              isDark
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-base font-medium">Reschedule</span>
          </button>
        </div>
      </div>
    </div>
  );
}
