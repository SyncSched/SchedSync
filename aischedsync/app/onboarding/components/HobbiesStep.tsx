const HobbiesStep = ({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) => {
  const hobbies = [
    'Reading',
    'Gaming',
    'Cooking',
    'Fitness',
    'Travel',
    'Music',
    'Art',
    'Photography',
    'Writing',
    'Sports',
    'Technology',
    'Other'
  ];

  const toggleHobby = (hobby: string) => {
    if (value.includes(hobby)) {
      onChange(value.filter(h => h !== hobby));
    } else {
      onChange([...value, hobby]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">What are your hobbies?</h1>
        <p className="mt-2 text-gray-600">Select all that apply</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
        {hobbies.map((hobby) => (
          <button
            key={hobby}
            onClick={() => toggleHobby(hobby)}
            className={`p-4 rounded-xl border-2 transition-all duration-200
              ${value.includes(hobby)
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
          >
            {hobby}
          </button>
        ))}
      </div>

      {value.includes('Other') && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter your hobby"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            onChange={(e) => onChange([...value.filter(h => h !== 'Other'), e.target.value])}
          />
        </div>
      )}
    </div>
  );
};

export default HobbiesStep; 