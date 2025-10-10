/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryData {
  categoryId: string;
  categoryName: string;
  totalRevenue: number;
  orderCount: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
}

const COLORS = [
  '#2D6A4F', // Forest green
  '#52B788', // Eco green
  '#95D5B2', // Light green
  '#0DCAF0', // Info blue
  '#6C757D', // Gray
  '#FFC107', // Warning yellow
  '#DC3545', // Error red
  '#6F42C1', // Purple
];

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-gray-500">
        No category data available
      </div>
    );
  }

  // Format data for the pie chart
  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: item.totalRevenue,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E9ECEF',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [
              `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              'Revenue',
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Category Breakdown List */}
      <div className="mt-6 space-y-2">
        {data.slice(0, 5).map((category, index) => (
          <div key={category.categoryId} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-700">{category.categoryName}</span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-gray-900">
                ${category.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="ml-2 text-xs text-gray-500">({category.orderCount} orders)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
