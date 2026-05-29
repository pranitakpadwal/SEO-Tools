import React, { useState, useCallback } from 'react'
import { Youtube, Search, Sparkles, Scissors, BarChart2, AlertCircle, LogOut } from 'lucide-react'

import ApiGate from './components/ApiGate.jsx'
import URLInput from './components/URLInput.jsx'
import VideoCard from './components/VideoCard.jsx'

import SEOAnalysis from './pages/SEOAnalysis.jsx'
import ContentOptimization from './pages/ContentOptimization.jsx'
import ShortsAnalysis from './pages/ShortsAnalysis.jsx'
import ChannelAnalytics from './pages/ChannelAnalytics.jsx'

import { extractVideoId, extractChannelId, fetchVideoData, fetchChannelInfo, fetchVideosByChannel } from './utils/youtube.js'
import { analyzeSEO } from './utils/seoAnalyzer.js'
import { generateTitleVariations, generateDescription, generateHashtags } from './utils/contentGenerator.js'
import { analyzeShortsOpportunities, analyzeThumbnail } from './utils/shortsAnalyzer.js'
import { analyzePublishingFrequency } from './utils/channelAnalyzer.js'

const TABS = [
  { id: 'seo',     label: 'SEO Analysis',      icon: Search,    desc: 'Score & fix' },
  { id: 'content', label: 'Content Optimizer',  icon: Sparkles,  desc: 'Titles & copy' },
  { id: 'shorts',  label: 'Shorts & Thumbnail', icon: Scissors,  desc: 'Clip ideas' },
  { id: 'channel', label: 'Channel Analytics',  icon: BarChart2, desc: 'Frequency report' },
]

export default function App() {
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') || '')
  const [activeTab, setActiveTab] = useState('seo')
  const [loading, setLoading] = useState(false)
  const [channelLoading, setChannelLoading] = useState(false)
  const [error, setError] = useState('')

  const [videoData, setVideoData] = useState(null)
  const [seoAnalysis, setSeoAnalysis] = useState(null)
  const [contentData, setContentData] = useState(null)
  const [shortsData, setShortsData] = useState(null)
  const [thumbnailData, setThumbnailData] = useState(null)
  const [channelData, setChannelData] = useState(null)
  const [channelInfo, setChannelInfo] = useState(null)

  const handleSignOut = () => {
    localStorage.removeItem('gemini_api_key')
    setGeminiKey('')
  }

  const handleAnalyze = useCallback(async (url) => {
    const videoId = extractVideoId(url)
    if (!videoId) { setError('Invalid YouTube video URL. Please paste a full YouTube video link.'); return }

    setLoading(true)
    setError('')
    setVideoData(null)
    setSeoAnalysis(null)
    setContentData(null)
    setShortsData(null)
    setThumbnailData(null)

    try {
      const data = await fetchVideoData(videoId)
      setVideoData(data)

      const seo = analyzeSEO(data)
      setSeoAnalysis(seo)

      const shorts = analyzeShortsOpportunities(data)
      setShortsData(shorts)
      const thumb = analyzeThumbnail(data)
      setThumbnailData(thumb)

      // AI generation — all three run in parallel using user's Gemini key
      const [titles, desc, tags] = await Promise.all([
        generateTitleVariations(data.snippet?.title || '', seo.extractedKeywords, geminiKey),
        generateDescription(data.snippet?.title || '', seo.extractedKeywords, data.snippet?.channelTitle || 'Your Channel', geminiKey),
        generateHashtags(seo.extractedKeywords, data.snippet?.title || '', geminiKey),
      ])
      setContentData({ titles, description: desc, hashtags: tags })
    } catch (err) {
      setError(err.message || 'Failed to fetch video data.')
    } finally {
      setLoading(false)
    }
  }, [geminiKey])

  const handleAnalyzeChannel = useCallback(async (url) => {
    const channelId = extractChannelId(url)
    if (!channelId) { setError('Invalid YouTube channel URL. Try: youtube.com/@channelname or youtube.com/channel/UCxxx'); return }

    setChannelLoading(true)
    setError('')
    setChannelData(null)
    setChannelInfo(null)

    try {
      const info = await fetchChannelInfo(channelId)
      setChannelInfo(info)
      const videos = await fetchVideosByChannel(info.id)
      const analytics = analyzePublishingFrequency(videos)
      setChannelData(analytics)
    } catch (err) {
      setError(err.message || 'Failed to fetch channel data.')
    } finally {
      setChannelLoading(false)
    }
  }, [])

  // Show login gate if no Gemini key
  if (!geminiKey) return <ApiGate onUnlock={setGeminiKey} />

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(79,95,247,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(167,139,250,0.08) 0%, transparent 60%), #0a0b1a' }}>
      <header className="sticky top-0 z-50 glass border-b border-dark-400/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Youtube className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">YouTube SEO Analyzer</span>
              <span className="hidden sm:inline text-xs text-slate-500 ml-2">Powered by Google Gemini</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-dark-500/50"
            title="Sign out / change Gemini key"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Video URL input (shown on tabs 1-3) */}
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

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Tab navigation */}
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
              {i < 3 && activeTab === tab.id && videoData && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          ))}
        </div>

        {/* Page content */}
        <div className="min-h-[400px]">
          {activeTab === 'seo' && <SEOAnalysis analysis={seoAnalysis} videoData={videoData} />}
          {activeTab === 'content' && (
            <ContentOptimization
              titles={contentData?.titles}
              description={contentData?.description}
              hashtags={contentData?.hashtags}
              videoData={videoData}
            />
          )}
          {activeTab === 'shorts' && (
            <ShortsAnalysis shorts={shortsData} thumbnail={thumbnailData} videoData={videoData} />
          )}
          {activeTab === 'channel' && (
            <ChannelAnalytics
              onAnalyzeChannel={handleAnalyzeChannel}
              channelData={channelData}
              loading={channelLoading}
              channelInfo={channelInfo}
            />
          )}
        </div>
      </div>

      <footer className="border-t border-dark-400/30 mt-12 py-6 text-center text-xs text-slate-600">
        YouTube SEO Analyzer • Powered by Google Gemini + YouTube Data API v3
      </footer>
    </div>
  )
}
