export function analyzePublishingFrequency(videos) {
  if (!videos || videos.length === 0) return null

  const parsed = videos.map(v => ({
    id: v.id?.videoId || v.id,
    title: v.snippet?.title || '',
    publishedAt: new Date(v.snippet?.publishedAt),
    isShort: isYouTubeShort(v),
  })).sort((a, b) => b.publishedAt - a.publishedAt)

  const now = new Date()
  const oneDay = 86400000

  const last30 = parsed.filter(v => now - v.publishedAt <= 30 * oneDay)
  const last90 = parsed.filter(v => now - v.publishedAt <= 90 * oneDay)
  const lastYear = parsed.filter(v => now - v.publishedAt <= 365 * oneDay)

  const regularLast30 = last30.filter(v => !v.isShort)
  const shortsLast30 = last30.filter(v => v.isShort)
  const regularLast90 = last90.filter(v => !v.isShort)
  const shortsLast90 = last90.filter(v => v.isShort)

  const videosPerDay30 = (regularLast30.length / 30).toFixed(2)
  const videosPerWeek30 = (regularLast30.length / 4.3).toFixed(1)
  const videosPerMonth30 = regularLast30.length

  const shortsPerDay30 = (shortsLast30.length / 30).toFixed(2)
  const shortsPerWeek30 = (shortsLast30.length / 4.3).toFixed(1)
  const shortsPerMonth30 = shortsLast30.length

  const inactivePeriods = findInactivePeriods(parsed)
  const consistencyScore = calculateConsistencyScore(parsed)
  const weeklyBuckets = buildWeeklyBuckets(parsed, 24)
  const monthlyBuckets = buildMonthlyBuckets(parsed, 12)

  const benchmark = getBenchmark(videosPerWeek30, shortsPerWeek30)

  return {
    totalAnalyzed: parsed.length,
    regular: {
      last30Days: regularLast30.length,
      last90Days: regularLast90.length,
      lastYear: lastYear.filter(v => !v.isShort).length,
      perDay: parseFloat(videosPerDay30),
      perWeek: parseFloat(videosPerWeek30),
      perMonth: videosPerMonth30,
    },
    shorts: {
      last30Days: shortsLast30.length,
      last90Days: shortsLast90.length,
      perDay: parseFloat(shortsPerDay30),
      perWeek: parseFloat(shortsPerWeek30),
      perMonth: shortsPerMonth30,
    },
    consistencyScore,
    inactivePeriods,
    weeklyBuckets,
    monthlyBuckets,
    benchmark,
    videos: parsed,
  }
}

function isYouTubeShort(video) {
  const title = (video.snippet?.title || '').toLowerCase()
  return title.includes('#short') || title.includes('#shorts')
}

function findInactivePeriods(videos) {
  if (videos.length < 2) return []
  const gaps = []
  for (let i = 0; i < videos.length - 1; i++) {
    const gapDays = Math.floor((videos[i].publishedAt - videos[i + 1].publishedAt) / 86400000)
    if (gapDays >= 21) {
      gaps.push({
        from: videos[i + 1].publishedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        to: videos[i].publishedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        days: gapDays,
      })
    }
  }
  return gaps.slice(0, 5)
}

function calculateConsistencyScore(videos) {
  if (videos.length < 4) return 50
  const gaps = []
  for (let i = 0; i < Math.min(videos.length - 1, 20); i++) {
    const gapDays = (videos[i].publishedAt - videos[i + 1].publishedAt) / 86400000
    gaps.push(gapDays)
  }
  if (!gaps.length) return 50
  const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length
  const variance = gaps.reduce((acc, g) => acc + Math.pow(g - avg, 2), 0) / gaps.length
  const stdDev = Math.sqrt(variance)
  const cv = stdDev / avg
  if (cv < 0.2) return 95
  if (cv < 0.4) return 82
  if (cv < 0.6) return 68
  if (cv < 0.9) return 52
  return 35
}

function buildWeeklyBuckets(videos, weeks) {
  const now = new Date()
  const buckets = []
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 86400000)
    const weekEnd = new Date(now.getTime() - i * 7 * 86400000)
    const count = videos.filter(v => v.publishedAt >= weekStart && v.publishedAt < weekEnd && !v.isShort).length
    const shorts = videos.filter(v => v.publishedAt >= weekStart && v.publishedAt < weekEnd && v.isShort).length
    buckets.push({
      label: `W${weeks - i}`,
      date: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      videos: count,
      shorts,
    })
  }
  return buckets
}

function buildMonthlyBuckets(videos, months) {
  const now = new Date()
  const buckets = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const count = videos.filter(v => v.publishedAt >= d && v.publishedAt < nextD && !v.isShort).length
    const shorts = videos.filter(v => v.publishedAt >= d && v.publishedAt < nextD && v.isShort).length
    buckets.push({
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      videos: count,
      shorts,
    })
  }
  return buckets
}

function getBenchmark(videosPerWeek, shortsPerWeek) {
  const vw = parseFloat(videosPerWeek)
  const sw = parseFloat(shortsPerWeek)
  let videoStatus = ''
  let shortsStatus = ''

  if (vw >= 5) videoStatus = 'High Volume — above industry avg (2–3/week)'
  else if (vw >= 2) videoStatus = 'On Track — matches top-performing B2B channels'
  else if (vw >= 1) videoStatus = 'Below Average — industry avg is 2–3/week'
  else videoStatus = 'Under-Posting — significantly below benchmarks'

  if (sw >= 7) shortsStatus = 'Excellent Shorts Cadence — algorithm-friendly'
  else if (sw >= 3) shortsStatus = 'Good Shorts Volume — recommended is 3–7/week'
  else if (sw >= 1) shortsStatus = 'Low Shorts Volume — increase for algorithm boost'
  else shortsStatus = 'No Shorts Detected — missing major growth lever'

  return { videoStatus, shortsStatus, recommendedVideosPerWeek: '2–3', recommendedShortsPerWeek: '3–7' }
}
