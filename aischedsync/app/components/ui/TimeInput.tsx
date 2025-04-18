import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface TimeInputProps {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
}

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange, className = '' }) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  // Store the original value to revert if canceled
  const [originalValue, setOriginalValue] = useState<Date>(new Date(value));
  // Temporary state for the time being edited
  const [tempValue, setTempValue] = useState<Date>(new Date(value));
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>(
    value.getHours() >= 12 ? 'PM' : 'AM'
  );

  // Update the original and temp values when the input value changes
  useEffect(() => {
    setOriginalValue(new Date(value));
    setTempValue(new Date(value));
    setSelectedPeriod(value.getHours() >= 12 ? 'PM' : 'AM');
  }, [value]);

  // Format the time for display
  const formatTimeForDisplay = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 4 }, (_, i) => i * 15);

  const currentHour = tempValue.getHours() % 12 || 12;
  const currentMinute = Math.floor(tempValue.getMinutes() / 15) * 15;

  const handleTimeChange = (hour: number, minute: number, period: 'AM' | 'PM') => {
    const newDate = new Date(tempValue);
    const hours24 = period === 'PM' ?
      (hour === 12 ? 12 : hour + 12) :
      (hour === 12 ? 0 : hour);

    newDate.setHours(hours24, minute, 0, 0);
    // Only update the temporary value, not the actual value yet
    setTempValue(newDate);
    // Do NOT close the modal here - keep it open for further selections
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          // When opening the time picker, store the current value as original
          setOriginalValue(new Date(value));
          setTempValue(new Date(value));
          setIsOpen(true);
        }}
        className={`w-full flex items-center justify-between px-4 py-3 border-2
          rounded-xl ${isDark ? 'hover:border-blue-500 text-gray-300' : 'hover:border-indigo-500 text-gray-700'} transition-colors
          duration-200 ${className}`}
      >
        <span className={`text-xl font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {formatTimeForDisplay(isOpen ? tempValue : value)}
        </span>
        <span className="opacity-60">{isDark ? '⌄' : '↓'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`relative ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-3xl shadow-2xl w-[90%] max-w-md overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Select Time</h2>
                <button
                  type="button"
                  onClick={() => {
                    // Reset to original value when canceling
                    setTempValue(new Date(originalValue));
                    setIsOpen(false);
                  }}
                  className={`p-2 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
                >
                  <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              {/* Time Picker Body */}
              <div className={`p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="grid grid-cols-3 gap-6">
                  {/* Hours Column */}
                  <div className="space-y-3">
                    <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hour</div>
                    <div className="space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                      {hours.map((hour) => (
                        <button
                          type="button"
                          key={hour}
                          onClick={() => handleTimeChange(hour, currentMinute, selectedPeriod)}
                          className={`
                            w-full px-4 py-3 text-center rounded-xl transition-all
                            ${currentHour === hour
                              ? isDark
                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                : 'bg-indigo-500 text-white shadow-lg scale-105'
                              : isDark
                                ? 'hover:bg-gray-700 text-gray-300'
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
                    <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Minute</div>
                    <div className="space-y-1">
                      {minutes.map((minute) => (
                        <button
                          type="button"
                          key={minute}
                          onClick={() => handleTimeChange(currentHour, minute, selectedPeriod)}
                          className={`
                            w-full px-4 py-3 text-center rounded-xl transition-all
                            ${currentMinute === minute
                              ? isDark
                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                : 'bg-indigo-500 text-white shadow-lg scale-105'
                              : isDark
                                ? 'hover:bg-gray-700 text-gray-300'
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
                    <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Period</div>
                    <div className="space-y-2">
                      {['AM', 'PM'].map((period) => (
                        <button
                          type="button"
                          key={period}
                          onClick={() => {
                            const newPeriod = period as 'AM' | 'PM';
                            setSelectedPeriod(newPeriod);
                            handleTimeChange(currentHour, currentMinute, newPeriod);
                            // Keep the modal open after selecting period
                          }}
                          className={`
                            w-full px-4 py-3 text-center rounded-xl transition-all
                            ${selectedPeriod === period
                              ? isDark
                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                : 'bg-indigo-500 text-white shadow-lg scale-105'
                              : isDark
                                ? 'hover:bg-gray-700 text-gray-300'
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
              <div className={`border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'} p-4 flex justify-end gap-3`}>
                <button
                  type="button"
                  onClick={() => {
                    // Reset to original value when canceling
                    setTempValue(new Date(originalValue));
                    setIsOpen(false);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Only now call the onChange prop with the final selected time
                    onChange(tempValue);
                    setIsOpen(false);
                  }}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium text-white ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-500 hover:bg-indigo-600'} transition-colors`}
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
