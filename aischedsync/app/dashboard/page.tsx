'use client';

import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getDashboardData,
  getDashboardUpcomingTasks,
  type Task,
  type DashboardData,
} from '../../api/lib';
import Loading from '../components/Loading';
import DashboardStats from '../components/dashboard/DashboardStats';
import TaskCategoryChart from '../components/dashboard/TaskCategoryChart';
import TaskCompletionChart from '../components/dashboard/TaskCompletionChart';
import ProductivityTrendChart from '../components/dashboard/ProductivityTrendChart';
import UpcomingTasksWidget from '../components/dashboard/UpcomingTasksWidget';
import StreakWidget from '../components/dashboard/StreakWidget';

export default function Dashboard() {
  const {  isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch dashboard data from API
        const data = await getDashboardData(timeframe);
        setDashboardData(data);

        // Fetch upcoming tasks separately to ensure we have the latest data
        const tasks = await getDashboardUpcomingTasks(3);
        setUpcomingTasks(tasks);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, timeframe]);

  const handleTimeframeChange = (newTimeframe: 'daily' | 'weekly' | 'monthly') => {
    setTimeframe(newTimeframe);
    // The useEffect will automatically fetch new data based on the timeframe
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    );
  }

  return (
    <div className={`p-4 md:-mt-14 md:p-8 h-full overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'}  transition-colors duration-300`}>
      {/* Timeframe selector */}
      <div className="mb-6 flex justify-end">
        <div className={`inline-flex rounded-md shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {(['daily', 'weekly', 'monthly'] as const).map((option) => (
            <button
              key={option}
              onClick={() => handleTimeframeChange(option)}
              className={`px-4 py-2 text-sm font-medium ${
                timeframe === option
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDark
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${option === 'daily' ? 'rounded-l-md' : ''} ${
                option === 'monthly' ? 'rounded-r-md' : ''
              } transition-colors duration-200`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard grid */}
      {error ? (
        <div className={`p-6 rounded-xl ${isDark ? 'bg-red-900/20 text-red-200' : 'bg-red-50 text-red-600'} mb-6`}>
          <p>{error}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardStats
          title="Total Tasks"
          value={dashboardData?.taskStats.total || 0}
          icon="clipboard-list"
          change={+5}
          changeLabel="vs. last week"
        />
        <DashboardStats
          title="Completed"
          value={dashboardData?.taskStats.completed || 0}
          icon="check-circle"
          change={+2}
          changeLabel="vs. last week"
          positive
        />
        <DashboardStats
          title="Pending"
          value={dashboardData?.taskStats.pending || 0}
          icon="clock"
          change={-1}
          changeLabel="vs. last week"
          positive
        />
        <DashboardStats
          title="Missed"
          value={dashboardData?.taskStats.missed || 0}
          icon="exclamation-circle"
          change={+1}
          changeLabel="vs. last week"
          positive={false}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-xl shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
          <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Task Categories
          </h3>
          <TaskCategoryChart
            isDark={isDark}
            categoryData={dashboardData?.categoryBreakdown}
          />
        </div>
        <div className={`p-4 rounded-xl shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300`}>
          <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Task Completion
          </h3>
          <TaskCompletionChart
            isDark={isDark}
            timeframe={timeframe}
            completionData={dashboardData?.taskCompletion}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'} transition-colors duration-300 lg:col-span-2`}>
          <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            Productivity Trend
          </h3>
          <ProductivityTrendChart
            isDark={isDark}
            timeframe={timeframe}
            trendData={dashboardData?.productivityTrend}
          />
        </div>
        <div className="space-y-4">
          <StreakWidget
            currentStreak={dashboardData?.streakData.currentStreak || 0}
            longestStreak={dashboardData?.streakData.longestStreak || 0}
            adherenceRate={dashboardData?.streakData.adherenceRate || 0}
            lastSevenDays={dashboardData?.streakData.lastSevenDays || [false, false, false, false, false, false, false]}
            isDark={isDark}
          />
          <UpcomingTasksWidget
            tasks={upcomingTasks}
            isDark={isDark}
          />
        </div>
      </div>
    </div>
  );
}
