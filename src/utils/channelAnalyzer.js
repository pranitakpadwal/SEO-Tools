export function analyzePublishingFrequency(videos) {
  if (!videos || videos.length === 0) return null
  const parsed = videos.map(v => ({
    id: v.id?.videoId || v.id,
    title: v.snippet?.title || '',
    publishedAt: new Date(v.snippet?.publishedAt),
    isShort: (v.snippet?.title||'').toLowerCase().includes('#short'),
  })).sort((a,b) => b.publishedAt - a.publishedAt)

  const now = new Date()
  const oneDay = 86400000
  const last30 = parsed.filter(v => now-v.publishedAt <= 30*oneDay)
  const last90 = parsed.filter(v => now-v.publishedAt <= 90*oneDay)
  const lastYear = parsed.filter(v => now-v.publishedAt <= 365*oneDay)
  const reg30 = last30.filter(v=>!v.isShort), sh30 = last30.filter(v=>v.isShort)
  const reg90 = last90.filter(v=>!v.isShort), sh90 = last90.filter(v=>v.isShort)

  return {
    totalAnalyzed: parsed.length,
    regular: { last30Days:reg30.length, last90Days:reg90.length, lastYear:lastYear.filter(v=>!v.isShort).length, perDay:+(reg30.length/30).toFixed(2), perWeek:+(reg30.length/4.3).toFixed(1), perMonth:reg30.length },
    shorts: { last30Days:sh30.length, last90Days:sh90.length, perDay:+(sh30.length/30).toFixed(2), perWeek:+(sh30.length/4.3).toFixed(1), perMonth:sh30.length },
    consistencyScore: calcConsistency(parsed),
    inactivePeriods: findInactive(parsed),
    weeklyBuckets: buildWeekly(parsed, 24),
    monthlyBuckets: buildMonthly(parsed, 12),
    benchmark: getBenchmark(reg30.length/4.3, sh30.length/4.3),
    videos: parsed,
  }
}

function findInactive(videos) {
  if (videos.length < 2) return []
  const gaps = []
  for (let i=0; i<videos.length-1; i++) {
    const days = Math.floor((videos[i].publishedAt - videos[i+1].publishedAt)/86400000)
    if (days >= 21) gaps.push({ from:videos[i+1].publishedAt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}), to:videos[i].publishedAt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}), days })
  }
  return gaps.slice(0,5)
}

function calcConsistency(videos) {
  if (videos.length < 4) return 50
  const gaps = []
  for (let i=0; i<Math.min(videos.length-1,20); i++) gaps.push((videos[i].publishedAt-videos[i+1].publishedAt)/86400000)
  const avg = gaps.reduce((a,b)=>a+b,0)/gaps.length
  const stdDev = Math.sqrt(gaps.reduce((acc,g)=>acc+Math.pow(g-avg,2),0)/gaps.length)
  const cv = stdDev/avg
  if (cv<0.2) return 95; if (cv<0.4) return 82; if (cv<0.6) return 68; if (cv<0.9) return 52; return 35
}

function buildWeekly(videos, weeks) {
  const now = new Date()
  return Array.from({length:weeks},(_,i)=>{
    const w = weeks-1-i
    const start = new Date(now.getTime()-(w+1)*7*86400000)
    const end = new Date(now.getTime()-w*7*86400000)
    return { label:`W${i+1}`, date:start.toLocaleDateString('en-US',{month:'short',day:'numeric'}), videos:videos.filter(v=>v.publishedAt>=start&&v.publishedAt<end&&!v.isShort).length, shorts:videos.filter(v=>v.publishedAt>=start&&v.publishedAt<end&&v.isShort).length }
  })
}

function buildMonthly(videos, months) {
  const now = new Date()
  return Array.from({length:months},(_,i)=>{
    const m = months-1-i
    const d = new Date(now.getFullYear(),now.getMonth()-m,1)
    const nd = new Date(now.getFullYear(),now.getMonth()-m+1,1)
    return { label:d.toLocaleDateString('en-US',{month:'short',year:'2-digit'}), videos:videos.filter(v=>v.publishedAt>=d&&v.publishedAt<nd&&!v.isShort).length, shorts:videos.filter(v=>v.publishedAt>=d&&v.publishedAt<nd&&v.isShort).length }
  })
}

function getBenchmark(vw, sw) {
  return {
    videoStatus: vw>=5?'High Volume - above industry avg (2-3/week)':vw>=2?'On Track - matches top-performing B2B channels':vw>=1?'Below Average - industry avg is 2-3/week':'Under-Posting - significantly below benchmarks',
    shortsStatus: sw>=7?'Excellent Shorts Cadence - algorithm-friendly':sw>=3?'Good Shorts Volume - recommended is 3-7/week':sw>=1?'Low Shorts Volume - increase for algorithm boost':'No Shorts Detected - missing major growth lever',
    recommendedVideosPerWeek:'2-3', recommendedShortsPerWeek:'3-7',
  }
}
