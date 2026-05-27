import React, { useState } from 'react'
import { Scissors, Image, Star, Clock, Flame, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import CopyButton from '../components/CopyButton.jsx'
import { ScoreRingOverlay } from '../components/ScoreRing.jsx'

const VIRAL_COLOR = (score) => {
  if (score >= 85) return 'text-emerald-400'
  if (score >= 70) return 'text-amber-400'
  return 'text-red-400'
}

function ShortsCard({ opp }) {
  const [open, setOpen] = useState(false)
  const vc = VIRAL_COLOR(opp.viralScore)

  return (
    <div className="glass-card overflow-hidden hover:border-brand-500/30 transition-all">
      <div
        className="p-4 cursor-pointer flex items-start justify-between gap-3"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{opp.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="tag bg-dark-500 border border-dark-400 text-slate-300 text-xs">{opp.category}</span>
              <span className={`text-xs font-bold ${vc}`}>
                <Flame className="w-3 h-3 inline mr-0.5" />{opp.viralScore}% viral
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-100 mt-1.5 line-clamp-2">{opp.hookTitle}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{opp.clipStart} – {opp.clipEnd}</span>
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-400" />{opp.type}</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {open && (
        <div className="border-t border-dark-400/60 p-4 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">On-Screen Text</p>
              <div className="flex items-start justify-between gap-2 bg-dark-700 rounded-lg p-3">
                <p className="text-sm font-bold text-white">{opp.onScreenText}</p>
                <CopyButton text={opp.onScreenText} />
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Hook Title</p>
              <div className="flex items-start justify-between gap-2 bg-dark-700 rounded-lg p-3">
                <p className="text-sm text-slate-200">{opp.hookTitle}</p>
                <CopyButton text={opp.hookTitle} />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-500">Caption</p>
              <CopyButton text={opp.caption} />
            </div>
            <div className="bg-dark-700 rounded-lg p-3">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{opp.caption}</pre>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2">Suggested Hashtags</p>
            <div className="flex flex-wrap gap-1.5">
              {opp.hashtags.map((h, i) => (
                <span key={i} className="tag bg-dark-500 border border-dark-400 text-slate-300 text-xs">{h}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ThumbnailScore({ breakdown }) {
  const COLORS = { excellent: '#34d399', good: '#a3e635', average: '#fbbf24', poor: '#f87171' }
  return (
    <div className="space-y-2.5">
      {Object.entries(breakdown).map(([key, item]) => {
        const pct = (item.score / item.max) * 100
        const color = pct >= 80 ? COLORS.excellent : pct >= 60 ? COLORS.good : pct >= 40 ? COLORS.average : COLORS.poor
        return (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{item.label}</span>
              <span className="font-semibold" style={{ color }}>{item.score}/{item.max}</span>
            </div>
            <div className="h-1.5 bg-dark-400 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ShortsAnalysis({ shorts, thumbnail, videoData }) {
  const [activeSection, setActiveSection] = useState('shorts')

  if (!shorts || !thumbnail) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-600/15 flex items-center justify-center mb-4">
          <Scissors className="w-9 h-9 text-brand-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-200 mb-2">Shorts &amp; Thumbnail Analysis</h3>
        <p className="text-slate-500 max-w-sm text-sm">Analyze a video first to identify Shorts clip opportunities and thumbnail performance.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Section toggle */}
      <div className="flex gap-2">
        {[
          { id: 'shorts', label: 'Shorts Opportunities', icon: Scissors },
          { id: 'thumbnail', label: 'Thumbnail Analysis', icon: Image },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === s.id
                ? 'bg-brand-600/25 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200 bg-dark-600 hover:bg-dark-500 border border-transparent'
            }`}
          >
            <s.icon className="w-4 h-4" /> {s.label}
          </button>
        ))}
      </div>

      {/* Shorts section */}
      {activeSection === 'shorts' && (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Best YouTube Shorts Opportunities</h3>
              <p className="text-xs text-slate-500 mt-0.5">{shorts.opportunities.length} clip opportunities identified • Click to expand details</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span><Flame className="w-3.5 h-3.5 text-emerald-400 inline" /> 85%+ Excellent</span>
              <span><Flame className="w-3.5 h-3.5 text-amber-400 inline" /> 70–84% Good</span>
            </div>
          </div>

          <div className="grid gap-3">
            {shorts.opportunities.map(opp => <ShortsCard key={opp.id} opp={opp} />)}
          </div>

          <div className="glass-card p-4 border-brand-500/15">
            <p className="section-title">Shorts Creation Checklist</p>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-400">
              {[
                'Hook must land in first 1–3 seconds',
                'Keep Shorts between 45–58 seconds for algorithm boost',
                'Add vertical captions (auto or manual) to every Short',
                'First frame should show your face or a bold visual',
                'End with a strong CTA directing to full video',
                'Post 3–5 Shorts per week for maximum reach',
              ].map((tip, i) => (
                <li key={i} className="flex gap-2"><span className="text-brand-400">✓</span>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Thumbnail section */}
      {activeSection === 'thumbnail' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Thumbnail preview + score */}
            <div className="glass-card p-5 flex flex-col items-center gap-5">
              {thumbnail.thumbUrl ? (
                <div className="w-full rounded-lg overflow-hidden">
                  <img src={thumbnail.thumbUrl} alt="Video thumbnail" className="w-full object-cover" style={{ aspectRatio: '16/9' }} />
                </div>
              ) : (
                <div className="w-full rounded-lg bg-dark-600 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                  <Image className="w-10 h-10 text-slate-600" />
                </div>
              )}
              <ScoreRingOverlay score={thumbnail.total} size={130} strokeWidth={12} label="Thumbnail Score" />
            </div>

            {/* Score breakdown */}
            <div className="glass-card p-5">
              <p className="section-title">Score Breakdown</p>
              <ThumbnailScore breakdown={thumbnail.breakdown} />
            </div>

            {/* Weaknesses */}
            <div className="glass-card p-5">
              <p className="section-title text-red-400">Weaknesses</p>
              <ul className="space-y-2">
                {thumbnail.weaknesses.map((w, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-slate-300 p-2 rounded-lg bg-red-500/8 border border-red-500/15">
                    <span className="text-red-400 flex-shrink-0">⚠</span> {w}
                  </li>
                ))}
                {thumbnail.weaknesses.length === 0 && (
                  <li className="text-sm text-emerald-400">No major weaknesses detected!</li>
                )}
              </ul>
            </div>
          </div>

          {/* Improvements */}
          <div className="glass-card p-5">
            <p className="section-title flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" />Improvement Suggestions</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {thumbnail.improvements.map((imp, i) => (
                <div key={i} className="flex gap-2.5 p-3 rounded-lg bg-amber-500/8 border border-amber-500/15 text-sm text-slate-300">
                  <span className="text-amber-400 flex-shrink-0">{i + 1}.</span> {imp}
                </div>
              ))}
            </div>
          </div>

          {/* Alternative concepts */}
          <div className="glass-card p-5">
            <p className="section-title">Alternative Thumbnail Concepts</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {thumbnail.alternatives.map((alt, i) => (
                <div key={i} className="glass-card p-4 hover:border-brand-500/30 transition-all">
                  <div className="text-2xl mb-2">
                    {['🎨', '😮', '↔️', '📈'][i]}
                  </div>
                  <p className="text-sm font-semibold text-slate-200 mb-1">{alt.concept}</p>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">{alt.description}</p>
                  <span className="text-xs font-bold text-emerald-400">{alt.ctrBoost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
