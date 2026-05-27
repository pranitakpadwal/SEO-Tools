'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({
  data,
  innerRadius = 55,
  outerRadius = 80,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
            animationBegin={200}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={0.9}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: '#f9fafb',
            }}
            formatter={(value: number, name: string) => [`${value}`, name]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      {(centerLabel || centerValue !== undefined) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue !== undefined && (
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
