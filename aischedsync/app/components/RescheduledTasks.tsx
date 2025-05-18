import { useTheme } from '@/contexts/ThemeContext';
import { Task, RescheduledTask } from '@/api/lib';
import { formatDate } from '../utils/dateUtils';

interface RescheduledTasksProps {
  rescheduledTasks?: RescheduledTask[];
  onTaskClick: (task: Task, rescheduledTask: RescheduledTask) => void;
}

export default function RescheduledTasks({
  rescheduledTasks = [],
  onTaskClick
}: RescheduledTasksProps) {
  const { isDark } = useTheme();

  // We're now using the imported formatDate function

  return (
    <div className={`w-full md:w-80 ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm mb-6 md:mb-4 transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-base md:text-lg font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} transition-colors duration-300`}>
          Rescheduled Tasks
        </h3>
        {rescheduledTasks.length > 0 && (
          <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
            {rescheduledTasks.length}
          </span>
        )}
      </div>

      {rescheduledTasks.length === 0 ? (
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center py-4`}>
          No rescheduled tasks
        </div>
      ) : (
        <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
          {rescheduledTasks.map((rescheduledTask) => {
            // Create a dummy task if task is undefined
            const task = rescheduledTask.task || {
              id: rescheduledTask.taskId,
              name: "Task " + rescheduledTask.taskId.substring(0, 4),
              time: rescheduledTask.originalTaskTime,
              scheduleId: "",
              duration: 0,
              isEmailEnabled: false,
              isWhatsAppEnabled: false,
              isTelegramEnabled: false,
              isCallEnabled: false
            };

            return (
              <div
                key={rescheduledTask.id}
                className={`${isDark ? 'bg-gray-700 hover:bg-gray-650' : 'bg-[#f7f9fa] hover:bg-gray-100'} rounded-xl p-3 border ${
                  isDark ? 'border-gray-600' : 'border-gray-200'
                } shadow-sm transition-all duration-300 cursor-pointer`}
                onClick={() => onTaskClick(task, rescheduledTask)}
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} transition-colors duration-300`}>
                      {task.name}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                      {rescheduledTask.rescheduledTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                      {formatDate(rescheduledTask.rescheduledDate)}
                    </span>
                  </div>
                  {rescheduledTask.reason && (
                    <div className="mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
                      <span className={`text-xs italic ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300 line-clamp-2`}>
                        Reason: {rescheduledTask.reason}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
