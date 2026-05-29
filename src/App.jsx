import React, { useState, useCallback, useEffect } from 'react'
import { Youtube, Search, Sparkles, Scissors, BarChart2, AlertCircle, LogOut, User } from 'lucide-react'

import ApiGate from './components/ApiGate.jsx'
import SetupWizard from './components/SetupWizard.jsx'
import URLInput from './components/URLInput.jsx'
import VideoCard from './components/VideoCard.jsx'

import SEOAnalysis from './pages/SEOAnalysis.jsx'
import ContentOptimization from './pages/ContentOptimization.jsx'
import ShortsAnalysis from './pages/ShortsAnalysis.jsx'
import ChannelAnalytics from './pages/ChannelAnalytics.jsx'

import { extractVideoId, extractChannelId, fetchVideoData, fetchChannelInfo, fetchVideosByChannel } from './utils/youtube.js'
import { apiFetch } from './utils/apiFetch.js'
import { analyzeSEO } from './utils/seoAnalyzer.js'
import { generateTitleVariations, generateDescription, generateHashtags } from './utils/contentGenerator.js'
import { analyzeShortsOpportunities, analyzeThumbnail } from './utils/shortsAnalyzer.js'
import { analyzePublishingFrequency } from './utils/channelAnalyzer.js'

const TABS = [
  { id: 'seo',     label: 'SEO Analysis',      icon: Search   },
  { id: 'content', label: 'Content Optimizer',  icon: Sparkles },
  { id: 'shorts',  label: 'Shorts & Thumbnail', icon: Scissors },
  { id: 'channel', label: 'Channel Analytics',  icon: BarChart2 },
]

export default function App() {
  // ── Session state machine: loading → gate → setup → app ──────────────────
  const [screen, setScreen] = useState('loading')
  const [user,   setUser]   = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('session_token')
    if (!token) { setScreen('gate'); return }

    apiFetch('/auth/me')
      .then(data => {
        if (!data) { setScreen('gate'); return }
        setUser(data)
        setScreen(data.has_gemini_key ? 'app' : 'setup')
      })
      .catch(() => setScreen('gate'))
  }, [])

  // Listen for forced logout from apiFetch (401 anywhere in the app)
  useEffect(() => {
    const handler = () => { setUser(null); setScreen('gate') }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  function handleLogin({ hasGeminiKey }) {
    if (hasGeminiKey) {
      apiFetch('/auth/me').then(data => { setUser(data); setScreen('app') })
    } else {
      setScreen('setup')
    }
  }

  function handleSignOut() {
    localStorage.removeItem('session_token')
    setUser(null)
    setScreen('gate')
  }

  // ── Tool state ────────────────────────────────────────────────────────────
  const [activeTab,      setActiveTab]      = useState('seo')
  const [loading,        setLoading]        = useState(false)
  const [channelLoading, setChannelLoading] = useState(false)
  const [error,          setError]          = useState('')
  const [videoData,      setVideoData]      = useState(null)
  const [seoAnalysis,    setSeoAnalysis]    = useState(null)
  const [contentData,    setContentData]    = useState(null)
  const [shortsData,     setShortsData]     = useState(null)
  const [thumbnailData,  setThumbnailData]  = useState(null)
  const [channelData,    setChannelData]    = useState(null)
  const [channelInfo,    setChannelInfo]    = useState(null)

  const handleAnalyze = useCallback(async (url) => {
    const videoId = extractVideoId(url)
    if (!videoId) { setError('Invalid YouTube video URL. Please paste a full YouTube video link.'); return }

    setLoading(true); setError('')
    setVideoData(null); setSeoAnalysis(null); setContentData(null)
    setShortsData(null); setThumbnailData(null)

    try {
      const data = await fetchVideoData(videoId)
      if (!data) return
      setVideoData(data)

      const seo = analyzeSEO(data)
      setSeoAnalysis(seo)
      setShortsData(analyzeShortsOpportunities(data))
      setThumbnailData(analyzeThumbnail(data))

      const [titles, desc, tags] = await Promise.all([
        generateTitleVariations(data.snippet?.title || '', seo.extractedKeywords),
        generateDescription(data.snippet?.title || '', seo.extractedKeywords, data.snippet?.channelTitle || 'Your Channel'),
        generateHashtags(seo.extractedKeywords, data.snippet?.title || ''),
      ])
      setContentData({ titles, description: desc, hashtags: tags })
    } catch (err) {
      setError(err.message || 'Failed to fetch video data.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleAnalyzeChannel = useCallback(async (url) => {
    const channelId = extractChannelId(url)
    if (!channelId) { setError('Invalid channel URL. Try: youtube.com/@channelname'); return }

    setChannelLoading(true); setError('')
    setChannelData(null); setChannelInfo(null)

    try {
      const info = await fetchChannelInfo(channelId)
      if (!info) return
      setChannelInfo(info)
      const videos    = await fetchVideosByChannel(info.id)
      const analytics = analyzePublishingFrequency(videos)
      setChannelData(analytics)
    } catch (err) {
      setError(err.message || 'Failed to fetch channel data.')
    } finally {
      setChannelLoading(false)
    }
  }, [])

  // ── Screen routing ────────────────────────────────────────────────────────
  if (screen === 'loading') return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: '#0a0b1a' }}>
      <svg className="animate-spin w-10 h-10 text-brand-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
      </svg>
    </div>
  )

  if (screen === 'gate')  return <ApiGate onLogin={handleLogin} />
  if (screen === 'setup') return <SetupWizard user={user} onComplete={() => {
    apiFetch('/auth/me').then(data => { setUser(data); setScreen('app') })
  }} />

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(79,95,247,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(167,139,250,0.08) 0%, transparent 60%), #0a0b1a' }}>
      <header className="sticky top-0 z-50 glass border-b border-dark-400/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Youtube className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">YouTube SEO Analyzer</span>
          </div>
          <div className="flex items-center gap-3">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-7 h-7 rounded-full" />
              : <User className="w-4 h-4 text-slate-500" />
            }
            <span className="hidden sm:inline text-xs text-slate-500">{user?.name || user?.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-dark-500/50"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {activeTab !== 'channel' && (
          <div className="glass-card p-5">
            <URLInput
              onAnalyze={handleAnalyze}
              loading={loading}
              placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
              label="YouTube Video URL"
              hint="Paste any YouTube video URL to analyze SEO, generate AI-optimized content, and find Shorts opportunities."
            />
            {videoData && <div className="mt-4"><VideoCard videoData={videoData} /></div>}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError('') }}
              className={`nav-tab flex-shrink-0 ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              {i < 3 && activeTab === tab.id && videoData && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'seo'     && <SEOAnalysis analysis={seoAnalysis} videoData={videoData} />}
          {activeTab === 'content' && <ContentOptimization titles={contentData?.titles} description={contentData?.description} hashtags={contentData?.hashtags} videoData={videoData} />}
          {activeTab === 'shorts'  && <ShortsAnalysis shorts={shortsData} thumbnail={thumbnailData} videoData={videoData} />}
          {activeTab === 'channel' && <ChannelAnalytics onAnalyzeChannel={handleAnalyzeChannel} channelData={channelData} loading={channelLoading} channelInfo={channelInfo} />}
        </div>
      </div>

      <footer className="border-t border-dark-400/30 mt-12 py-6 text-center text-xs text-slate-600">
        YouTube SEO Analyzer · Powered by Google Gemini + YouTube Data API v3
      </footer>
    </div>
  )
}
