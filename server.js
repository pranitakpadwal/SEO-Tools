import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const app = express()
app.use(express.json())
const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const YT_KEY = process.env.YOUTUBE_API_KEY || ''
const YT = 'https://www.googleapis.com/youtube/v3'

async function ytFetch(url) {
  const res = await fetch(url)
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data
}

// Proxy: fetch single video data
app.get('/api/video', async (req, res) => {
  try {
    if (!YT_KEY) return res.status(500).json({ error: 'YouTube API key not configured on server.' })
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Missing video id' })
    const data = await ytFetch(`${YT}/videos?id=${id}&part=snippet,statistics,contentDetails&key=${YT_KEY}`)
    if (!data.items?.length) return res.status(404).json({ error: 'Video not found. Check the URL.' })
    res.json(data.items[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Proxy: fetch channel info by handle or ID
app.get('/api/channel', async (req, res) => {
  try {
    if (!YT_KEY) return res.status(500).json({ error: 'YouTube API key not configured on server.' })
    const { type, value } = req.query
    if (!value) return res.status(400).json({ error: 'Missing channel value' })
    const param = type === 'handle' ? `forHandle=${encodeURIComponent(value)}` : `id=${encodeURIComponent(value)}`
    const data = await ytFetch(`${YT}/channels?${param}&part=snippet,statistics,contentDetails&key=${YT_KEY}`)
    if (!data.items?.length) return res.status(404).json({ error: 'Channel not found. Check the URL.' })
    res.json(data.items[0])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Proxy: fetch all recent videos for a channel (up to 200)
app.get('/api/channel-videos', async (req, res) => {
  try {
    if (!YT_KEY) return res.status(500).json({ error: 'YouTube API key not configured on server.' })
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Missing channel id' })
    const allVideos = []
    let pageToken = ''
    for (let page = 0; page < 4; page++) {
      const tokenParam = pageToken ? `&pageToken=${pageToken}` : ''
      const data = await ytFetch(`${YT}/search?channelId=${id}&part=snippet&type=video&maxResults=50&order=date${tokenParam}&key=${YT_KEY}`)
      allVideos.push(...(data.items || []))
      if (!data.nextPageToken) break
      pageToken = data.nextPageToken
    }
    res.json(allVideos)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Proxy: Gemini AI generation — uses the user's own Gemini API key, never stored server-side
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, geminiKey } = req.body
    if (!geminiKey) return res.status(400).json({ error: 'Missing Gemini API key.' })
    if (!prompt) return res.status(400).json({ error: 'Missing prompt.' })

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
        }),
      }
    )
    const data = await response.json()
    if (data.error) return res.status(400).json({ error: data.error.message })
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    res.json({ text })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Serve built React app
app.use(express.static(join(__dirname, 'dist')))
app.get('*', (req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')))

app.listen(PORT, () => console.log(`YouTube SEO Analyzer running on port ${PORT}`))
