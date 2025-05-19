import { useTheme } from '@/contexts/ThemeContext';
import { Task } from '@/api/lib';
import { motion } from 'framer-motion';

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl overflow-hidden max-w-md w-full border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className={`p-4 ${isDark ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-blue-500 to-blue-600'} flex justify-between items-center`}>
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-white font-bold text-lg">Task Status</h2>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/10 p-1.5 rounded-full transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className={`p-6 ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <motion.div className="mb-6" variants={itemVariants}>
          <h3 className="text-xl font-semibold mb-2 flex items-center">
            <span className="mr-2">"{task.name}"</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              isDark ? 'bg-blue-900/50 text-blue-200 border border-blue-800' : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}>
              {new Date(task.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </h3>
          <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            This task's scheduled time has passed. Please update its status:
          </p>
        </motion.div>

        <div className="flex flex-col space-y-3">
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onComplete(task)}
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200 ${
              isDark
                ? 'bg-green-600/90 hover:bg-green-600 text-white border border-green-500'
                : 'bg-green-500 hover:bg-green-600 text-white border border-green-400'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-base font-medium">Completed</span>
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              // Mark the task as overdue
              onNotComplete({ ...task, status: 'OVERDUE' });
            }}
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200 ${
              isDark
                ? 'bg-red-600/90 hover:bg-red-600 text-white border border-red-500'
                : 'bg-red-500 hover:bg-red-600 text-white border border-red-400'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-base font-medium">Overdue</span>
          </motion.button>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              // Mark the task as rescheduled
              onNotComplete({ ...task, status: 'RESCHEDULED' });
              // Then open the reschedule modal
              onReschedule(task);
            }}
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200 ${
              isDark
                ? 'bg-purple-600/90 hover:bg-purple-600 text-white border border-purple-500'
                : 'bg-purple-500 hover:bg-purple-600 text-white border border-purple-400'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-base font-medium">Reschedule</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
