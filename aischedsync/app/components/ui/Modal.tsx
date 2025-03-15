import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ children, onClose, size = 'md', title }) => {
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
        className={`relative bg-white rounded-2xl shadow-2xl w-[98%] ${sizeClasses[size]} overflow-hidden border border-gray-100`}
      >
        <div className="flex items-center justify-between px-6 py-4 lg:px-8 lg:py-4 border-b border-gray-100 bg-white/50">
          {title && <h2 className="text-xl font-semibold text-gray-900  tracking-tight">{title}</h2>}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100/80 rounded-lg transition-all duration-200 -mr-2 group"
          >
            <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 group-hover:scale-110 transition-all" />
          </button>
        </div>
        <div className="p-6 lg:p-8 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #E5E7EB transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #E5E7EB;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #D1D5DB;
        }
      `}</style>
    </div>
  );
};

export default Modal;