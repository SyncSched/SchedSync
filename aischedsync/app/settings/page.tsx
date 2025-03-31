'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { UserInfo, getCurrentUser, UserSettings, updateUserSettings, getUserSettings } from '@/api/lib';
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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    timezone: '',
    notificationPreferences: {
      isEmailEnabled: false,
      isWhatsAppEnabled: false,
      isTelegramEnabled: false,
      isCallEnabled: false,
      notifyBeforeMinutes: 15,
      phoneNumber: '',
    },
    onboardingData: {
      profession: '',
      hobbies: [] as string[],
      sleepingHours: 8,
      sleepingStart: '',
      sleepingEnd: '',
      workingHours: 8,
      workingStart: '',
      workingEnd: ''
    }
  });
  const [originalFormData, setOriginalFormData] = useState(formData);

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

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated) {
        try {
          const userData = await getCurrentUser();
          const userSettingsData = await getUserSettings();
          setUser(userData as ExtendedUserInfo);
          
          // Initialize form data with current settings
          const initialData = {
            timezone: userSettingsData.timezone,
            notificationPreferences: {
              isEmailEnabled: userSettingsData.isEmailEnabled,
              isWhatsAppEnabled: userSettingsData.isWhatsAppEnabled,
              isTelegramEnabled: userSettingsData.isTelegramEnabled,
              isCallEnabled: userSettingsData.isCallEnabled,
              notifyBeforeMinutes: userSettingsData.notifyBeforeMinutes,
              phoneNumber: userSettingsData.phoneNumber || '',
            },
            onboardingData: userSettingsData.onboardingData || {
              profession: '',
              hobbies: [],
              sleepingHours: 8,
              sleepingStart: '',
              sleepingEnd: '',
              workingHours: 8,
              workingStart: '',
              workingEnd: ''
            }
          };
          
          setFormData(initialData);
          setOriginalFormData(initialData); // Store original data
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          showErrorToast('Failed to load user settings');
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleHobbiesChange = (hobbiesString: string) => {
    const hobbiesArray = hobbiesString.split(',').map(hobby => hobby.trim());
    setFormData(prev => ({
      ...prev,
      onboardingData: {
        ...prev.onboardingData,
        hobbies: hobbiesArray
      }
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateUserSettings(formData);
      showSuccessToast('Settings updated successfully');
      setIsEditing(false);
    } catch (error) {
      showErrorToast('Failed to update settings');
    }
  };

  const handleCancel = () => {
    setFormData(originalFormData); // Revert to original data
    setIsEditing(false);
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmit}
                          className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                        >
                          Save Changes
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                      >
                        Edit Settings
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Timezone Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timezone</label>
                    <select
                      disabled={!isEditing}
                      value={formData.timezone}
                      onChange={(e) => handleInputChange('timezone', '', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      {Intl.supportedValuesOf('timeZone').map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>

                  {/* Notification Preferences */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Notification Preferences</h3>
                    <div className="space-y-4">
                      {Object.entries({
                        isEmailEnabled: 'Email',
                        isWhatsAppEnabled: 'WhatsApp',
                        isTelegramEnabled: 'Telegram',
                        isCallEnabled: 'Phone Call'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            disabled={!isEditing}
                            checked={formData.notificationPreferences[key as keyof typeof formData.notificationPreferences] as boolean}
                            onChange={(e) => handleInputChange('notificationPreferences', key, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">{label}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={formData.notificationPreferences.phoneNumber}
                      onChange={(e) => handleInputChange('notificationPreferences', 'phoneNumber', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  {/* Notification Timing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notify Before (minutes)</label>
                    <select
                      disabled={!isEditing}
                      value={formData.notificationPreferences.notifyBeforeMinutes}
                      onChange={(e) => handleInputChange('notificationPreferences', 'notifyBeforeMinutes', Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      {[5, 10, 15, 30, 60].map((minutes) => (
                        <option key={minutes} value={minutes}>{minutes} minutes</option>
                      ))}
                    </select>
                  </div>

                  {/* Onboarding Data */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Profile Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Profession</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.onboardingData.profession}
                        onChange={(e) => handleInputChange('onboardingData', 'profession', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hobbies (comma-separated)</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.onboardingData.hobbies.join(', ')}
                        onChange={(e) => handleHobbiesChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Working Start Time</label>
                        <input
                          type="time"
                          disabled={!isEditing}
                          value={formData.onboardingData.workingStart}
                          onChange={(e) => handleInputChange('onboardingData', 'workingStart', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Working End Time</label>
                        <input
                          type="time"
                          disabled={!isEditing}
                          value={formData.onboardingData.workingEnd}
                          onChange={(e) => handleInputChange('onboardingData', 'workingEnd', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sleeping Start Time</label>
                        <input
                          type="time"
                          disabled={!isEditing}
                          value={formData.onboardingData.sleepingStart}
                          onChange={(e) => handleInputChange('onboardingData', 'sleepingStart', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sleeping End Time</label>
                        <input
                          type="time"
                          disabled={!isEditing}
                          value={formData.onboardingData.sleepingEnd}
                          onChange={(e) => handleInputChange('onboardingData', 'sleepingEnd', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {showToast && (
        <div 
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white ${
            toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
          } transition-opacity duration-300`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
} 
