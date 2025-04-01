'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<ExtendedUserInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [originalFormData, setOriginalFormData] = useState<FormData>(defaultFormData);
  const isMounted = useRef(false);

  const showToastMessage = useCallback((message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []); // Empty dependency array since it only uses setState functions which are stable

  const fetchUserData = useCallback(async () => {
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
  }, [isAuthenticated, showToastMessage]);

  useEffect(() => {
    isMounted.current = true;
    
    if (isAuthenticated) {
      fetchUserData();
    }

    return () => {
      isMounted.current = false;
    };
  }, [isAuthenticated, fetchUserData]);

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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen -mt-[80px]">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Settings Card - Apple Style */}
        <div className="bg-white backdrop-blur-xl bg-opacity-80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#e2e2e7] overflow-hidden">
          
          {/* Card Body with Form Fields */}
          <div className="p-8">
            {/* Action Buttons at the top */}
            <div className="flex justify-end mb-8">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium text-sm flex items-center gap-1.5 mr-3"
                    disabled={isSubmitting}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-medium text-sm flex items-center gap-1.5 disabled:opacity-70 shadow-sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </span>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-medium text-sm flex items-center gap-1.5 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Settings
                </button>
              )}
            </div>

            <div className="space-y-10">
              {/* Timezone Section */}
              <div className="bg-[#f9f9fc] p-6 rounded-2xl border border-[#e8e8ed]">
                <h3 className="text-md font-semibold text-gray-900 mb-5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Time Zone Settings
                </h3>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Time Zone</label>
                  <select
                    disabled={!isEditing}
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', '', e.target.value)}
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors duration-200 h-11"
                  >
                    {Intl.supportedValuesOf('timeZone').map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-500">This will be used to schedule and display events in your local time</p>
                </div>
              </div>

              {/* Notification Section */}
              <div className="bg-[#f9f9fc] p-6 rounded-2xl border border-[#e8e8ed]">
                <h3 className="text-md font-semibold text-gray-900 mb-5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notification Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Notification Preferences */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e8e8ed]">
                    <h4 className="text-sm font-medium text-gray-800 mb-4">Notification Channels</h4>
                    <div className="space-y-4">
                      {[
                        ['isEmailEnabled', 'Email', 'Receive email notifications for reminders and updates'],
                        ['isWhatsAppEnabled', 'WhatsApp', 'Get instant messages via WhatsApp'],
                        ['isTelegramEnabled', 'Telegram', 'Receive notifications through Telegram'],
                        ['isCallEnabled', 'Phone Call', 'Get important reminders via phone call']
                      ].map(([key, label, description]) => (
                        <div key={key} className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              disabled={!isEditing}
                              checked={formData.notificationPreferences[key as keyof typeof formData.notificationPreferences] as boolean}
                              onChange={(e) => handleInputChange('notificationPreferences', key, e.target.checked)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label className="font-medium text-gray-700">{label}</label>
                            <p className="text-gray-500">{description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Add Notify Before Minutes */}
                    <div className="mt-6 pt-5 border-t border-gray-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification Timing
                      </label>
                      <div className="flex items-center px-3 py-2 bg-[#f9f9fc] rounded-lg">
                        <span className="text-sm text-gray-600 mr-2">Notify</span>
                        <select
                          disabled={!isEditing}
                          value={formData.notificationPreferences.notifyBeforeMinutes}
                          onChange={(e) => handleInputChange('notificationPreferences', 'notifyBeforeMinutes', parseInt(e.target.value))}
                          className="rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 text-sm"
                        >
                          {[5, 10, 15, 30, 60].map((mins) => (
                            <option key={mins} value={mins}>{mins}</option>
                          ))}
                        </select>
                        <span className="text-sm text-gray-600 ml-2">minutes before events</span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">How far in advance you&apos;ll receive notifications for your scheduled events</p>
                    </div>
                  </div>

                  {/* Telegram Connection */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e8e8ed]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-800">Telegram Notifications</h4>
                        <p className="text-xs text-gray-500 mt-1">Connect your Telegram account to receive instant notifications</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={handleTelegramConnect}
                          disabled={!isEditing || !!formData.notificationPreferences.telegramChatId}
                          className={`px-3.5 py-1.5 text-xs rounded-full flex items-center gap-1 ${
                            formData.notificationPreferences.telegramChatId 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400'
                          }`}
                        >
                          {formData.notificationPreferences.telegramChatId ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Connected
                            </>
                          ) : (
                            'Connect Telegram'
                          )}
                        </button>
                        <span className="text-xs text-gray-500">
                          {formData.notificationPreferences.telegramChatId 
                            ? 'Your Telegram account is linked'
                            : 'Link your account to get notifications'}
                        </span>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="mt-6 pt-5 border-t border-gray-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          disabled={!isEditing}
                          value={formData.notificationPreferences.phoneNumber}
                          onChange={(e) => handleInputChange('notificationPreferences', 'phoneNumber', e.target.value)}
                          className="pl-10 w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 text-sm h-11"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Used for WhatsApp and call notifications</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="bg-[#f9f9fc] p-6 rounded-2xl border border-[#e8e8ed]">
                <h3 className="text-md font-semibold text-gray-900 mb-5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.onboardingData.profession}
                        onChange={(e) => handleInputChange('onboardingData', 'profession', e.target.value)}
                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 text-sm h-11"
                        placeholder="What do you do?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hobbies</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.onboardingData.hobbies.join(', ')}
                        onChange={(e) => handleInputChange('onboardingData', 'hobbies', e.target.value.split(',').map(h => h.trim()))}
                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 text-sm h-11"
                        placeholder="Reading, Cooking, Sports, etc. (comma-separated)"
                      />
                      <p className="mt-2 text-xs text-gray-500">Separate multiple hobbies with commas</p>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e8e8ed]">
                    <h4 className="text-lg font-medium text-gray-800 mb-6">Schedule Preferences</h4>
                    
                    <div className="space-y-8">
                      {/* Working Hours */}
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-3">Working Hours</label>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm text-gray-500 mb-2">Start Time</label>
                            <div className="relative bg-[#f9f9fc] rounded-xl p-3 h-14 flex items-center">
                              <input
                                type="time"
                                disabled={!isEditing}
                                value={formData.onboardingData.workingStart}
                                onChange={(e) => handleInputChange('onboardingData', 'workingStart', e.target.value)}
                                className="appearance-none bg-transparent w-full border-none focus:ring-0 text-xl font-medium text-gray-800"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-2">End Time</label>
                            <div className="relative bg-[#f9f9fc] rounded-xl p-3 h-14 flex items-center">
                              <input
                                type="time"
                                disabled={!isEditing}
                                value={formData.onboardingData.workingEnd}
                                onChange={(e) => handleInputChange('onboardingData', 'workingEnd', e.target.value)}
                                className="appearance-none bg-transparent w-full border-none focus:ring-0 text-xl font-medium text-gray-800"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Sleep Schedule */}
                      <div className="pt-6 border-t border-gray-100">
                        <label className="block text-base font-medium text-gray-700 mb-3">Sleep Schedule</label>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm text-gray-500 mb-2">Bedtime</label>
                            <div className="relative bg-[#f9f9fc] rounded-xl p-3 h-14 flex items-center">
                              <input
                                type="time"
                                disabled={!isEditing}
                                value={formData.onboardingData.sleepingStart}
                                onChange={(e) => handleInputChange('onboardingData', 'sleepingStart', e.target.value)}
                                className="appearance-none bg-transparent w-full border-none focus:ring-0 text-xl font-medium text-gray-800"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-2">Wake Time</label>
                            <div className="relative bg-[#f9f9fc] rounded-xl p-3 h-14 flex items-center">
                              <input
                                type="time"
                                disabled={!isEditing}
                                value={formData.onboardingData.sleepingEnd}
                                onChange={(e) => handleInputChange('onboardingData', 'sleepingEnd', e.target.value)}
                                className="appearance-none bg-transparent w-full border-none focus:ring-0 text-xl font-medium text-gray-800"
                              />
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-500">We use this to avoid scheduling during your sleep hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification - Apple Style */}
      {showToast && (
        <div 
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-5 py-3.5 rounded-full text-white shadow-lg flex items-center gap-2 ${
            toastType === 'success' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'
          } transition-all duration-300 z-50 backdrop-blur-sm bg-opacity-90`}
        >
          {toastType === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          {toastMessage}
        </div>
      )}
    </div>
  );
} 
