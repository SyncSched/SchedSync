import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ children, onClose, size = 'md', title }) => {
  const { isDark } = useTheme();
  const sizeClasses = {
    sm: 'max-w-4xl',
    md: 'max-w-6xl',
    lg: 'max-w-9xl'
  };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
        className={`relative ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-[98%] ${sizeClasses[size]} overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-100'} border transition-colors duration-300`}
      >
        <div className="flex justify-between items-center px-4 pt-3">
          {title && (
            <h2 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className={`p-1.5 ${isDark ? 'hover:bg-gray-700/80' : 'hover:bg-gray-100/80'} rounded-lg transition-all duration-200 group ml-auto`}
          >
            <X className={`w-4 h-4 ${isDark ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-500 group-hover:text-gray-700'} group-hover:scale-110 transition-all`} />
          </button>
        </div>
        <div className={`px-4 pb-4 lg:px-6 lg:pb-6 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar ${isDark ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
          {children}
        </div>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${isDark ? '#4B5563 transparent' : '#E5E7EB transparent'};
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: ${isDark ? '#4B5563' : '#E5E7EB'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: ${isDark ? '#6B7280' : '#D1D5DB'};
        }
      `}</style>
    </div>
  );
};

export default Modal;