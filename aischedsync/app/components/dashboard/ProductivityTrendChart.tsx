import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ProductivityTrend } from '@/api/lib';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProductivityTrendChartProps {
  isDark: boolean;
  timeframe: 'daily' | 'weekly' | 'monthly';
  trendData?: ProductivityTrend;
}

export default function ProductivityTrendChart({ isDark, timeframe, trendData }: ProductivityTrendChartProps) {
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
  const getDefaultData = (type: 'productivityScore' | 'completionRate') => {
    if (type === 'productivityScore') {
      return timeframe === 'daily'
        ? [0, 45, 65, 78, 80, 74, 68, 50]
        : timeframe === 'weekly'
        ? [72, 68, 75, 82, 78, 65, 70]
        : [74, 78, 72, 76];
    } else {
      return timeframe === 'daily'
        ? [0, 50, 70, 82, 75, 68, 72, 60]
        : timeframe === 'weekly'
        ? [68, 75, 80, 76, 82, 70, 75]
        : [72, 80, 76, 78];
    }
  };

  // Use real data if available, otherwise use fallback data
  const chartData = {
    labels: trendData?.labels || getDefaultLabels(),
    datasets: [
      {
        label: 'Productivity Score',
        data: trendData?.productivityScore || getDefaultData('productivityScore'),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Task Completion Rate',
        data: trendData?.completionRate || getDefaultData('completionRate'),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: 100,
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
      <Line data={chartData} options={options} />
    </div>
  );
}
