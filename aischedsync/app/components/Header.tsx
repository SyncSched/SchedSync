import Image from "next/image";
import { UserInfo } from '@/api/lib';

interface HeaderProps {
  onAddTask: () => void;
  onSidebarToggle: () => void;
  user: UserInfo | null;
  onProfileClick: () => void;
  showProfileModal: boolean;
  onLogout: () => void;
  setShowProfileModal: (show: boolean) => void;
}

export default function Header({
  onAddTask,
  onSidebarToggle,
  user,
  onProfileClick,
  showProfileModal,
  onLogout,
  setShowProfileModal
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6 md:mb-8">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Today's Schedule</h1>
        <p className="text-sm text-gray-500 mt-1">Plan your day effectively</p>
      </div>
      
      {/* User Actions */}
      <div className="flex items-center space-x-3 md:space-x-4">
        <button 
          onClick={onAddTask}
          className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <span>Add New Task</span>
        </button>

        <button 
          onClick={() => {}}
          className="flex items-center justify-center w-10 h-10 bg-white text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>
        
        <div className="relative">
          <button 
            className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200"
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
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                <div className="p-3 border-b border-gray-200">
                  <p className="font-medium text-sm text-gray-900">
                    {user?.name || 'Anonymous User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'No email available'}
                  </p>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      onLogout();
                      setShowProfileModal(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center space-x-2"
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