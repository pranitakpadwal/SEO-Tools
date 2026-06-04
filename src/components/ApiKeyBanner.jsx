import React, { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function ApiKeyBanner({ apiKey, onSave }) {
  const [open,  setOpen]  = useState(false)
  const [draft, setDraft] = useState(apiKey || '')
  const [show,  setShow]  = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSave(draft.trim())
    setSaved(true)
    setTimeout(() => { setSaved(false); setOpen(false) }, 1500)
  }

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-dark-500/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-medium text-slate-300">Gemini API Key</span>
          {apiKey
            ? <span className="tag bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">AI Active</span>
            : <span className="tag bg-slate-500/15 text-slate-400 border border-slate-500/30">Optional — enables AI content</span>
          }
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-dark-400/60 pt-3 animate-fade-in">
          <p className="text-xs text-slate-400 mb-3">
            Add your free Gemini API key to enable AI-generated titles, descriptions, and hashtags.
            Get one at <span className="text-brand-400">aistudio.google.com/app/apikey</span> — it's free.
            Your key is stored only in your browser.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={show ? 'text' : 'password'}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="AIza..."
                className="input-field pr-10 font-mono text-xs"
              />
              <button type="button" onClick={() => setShow(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {show ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
            <button onClick={handleSave} disabled={!draft.trim()} className="btn-primary">
              {saved ? <><CheckCircle className="w-4 h-4" /> Saved</> : 'Save Key'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
