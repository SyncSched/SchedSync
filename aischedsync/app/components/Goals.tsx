import { useState } from 'react';

interface Goal {
  id: number;
  title: string;
  isCompleted: boolean;
}

interface GoalsProps {
  goals: Goal[];
  onGoalAdd: (goal: string) => void;
  onGoalDelete: (id: number) => void;
  onGoalEdit: (id: number, newTitle: string) => void;
  onGoalToggle: (id: number) => void;
}

export default function Goals({
  goals,
  onGoalAdd,
  onGoalDelete,
  onGoalEdit,
  onGoalToggle
}: GoalsProps) {
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const handleEditStart = (goal: Goal) => {
    setIsEditing(goal.id);
    setEditText(goal.title);
  };

  const handleEditSave = (id: number) => {
    if (editText.trim()) {
      onGoalEdit(id, editText.trim());
    }
    setIsEditing(null);
    setEditText('');
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim() && goals.length < 3) {
      onGoalAdd(newGoal.trim());
      setNewGoal('');
    }
  };

  return (
    <div className="w-full md:w-80 bg-white p-6 rounded-xl shadow-sm mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-medium text-gray-900">Goals</h3>
        <span className="text-xs text-gray-500">{goals.length}/3</span>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="bg-[#f7f9fa] rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
          >
            {isEditing === goal.id ? (
              <div className="p-3 bg-white">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => handleEditSave(goal.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEditSave(goal.id)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  autoFocus
                />
              </div>
            ) : (
              <div className="p-3 flex items-center justify-between group">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => onGoalToggle(goal.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                      ${goal.isCompleted 
                        ? 'bg-green-500 border-green-500' 
                        : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    {goal.isCompleted && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <span className={`text-sm ${goal.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {goal.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditStart(goal)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onGoalDelete(goal.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {goals.length < 3 && (
        <form onSubmit={handleAddGoal} className="mt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a new goal"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <button
              type="submit"
              disabled={!newGoal.trim()}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Add
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 