import React, { useState } from 'react'
import { BarChart2, Download, FileSpreadsheet, FileText, Calendar, TrendingUp, Clock, AlertTriangle, CheckCircle, Search } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from 'recharts'
import URLInput from '../components/URLInput.jsx'
import { ScoreRingOverlay } from '../components/ScoreRing.jsx'
import { exportToExcel, exportToWord } from '../utils/exportUtils.js'

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-800 border border-dark-400 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color = 'text-brand-400' }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-dark-500 ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500">{label}</p>
          <p className={`text-2xl font-bold ${color} mt-0.5`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  )
}

export default function ChannelAnalytics({ onAnalyzeChannel, channelData, loading, channelInfo }) {
  const [exporting, setExporting] = useState('')

  const handleExcelExport = async () => {
    if (!channelData) return
    setExporting('excel')
    try {
      exportToExcel(channelData, channelInfo?.snippet?.title || 'Channel')
    } finally {
      setExporting('')
    }
  }

  const handleWordExport = async () => {
    if (!channelData) return
    setExporting('word')
    try {
      await exportToWord(channelData, channelInfo?.snippet?.title || 'Channel')
    } finally {
      setExporting('')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Channel URL input */}
      <div className="glass-card p-5 border-2 border-brand-500/20">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-brand-600/20">
            <BarChart2 className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">Channel Publishing Analytics</h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Paste a <strong className="text-brand-300">YouTube Channel URL</strong> below to analyze publishing frequency and consistency.
              <br />
              <span className="text-xs text-amber-400">Note: This requires a Channel URL (not a video URL)</span>
            </p>
          </div>
        </div>
        <URLInput
          onAnalyze={onAnalyzeChannel}
          loading={loading}
          placeholder="https://www.youtube.com/@channelname or /channel/UCxxx"
          hint="Supports: youtube.com/@handle, youtube.com/channel/ID, youtube.com/c/name, youtube.com/user/name"
        />
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> youtube.com/@channelname</span>
          <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> youtube.com/channel/UCxxx</span>
          <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> youtube.com/c/channelname</span>
        </div>
      </div>

      {!channelData && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-brand-600/15 flex items-center justify-center mb-4">
            <Calendar className="w-9 h-9 text-brand-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2">Publishing Frequency Report</h3>
          <p className="text-slate-500 max-w-sm text-sm">Enter a YouTube channel URL above to generate a complete publishing analytics report with export options.</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <svg className="animate-spin w-10 h-10 text-brand-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
          <p className="text-slate-400 text-sm">Fetching channel videos... this may take a moment.</p>
        </div>
      )}

      {channelData && !loading && (
        <div className="space-y-5">
          {/* Channel header + export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-4">
            <div className="flex items-center gap-3">
              {channelInfo?.snippet?.thumbnails?.default?.url && (
                <img src={channelInfo.snippet.thumbnails.default.url} alt="" className="w-12 h-12 rounded-full" />
              )}
              <div>
                <h3 className="font-semibold text-slate-100">{channelInfo?.snippet?.title || 'Channel'}</h3>
                <p className="text-xs text-slate-400">
                  {channelData.totalAnalyzed} videos analyzed •{' '}
                  {channelInfo?.statistics?.subscriberCount
                    ? `${parseInt(channelInfo.statistics.subscriberCount).toLocaleString()} subscribers`
                    : 'Subscribers hidden'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExcelExport}
                disabled={!!exporting}
                className="btn-secondary text-emerald-300 border-emerald-500/30 hover:border-emerald-400/50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {exporting === 'excel' ? 'Exporting...' : 'Excel'}
              </button>
              <button
                onClick={handleWordExport}
                disabled={!!exporting}
                className="btn-secondary text-blue-300 border-blue-500/30 hover:border-blue-400/50"
              >
                <FileText className="w-4 h-4" />
                {exporting === 'word' ? 'Exporting...' : 'Word'}
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={TrendingUp} label="Videos / Week (30d)" value={channelData.regular.perWeek} sub="regular videos" color="text-brand-400" />
            <StatCard icon={TrendingUp} label="Shorts / Week (30d)" value={channelData.shorts.perWeek} sub="short-form content" color="text-pink-400" />
            <StatCard icon={Calendar} label="Videos / Month (30d)" value={channelData.regular.last30Days} sub="regular videos" color="text-purple-400" />
            <StatCard icon={Calendar} label="Shorts / Month (30d)" value={channelData.shorts.last30Days} sub="short-form content" color="text-amber-400" />
          </div>

          {/* Consistency + Benchmark row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="glass-card p-5 flex flex-col items-center justify-center gap-3">
              <ScoreRingOverlay score={channelData.consistencyScore} size={130} strokeWidth={12} label="Consistency Score" />
              <p className="text-xs text-slate-400 text-center max-w-[180px]">
                {channelData.consistencyScore >= 80
                  ? 'Publishing cadence is very consistent — great for algorithm.'
                  : channelData.consistencyScore >= 60
                  ? 'Moderate consistency — aim for a fixed weekly schedule.'
                  : 'Inconsistent publishing — this hurts algorithm favorability.'}
              </p>
            </div>

            <div className="lg:col-span-2 glass-card p-5">
              <p className="section-title flex items-center gap-2"><TrendingUp className="w-4 h-4" />Upload Frequency Benchmarks</p>
              <div className="space-y-4">
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`text-xs px-2.5 py-1 rounded-full font-semibold ${channelData.regular.perWeek >= 2 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : channelData.regular.perWeek >= 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                      Regular Videos
                    </div>
                    <span className="text-sm text-slate-300">{channelData.benchmark.videoStatus}</span>
                  </div>
                  <div className="text-xs text-slate-500">Recommended: {channelData.benchmark.recommendedVideosPerWeek} videos/week</div>
                </div>
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`text-xs px-2.5 py-1 rounded-full font-semibold ${channelData.shorts.perWeek >= 3 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : channelData.shorts.perWeek >= 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                      YouTube Shorts
                    </div>
                    <span className="text-sm text-slate-300">{channelData.benchmark.shortsStatus}</span>
                  </div>
                  <div className="text-xs text-slate-500">Recommended: {channelData.benchmark.recommendedShortsPerWeek} shorts/week</div>
                </div>
                <div className="border-t border-dark-400 pt-3 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Last 30 Days', videos: channelData.regular.last30Days, shorts: channelData.shorts.last30Days },
                    { label: 'Last 90 Days', videos: channelData.regular.last90Days, shorts: channelData.shorts.last90Days },
                    { label: 'Last 12 Months', videos: channelData.regular.lastYear, shorts: '—' },
                  ].map(item => (
                    <div key={item.label} className="text-center bg-dark-700 rounded-lg p-2.5">
                      <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                      <p className="text-lg font-bold text-brand-400">{item.videos}</p>
                      <p className="text-xs text-pink-400">{item.shorts} shorts</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly chart */}
          <div className="glass-card p-5">
            <p className="section-title flex items-center gap-2"><BarChart2 className="w-4 h-4" />Monthly Publishing History</p>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData.monthlyBuckets} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1e3d" />
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                  <Bar dataKey="videos" name="Videos" fill="#4f5ff7" radius={[3,3,0,0]} />
                  <Bar dataKey="shorts" name="Shorts" fill="#ec4899" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly chart */}
          <div className="glass-card p-5">
            <p className="section-title flex items-center gap-2"><TrendingUp className="w-4 h-4" />Weekly Publishing Trend (Last 24 Weeks)</p>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={channelData.weeklyBuckets}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1e3d" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} interval={3} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="videos" name="Videos" stroke="#4f5ff7" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="shorts" name="Shorts" stroke="#ec4899" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inactive periods */}
          <div className="glass-card p-5">
            <p className="section-title flex items-center gap-2"><Clock className="w-4 h-4" />Inactive Publishing Periods (21+ day gaps)</p>
            {channelData.inactivePeriods.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                No significant inactive periods detected — excellent publishing discipline!
              </div>
            ) : (
              <div className="space-y-2">
                {channelData.inactivePeriods.map((period, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-amber-500/8 border border-amber-500/20">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">From</p>
                        <p className="text-slate-300 font-medium">{period.from}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">To</p>
                        <p className="text-slate-300 font-medium">{period.to}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Gap</p>
                        <p className="text-amber-400 font-bold">{period.days} days</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
