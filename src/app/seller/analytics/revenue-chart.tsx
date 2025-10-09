'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RevenueTrend {
  month: string;
  monthKey: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

interface RevenueChartProps {
  data: RevenueTrend[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-gray-500">
        No revenue data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
        <XAxis dataKey="month" stroke="#6C757D" style={{ fontSize: '12px' }} />
        <YAxis
          stroke="#6C757D"
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E9ECEF',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
          formatter={(value: number, name: string) => {
            if (name === 'revenue' || name === 'averageOrderValue') {
              return [
                `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                name === 'revenue' ? 'Revenue' : 'Avg Order Value',
              ];
            }
            return [value, 'Orders'];
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
          formatter={(value) => {
            if (value === 'revenue') return 'Revenue';
            if (value === 'orderCount') return 'Orders';
            if (value === 'averageOrderValue') return 'Avg Order Value';
            return value;
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#2D6A4F"
          strokeWidth={2}
          dot={{ fill: '#2D6A4F', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="orderCount"
          stroke="#0DCAF0"
          strokeWidth={2}
          dot={{ fill: '#0DCAF0', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
