import React, { useState, useEffect, useCallback } from 'react';
import TimeInput from './ui/TimeInput';
import { formatToHHMM, convertHHMMToISO } from '../utils/dateUtils';
import { useTheme } from '@/contexts/ThemeContext';
import dynamic from "next/dynamic";


// Load Leaflet dynamically to avoid SSR issues
const LocationPicker = dynamic(() => import("../components/LocationPicker"), {
  ssr: false,
});

interface TaskFormProps {
  onSubmit: (task: TaskFormData) => void;
  onClose: () => void;
  onDelete?: () => void;
  mode?: 'edit' | 'add';
  initialTask?: {
    name?: string;
    description?: string;
    time?: string;
    duration?: number;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    status?: 'PENDING' | 'COMPLETED';
    location?: string | null;
    isEmailEnabled?: boolean;
    isWhatsAppEnabled?: boolean;
    isTelegramEnabled?: boolean;
    isCallEnabled?: boolean;
  };
}

export interface TaskFormData {
  name: string;
  description: string;
  time: string;
  duration: number;
  endTime: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'COMPLETED';
  location?: string | null;
  isEmailEnabled: boolean;
  isWhatsAppEnabled: boolean;
  isTelegramEnabled: boolean;
  isCallEnabled: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onClose,
  onDelete,
  mode = 'add',
  initialTask
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'details' | 'second'>('details');
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  // Initialize the time value correctly
  const getInitialTime = () => {
    if (initialTask?.time) {
      // If time is already in HH:mm format
      if (typeof initialTask.time === 'string' && initialTask.time.includes(':')) {
        return initialTask.time;
      }
      return formatToHHMM(initialTask.time);
    }
    // If no initial time, use current time
    return formatToHHMM(new Date());
  };

  const [formData, setFormData] = useState<TaskFormData>({
    name: initialTask?.name || '',
    description: initialTask?.description || '',
    time: getInitialTime(),
    duration: initialTask?.duration || 30,
    endTime: '',
    priority: initialTask?.priority || 'MEDIUM',
    status: initialTask?.status || 'PENDING',
    location: initialTask?.location,
    isEmailEnabled: initialTask?.isEmailEnabled || false,
    isWhatsAppEnabled: initialTask?.isWhatsAppEnabled || false,
    isTelegramEnabled: initialTask?.isTelegramEnabled || false,
    isCallEnabled: initialTask?.isCallEnabled || false
  });

  // Helper function to convert HH:mm to Date object
  const getTimeAsDate = (timeStr: string): Date => {
    const date = new Date();
    if (timeStr && timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        date.setHours(hours, minutes, 0, 0);
      }
    }
    return date;
  };

  const handleTimeChange = (date: Date) => {
    const timeString = formatToHHMM(date);
    setFormData(prev => ({
      ...prev,
      time: timeString
    }));
  };
  // Function to get location name from coordinates using reverse geocoding
  const getLocationNameFromCoords = useCallback(async (coords: string) => {
    try {
      const [lat, lng] = coords.split(',').map(Number);
      if (isNaN(lat) || isNaN(lng)) return null;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error('Error getting location name:', error);
      return null;
    }
  }, []);

  const handleLocationChange = (locationValue: string | null = null, locName: string = '') => {
    console.log({location: locationValue || location, locationName: locName || locationName},"location######")
    setFormData(prev => ({
      ...prev,
      location: locationValue || location
    }));

    // If we have coordinates but no location name, try to get it
    if (locationValue && !locName) {
      getLocationNameFromCoords(locationValue).then(name => {
        if (name) setLocationName(name);
      });
    } else if (locName) {
      setLocationName(locName);
    }
  };

  // Get location name for initial location if available
  useEffect(() => {
    if (initialTask?.location && !locationName) {
      console.log('Initial task location found:', initialTask.location);
      setLocation(initialTask.location);
      getLocationNameFromCoords(initialTask.location).then(name => {
        if (name) {
          console.log('Got location name:', name);
          setLocationName(name);
        }
      });
    }
  }, [initialTask?.location, locationName, getLocationNameFromCoords]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      time: convertHHMMToISO(formData.time),
      duration: Number(formData.duration)
    };
    onSubmit(submissionData);
    onClose();
  };

  return (
    <div>
    <form onSubmit={handleSubmit} className={`flex flex-col h-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Tabs Header */}
      <div className={`flex items-end px-2 sm:px-4 pt-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex items-end gap-1 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} w-full sm:w-auto`}>
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`relative flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-t-lg transition-all duration-200 ${
              activeTab === 'details'
              ? isDark
                ? 'text-blue-400 bg-blue-900/50 border border-gray-700 border-b-gray-800'
                : 'text-blue-700 bg-blue-50 border border-gray-200 border-b-white'
              : isDark
                ? 'text-gray-400 hover:bg-gray-700/50'
                : 'text-gray-600 hover:bg-gray-50/80'
            }`}
          >
            <span className="relative z-10">Task Details</span>
            {activeTab === 'details' && (
              <div className={`absolute inset-x-0 -bottom-[1px] h-[1px] ${isDark ? 'bg-gray-800' : 'bg-white'}`}></div>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('second')}
            className={`relative flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-t-lg transition-all duration-200 ${
              activeTab === 'second'
              ? isDark
                ? 'text-blue-400 bg-blue-900/50 border border-gray-700 border-b-gray-800'
                : 'text-blue-700 bg-blue-50 border border-gray-200 border-b-white'
              : isDark
                ? 'text-gray-400 hover:bg-gray-700/50'
                : 'text-gray-600 hover:bg-gray-50/80'
            }`}
          >
            <span className="relative z-10">Notes</span>
            {activeTab === 'second' && (
              <div className={`absolute inset-x-0 -bottom-[1px] h-[1px] ${isDark ? 'bg-gray-800' : 'bg-white'}`}></div>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {activeTab === 'details' ? (
          <>
            {/* Main Form Content - Left Side */}
            <div className={`flex-1 pr-0 lg:pr-3.5 ${isDark ? 'bg-gray-800/50' : 'bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30'} overflow-y-auto`}>
              <div className="space-y-4 p-3">
                {/* Task Name */}
                <div className="group">
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'} hover:shadow-md ${isDark ? 'hover:border-blue-500/50' : 'hover:border-blue-100'} transition-all duration-300 overflow-hidden`}>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2.5 text-sm sm:text-base font-medium ${
                          isDark ? 'text-gray-200 bg-gray-800 placeholder-gray-500' : 'text-gray-900 bg-white placeholder-gray-400'
                        } rounded-lg focus:outline-none transition-all duration-300`}
                        placeholder="What's your task about?"
                      />
                      <div className={`absolute inset-y-0 right-4 flex items-center pointer-events-none ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      } transition-colors duration-300`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="group">
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'} hover:shadow-md ${isDark ? 'hover:border-purple-500/50' : 'hover:border-purple-100'} transition-all duration-300 overflow-hidden`}>
                    <div className="relative">
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className={`w-full px-4 py-3 text-sm ${
                          isDark ? 'text-gray-200 bg-gray-800 placeholder-gray-500' : 'text-gray-700 bg-white placeholder-gray-400'
                        } rounded-lg focus:outline-none transition-all duration-300 resize-none`}
                        placeholder="Describe your task in detail..."
                      />
                      <div className={`absolute top-3 right-4 pointer-events-none ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      } transition-colors duration-300`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications Section */}
                <div className="group">
                  <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'} hover:shadow-md ${isDark ? 'hover:border-violet-500/50' : 'hover:border-violet-100'} p-3 transition-all duration-300`}>
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className={`p-1.5 rounded-full ${
                        isDark ? 'bg-gray-700/80 text-violet-400' : 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-600'
                      } group-hover:scale-110 transition-transform duration-300`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div>
                        <h3 className={`text-sm font-semibold ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        } transition-colors duration-300`}>Notifications</h3>
                        <p className={`text-xs ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        } transition-colors duration-300`}>Choose how you want to be notified</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        {
                          name: 'isWhatsAppEnabled',
                          label: 'WhatsApp',
                          icon: (
                            <span className="[&>svg]:h-5 [&>svg]:w-5 [&>svg]:fill-[#128c7e]">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                              </svg>
                            </span>
                          ),
                          activeGradient: 'from-emerald-500 to-green-500'
                        },
                        {
                          name: 'isTelegramEnabled',
                          label: 'Telegram',
                          icon: (
                            <span className="[&>svg]:h-5 [&>svg]:w-5 [&>svg]:fill-[#0088cc]">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
                                <path d="M248 8C111 8 0 119 0 256S111 504 248 504 496 393 496 256 385 8 248 8zM363 176.7c-3.7 39.2-19.9 134.4-28.1 178.3-3.5 18.6-10.3 24.8-16.9 25.4-14.4 1.3-25.3-9.5-39.3-18.7-21.8-14.3-34.2-23.2-55.3-37.2-24.5-16.1-8.6-25 5.3-39.5 3.7-3.8 67.1-61.5 68.3-66.7 .2-.7 .3-3.1-1.2-4.4s-3.6-.8-5.1-.5q-3.3 .7-104.6 69.1-14.8 10.2-26.9 9.9c-8.9-.2-25.9-5-38.6-9.1-15.5-5-27.9-7.7-26.8-16.3q.8-6.7 18.5-13.7 108.4-47.2 144.6-62.3c68.9-28.6 83.2-33.6 92.5-33.8 2.1 0 6.6 .5 9.6 2.9a10.5 10.5 0 0 1 3.5 6.7A43.8 43.8 0 0 1 363 176.7z"/>
                              </svg>
                            </span>
                          ),
                          activeGradient: 'from-blue-500 to-sky-500'
                        },
                        {
                          name: 'isEmailEnabled',
                          label: 'Email',
                          icon: (
                            <span className="[&>svg]:h-5 [&>svg]:w-5">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"/>
                                <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"/>
                                <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"/>
                                <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z"/>
                                <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z"/>
                              </svg>
                            </span>
                          ),
                          activeGradient: 'from-amber-500 to-yellow-500'
                        },
                        {
                          name: 'isCallEnabled',
                          label: 'Phone Call',
                          icon: (
                            <span className="[&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-blue-600">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0 6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z"/>
                              </svg>
                            </span>
                          ),
                          activeGradient: 'from-purple-500 to-violet-500'
                        },
                      ].map(({ name, label, icon, activeGradient }) => (
                        <label key={name} className={`group/toggle relative flex items-center justify-between p-3 ${
                          isDark ? 'bg-gray-800/80 hover:bg-gray-800' : 'bg-gradient-to-r from-gray-50 to-transparent hover:from-gray-100'
                        } rounded-md transition-all duration-300 cursor-pointer overflow-hidden border ${
                          isDark ? 'border-gray-700' : 'border-gray-100'
                        }`}>
                          <div className="flex items-center gap-2.5 relative z-10">
                            <div className="scale-100">{icon}</div>
                            <span className={`text-sm font-medium ${
                              isDark ? 'text-gray-300 group-hover/toggle:text-gray-200' : 'text-gray-700 group-hover/toggle:text-gray-900'
                            }`}>{label}</span>
                          </div>
                          <div className="relative">
                            <input
                              type="checkbox"
                              name={name}
                              checked={formData[name as keyof TaskFormData] as boolean}
                              onChange={handleChange}
                              className="peer sr-only"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-r peer-checked:opacity-5 opacity-0 transition-opacity duration-300`} style={{background: `linear-gradient(to right, var(--${activeGradient}))`}}></div>
                            <div className={`w-10 h-5 ${
                              isDark ? 'bg-gray-700' : 'bg-gray-200'
                            } rounded-full peer peer-focus:ring-2 ${
                              isDark ? 'peer-focus:ring-blue-900' : 'peer-focus:ring-blue-100'
                            } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${
                              isDark ? 'peer-checked:bg-blue-600' : 'peer-checked:bg-blue-500'
                            }`}></div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className={`w-full lg:w-72 border-t lg:border-t-0 lg:border-l ${
              isDark ? 'border-gray-700' : 'border-gray-100'
            } p-3 lg:pl-3 flex flex-col backdrop-blur-sm`}>
              <div className="flex-1 space-y-2.5">
                {/* Location Field */}
                <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-lg p-2 shadow-sm border ${
                  isDark ? 'border-gray-600/80' : 'border-gray-100/80'
                }`}>
                  <label className={`block text-[11px] font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } mb-1`}>Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="location"
                      value={locationName || 'No location selected'}
                      readOnly
                      placeholder="Select a location"
                      className={`w-full px-2 py-2 sm:py-1.5 ${
                        isDark ? 'bg-gradient-to-r from-blue-900/30 to-indigo-900/30 text-gray-300' : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700'
                      } rounded-lg text-xs font-medium focus:outline-none focus:ring-1 ${
                        isDark ? 'focus:ring-blue-500/30' : 'focus:ring-blue-200'
                      } ${isDark ? 'placeholder-gray-500' : ''}`}
                    />
                    <div
                      onClick={() => setShowMap(true)}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:text-blue-500 transition-colors duration-200 ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Time Details */}
                <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-lg p-2 shadow-sm border ${
                  isDark ? 'border-gray-600/80' : 'border-gray-100/80'
                }`}>
                  <label className={`block text-[11px] font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } mb-1`}>Start Time</label>
                  <TimeInput
                    value={getTimeAsDate(formData.time)}
                    onChange={handleTimeChange}
                    className={`!bg-gradient-to-r ${
                      isDark ? '!from-green-900/30 !to-emerald-900/30 !text-gray-300' : '!from-green-50 !to-emerald-50'
                    } !border-0 !shadow-none !text-xs !py-2 sm:!py-1.5`}
                  />
                </div>

                <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-lg p-2 shadow-sm border ${
                  isDark ? 'border-gray-600/80' : 'border-gray-100/80'
                }`}>
                  <label className={`block text-[11px] font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } mb-1`}>Duration</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      min="1"
                      className={`w-full px-2 py-1.5 ${
                        isDark ? 'bg-gray-800 text-gray-200 border border-gray-700' : 'bg-gradient-to-r from-orange-50 to-amber-50 text-gray-700'
                      } rounded-lg text-xs font-medium focus:outline-none focus:ring-1 ${
                        isDark ? 'focus:ring-orange-500/30 focus:border-orange-500/50' : 'focus:ring-orange-200'
                      }`}
                    />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>minutes</span>
                  </div>
                </div>

                {/* Priority */}
                <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-lg p-2 shadow-sm border ${
                  isDark ? 'border-gray-600/80' : 'border-gray-100/80'
                }`}>
                  <label className={`block text-[11px] font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } mb-1`}>Priority</label>
                  <div className="relative">
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className={`w-full px-2 py-1.5 appearance-none rounded-lg text-xs font-medium focus:outline-none focus:ring-1 transition-colors duration-200 ${
                        isDark ? (
                          formData.priority === 'HIGH'
                            ? 'bg-red-900/30 text-red-400 focus:ring-red-500/30'
                            : formData.priority === 'MEDIUM'
                            ? 'bg-amber-900/30 text-amber-400 focus:ring-amber-500/30'
                            : 'bg-green-900/30 text-green-400 focus:ring-green-500/30'
                        ) : (
                          formData.priority === 'HIGH'
                            ? 'bg-red-50 text-red-700 focus:ring-red-200'
                            : formData.priority === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 focus:ring-amber-200'
                            : 'bg-green-50 text-green-700 focus:ring-green-200'
                        )
                      }`}
                    >
                      <option value="HIGH" className={isDark ? 'bg-gray-800 text-red-400' : 'bg-red-50 text-red-700'}>High</option>
                      <option value="MEDIUM" className={isDark ? 'bg-gray-800 text-amber-400' : 'bg-amber-50 text-amber-700'}>Medium</option>
                      <option value="LOW" className={isDark ? 'bg-gray-800 text-green-400' : 'bg-green-50 text-green-700'}>Low</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className={`size-3.5 ${
                        isDark ? (
                          formData.priority === 'HIGH'
                            ? 'text-red-400'
                            : formData.priority === 'MEDIUM'
                            ? 'text-amber-400'
                            : 'text-green-400'
                        ) : (
                          formData.priority === 'HIGH'
                            ? 'text-red-500'
                            : formData.priority === 'MEDIUM'
                            ? 'text-amber-500'
                            : 'text-green-500'
                        )
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-lg p-2 shadow-sm border ${
                  isDark ? 'border-gray-600/80' : 'border-gray-100/80'
                }`}>
                  <label className={`block text-[11px] font-medium ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  } mb-1`}>Status</label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={`w-full px-2 py-1.5 appearance-none rounded-lg text-xs font-medium focus:outline-none focus:ring-1 transition-colors duration-200 ${
                        isDark ? (
                          formData.status === 'PENDING'
                            ? 'bg-blue-900/30 text-blue-400 focus:ring-blue-500/30'
                            : 'bg-emerald-900/30 text-emerald-400 focus:ring-emerald-500/30'
                        ) : (
                          formData.status === 'PENDING'
                            ? 'bg-blue-50 text-blue-700 focus:ring-blue-200'
                            : 'bg-emerald-50 text-emerald-700 focus:ring-emerald-200'
                        )
                      }`}
                    >
                      <option value="PENDING" className={isDark ? 'bg-gray-800 text-blue-400' : 'bg-blue-50 text-blue-700'}>Pending</option>
                      <option value="COMPLETED" className={isDark ? 'bg-gray-800 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}>Completed</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className={`size-3.5 ${
                        isDark ? (
                          formData.status === 'PENDING'
                            ? 'text-blue-400'
                            : 'text-emerald-400'
                        ) : (
                          formData.status === 'PENDING'
                            ? 'text-blue-500'
                            : 'text-emerald-500'
                        )
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'} border-t ${
                isDark ? 'border-gray-700' : 'border-gray-100'
              } mt-2 p-2 space-y-1.5 rounded-b-xl`}>
                <button
                  type="submit"
                  className={`w-full px-3 py-1.5 text-xs font-medium text-white ${
                    isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                  } rounded-lg focus:outline-none focus:ring-1 focus:ring-offset-1 ${
                    isDark ? 'focus:ring-blue-500' : 'focus:ring-blue-500'
                  } transition-all duration-200 shadow-sm`}
                >
                  {mode === 'edit' ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className={`w-full px-3 py-1.5 text-xs font-medium text-white ${
                    isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                  } rounded-lg focus:outline-none focus:ring-1 focus:ring-offset-1 ${
                    isDark ? 'focus:ring-blue-500' : 'focus:ring-blue-500'
                  } transition-all duration-200 shadow-sm`}
                  onClick={() => setShowMap(true)}
                >
                  Set location
                </button>

                {mode === 'edit' && onDelete && (
                  <button
                    type="button"
                    onClick={onDelete}
                    className={`w-full px-3 py-1.5 text-xs font-medium ${
                      isDark ? 'text-red-400 bg-red-900/30 hover:bg-red-900/50' : 'text-red-600 bg-red-50 hover:bg-red-100'
                    } rounded-lg focus:outline-none focus:ring-1 focus:ring-offset-1 ${
                      isDark ? 'focus:ring-red-500/30' : 'focus:ring-red-200'
                    } transition-all duration-200`}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className={`flex-1 p-4 ${
            isDark ? 'bg-gray-800/50' : 'bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30'
          }`}>
            <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-8`}>
              <p className="text-sm">Second tab content will be added here</p>
            </div>
          </div>
        )}
      </div>
    </form>

    {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-[90%] max-w-3xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">Select Location</h3>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <LocationPicker
              onSelect={(coords, name) => {
                if (coords) {
                  const locationString = `${coords.lat},${coords.lng}`;
                  setLocation(locationString);
                  handleLocationChange(locationString, name);
                  setShowMap(false);
                }
              }}
              initialLocation={location ? {
                lat: parseFloat(location.split(',')[0]),
                lng: parseFloat(location.split(',')[1])
              } : undefined}
              initialLocationName={locationName}
            />
          </div>
        </div>
      )}

    </div>
  );
};