import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Moon, Sun, Info } from 'lucide-react';
import CustomTooltip from './CustomTooltip';
import TimeInput from '@/app/components/ui/TimeInput';

interface SleepTimeStepProps {
  value: {
    sleepingHours: number;
    sleepingStart: string;
    sleepingEnd: string;
  };
  onChange: (value: {
    sleepingHours: number;
    sleepingStart: string;
    sleepingEnd: string;
  }) => void;
}

const SleepTimeStep: React.FC<SleepTimeStepProps> = ({ value, onChange }) => {
  const [selectedHours, setSelectedHours] = useState(value.sleepingHours);

  const createLocalDateTime = (date: Date) => {
    const newDate = new Date();
    newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
    return newDate;
  };

  const parseTimeString = (timeStr: string): Date => {
    const newDate = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  const convertStringTimeToDate = (timeStr: string): Date => {
    const date = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const handleHoursChange = (hours: number) => {
    console.log('Clicked Hours:', hours); // Log clicked hours
  
    setSelectedHours(hours);
    console.log('Updated selectedHours State (after set):', selectedHours); // Log state (may show stale due to async state update)
  
    // Use current bedtime or create new one
    const dateObj = parseTimeString(value.sleepingStart);
    const startTime = createLocalDateTime(dateObj);
    console.log('Sleeping Start Time:', startTime);
  
    // Calculate wake time
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + hours);
    console.log('Calculated Sleeping End Time (Before Date Fix):', endTime); // Log calculated end time before correction
  
    // If end time is before start time, add one day
    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1);
      console.log('Adjusted Sleeping End Time (Next Day):', endTime); // Log adjusted end time if next day
    }
  
    // Final payload log
    console.log('Payload to onChange:', {
      sleepingHours: hours,
      sleepingStart: startTime,
      sleepingEnd: endTime
    });
  
    onChange({
      sleepingHours: hours,
      sleepingStart: startTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      sleepingEnd: endTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    });
  };
  

  const handleStartTimeChange = (time: Date) => {
    // Create new date objects to avoid reference issues
    console.log(time, "in sleeptime step")
    const startTime = createLocalDateTime(time);
    const endTime = new Date(startTime);

    // Calculate end time based on selected hours
    endTime.setHours(startTime.getHours() + selectedHours);
    console.log(startTime, "updated start time")
    // If end time is before start time, add one day
    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    onChange({
      sleepingHours: selectedHours,
      sleepingStart: startTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      sleepingEnd: endTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    });
  };

  // Helper function for quick select times
  const handleQuickSelect = (timeStr: string) => {
    const [timeValue, period] = timeStr.split(' ');
    const [hours, minutes] = timeValue.split(':').map(Number);

    const date = new Date();
    const adjustedHours = period === 'PM' ?
      (hours === 12 ? 12 : hours + 12) :
      (hours === 12 ? 0 : hours);

    date.setHours(adjustedHours, minutes, 0, 0);
    handleStartTimeChange(date);
  };

  // Helper function to format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto px-4 w-full" // Added w-full
    >
      {/* Header section - made more responsive */}
      <div className="mb-6 sm:mb-8 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <Moon className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Set Your Sleep Schedule</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Optimize your productivity by aligning tasks with your natural sleep rhythm
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Made grid responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Sleep Duration Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-base font-semibold text-gray-900">
                Sleep Duration
              </label>
              <CustomTooltip content="Recommended sleep duration is 7-9 hours for adults">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </CustomTooltip>
            </div>
            <div className="grid grid-cols-2 gap-2"> {/* 2x2 grid for hours */}
              {[6, 7, 8, 9].map((hours) => (
                <motion.button
                  key={hours}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    console.log('Selected Hours 🙏🙏🙏🙏:', hours); // Log selected hours
                    handleHoursChange(hours);
                  }}
                  className={`
        relative py-2 px-3 rounded-lg transition-all duration-200
        ${selectedHours === hours
                      ? 'bg-indigo-500 text-white shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}
      `}
                >
                  <div className="text-xl font-bold">{hours}</div>
                  <div className="text-xs opacity-80">hours</div>
                </motion.button>
              ))}
            </div>

          </div>

          {/* Enhanced Bedtime Section */}
          <div className="space-y-3">
            <label className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Bedtime
            </label>
            <div className="space-y-4">
              <TimeInput
                value={convertStringTimeToDate(value.sleepingStart)}
                onChange={handleStartTimeChange}
                className="w-full"
              />

              {/* Quick Select Times */}
              <div className="grid grid-cols-auto gap-2">
                {['9:00 PM', '10:00 PM', '11:00 PM'].map((time) => (
                  <button
                    key={time}
                    onClick={() => handleQuickSelect(time)}
                    className="px-3 py-2 rounded-xl text-sm font-medium
                      bg-gradient-to-r from-indigo-50 to-purple-50
                      text-indigo-600 hover:from-indigo-100 hover:to-purple-100
                      transition-all duration-200"
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Wake Time Preview - made responsive */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 flex items-center justify-between
            sm:h-[52px] my-auto"> {/* Added height to match time input */}
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="text-sm sm:text-base font-semibold text-gray-900">
                Wake up time
              </span>
            </div>
            <div className="text-base sm:text-lg font-bold text-indigo-600">
              {formatTime(convertStringTimeToDate(value.sleepingEnd))}
            </div>
          </div>
        </div>

        {/* Footer - made responsive */}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-100">
          <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
            <CustomTooltip content="We'll optimize your schedule based on these preferences" position="top">
              <span className="inline-flex">
                <Info className="w-4 h-4 cursor-help" />
              </span>
            </CustomTooltip>
            <span>Your schedule will be optimized based on your sleep preferences</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SleepTimeStep;