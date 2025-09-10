'use client';

import React from 'react';

interface ChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  type: 'bar' | 'line' | 'pie';
  width?: number;
  height?: number;
  className?: string;
}

export const Chart: React.FC<ChartProps> = ({
  data,
  type,
  width = 400,
  height = 200,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6b7280'
  ];

  if (type === 'bar') {
    return (
      <div className={`chart-container ${className}`}>
        <svg width={width} height={height} className="border border-gray-200 dark:border-gray-700 rounded">
          {data.map((item, index) => {
            const barWidth = (width - 60) / data.length;
            const barHeight = (item.value / maxValue) * (height - 60);
            const x = 40 + index * barWidth;
            const y = height - 30 - barHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth * 0.8}
                  height={barHeight}
                  fill={item.color || colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity"
                />
                <text
                  x={x + barWidth * 0.4}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                >
                  {item.label}
                </text>
                <text
                  x={x + barWidth * 0.4}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-800 dark:fill-gray-200 font-medium"
                >
                  {item.value}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  if (type === 'line') {
    const points = data.map((item, index) => {
      const x = 40 + (index * (width - 60)) / (data.length - 1);
      const y = height - 30 - (item.value / maxValue) * (height - 60);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className={`chart-container ${className}`}>
        <svg width={width} height={height} className="border border-gray-200 dark:border-gray-700 rounded">
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          {data.map((item, index) => {
            const x = 40 + (index * (width - 60)) / (data.length - 1);
            const y = height - 30 - (item.value / maxValue) * (height - 60);

            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3b82f6"
                  className="hover:r-6 transition-all"
                />
                <text
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -90; // Start from top

    return (
      <div className={`chart-container ${className}`}>
        <svg width={width} height={height} className="border border-gray-200 dark:border-gray-700 rounded">
          {data.map((item, index) => {
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;

            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) / 2 - 20;

            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            currentAngle = endAngle;

            return (
              <path
                key={index}
                d={pathData}
                fill={item.color || colors[index % colors.length]}
                className="hover:opacity-80 transition-opacity"
              />
            );
          })}
          {/* Legend */}
          {data.map((item, index) => (
            <g key={`legend-${index}`}>
              <rect
                x={width - 120}
                y={20 + index * 20}
                width={12}
                height={12}
                fill={item.color || colors[index % colors.length]}
              />
              <text
                x={width - 100}
                y={30 + index * 20}
                className="text-sm fill-gray-700 dark:fill-gray-300"
              >
                {item.label}: {item.value}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  }

  return null;
};