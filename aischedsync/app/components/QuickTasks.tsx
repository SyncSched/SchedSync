import { useTheme } from '@/contexts/ThemeContext';

interface QuickTask {
  id: number;
  title: string;
  time: string;
}

interface QuickTasksProps {
  tasks: QuickTask[];
  onDragStart: (e: React.DragEvent, columnType: 'main' | 'quick', index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnType: 'main' | 'quick', index: number) => void;
  onAddTask: () => void;
}

export default function QuickTasks({
  tasks,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onAddTask
}: QuickTasksProps) {
  const { isDark } = useTheme();

  return (
    <div className={`w-full md:w-80 ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm mb-6 md:mb-4 transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-base md:text-lg font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} transition-colors duration-300`}>Reschedule</h3>
      </div>

      <div className="space-y-3 mb-4">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className={`${isDark ? 'bg-gray-700' : 'bg-[#f7f9fa]'} rounded-xl p-3 border ${
              isDark ? 'border-gray-600' : 'border-gray-200'
            } shadow-sm transition-all duration-300`}
            draggable
            onDragStart={(e) => onDragStart(e, 'quick', index)}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, 'quick', index)}
            data-draggable="true"
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'} transition-colors duration-300`}>{task.title}</span>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>{task.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 pt-2">
        <button
          onClick={onAddTask}
          className={`w-full ${
            isDark 
              ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' 
              : 'bg-black text-white hover:bg-gray-800'
          } rounded-xl py-3 text-sm font-medium transition-colors duration-300`}
        >
          Add Task
        </button>
      </div>
    </div>
  );
} 