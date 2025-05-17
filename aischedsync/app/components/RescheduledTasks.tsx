import { useTheme } from '@/contexts/ThemeContext';
import { Task } from '@/api/lib';
import { formatToHHMM } from '../utils/dateUtils';

interface RescheduledTasksProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function RescheduledTasks({
  tasks,
  onTaskClick
}: RescheduledTasksProps) {
  const { isDark } = useTheme();

  // Format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className={`w-full md:w-80 ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm mb-6 md:mb-4 transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-base md:text-lg font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} transition-colors duration-300`}>
          Rescheduled Tasks
        </h3>
        {tasks.length > 0 && (
          <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
            {tasks.length}
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center py-4`}>
          No rescheduled tasks
        </div>
      ) : (
        <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`${isDark ? 'bg-gray-700 hover:bg-gray-650' : 'bg-[#f7f9fa] hover:bg-gray-100'} rounded-xl p-3 border ${
                isDark ? 'border-gray-600' : 'border-gray-200'
              } shadow-sm transition-all duration-300 cursor-pointer`}
              onClick={() => onTaskClick(task)}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} transition-colors duration-300`}>
                    {task.name}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                    {formatToHHMM(task.time)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                    {formatDate(task.time)}
                  </span>
                </div>
                {task.rescheduledReason && (
                  <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                    <span className={`text-xs italic ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300 line-clamp-2`}>
                      Reason: {task.rescheduledReason}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
