'use client';

import { useEffect, useState } from 'react';
import { getScoreRingColor } from '@/lib/scoring/scoreCalculator';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
  sublabel?: string;
  thickness?: number;
}

export function ScoreGauge({
  score,
  size = 180,
  label,
  sublabel,
  thickness = 12,
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = (size - thickness * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Only use 3/4 of the circle (270 degrees)
  const totalArc = circumference * 0.75;
  const offset = circumference * 0.125; // Start at bottom-left
  const filled = (animatedScore / 100) * totalArc;
  const dashArray = `${filled} ${circumference - filled}`;

  const color = getScoreRingColor(animatedScore);
  const trackColor = '#e5e7eb';
  const cx = size / 2;
  const cy = size / 2;

  const getScoreLabel = (s: number) => {
    if (s >= 90) return 'Excellent';
    if (s >= 75) return 'Good';
    if (s >= 50) return 'Needs Work';
    if (s >= 25) return 'Poor';
    return 'Critical';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(135deg)' }}
        >
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={thickness}
            strokeDasharray={`${totalArc} ${circumference - totalArc}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            className="dark:stroke-gray-700"
          />
          {/* Score fill */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeDasharray={dashArray}
            strokeDashoffset={-offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold tabular-nums"
            style={{ color }}
          >
            {animatedScore}
          </span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
            {getScoreLabel(animatedScore)}
          </span>
        </div>
      </div>

      {label && (
        <div className="text-center mt-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
          {sublabel && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sublabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
