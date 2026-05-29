import React, { useState } from 'react'
import { Youtube, Key, Eye, EyeOff, Sparkles, ExternalLink, LogIn, Shield } from 'lucide-react'

export default function ApiGate({ onUnlock }) {
  const [key, setKey] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmedKey = key.trim()
    if (!trimmedKey) { setError('Please enter your Gemini API key'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Reply with just the word: ready', geminiKey: trimmedKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid API key. Please check and try again.')
      localStorage.setItem('gemini_api_key', trimmedKey)
      onUnlock(trimmedKey)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(79,95,247,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(167,139,250,0.08) 0%, transparent 60%), #0a0b1a' }}
    >
      <div className="w-full max-w-md space-y-5">
        {/* Logo + title */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/30">
            <Youtube className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">YouTube SEO Analyzer</h1>
          <p className="text-slate-400 mt-1.5 text-sm">Sign in with your Gemini API key to continue</p>
        </div>

        {/* Login card */}
        <div className="glass-card p-6 space-y-5">
          {/* Info */}
          <div className="flex gap-3 p-3.5 rounded-lg bg-brand-600/10 border border-brand-500/20">
            <Sparkles className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Your Gemini key powers AI title rewrites, descriptions &amp; content suggestions —
              <strong className="text-slate-200"> using your own free quota, never stored on our server.</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Key className="w-3.5 h-3.5 inline mr-1.5" />Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={key}
                  onChange={e => { setKey(e.target.value); setError('') }}
                  placeholder="AIza..."
                  className="input-field pr-10 font-mono text-sm w-full"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !key.trim()}
              className="btn-primary w-full justify-center gap-2 py-2.5 text-sm"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Verifying key...' : 'Access Tool'}
            </button>
          </form>

          <div className="border-t border-dark-400 pt-4 space-y-2.5">
            <p className="text-xs text-slate-400 font-medium">Don't have a key? Get one free in 30 seconds:</p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Google AI Studio → Get API Key (100% free)
            </a>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Shield className="w-3 h-3" /> Free tier: 15 req/min · 1 million tokens/day
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-700">
          YouTube SEO Analyzer · Powered by Google Gemini + YouTube Data API v3
        </p>
      </div>
    </div>
  )
}
