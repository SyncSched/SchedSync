import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TimeInputProps {
  value: Date;
  onChange: (time: Date) => void;
  className?: string;
}

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(
    value.getHours() >= 12 ? 'PM' : 'AM'
  );

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 4 }, (_, i) => i * 15);

  const currentHour = value.getHours() % 12 || 12;
  const currentMinute = Math.floor(value.getMinutes() / 15) * 15;

  const handleTimeChange = (hour: number, minute: number, period: 'AM' | 'PM') => {
    // Create a new date object with the current date
    const newDate = new Date();
    
    // Convert to 24-hour format
    let hours24 = period === 'PM' ? 
      (hour === 12 ? 12 : hour + 12) : 
      (hour === 12 ? 0 : hour);
    
    // Set the hours and minutes
    newDate.setHours(hours24, minute, 0, 0);
    
    // Call onChange with the new date
    onChange(newDate);
    
    // Don't close modal here - let the Confirm button do that
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 
          rounded-xl hover:border-indigo-500 transition-colors duration-200 ${className}`}
      >
        <span className="text-xl font-semibold text-gray-700">
          {value.toLocaleTimeString('en-US', { 
            hour: 'numeric',
            minute: '2-digit',
            hour12: true 
          })}
        </span>
        <span className="text-gray-400">↓</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-3xl shadow-2xl w-[90%] max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Select Time</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Time Picker Body */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  {/* Hours Column */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-500">Hour</div>
                    <div className="space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                      {hours.map((hour) => (
                        <button
                          key={hour}
                          onClick={() => handleTimeChange(hour, currentMinute, selectedPeriod)}
                          className={`
                            w-full px-4 py-3 text-center rounded-xl transition-all
                            ${currentHour === hour 
                              ? 'bg-indigo-500 text-white shadow-lg scale-105' 
                              : 'hover:bg-gray-100 text-gray-700'}
                          `}
                        >
                          {hour}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Minutes Column */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-500">Minute</div>
                    <div className="space-y-1">
                      {minutes.map((minute) => (
                        <button
                          key={minute}
                          onClick={() => handleTimeChange(currentHour, minute, selectedPeriod)}
                          className={`
                            w-full px-4 py-3 text-center rounded-xl transition-all
                            ${currentMinute === minute 
                              ? 'bg-indigo-500 text-white shadow-lg scale-105' 
                              : 'hover:bg-gray-100 text-gray-700'}
                          `}
                        >
                          {minute.toString().padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AM/PM Column */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-500">Period</div>
                    <div className="space-y-2">
                      {['AM', 'PM'].map((period) => (
                        <button
                          key={period}
                          onClick={() => {
                            setSelectedPeriod(period as 'AM' | 'PM');
                            handleTimeChange(currentHour, currentMinute, period as 'AM' | 'PM');
                          }}
                          className={`
                            w-full px-4 py-3 text-center rounded-xl transition-all
                            ${selectedPeriod === period 
                              ? 'bg-indigo-500 text-white shadow-lg scale-105' 
                              : 'hover:bg-gray-100 text-gray-700'}
                          `}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Ensure the final time is set before closing
                    handleTimeChange(currentHour, currentMinute, selectedPeriod);
                    setIsOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TimeInput;
