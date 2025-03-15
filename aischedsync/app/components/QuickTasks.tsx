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
  return (
    <div className="w-full md:w-80 bg-white p-6 rounded-xl shadow-sm mb-6 md:mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-medium text-gray-900">Reschedule</h3>
      </div>

      <div className="space-y-3 mb-4">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="bg-[#f7f9fa] rounded-xl p-3 border border-gray-200 shadow-sm"
            draggable
            onDragStart={(e) => onDragStart(e, 'quick', index)}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, 'quick', index)}
            data-draggable="true"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">{task.title}</span>
              <span className="text-xs text-gray-500">{task.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 pt-2">
        <button
          onClick={onAddTask}
          className="w-full bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Add Task
        </button>
      </div>
    </div>
  );
} 