import { useState } from 'react';

const HobbiesStep = ({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) => {
  const [customInput, setCustomInput] = useState('');
  const [isOtherMode, setIsOtherMode] = useState(false);

  const predefinedHobbies = [
    'Reading',
    'Gaming',
    'Cooking',
    'Traveling',
    'Photography',
    'Music',
    'Sports',
    'Other'
  ];

  const handleHobbyToggle = (hobby: string) => {
    if (hobby === 'Other') {
      setIsOtherMode(true);
      return;
    }
    onChange(
      value.includes(hobby)
        ? value.filter(h => h !== hobby)
        : [...value, hobby]
    );
  };

  const handleCustomHobbyAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newHobby = customInput.trim();
      if (newHobby && !value.includes(newHobby)) {
        onChange([...value, newHobby]);
        setCustomInput('');
      }
    }
  };

  const handleRemoveHobby = (hobby: string) => {
    onChange(value.filter(h => h !== hobby));
  };

  const customHobbies = value.filter(hobby => !predefinedHobbies.includes(hobby));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">What are your hobbies?</h1>
        <p className="mt-2 text-gray-600">Select all that apply</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-8">
        {predefinedHobbies.map((hobby) => (
          <button
            key={hobby}
            onClick={() => handleHobbyToggle(hobby)}
            className={`p-4 rounded-xl border-2 transition-all duration-200
              ${(value.includes(hobby) || (hobby === 'Other' && isOtherMode))
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
          >
            {hobby}
          </button>
        ))}
      </div>

      {/* Custom Hobbies Display */}
      {customHobbies.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {customHobbies.map((hobby) => (
            <span
              key={hobby}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-green-50 text-green-700 border border-green-500"
            >
              {hobby}
              <button
                onClick={() => handleRemoveHobby(hobby)}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Custom Input for "Other" */}
      {isOtherMode && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Type a hobby and press Enter"
            value={customInput}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black"
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleCustomHobbyAdd}
          />
          <p className="mt-2 text-sm text-gray-500">Press Enter or use comma to add multiple hobbies</p>
        </div>
      )}
    </div>
  );
};

export default HobbiesStep;