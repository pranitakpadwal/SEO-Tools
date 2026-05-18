import React from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, Tag, Link2, Search, Lightbulb, TrendingUp } from 'lucide-react'
import { ScoreRingOverlay } from '../components/ScoreRing.jsx'
import { getScoreColor } from '../utils/seoAnalyzer.js'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

const scoreColors = { excellent: '#34d399', good: '#a3e635', average: '#fbbf24', poor: '#f87171' }

function IssueRow({ issue }) {
  const icons = { error: XCircle, warning: AlertCircle, info: Info }
  const colors = { error: 'text-red-400', warning: 'text-amber-400', info: 'text-blue-400' }
  const bgs = { error: 'bg-red-500/8 border-red-500/20', warning: 'bg-amber-500/8 border-amber-500/20', info: 'bg-blue-500/8 border-blue-500/20' }
  const Icon = icons[issue.type] || Info
  return (
    <div className={`flex gap-3 p-3 rounded-lg border ${bgs[issue.type]}`}>
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors[issue.type]}`} />
      <div>
        <span className="text-xs font-semibold text-slate-400 mr-2">[{issue.category}]</span>
        <span className="text-sm text-slate-300">{issue.msg}</span>
      </div>
    </div>
  )
}

function ScoreBar({ label, score, max }) {
  const pct = Math.min((score / max) * 100, 100)
  const color = scoreColors[getScoreColor(score, max)]
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold" style={{ color }}>{score}/{max}</span>
      </div>
      <div className="h-1.5 bg-dark-400 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function SEOAnalysis({ analysis, videoData }) {
  if (!analysis || !videoData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-600/15 flex items-center justify-center mb-4">
          <Search className="w-9 h-9 text-brand-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-200 mb-2">SEO Analysis</h3>
        <p className="text-slate-500 max-w-sm text-sm">Paste a YouTube video URL above and click Analyze to get your comprehensive SEO report.</p>
      </div>
    )
  }

  const { title: titleScore, description: descScore, tags: tagScore, technical: techScore, engagement: engScore } = analysis.scores
  const radarData = [
    { subject: 'Title', score: (titleScore / 25) * 100, fullMark: 100 },
    { subject: 'Description', score: (descScore / 25) * 100, fullMark: 100 },
    { subject: 'Tags', score: (tagScore / 20) * 100, fullMark: 100 },
    { subject: 'Technical', score: (techScore / 15) * 100, fullMark: 100 },
    { subject: 'Engagement', score: (engScore / 15) * 100, fullMark: 100 },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top row: score + radar + quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="glass-card p-6 flex flex-col items-center justify-center gap-4">
          <ScoreRingOverlay score={analysis.total} size={160} strokeWidth={14} label="Overall SEO Score" />
          <div className="w-full space-y-2.5 mt-2">
            <ScoreBar label="Title" score={titleScore} max={25} />
            <ScoreBar label="Description" score={descScore} max={25} />
            <ScoreBar label="Tags &amp; Hashtags" score={tagScore} max={20} />
            <ScoreBar label="Technical" score={techScore} max={15} />
            <ScoreBar label="Engagement" score={engScore} max={15} />
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col">
          <p className="section-title">Score Radar</p>
          <div className="flex-1" style={{ minHeight: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2d2f5a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="#4f5ff7" fill="#4f5ff7" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip
                  contentStyle={{ background: '#0f1029', border: '1px solid #2d2f5a', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${Math.round(v)}%`, 'Score']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-4 space-y-3">
          <p className="section-title">Quick Health Check</p>
          {[
            { label: 'Title Searchable', val: analysis.titleSearchable },
            { label: 'Description Optimized', val: analysis.descriptionOptimized },
            { label: 'CTA Present', val: analysis.hasCTA },
            { label: 'Timestamps Added', val: analysis.hasTimestamps },
            { label: 'Hashtags Used', val: analysis.hashtags.length >= 3 },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{item.label}</span>
              {item.val
                ? <span className="flex items-center gap-1 text-xs font-medium text-emerald-400"><CheckCircle className="w-3.5 h-3.5" />Yes</span>
                : <span className="flex items-center gap-1 text-xs font-medium text-red-400"><XCircle className="w-3.5 h-3.5" />No</span>
              }
            </div>
          ))}
          <div className="border-t border-dark-400 pt-3 mt-1">
            <p className="text-xs text-slate-500 mb-1">Primary Keyword Detected</p>
            {analysis.primaryKeyword
              ? <span className="tag bg-brand-600/20 text-brand-300 border border-brand-500/30 text-xs">#{analysis.primaryKeyword}</span>
              : <span className="text-xs text-slate-500 italic">None detected</span>
            }
          </div>
        </div>
      </div>

      {/* Missing elements checklist */}
      <div className="glass-card p-5">
        <p className="section-title flex items-center gap-2"><Tag className="w-4 h-4" /> Missing SEO Elements</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {analysis.missingElements.map(el => (
            <div key={el.label} className={`flex items-center gap-2.5 p-2.5 rounded-lg text-sm ${el.present ? 'bg-emerald-500/8 border border-emerald-500/20' : 'bg-red-500/8 border border-red-500/20'}`}>
              {el.present
                ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              }
              <span className={el.present ? 'text-emerald-300' : 'text-red-300'}>{el.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Issues */}
      {analysis.issues.length > 0 && (
        <div className="glass-card p-5">
          <p className="section-title flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Keyword Placement &amp; Issues ({analysis.issues.length})</p>
          <div className="space-y-2">
            {analysis.keywordIssues.map((msg, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg border bg-orange-500/8 border-orange-500/20">
                <AlertCircle className="w-4 h-4 mt-0.5 text-orange-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{msg}</span>
              </div>
            ))}
            {analysis.issues.map((issue, i) => <IssueRow key={i} issue={issue} />)}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="glass-card p-5">
          <p className="section-title flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Suggested Improvements</p>
          <div className="space-y-2">
            {analysis.suggestions.map((s, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg border bg-brand-600/8 border-brand-500/20">
                <Lightbulb className="w-4 h-4 mt-0.5 text-brand-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Long-tail keywords */}
      <div className="glass-card p-5">
        <p className="section-title flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Recommended Long-Tail Keywords</p>
        <div className="flex flex-wrap gap-2">
          {analysis.longTailKeywords.map((kw, i) => (
            <span key={i} className="tag bg-purple-500/15 text-purple-300 border border-purple-500/25 text-xs">
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Internal linking */}
      <div className="glass-card p-5">
        <p className="section-title flex items-center gap-2"><Link2 className="w-4 h-4" /> Internal Linking Opportunities</p>
        <ul className="space-y-2">
          {analysis.internalLinkingTips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
              <span className="text-brand-400 font-bold flex-shrink-0">{i + 1}.</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Extracted keywords */}
      <div className="glass-card p-5">
        <p className="section-title">Extracted Keywords from Video</p>
        <div className="flex flex-wrap gap-1.5">
          {analysis.extractedKeywords.slice(0, 15).map((kw, i) => (
            <span key={i} className="tag bg-dark-500 text-slate-300 border border-dark-400 text-xs font-normal">{kw}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
