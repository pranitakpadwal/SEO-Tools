import React, { useState } from 'react'
import { Type, FileText, Hash, CheckCircle, Sparkles, RefreshCw } from 'lucide-react'
import CopyButton from '../components/CopyButton.jsx'

const BADGE_MAP = {
  'SEO': 'badge-seo',
  'CTR': 'badge-ctr',
  'Thought Leadership': 'badge-thought',
  'Shorts Hook': 'badge-shorts',
}

const TYPE_ICON = {
  'SEO': '🔍',
  'CTR': '🖱️',
  'Thought Leadership': '🎯',
  'Shorts Hook': '⚡',
}

function TitleCard({ variation }) {
  return (
    <div className="glass-card p-4 hover:border-brand-500/30 transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`tag ${BADGE_MAP[variation.type]}`}>
          {TYPE_ICON[variation.type]} {variation.type}
        </span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono ${variation.charOk ? 'text-emerald-400' : 'text-amber-400'}`}>
            {variation.chars} chars
          </span>
          <CopyButton text={variation.title} />
        </div>
      </div>
      <p className="text-sm text-slate-100 font-medium leading-relaxed">{variation.title}</p>
      {!variation.charOk && (
        <p className="text-xs text-amber-400 mt-2">Over 70 chars — may be truncated in search</p>
      )}
    </div>
  )
}

export default function ContentOptimization({ titles, description, hashtags, videoData }) {
  const [activeTab, setActiveTab] = useState('titles')
  const [descCopied, setDescCopied] = useState(false)
  const [showAll, setShowAll] = useState(false)

  if (!titles || !description) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-600/15 flex items-center justify-center mb-4">
          <Sparkles className="w-9 h-9 text-brand-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-200 mb-2">Content Optimization</h3>
        <p className="text-slate-500 max-w-sm text-sm">Analyze a video first to generate optimized titles, descriptions, and hashtags.</p>
      </div>
    )
  }

  const tabs = [
    { id: 'titles', label: 'Title Rewrites', icon: Type, count: titles?.length },
    { id: 'description', label: 'Description', icon: FileText },
    { id: 'hashtags', label: 'Hashtags', icon: Hash, count: hashtags?.length },
  ]

  const seoTitles = titles.filter(t => t.type === 'SEO')
  const ctrTitles = titles.filter(t => t.type === 'CTR')
  const thoughtTitles = titles.filter(t => t.type === 'Thought Leadership')
  const shortsTitles = titles.filter(t => t.type === 'Shorts Hook')

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Sub-tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-brand-600/25 text-brand-300 border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200 bg-dark-600 hover:bg-dark-500 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count && (
              <span className="text-xs bg-brand-600/30 text-brand-300 px-1.5 py-0.5 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Titles tab */}
      {activeTab === 'titles' && (
        <div className="space-y-5">
          <div className="glass-card p-4">
            <p className="text-xs text-slate-400 mb-1">Original Title</p>
            <p className="text-sm text-slate-200 font-medium">{videoData?.snippet?.title}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <span className="tag badge-seo">🔍 SEO Focused</span>
              </h3>
              <span className="text-xs text-slate-500">Keyword-optimized for search discovery</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {seoTitles.map((t, i) => <TitleCard key={i} variation={t} />)}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <span className="tag badge-ctr">🖱️ CTR Focused</span>
              </h3>
              <span className="text-xs text-slate-500">Designed to maximize click-through rate</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ctrTitles.map((t, i) => <TitleCard key={i} variation={t} />)}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <span className="tag badge-thought">🎯 Thought Leadership</span>
              </h3>
              <span className="text-xs text-slate-500">Executive &amp; B2B audience optimized</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {thoughtTitles.map((t, i) => <TitleCard key={i} variation={t} />)}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <span className="tag badge-shorts">⚡ Shorts Hook</span>
              </h3>
              <span className="text-xs text-slate-500">Short-form viral hooks under 60 chars</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shortsTitles.map((t, i) => <TitleCard key={i} variation={t} />)}
            </div>
          </div>

          <div className="glass-card p-4 border-brand-500/20">
            <p className="section-title">Title Writing Rules</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
              {[
                'Under 70 characters preferred',
                'Include primary keyword in first 3 words',
                'Avoid all-caps and excessive punctuation',
                'Numbers increase CTR by up to 36%',
                'Question titles boost engagement',
                'Use "|" or ":" to separate hook from topic',
              ].map((rule, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Description tab */}
      {activeTab === 'description' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Generated YouTube Description</h3>
              <p className="text-xs text-slate-500 mt-0.5">Professional B2B media tone • Keyword-rich • CTA included</p>
            </div>
            <CopyButton text={description} />
          </div>

          <div className="glass-card p-5">
            <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">{description}</pre>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Keyword-rich Opening', icon: '🎯', desc: 'Primary keyword in first sentence' },
              { label: 'Timestamps', icon: '⏱️', desc: 'Chapter placeholders included' },
              { label: 'CTA Section', icon: '🔔', desc: 'Subscribe, like & comment prompts' },
              { label: 'Hashtags', icon: '#️⃣', desc: '10 hashtags at footer' },
            ].map(item => (
              <div key={item.label} className="glass-card p-3 text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-xs font-semibold text-slate-300">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hashtags tab */}
      {activeTab === 'hashtags' && (
        <div className="space-y-5">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">15 Highly Searchable Hashtags</h3>
                <p className="text-xs text-slate-500 mt-0.5">Mix of niche-specific and broad discovery hashtags</p>
              </div>
              <CopyButton text={hashtags.join(' ')} />
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer hover:opacity-80 transition-opacity ${
                    i < 5 ? 'bg-brand-600/20 text-brand-300 border-brand-500/30' :
                    i < 10 ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                    'bg-dark-500 text-slate-300 border-dark-400'
                  }`}
                  title={`Click to copy ${tag}`}
                  onClick={() => navigator.clipboard.writeText(tag)}
                >
                  {tag}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-400">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-3 h-3 rounded-full bg-brand-600/40 border border-brand-500/50" />
                Topic-specific (top 5)
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-3 h-3 rounded-full bg-purple-500/40 border border-purple-500/50" />
                Industry hashtags
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-3 h-3 rounded-full bg-dark-500 border border-dark-400" />
                Broad discovery
              </div>
            </div>
          </div>

          <div className="glass-card p-4 border-brand-500/20">
            <p className="section-title">Hashtag Best Practices</p>
            <ul className="space-y-2 text-xs text-slate-400">
              {[
                'Use 3–15 hashtags per video — YouTube ignores hashtags beyond 15',
                'Place hashtags at the end of your description for clean formatting',
                'The first 3 hashtags appear above your video title in mobile search',
                'Mix 1–2 very specific niche tags with 3–5 broader industry tags',
                'Avoid banned or spammy hashtags — they can suppress your video',
              ].map((tip, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-brand-400">•</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
