'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { UserInfo, getCurrentUser, NotificationSettings, updateUserSettings } from '@/api/lib';
import { useAuth } from '@/contexts/AuthContext';

interface ExtendedUserInfo extends UserInfo {
  notificationSettings?: NotificationSettings;
}

export default function Settings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<ExtendedUserInfo | null>(null);
  const { isAuthenticated } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [settings, setSettings] = useState<NotificationSettings>({
    isEmailEnabled: false,
    isWhatsAppEnabled: false,
    isTelegramEnabled: false,
    isCallEnabled: false
  });

  // Fetch user data and settings when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const userData = await getCurrentUser();
          const extendedUserData = userData as ExtendedUserInfo;
          setUser(extendedUserData);
          // Initialize settings with user preferences if available
          if (extendedUserData.notificationSettings) {
            setSettings(extendedUserData.notificationSettings);
          }
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          showErrorToast('Failed to load user settings');
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSettingChange = async (setting: keyof NotificationSettings) => {
    try {
      const newSettings = {
        ...settings,
        [setting]: !settings[setting]
      };
      
      // Update local state immediately for responsive UI
      setSettings(newSettings);

      // Make API call to update settings
      await updateUserSettings(newSettings);
      showSuccessToast('Settings updated successfully');
    } catch (error: unknown) {
      // Revert the local state change if API call fails
      setSettings(settings);
      showErrorToast(error instanceof Error ? error.message : 'Failed to update settings');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-black"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
        </div>
      </div>

      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        user={user}
        onLogout={() => {}}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full bg-[#F8F9FA]">
        <div className="p-3 md:p-8">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your notification preferences and account settings</p>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Notification Settings Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Notification Settings</h2>
                <p className="text-sm text-gray-500 mb-6">Choose how you want to receive notifications</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      name: 'isWhatsAppEnabled',
                      label: 'WhatsApp',
                      icon: (
                        <span className="[&>svg]:h-7 [&>svg]:w-7 [&>svg]:fill-[#128c7e]">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 448 512">
                            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                          </svg>
                        </span>
                      ),
                    },
                    {
                      name: 'isTelegramEnabled',
                      label: 'Telegram',
                      icon: (
                        <span className="[&>svg]:h-7 [&>svg]:w-7 [&>svg]:fill-[#0088cc]">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
                            <path d="M248 8C111 8 0 119 0 256S111 504 248 504 496 393 496 256 385 8 248 8zM363 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3 .7-104.6 69.1-14.8 10.2-26.9 9.9c-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3q.8-6.7 18.5-13.7 108.4-47.2 144.6-62.3c68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9a10.5 10.5 0 0 1 3.5 6.7A43.8 43.8 0 0 1 363 176.7z"/>
                          </svg>
                        </span>
                      ),
                    },
                    {
                      name: 'isEmailEnabled',
                      label: 'Email',
                      icon: (
                        <span className="[&>svg]:h-7 [&>svg]:w-7 [&>svg]">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"/>
                            <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"/>
                            <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"/>
                            <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z"/>
                            <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z"/>
                          </svg>
                        </span>
                      ),
                    },
                    {
                      name: 'isCallEnabled',
                      label: 'Phone Call',
                      icon: (
                        <span className="[&>svg]:h-7 [&>svg]:w-7 [&>svg]:fill-[#0088cc]">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0 6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z"/>
                          </svg>
                        </span>
                      ),
                    },
                  ].map(({ name, label, icon }) => (
                    <label key={name} className="flex flex-col sm:flex-row items-center p-4 border border-gray-200 rounded-xl hover:bg-white/80 hover:border-blue-100 hover:shadow-sm transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <div className="relative inline-block w-11 mr-3 align-middle flex-shrink-0">
                            <input
                              type="checkbox"
                              name={name}
                              checked={settings[name as keyof NotificationSettings]}
                              onChange={() => handleSettingChange(name as keyof NotificationSettings)}
                              className="peer sr-only"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-100 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
                        </div>
                        <div className="ml-auto">
                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-md shadow-gray-200 group-hover:shadow-gray-300 transition-all duration-300">
                            {icon}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${
          toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } transition-opacity duration-300`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
} 