const SleepTimeStep = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const timeSlots = [
    '9:00 PM',
    '10:00 PM',
    '11:00 PM',
    '12:00 AM',
    '1:00 AM',
    '2:00 AM',
    'Other'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">When do you usually go to sleep?</h1>
        <p className="mt-2 text-gray-600">This helps us optimize your schedule</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-8">
        {timeSlots.map((time) => (
          <button
            key={time}
            onClick={() => onChange(time)}
            className={`p-4 rounded-xl border-2 transition-all duration-200
              ${value === time
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
          >
            {time}
          </button>
        ))}
      </div>

      {value === 'Other' && (
        <div className="mt-4">
          <input
            type="time"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default SleepTimeStep; 