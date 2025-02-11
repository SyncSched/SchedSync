const WorkingHoursStep = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const workingHours = [
    '9 AM - 5 PM',
    '8 AM - 4 PM',
    '10 AM - 6 PM',
    '11 AM - 7 PM',
    'Flexible Hours',
    'Night Shift',
    'Other'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">What are your working hours?</h1>
        <p className="mt-2 text-gray-600">Help us understand your daily schedule</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-8">
        {workingHours.map((hours) => (
          <button
            key={hours}
            onClick={() => onChange(hours)}
            className={`p-4 rounded-xl border-2 transition-all duration-200
              ${value === hours
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
          >
            {hours}
          </button>
        ))}
      </div>

      {value === 'Other' && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                onChange={(e) => onChange(`${e.target.value} - ${value.split(' - ')[1] || ''}`)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                onChange={(e) => onChange(`${value.split(' - ')[0] || ''} - ${e.target.value}`)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkingHoursStep; 