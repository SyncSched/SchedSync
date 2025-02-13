import React, { useState } from 'react';
import TimePicker from 'react-time-picker';

interface WorkTimeStepProps {
  value: {
    workingHours: number;
    workingStart: Date;
    workingEnd: Date;
  };
  onChange: (value: any) => void;
}

const WorkTimeStep: React.FC<WorkTimeStepProps> = ({ value, onChange }) => {
  const [selectedHours, setSelectedHours] = useState(value.workingHours);

  const handleHoursChange = (hours: number) => {
    setSelectedHours(hours);
    
    // Calculate end time based on start time and hours
    const startTime = new Date();
    startTime.setHours(9, 0, 0); // Default to 9 AM
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + hours);
    
    onChange({
      workingHours: hours,
      workingStart: startTime,
      workingEnd: endTime
    });
  };

  const handleStartTimeChange = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0);
    
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + selectedHours);
    
    onChange({
      workingHours: selectedHours,
      workingStart: startTime,
      workingEnd: endTime
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Work Schedule</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            How many hours do you work?
          </label>
          <select
            value={selectedHours}
            onChange={(e) => handleHoursChange(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value={6}>6 hours</option>
            <option value={7}>7 hours</option>
            <option value={8}>8 hours</option>
            <option value={9}>9 hours</option>
            <option value={10}>10 hours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            When do you start working?
          </label>
          <TimePicker
            onChange={handleStartTimeChange}
            value={value.workingStart}
            className="mt-1 block w-full"
            disableClock={true}
            format="HH:mm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Work end time (calculated)
          </label>
          <div className="mt-1 block w-full p-2 bg-gray-100 rounded-md">
            {value.workingEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkTimeStep;