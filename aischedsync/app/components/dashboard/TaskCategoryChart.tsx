import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { CategoryBreakdown } from '@/api/lib';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TaskCategoryChartProps {
  isDark: boolean;
  categoryData?: CategoryBreakdown;
}

export default function TaskCategoryChart({ isDark, categoryData }: TaskCategoryChartProps) {
  // Use real data if available, otherwise use fallback data
  const chartData = {
    labels: ['Work', 'Personal', 'Health', 'Learning', 'Other'],
    datasets: [
      {
        data: categoryData ? [
          categoryData.work,
          categoryData.personal,
          categoryData.health,
          categoryData.learning,
          categoryData.other
        ] : [0, 0, 0, 0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
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
        displayColors: true,
        callbacks: {
          label: function(context: unknown) {
            // Using type assertion to avoid TypeScript errors
            const ctx = context as unknown as { label: string; raw: number; dataset: { data: number[] } };
            const label = ctx.label || '';
            const value = ctx.raw || 0;
            const total = ctx.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}% (${value} tasks)`;
          }
        }
      }
    },
  };

  return (
    <div className="h-64">
      <Pie data={chartData} options={options} />
    </div>
  );
}
