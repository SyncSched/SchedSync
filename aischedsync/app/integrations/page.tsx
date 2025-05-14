'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  hasCalendarIntegration,
  removeCalendarIntegration,
  getTelegramAuthLink,
  getCurrentUser,
  getUserSettings,
  removeTelegramIntegration
} from '@/api/lib';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';

// Define the IntegrationCard component
interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  onConnect: () => void;
  onRemove: () => void;
  connectLabel?: string;
  removeLabel?: string;
  isLoading?: boolean;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  title,
  description,
  icon,
  isConnected,
  onConnect,
  onRemove,
  connectLabel = 'Connect',
  removeLabel = 'Remove',
  isLoading = false
}) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 p-3 rounded-lg ${
          isDark ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          {icon}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              isLoading
                ? (isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500')
                : isConnected
                  ? (isDark ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-green-100 text-green-700 border border-green-200')
                  : (isDark ? 'bg-gray-700 text-gray-400 border border-gray-600' : 'bg-gray-100 text-gray-600 border border-gray-200')
            }`}>
              {isLoading ? 'Checking...' : isConnected ? 'Connected' : 'Not Connected'}
            </div>
          </div>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
          <div className="mt-4">
            {isLoading ? (
              <div className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center ${
                isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
              }`}>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            ) : isConnected ? (
              <button
                onClick={onRemove}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-800'
                    : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                }`}
              >
                {removeLabel}
              </button>
            ) : (
              <button
                onClick={onConnect}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border border-blue-800'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                {connectLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Integrations Page Component
export default function IntegrationsPage() {
  const { isDark } = useTheme();
  const [hasGoogleCalendar, setHasGoogleCalendar] = useState(false);
  const [hasTelegram, setHasTelegram] = useState(false);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [isLoadingTelegram, setIsLoadingTelegram] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isProcessingCalendar, setIsProcessingCalendar] = useState(false);
  const [isProcessingTelegram, setIsProcessingTelegram] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        if (user && user.id) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const checkIntegrations = async () => {
      try {
        // Check Google Calendar integration
        setIsLoadingCalendar(true);
        const calendarIntegration = await hasCalendarIntegration();
        setHasGoogleCalendar(calendarIntegration);
      } catch (error) {
        console.error('Error checking calendar integration:', error);
      } finally {
        setIsLoadingCalendar(false);
      }
    };

    checkIntegrations();
  }, []);

  useEffect(() => {
    const checkTelegramIntegration = async () => {
      try {
        setIsLoadingTelegram(true);
        // Check if user has Telegram integration by checking if telegramChatId exists
        const settings = await getUserSettings();
        setHasTelegram(!!settings.telegramChatId);
      } catch (error) {
        console.error('Error checking Telegram integration:', error);
        setHasTelegram(false);
      } finally {
        setIsLoadingTelegram(false);
      }
    };

    checkTelegramIntegration();
  }, []);

  const handleConnectGoogleCalendar = () => {
    setIsProcessingCalendar(true);
    toast.loading('Connecting to Google Calendar...', { id: 'google-calendar-connect' });

    // Get the API URL from environment or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    // Open Google OAuth flow in a new window
    const authWindow = window.open(`${apiUrl}/auth/google`, '_blank');

    if (!authWindow) {
      toast.error('Failed to open authentication window. Please check your popup blocker settings.', { id: 'google-calendar-connect' });
      setIsProcessingCalendar(false);
      return;
    }

    // Poll for integration status every 2 seconds
    const checkInterval = setInterval(async () => {
      try {
        const status = await hasCalendarIntegration();
        if (status) {
          setHasGoogleCalendar(true);
          clearInterval(checkInterval);
          setIsProcessingCalendar(false);
          toast.success('Google Calendar connected successfully!', { id: 'google-calendar-connect' });

          // Try to close the auth window if it's still open
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
        }
      } catch (error) {
        console.error('Error checking calendar integration status:', error);
      }
    }, 2000);

    // Stop polling after 2 minutes (120 seconds)
    setTimeout(() => {
      clearInterval(checkInterval);
      setIsProcessingCalendar(false);
      if (!hasGoogleCalendar) {
        toast.error('Connection timed out. Please try again.', { id: 'google-calendar-connect' });
      }
    }, 120000);
  };

  const handleRemoveGoogleCalendar = async () => {
    try {
      setIsProcessingCalendar(true);
      toast.loading('Removing Google Calendar integration...', { id: 'google-calendar-remove' });

      // Call the API to remove the calendar integration
      const success = await removeCalendarIntegration();

      if (success) {
        // Update UI state
        setHasGoogleCalendar(false);
        toast.success('Google Calendar integration removed successfully', { id: 'google-calendar-remove' });
        console.log('Google Calendar integration removed successfully');
      } else {
        toast.error('Failed to remove Google Calendar integration', { id: 'google-calendar-remove' });
        console.error('Failed to remove Google Calendar integration');
      }
    } catch (error) {
      toast.error('Error removing Google Calendar integration', { id: 'google-calendar-remove' });
      console.error('Error removing Google Calendar integration:', error);
    } finally {
      setIsProcessingCalendar(false);
    }
  };

  const handleConnectTelegram = async () => {
    if (!userId) {
      toast.error('Cannot connect Telegram: User ID is not available');
      console.error('Cannot connect Telegram: User ID is not available');
      return;
    }

    try {
      setIsProcessingTelegram(true);
      toast.loading('Connecting to Telegram...', { id: 'telegram-connect' });

      // Get Telegram auth link from the API
      const { authLink } = await getTelegramAuthLink(userId);

      if (!authLink) {
        toast.error('Failed to get Telegram auth link', { id: 'telegram-connect' });
        console.error('Failed to get Telegram auth link');
        setIsProcessingTelegram(false);
        return;
      }

      // Open Telegram auth link in a new window
      const authWindow = window.open(authLink, '_blank');

      if (!authWindow) {
        toast.error('Failed to open authentication window. Please check your popup blocker settings.', { id: 'telegram-connect' });
        setIsProcessingTelegram(false);
        return;
      }

      // Poll for integration status every 2 seconds
      const checkInterval = setInterval(async () => {
        try {
          const settings = await getUserSettings();
          if (settings && settings.telegramChatId) {
            setHasTelegram(true);
            clearInterval(checkInterval);
            setIsProcessingTelegram(false);
            toast.success('Telegram connected successfully!', { id: 'telegram-connect' });

            // Try to close the auth window if it's still open
            if (authWindow && !authWindow.closed) {
              authWindow.close();
            }
          }
        } catch (error) {
          console.error('Error checking Telegram integration status:', error);
        }
      }, 2000);

      // Stop polling after 2 minutes (120 seconds)
      setTimeout(() => {
        clearInterval(checkInterval);
        setIsProcessingTelegram(false);
        if (!hasTelegram) {
          toast.error('Connection timed out. Please try again.', { id: 'telegram-connect' });
        }
      }, 120000);
    } catch (error) {
      toast.error('Error connecting to Telegram', { id: 'telegram-connect' });
      console.error('Error getting Telegram auth link:', error);
      setIsProcessingTelegram(false);
    }
  };

  const handleRemoveTelegram = async () => {
    try {
      setIsProcessingTelegram(true);
      toast.loading('Removing Telegram integration...', { id: 'telegram-remove' });

      // Call the API function to remove Telegram integration
      const success = await removeTelegramIntegration();

      if (success) {
        // Update UI state
        setHasTelegram(false);
        toast.success('Telegram integration removed successfully', { id: 'telegram-remove' });
        console.log('Telegram integration removed successfully');
      } else {
        toast.error('Failed to remove Telegram integration', { id: 'telegram-remove' });
        console.error('Failed to remove Telegram integration');
      }
    } catch (error) {
      toast.error('Error removing Telegram integration', { id: 'telegram-remove' });
      console.error('Error removing Telegram integration:', error);
    } finally {
      setIsProcessingTelegram(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" toastOptions={{
        duration: 3000,
        style: {
          background: isDark ? '#374151' : '#ffffff',
          color: isDark ? '#ffffff' : '#000000',
        },
      }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Calendar Integration */}
        <IntegrationCard
          title="Google Calendar"
          description="Sync your Google Calendar events with SchedSync to ensure your schedule accounts for all your commitments."
          icon={
            <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          }
          isConnected={hasGoogleCalendar}
          onConnect={handleConnectGoogleCalendar}
          onRemove={handleRemoveGoogleCalendar}
          isLoading={isLoadingCalendar || isProcessingCalendar}
        />

        {/* Telegram Integration */}
        <IntegrationCard
          title="Telegram"
          description="Receive task notifications and reminders directly through Telegram for instant updates on the go."
          icon={
            <svg className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2l-19 9 5.7 2.8L18.5 6l-8.5 9.5 4.5 2.5z"></path>
              <path d="M10 22l2-7"></path>
            </svg>
          }
          isConnected={hasTelegram}
          onConnect={handleConnectTelegram}
          onRemove={handleRemoveTelegram}
          isLoading={isLoadingTelegram || isProcessingTelegram}
        />
      </div>
    </div>
  );
}
