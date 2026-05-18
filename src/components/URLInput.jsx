import React, { useState } from 'react'
import { Search, X, AlertCircle } from 'lucide-react'

export default function URLInput({ onAnalyze, loading, placeholder, label, hint }) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!url.trim()) { setError('Please enter a URL'); return }
    setError('')
    onAnalyze(url.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {label && <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="url"
            value={url}
            onChange={e => { setUrl(e.target.value); setError('') }}
            placeholder={placeholder || 'Paste YouTube URL here...'}
            className="input-field pl-10 pr-10"
            disabled={loading}
          />
          {url && (
            <button type="button" onClick={() => setUrl('')} className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="btn-primary whitespace-nowrap"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
              </svg>
              Analyzing...
            </span>
          ) : 'Analyze'}
        </button>
      </div>
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
      {hint && !error && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
    </form>
  )
}
