export function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function extractChannelId(url) {
  const patterns = [
    /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/@([a-zA-Z0-9_.-]+)/,
    /youtube\.com\/c\/([a-zA-Z0-9_.-]+)/,
    /youtube\.com\/user\/([a-zA-Z0-9_.-]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return { type: url.includes('/@') ? 'handle' : 'id', value: match[1] }
  }
  return null
}

export function parseDuration(iso) {
  if (!iso) return 0
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const h = parseInt(match[1] || 0)
  const m = parseInt(match[2] || 0)
  const s = parseInt(match[3] || 0)
  return h * 3600 + m * 60 + s
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${m}:${String(s).padStart(2,'0')}`
}

export function formatNumber(n) {
  if (!n) return '0'
  const num = parseInt(n)
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
  return num.toLocaleString()
}

export async function fetchVideoData(videoId) {
  const res = await fetch(`/api/video?id=${videoId}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'YouTube API error')
  return data
}

export async function fetchChannelInfo(channelIdentifier) {
  const res = await fetch(`/api/channel?type=${channelIdentifier.type}&value=${encodeURIComponent(channelIdentifier.value)}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Channel not found. Check the URL.')
  return data
}

export async function fetchVideosByChannel(channelId) {
  const res = await fetch(`/api/channel-videos?id=${channelId}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch channel videos.')
  return data
}
