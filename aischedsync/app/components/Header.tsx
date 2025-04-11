import Image from "next/image";
import { UserInfo } from '@/api/lib';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  onAddTask: () => void;
  onSidebarToggle: () => void;
  user: UserInfo | null;
  onProfileClick: () => void;
  showProfileModal: boolean;
  onLogout: () => void;
  setShowProfileModal: (show: boolean) => void;
  title?: string;
  subtitle?: string;
}

export default function Header({
  user,
  onProfileClick,
  showProfileModal,
  onLogout,
  setShowProfileModal,
  title = "Today's Schedule",
  subtitle = "Plan your day effectively"
}: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`flex justify-between items-center mb-6 md:mb-8 ${isDark ? 'bg-gray-900' : 'bg-white'} p-4 rounded-lg transition-colors duration-300`}>
      <div>
        <h1 className={`text-xl md:text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>{title}</h1>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1 transition-colors duration-300`}>{subtitle}</p>
      </div>
      
      {/* User Actions */}
      <div className="flex items-center space-x-3 md:space-x-4">
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className={`flex items-center justify-center w-10 h-10 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'} rounded-lg border relative group transition-all duration-300`}
          aria-label="Toggle theme"
        >
          {/* Sun icon */}
          <svg 
            className={`w-5 h-5 absolute transition-transform duration-500 ${isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          {/* Moon icon */}
          <svg 
            className={`w-5 h-5 absolute transition-transform duration-500 ${isDark ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>

        <button 
          onClick={() => {}}
          className={`flex items-center justify-center w-10 h-10 ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'} rounded-lg border transition-all duration-300`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>
        
        <div className="relative">
          <button 
            className={`w-10 h-10 rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}
            onClick={onProfileClick}
          >
            {user?.avatarUrl ? (
              <Image 
                src={user.avatarUrl}
                width={40}
                height={40}
                alt={user.name || 'Profile'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <Image 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Anonymous')}&background=0D8ABC&color=fff`}
                width={40}
                height={40}
                alt={user?.name || 'Profile'} 
                className="w-full h-full object-cover"
              />
            )}
          </button>

          {showProfileModal && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowProfileModal(false)}
              />
              
              <div className={`absolute right-0 mt-2 w-48 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border z-40 transition-colors duration-300`}>
                <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}>
                  <p className={`font-medium text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'} transition-colors duration-300`}>
                    {user?.name || 'Anonymous User'}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} truncate transition-colors duration-300`}>
                    {user?.email || 'No email available'}
                  </p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      onLogout();
                      setShowProfileModal(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm text-red-600 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-red-50'} rounded-md flex items-center space-x-2 transition-colors duration-300`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
