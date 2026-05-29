import React, { useState } from 'react'
import { CheckCircle, ExternalLink, Eye, EyeOff, Loader2, ChevronRight, SkipForward } from 'lucide-react'
import { apiFetch } from '../utils/apiFetch.js'

const STEPS = ['welcome', 'gemini', 'claude', 'done']

function StepDot({ index, current }) {
  const done   = index < STEPS.indexOf(current)
  const active = STEPS[index] === current
  return (
    <div className={`w-2.5 h-2.5 rounded-full transition-all ${
      done   ? 'bg-emerald-400' :
      active ? 'bg-brand-400 scale-125' :
               'bg-dark-400'
    }`} />
  )
}

export default function SetupWizard({ user, onComplete }) {
  const [step, setStep]         = useState('welcome')
  const [geminiKey, setGeminiKey] = useState('')
  const [claudeKey, setClaudeKey] = useState('')
  const [showGemini, setShowGemini] = useState(false)
  const [showClaude, setShowClaude] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  async function saveKey(provider, key) {
    setSaving(true)
    setError('')
    try {
      await apiFetch('/auth/save-key', {
        method: 'POST',
        body:   JSON.stringify({ provider, key }),
      })
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  async function handleGeminiSubmit(e) {
    e.preventDefault()
    if (!geminiKey.trim()) { setError('Please enter your Gemini API key'); return }
    const ok = await saveKey('gemini', geminiKey)
    if (ok) { setError(''); setStep('claude') }
  }

  async function handleClaudeSubmit(e) {
    e.preventDefault()
    if (!claudeKey.trim()) { setStep('done'); return }
    const ok = await saveKey('claude', claudeKey)
    if (ok) { setError(''); setStep('done') }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(79,95,247,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(167,139,250,0.08) 0%, transparent 60%), #0a0b1a' }}
    >
      <div className="w-full max-w-md space-y-5">

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => <StepDot key={s} index={i} current={step} />)}
        </div>

        {/* ── WELCOME ── */}
        {step === 'welcome' && (
          <div className="glass-card p-7 text-center space-y-5">
            <div className="text-4xl">👋</div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
              </h2>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                One quick setup and you are ready to go. We need to connect your AI accounts
                so the tool can generate titles, descriptions, and content — using your own
                tokens, not ours.
              </p>
            </div>
            <div className="text-left space-y-2.5">
              {[
                { icon: '🔑', label: 'Connect Gemini (required)', sub: 'Powers all AI generation. Free tier available.' },
                { icon: '⚡', label: 'Connect Claude (optional)', sub: 'Add later if you want Claude-powered features.' },
              ].map(item => (
                <div key={item.label} className="flex gap-3 p-3 rounded-lg bg-dark-600 border border-dark-400">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setStep('gemini')} className="btn-primary w-full justify-center gap-2">
              Let's set it up <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── GEMINI ── */}
        {step === 'gemini' && (
          <div className="glass-card p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">Connect Gemini</h2>
              <p className="text-slate-400 mt-1 text-sm">Get a free key from Google AI Studio — takes about 1 minute.</p>
            </div>

            <div className="space-y-2.5 text-sm">
              {[
                { n: 1, text: 'Click the button below — it opens Google AI Studio' },
                { n: 2, text: 'Click "Create API key" → "Create API key in new project"' },
                { n: 3, text: 'Copy the key that starts with AIza...' },
                { n: 4, text: 'Paste it in the field below' },
              ].map(s => (
                <div key={s.n} className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-600/30 text-brand-300 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{s.n}</span>
                  <span className="text-slate-400">{s.text}</span>
                </div>
              ))}
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-brand-500/30 bg-brand-600/10 text-brand-300 text-sm hover:bg-brand-600/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Open Google AI Studio
            </a>

            <form onSubmit={handleGeminiSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type={showGemini ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={e => { setGeminiKey(e.target.value); setError('') }}
                  placeholder="AIza..."
                  className="input-field pr-10 font-mono text-sm w-full"
                  autoFocus
                />
                <button type="button" onClick={() => setShowGemini(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={saving || !geminiKey.trim()} className="btn-primary w-full justify-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <>Connect Gemini <ChevronRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-xs text-slate-600 text-center">
              Your key is encrypted with AES-256 and stored on our server. You will never need to enter it again.
            </p>
          </div>
        )}

        {/* ── CLAUDE ── */}
        {step === 'claude' && (
          <div className="glass-card p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white">Connect Anthropic <span className="text-sm font-normal text-slate-500">(optional)</span></h2>
              <p className="text-slate-400 mt-1 text-sm">Add your Claude API key to unlock Claude-powered features. You can skip this and add it later.</p>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/8 border border-amber-500/20 text-xs text-slate-400">
              Note: Anthropic does not support OAuth login. This is a one-time key entry — stored encrypted, never shown again.
            </div>

            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-dark-400 bg-dark-600 text-slate-300 text-sm hover:bg-dark-500 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Open Anthropic Console
            </a>

            <form onSubmit={handleClaudeSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type={showClaude ? 'text' : 'password'}
                  value={claudeKey}
                  onChange={e => { setClaudeKey(e.target.value); setError('') }}
                  placeholder="sk-ant-..."
                  className="input-field pr-10 font-mono text-sm w-full"
                />
                <button type="button" onClick={() => setShowClaude(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showClaude ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : claudeKey.trim() ? <>Connect Claude <ChevronRight className="w-4 h-4" /></> : <>Skip for now <SkipForward className="w-4 h-4" /></>}
              </button>
            </form>
          </div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <div className="glass-card p-7 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">All set!</h2>
              <p className="text-slate-400 mt-2 text-sm">
                Your accounts are connected and your keys are encrypted. Next time you sign in with Google, you go straight to the tool.
              </p>
            </div>
            <button onClick={onComplete} className="btn-primary w-full justify-center">
              Open YouTube SEO Analyzer
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
