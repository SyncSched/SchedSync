import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { TaskCompletionData } from '@/api/lib';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TaskCompletionChartProps {
  isDark: boolean;
  timeframe: 'daily' | 'weekly' | 'monthly';
  completionData?: TaskCompletionData;
}

export default function TaskCompletionChart({ isDark, timeframe, completionData }: TaskCompletionChartProps) {
  // Generate default labels based on timeframe if no data is provided
  const getDefaultLabels = () => {
    switch (timeframe) {
      case 'daily':
        return ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
      case 'weekly':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'monthly':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      default:
        return [];
    }
  };

  // Generate default data based on timeframe if no data is provided
  const getDefaultData = (type: 'completed' | 'total') => {
    if (type === 'completed') {
      return timeframe === 'daily'
        ? [1, 2, 4, 5, 6, 3, 2, 1]
        : timeframe === 'weekly'
        ? [5, 7, 4, 6, 8, 3, 5]
        : [18, 22, 19, 24];
    } else {
      return timeframe === 'daily'
        ? [2, 3, 5, 7, 8, 4, 3, 2]
        : timeframe === 'weekly'
        ? [8, 9, 6, 8, 10, 5, 7]
        : [25, 28, 24, 30];
    }
  };

  // Use real data if available, otherwise use fallback data
  const chartData = {
    labels: completionData?.labels || getDefaultLabels(),
    datasets: [
      {
        label: 'Completed',
        data: completionData?.completed || getDefaultData('completed'),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total',
        data: completionData?.total || getDefaultData('total'),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDark ? '#e5e7eb' : '#374151',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#e5e7eb' : '#374151',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#e5e7eb' : '#374151',
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#374151' : '#ffffff',
        titleColor: isDark ? '#e5e7eb' : '#111827',
        bodyColor: isDark ? '#e5e7eb' : '#374151',
        borderColor: isDark ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
      },
    },
  };

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
}
