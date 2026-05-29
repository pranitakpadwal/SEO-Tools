import React, { useEffect, useRef, useState } from 'react'
import { Youtube, Info, X } from 'lucide-react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function ApiGate({ onLogin }) {
  const btnRef           = useRef(null)
  const [showClaudeInfo, setShowClaudeInfo] = useState(false)
  const [error, setError]                  = useState('')
  const [loading, setLoading]              = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const script    = document.createElement('script')
    script.src      = 'https://accounts.google.com/gsi/client'
    script.async    = true
    script.onload   = () => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback:  handleCredential,
        auto_select: true,
      })
      if (btnRef.current) {
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: 'filled_black',
          size:  'large',
          text:  'continue_with',
          shape: 'rectangular',
          width: 320,
        })
      }
      window.google.accounts.id.prompt()
    }
    document.head.appendChild(script)
    return () => { try { document.head.removeChild(script) } catch {} }
  }, [])

  async function handleCredential(response) {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/auth/google', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ credential: response.credential }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sign-in failed')
      localStorage.setItem('session_token', data.token)
      onLogin({ hasGeminiKey: data.hasGeminiKey, hasClaudeKey: data.hasClaudeKey })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at 20% 0%, rgba(79,95,247,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(167,139,250,0.08) 0%, transparent 60%), #0a0b1a' }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/30">
            <Youtube className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">YouTube SEO Analyzer</h1>
          <p className="text-slate-400 mt-1.5 text-sm">Sign in to access the tool</p>
        </div>

        {/* Login card */}
        <div className="glass-card p-6 space-y-4">
          {/* Google Sign-In */}
          <div>
            <p className="text-xs text-slate-500 mb-3 text-center">Choose your account</p>

            {!GOOGLE_CLIENT_ID ? (
              <div className="text-center text-xs text-amber-400 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                Google Client ID not configured. Set <code>VITE_GOOGLE_CLIENT_ID</code> in Railway.
              </div>
            ) : (
              <div className="flex justify-center">
                <div ref={btnRef} />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-dark-400" />
            <span className="text-xs text-slate-600">or</span>
            <div className="flex-1 h-px bg-dark-400" />
          </div>

          {/* Claude button — explains limitation */}
          <button
            onClick={() => setShowClaudeInfo(true)}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-dark-400 bg-dark-600 hover:bg-dark-500 transition-colors text-sm text-slate-300"
          >
            <span className="text-base">⊕</span>
            Continue with Anthropic
          </button>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          {loading && <p className="text-slate-500 text-xs text-center">Signing in…</p>}
        </div>

        <p className="text-center text-xs text-slate-700">
          Sessions secured with JWT · Keys encrypted with AES-256
        </p>
      </div>

      {/* Claude info modal */}
      {showClaudeInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-sm w-full space-y-4 relative">
            <button onClick={() => setShowClaudeInfo(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/15">
                <Info className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-semibold text-slate-200">About Anthropic Sign-In</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Anthropic does not currently offer OAuth login for third-party apps — there is no
              "Sign in with Claude" flow available from Anthropic.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Instead, sign in with Google below. After login you will have the option to connect
              your Anthropic API key once — it gets encrypted and stored securely, so you never
              need to enter it again.
            </p>
            <button
              onClick={() => setShowClaudeInfo(false)}
              className="btn-primary w-full justify-center"
            >
              Got it — Sign in with Google
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
