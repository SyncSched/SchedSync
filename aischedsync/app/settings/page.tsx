'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { UserInfo, getCurrentUser, updateUserSettings, getUserSettings, NotificationSettings, getTelegramAuthLink } from '@/api/lib';
import { useAuth } from '@/contexts/AuthContext';

interface ExtendedUserInfo extends UserInfo {
  notificationSettings?: NotificationSettings;
}

interface FormData {
  timezone: string;
  notificationPreferences: {
    isEmailEnabled: boolean;
    isWhatsAppEnabled: boolean;
    isTelegramEnabled: boolean;
    isCallEnabled: boolean;
    notifyBeforeMinutes: number;
    phoneNumber: string;
    telegramChatId?: string;
  };
  onboardingData: {
    profession: string;
    hobbies: string[];
    sleepingHours: number;
    sleepingStart: string;
    sleepingEnd: string;
    workingHours: number;
    workingStart: string;
    workingEnd: string;
  };
}

const defaultFormData: FormData = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
    hobbies: [],
    sleepingHours: 8,
    sleepingStart: '',
    sleepingEnd: '',
    workingHours: 8,
    workingStart: '',
    workingEnd: ''
  }
};

export default function Settings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<ExtendedUserInfo | null>(null);
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [originalFormData, setOriginalFormData] = useState<FormData>(defaultFormData);
  const isMounted = useRef(false);

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fetchUserData = async () => {
    if (!isAuthenticated || !isMounted.current) return;

    try {
      setIsLoading(true);
      const [userData, userSettingsData] = await Promise.all([
        getCurrentUser(),
        getUserSettings()
      ]);

      if (!isMounted.current) return;

      setUser(userData as ExtendedUserInfo);
      
      const initialData: FormData = {
        timezone: userSettingsData.timezone || defaultFormData.timezone,
        notificationPreferences: {
          isEmailEnabled: userSettingsData.isEmailEnabled || false,
          isWhatsAppEnabled: userSettingsData.isWhatsAppEnabled || false,
          isTelegramEnabled: userSettingsData.isTelegramEnabled || false,
          isCallEnabled: userSettingsData.isCallEnabled || false,
          notifyBeforeMinutes: userSettingsData.notifyBeforeMinutes || 15,
          phoneNumber: userSettingsData.phoneNumber || '',
          telegramChatId: userSettingsData.telegramChatId || undefined,
        },
        onboardingData: {
          profession: userSettingsData.onboardingData?.profession || '',
          hobbies: userSettingsData.onboardingData?.hobbies || [],
          sleepingHours: userSettingsData.onboardingData?.sleepingHours || 8,
          sleepingStart: userSettingsData.onboardingData?.sleepingStart || '',
          sleepingEnd: userSettingsData.onboardingData?.sleepingEnd || '',
          workingHours: userSettingsData.onboardingData?.workingHours || 8,
          workingStart: userSettingsData.onboardingData?.workingStart || '',
          workingEnd: userSettingsData.onboardingData?.workingEnd || ''
        }
      };

      setFormData(initialData);
      setOriginalFormData(initialData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      showToastMessage('Failed to load user settings', 'error');
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMounted.current = true;
    
    if (isAuthenticated) {
      fetchUserData();
    }

    return () => {
      isMounted.current = false;
    };
  }, [isAuthenticated]);

  const handleInputChange = (
    section: keyof FormData,
    field: string,
    value: string | boolean | number | string[]
  ) => {
    setFormData(prev => {
      if (section === 'timezone') {
        return { ...prev, timezone: value as string };
      }

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const settingsData: NotificationSettings = {
        timezone: formData.timezone,
        isEmailEnabled: formData.notificationPreferences.isEmailEnabled,
        isWhatsAppEnabled: formData.notificationPreferences.isWhatsAppEnabled,
        isTelegramEnabled: formData.notificationPreferences.isTelegramEnabled,
        isCallEnabled: formData.notificationPreferences.isCallEnabled,
        notifyBeforeMinutes: formData.notificationPreferences.notifyBeforeMinutes,
        phoneNumber: formData.notificationPreferences.phoneNumber,
        onboardingData: formData.onboardingData
      };

      await updateUserSettings(settingsData);
      showToastMessage('Settings updated successfully', 'success');
      setIsEditing(false);
      setOriginalFormData(formData);
    } catch (error) {
      console.error('Failed to update settings:', error);
      showToastMessage('Failed to update settings', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalFormData);
    setIsEditing(false);
  };

  const handleTelegramConnect = async () => {
    try {
      if (!user?.id) {
        throw new Error('User ID not found');
      }

      const { authLink } = await getTelegramAuthLink(user.id);
      window.open(authLink, '_blank');
    } catch (error) {
      console.error('Error generating Telegram auth link:', error);
      showToastMessage('Failed to generate Telegram link', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

      <main className="flex-1 overflow-auto w-full bg-[#F8F9FA]">
        <div className="p-3 md:p-8">
          <div className="hidden md:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your notification preferences and account settings</p>
            </div>
          </div>

          <div className="space-y-6">
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
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSubmit}
                          className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
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

                {/* Form Fields */}
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
                      {[
                        ['isEmailEnabled', 'Email'],
                        ['isWhatsAppEnabled', 'WhatsApp'],
                        ['isTelegramEnabled', 'Telegram'],
                        ['isCallEnabled', 'Phone Call']
                      ].map(([key, label]) => (
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

                  <div className="p-3 md:p-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-lg font-semibold text-gray-900">Get notified from Telegram</h2>
                          <div className="flex flex-col items-end gap-1">
                            <button
                              onClick={handleTelegramConnect}
                              disabled={!isEditing || !!formData.notificationPreferences.telegramChatId}
                              className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300"
                            >
                              {formData.notificationPreferences.telegramChatId ? 'Telegram Connected' : 'Connect Telegram'}
                            </button>
                            <span className="text-xs text-gray-500">
                              {formData.notificationPreferences.telegramChatId 
                                ? 'You will receive notifications from Telegram'
                                : 'Click button to get notifications from Telegram'}
                            </span>
                          </div>
                        </div>
                      </div>
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
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Personal Information</h3>
                    <div className="space-y-4">
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
                          onChange={(e) => handleInputChange('onboardingData', 'hobbies', e.target.value.split(',').map(h => h.trim()))}
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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
        
      </main>

      {/* Telegram Connect Button */}

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
