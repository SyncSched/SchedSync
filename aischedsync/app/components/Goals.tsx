import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Goal, getUserGoals, createGoal, updateGoal, deleteGoal } from '@/api/lib';
import { useAuth } from '@/contexts/AuthContext';

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useTheme();
  const { isAuthenticated } = useAuth();

  // Fetch goals when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchGoals();
    }
  }, [isAuthenticated]);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedGoals = await getUserGoals();
      setGoals(fetchedGoals);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStart = (goal: Goal) => {
    setIsEditing(goal.id);
    setEditText(goal.title);
  };

  const handleEditSave = async (id: string) => {
    try {
      if (editText.trim()) {
        await updateGoal(id, { title: editText.trim() });
        // Refresh goals after update
        fetchGoals();
      }
      setIsEditing(null);
      setEditText('');
    } catch (err) {
      console.error('Error updating goal:', err);
      setError('Failed to update goal');
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newGoal.trim() && goals.length < 3) {
        await createGoal(newGoal.trim());
        setNewGoal('');
        // Refresh goals after adding
        fetchGoals();
      }
    } catch (err) {
      console.error('Error adding goal:', err);
      setError('Failed to add goal');
    }
  };

  const handleGoalToggle = async (id: string) => {
    try {
      const goal = goals.find(g => g.id === id);
      if (goal) {
        await updateGoal(id, { isCompleted: !goal.isCompleted });
        // Refresh goals after toggle
        fetchGoals();
      }
    } catch (err) {
      console.error('Error toggling goal:', err);
      setError('Failed to update goal');
    }
  };

  const handleGoalDelete = async (id: string) => {
    try {
      await deleteGoal(id);
      // Refresh goals after delete
      fetchGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete goal');
    }
  };

  return (
    <div className={`w-full md:w-80 ${isDark ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm mb-4 transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-base md:text-lg font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} transition-colors duration-300`}>Goals</h3>
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>{goals.length}/3</span>
      </div>

      {isLoading ? (
        <div className={`flex justify-center items-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading goals...
        </div>
      ) : error ? (
        <div className={`text-center py-4 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
          {error}
          <button
            onClick={fetchGoals}
            className={`block mx-auto mt-2 px-3 py-1 text-xs rounded ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {goals.length === 0 ? (
              <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No goals yet. Add your first goal below.
              </div>
            ) : (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`${isDark ? 'bg-gray-700' : 'bg-[#f7f9fa]'} rounded-xl border ${
                    isDark ? 'border-gray-600' : 'border-gray-200'
                  } shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
                >
                  {isEditing === goal.id ? (
                    <div className={`p-3 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => handleEditSave(goal.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEditSave(goal.id)}
                        className={`w-full px-2 py-1 text-sm border ${
                          isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-black'
                        } rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div className="p-3 flex items-center justify-between group">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => handleGoalToggle(goal.id)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                            ${goal.isCompleted
                              ? 'bg-green-500 border-green-500'
                              : isDark
                                ? 'bg-gray-700 border-gray-500 hover:border-gray-400'
                                : 'bg-white border-gray-300 hover:border-gray-400'
                            }`}
                        >
                          {goal.isCompleted && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span className={`text-sm ${
                          goal.isCompleted
                            ? isDark ? 'text-gray-400 line-through' : 'text-gray-500 line-through'
                            : isDark ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {goal.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditStart(goal)}
                          className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleGoalDelete(goal.id)}
                          className={`${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {goals.length < 3 && (
            <form onSubmit={handleAddGoal} className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a new goal"
                  className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'border-gray-300 text-black placeholder-gray-500'
                  } transition-colors duration-300`}
                />
                <button
                  type="submit"
                  disabled={!newGoal.trim()}
                  className={`px-4 py-2 ${
                    isDark
                      ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                      : 'bg-black text-white hover:bg-gray-800'
                  } rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                >
                  Add
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}