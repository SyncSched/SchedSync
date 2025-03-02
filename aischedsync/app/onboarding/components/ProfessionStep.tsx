const ProfessionStep = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const professions = [
    'Software Developer',
    'Designer',
    'Product Manager',
    'Marketing',
    'Sales',
    'Student',
    'Other'
  ];

  // Track if we're in "Other" input mode
  const isOtherMode = value === 'Other' || (value && !professions.includes(value));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">What`s your profession?</h1>
        <p className="mt-2 text-gray-600">This helps us personalize your experience</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-8">
        {professions.map((profession) => (
          <button
            key={profession}
            onClick={() => onChange(profession)}
            className={`p-4 rounded-xl border-2 transition-all duration-200
              ${(!isOtherMode && value === profession) || (profession === 'Other' && isOtherMode)
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
          >
            {profession}
          </button>
        ))}
      </div>

      {/* Custom Input for "Other" */}
      {isOtherMode && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter your profession"
            value={value === 'Other' ? '' : value}
            className="w-full p-3 border  rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default ProfessionStep;