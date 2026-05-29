import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createClient } from '@libsql/client'
import { SignJWT, jwtVerify } from 'jose'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const app = express()
app.use(express.json())
const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Config ────────────────────────────────────────────────────────────────────
const PORT             = process.env.PORT || 3000
const YT_KEY           = process.env.YOUTUBE_API_KEY || ''
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const JWT_SECRET       = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me')
const ENC_KEY          = Buffer.from(process.env.ENCRYPTION_KEY || 'a'.repeat(64), 'hex')
const YT               = 'https://www.googleapis.com/youtube/v3'

// ── Database (libsql / Turso — falls back to local file) ─────────────────────
const db = createClient({ url: process.env.DATABASE_URL || 'file:./users.db' })

await db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id            TEXT UNIQUE NOT NULL,
    email                TEXT NOT NULL,
    name                 TEXT,
    avatar               TEXT,
    encrypted_gemini_key TEXT,
    encrypted_claude_key TEXT,
    has_gemini_key       INTEGER DEFAULT 0,
    has_claude_key       INTEGER DEFAULT 0,
    created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login           DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// ── Crypto helpers ────────────────────────────────────────────────────────────
function encrypt(text) {
  const iv     = randomBytes(16)
  const cipher = createCipheriv('aes-256-gcm', ENC_KEY, iv)
  const enc    = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${enc.toString('hex')}`
}

function decrypt(stored) {
  const [ivHex, tagHex, encHex] = stored.split(':')
  const dec = createDecipheriv('aes-256-gcm', ENC_KEY, Buffer.from(ivHex, 'hex'))
  dec.setAuthTag(Buffer.from(tagHex, 'hex'))
  return dec.update(Buffer.from(encHex, 'hex'), undefined, 'utf8') + dec.final('utf8')
}

// ── Auth middleware ───────────────────────────────────────────────────────────
async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const { payload } = await jwtVerify(header.slice(7), JWT_SECRET)
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Session expired. Please sign in again.' })
  }
}

// ── POST /auth/google ─────────────────────────────────────────────────────────
app.post('/auth/google', async (req, res) => {
  try {
    const { credential } = req.body
    if (!credential) return res.status(400).json({ error: 'Missing credential' })

    const r       = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
    const profile = await r.json()
    if (profile.error) return res.status(401).json({ error: 'Invalid Google token' })
    if (GOOGLE_CLIENT_ID && profile.aud !== GOOGLE_CLIENT_ID)
      return res.status(401).json({ error: 'Token audience mismatch' })

    await db.execute({
      sql: `INSERT INTO users (google_id, email, name, avatar) VALUES (?, ?, ?, ?)
            ON CONFLICT(google_id) DO UPDATE SET
              email=excluded.email, name=excluded.name,
              avatar=excluded.avatar, last_login=CURRENT_TIMESTAMP`,
      args: [profile.sub, profile.email, profile.name, profile.picture],
    })

    const { rows } = await db.execute({
      sql:  'SELECT has_gemini_key, has_claude_key FROM users WHERE google_id=?',
      args: [profile.sub],
    })

    const token = await new SignJWT({ sub: profile.sub, email: profile.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    res.json({ token, hasGeminiKey: rows[0]?.has_gemini_key === 1, hasClaudeKey: rows[0]?.has_claude_key === 1 })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── GET /auth/me ──────────────────────────────────────────────────────────────
app.get('/auth/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.execute({
      sql:  'SELECT email, name, avatar, has_gemini_key, has_claude_key FROM users WHERE google_id=?',
      args: [req.user.sub],
    })
    if (!rows[0]) return res.status(404).json({ error: 'User not found' })

    let refreshedToken = null
    if (req.user.exp * 1000 - Date.now() < 86_400_000) {
      refreshedToken = await new SignJWT({ sub: req.user.sub, email: req.user.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET)
    }
    res.json({ ...rows[0], ...(refreshedToken ? { token: refreshedToken } : {}) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── POST /auth/save-key ───────────────────────────────────────────────────────
app.post('/auth/save-key', requireAuth, async (req, res) => {
  try {
    const { provider, key } = req.body
    if (!key?.trim()) return res.status(400).json({ error: 'Key is required' })

    if (provider === 'gemini') {
      const t = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key.trim()}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] }) }
      )
      const d = await t.json()
      if (d.error) throw new Error('Invalid Gemini key: ' + d.error.message)
      await db.execute({
        sql:  'UPDATE users SET encrypted_gemini_key=?, has_gemini_key=1 WHERE google_id=?',
        args: [encrypt(key.trim()), req.user.sub],
      })
    } else if (provider === 'claude') {
      const t = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': key.trim(), 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 10, messages: [{ role: 'user', content: 'ping' }] }),
      })
      const d = await t.json()
      if (d.error) throw new Error('Invalid Claude key: ' + d.error.message)
      await db.execute({
        sql:  'UPDATE users SET encrypted_claude_key=?, has_claude_key=1 WHERE google_id=?',
        args: [encrypt(key.trim()), req.user.sub],
      })
    } else {
      return res.status(400).json({ error: 'Unknown provider' })
    }
    res.json({ ok: true })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

// ── POST /api/generate — uses user's own decrypted Gemini key ─────────────────
app.post('/api/generate', requireAuth, async (req, res) => {
  try {
    const { prompt } = req.body
    const { rows } = await db.execute({
      sql:  'SELECT encrypted_gemini_key FROM users WHERE google_id=?',
      args: [req.user.sub],
    })
    if (!rows[0]?.encrypted_gemini_key)
      return res.status(400).json({ error: 'Gemini not set up. Please complete account setup.' })

    const geminiKey = decrypt(rows[0].encrypted_gemini_key)
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 2048 } }) }
    )
    const data = await r.json()
    if (data.error) return res.status(400).json({ error: data.error.message })
    res.json({ text: data.candidates?.[0]?.content?.parts?.[0]?.text || '' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── YouTube API proxy (auth-protected) ───────────────────────────────────────
async function ytFetch(url) {
  const res  = await fetch(url)
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data
}

app.get('/api/video', requireAuth, async (req, res) => {
  try {
    if (!YT_KEY) return res.status(500).json({ error: 'YouTube API key not configured.' })
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Missing video id' })
    const data = await ytFetch(`${YT}/videos?id=${id}&part=snippet,statistics,contentDetails&key=${YT_KEY}`)
    if (!data.items?.length) return res.status(404).json({ error: 'Video not found.' })
    res.json(data.items[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/channel', requireAuth, async (req, res) => {
  try {
    if (!YT_KEY) return res.status(500).json({ error: 'YouTube API key not configured.' })
    const { type, value } = req.query
    if (!value) return res.status(400).json({ error: 'Missing channel value' })
    const param = type === 'handle' ? `forHandle=${encodeURIComponent(value)}` : `id=${encodeURIComponent(value)}`
    const data  = await ytFetch(`${YT}/channels?${param}&part=snippet,statistics,contentDetails&key=${YT_KEY}`)
    if (!data.items?.length) return res.status(404).json({ error: 'Channel not found.' })
    res.json(data.items[0])
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.get('/api/channel-videos', requireAuth, async (req, res) => {
  try {
    if (!YT_KEY) return res.status(500).json({ error: 'YouTube API key not configured.' })
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Missing channel id' })
    const allVideos = []
    let pageToken = ''
    for (let page = 0; page < 4; page++) {
      const tp   = pageToken ? `&pageToken=${pageToken}` : ''
      const data = await ytFetch(`${YT}/search?channelId=${id}&part=snippet&type=video&maxResults=50&order=date${tp}&key=${YT_KEY}`)
      allVideos.push(...(data.items || []))
      if (!data.nextPageToken) break
      pageToken = data.nextPageToken
    }
    res.json(allVideos)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── Serve React app ───────────────────────────────────────────────────────────
app.use(express.static(join(__dirname, 'dist')))
app.get('*', (req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')))
app.listen(PORT, () => console.log(`YouTube SEO Analyzer running on port ${PORT}`))
