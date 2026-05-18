import React from 'react'

const COLORS = {
  excellent: '#34d399',
  good:      '#a3e635',
  average:   '#fbbf24',
  poor:      '#f87171',
}

export default function ScoreRing({ score, max = 100, size = 120, strokeWidth = 10, label = 'Score' }) {
  const pct = Math.min((score / max) * 100, 100)
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)

  let colorKey = 'poor'
  if (pct >= 80) colorKey = 'excellent'
  else if (pct >= 60) colorKey = 'good'
  else if (pct >= 40) colorKey = 'average'

  const color = COLORS[colorKey]
  const center = size / 2

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke="rgba(45,47,90,0.8)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.3s' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center" style={{ marginTop: -(size / 2 + 18) }}>
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-400">/ {max}</span>
      </div>
      {label && <span className="text-xs text-slate-400 font-medium text-center">{label}</span>}
    </div>
  )
}

export function ScoreRingOverlay({ score, max = 100, size = 140, strokeWidth = 12, label = 'SEO Score' }) {
  const pct = Math.min((score / max) * 100, 100)
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)

  let colorKey = 'poor'
  if (pct >= 80) colorKey = 'excellent'
  else if (pct >= 60) colorKey = 'good'
  else if (pct >= 40) colorKey = 'average'

  const color = COLORS[colorKey]
  const labelMap = { excellent: 'Excellent', good: 'Good', average: 'Needs Work', poor: 'Poor' }
  const center = size / 2

  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(45,47,90,0.8)" strokeWidth={strokeWidth} />
          <circle
            cx={center} cy={center} r={r} fill="none"
            stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-extrabold leading-none" style={{ color, fontSize: size * 0.22 }}>{score}</span>
          <span className="text-slate-400 font-medium" style={{ fontSize: size * 0.09 }}>/ {max}</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-slate-200">{label}</div>
        <div className="text-xs font-bold mt-0.5" style={{ color }}>{labelMap[colorKey]}</div>
      </div>
    </div>
  )
}
