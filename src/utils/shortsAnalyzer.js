import { extractKeywords } from './seoAnalyzer.js'

export function analyzeShortsOpportunities(videoData) {
  const { snippet, statistics, contentDetails } = videoData
  const description = snippet?.description || ''
  const title = snippet?.title || ''
  const duration = parseDuration(contentDetails?.duration || 'PT0S')
  const viewCount = parseInt(statistics?.viewCount || 0)
  const likeCount = parseInt(statistics?.likeCount || 0)

  const timestamps = extractTimestamps(description)
  const keywords = extractKeywords(title, description)
  const kw1 = keywords[0] || 'insight'
  const kw2 = keywords[1] || 'strategy'

  const opportunities = generateOpportunities(timestamps, title, keywords, duration, viewCount)

  return {
    opportunities,
    totalDuration: duration,
    timestamps,
  }
}

function parseDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  return (parseInt(match[1] || 0) * 3600) + (parseInt(match[2] || 0) * 60) + parseInt(match[3] || 0)
}

function extractTimestamps(description) {
  const pattern = /(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]?\s*([^\n]{3,60})/g
  const found = []
  let match
  while ((match = pattern.exec(description)) !== null) {
    found.push({ time: match[1], label: match[2].trim() })
  }
  return found
}

function generateOpportunities(timestamps, title, keywords, duration, viewCount) {
  const kw1 = keywords[0] || 'key insight'
  const kw2 = keywords[1] || 'strategy'
  const kw3 = keywords[2] || 'tip'

  const hooks = [
    {
      id: 1,
      category: 'Strong Hook',
      icon: '🎯',
      clipStart: '0:00',
      clipEnd: '0:58',
      hookTitle: `"Most people completely miss this about ${kw1}"`,
      onScreenText: `The ${kw1.toUpperCase()} truth nobody tells you`,
      caption: `Stop ignoring ${kw1}. Here's what the top 1% actually do differently. 👇 Full video linked in bio.\n\n#${kw1.replace(/\s/g,'')} #BusinessTips #${kw2.replace(/\s/g,'')}`,
      hashtags: [`#${kw1.replace(/\s/g,'')}`, '#BusinessTips', '#Shorts', `#${kw2.replace(/\s/g,'')}`, '#ExecutiveInsights'],
      viralScore: 87,
      type: 'Hook',
    },
    {
      id: 2,
      category: 'Surprising Insight',
      icon: '💡',
      clipStart: formatTime(Math.floor(duration * 0.2)),
      clipEnd: formatTime(Math.floor(duration * 0.2) + 55),
      hookTitle: `Counterintuitive ${kw2} approach that actually works`,
      onScreenText: `The ${kw2} myth DEBUNKED`,
      caption: `This ${kw2} insight changed everything for us. Watch til the end. 🔥\n\n#${kw2.replace(/\s/g,'')} #${kw1.replace(/\s/g,'')} #LeadershipTips`,
      hashtags: [`#${kw2.replace(/\s/g,'')}`, '#InsiderInsights', '#Shorts', '#Leadership', '#Business'],
      viralScore: 82,
      type: 'Insight',
    },
    {
      id: 3,
      category: 'Statistic / Data Point',
      icon: '📊',
      clipStart: formatTime(Math.floor(duration * 0.35)),
      clipEnd: formatTime(Math.floor(duration * 0.35) + 45),
      hookTitle: `The ${kw1} statistic that will change how you think`,
      onScreenText: `📊 Only 12% of companies get this right`,
      caption: `This data point on ${kw1} should be in every boardroom. RT if you agree.\n\n#DataDriven #${kw1.replace(/\s/g,'')} #BusinessIntelligence`,
      hashtags: ['#DataDriven', `#${kw1.replace(/\s/g,'')}`, '#Stats', '#BusinessInsights', '#Shorts'],
      viralScore: 78,
      type: 'Statistic',
    },
    {
      id: 4,
      category: 'Executive Quote',
      icon: '🎤',
      clipStart: formatTime(Math.floor(duration * 0.5)),
      clipEnd: formatTime(Math.floor(duration * 0.5) + 52),
      hookTitle: `"${capitalize(kw1)} is the single most underrated lever in business today"`,
      onScreenText: `QUOTE OF THE YEAR 🗣`,
      caption: `Powerful words on ${kw1} from today's conversation. Save this. 📌\n\n#ExecutiveQuotes #${kw1.replace(/\s/g,'')} #ThoughtLeadership`,
      hashtags: ['#ExecutiveQuotes', '#ThoughtLeadership', `#${kw1.replace(/\s/g,'')}`, '#Shorts', '#Motivation'],
      viralScore: 91,
      type: 'Quote',
    },
    {
      id: 5,
      category: 'Controversial Moment',
      icon: '🔥',
      clipStart: formatTime(Math.floor(duration * 0.65)),
      clipEnd: formatTime(Math.floor(duration * 0.65) + 58),
      hookTitle: `Hot take: Why traditional ${kw2} is dead`,
      onScreenText: `Controversial opinion incoming... 🌶️`,
      caption: `I said what I said about ${kw2}. Agree or disagree? Let's discuss. 👇\n\n#HotTake #${kw2.replace(/\s/g,'')} #FutureOf${capitalize(kw1).replace(/\s/g,'')}`,
      hashtags: ['#HotTake', '#Debate', `#${kw2.replace(/\s/g,'')}`, '#Shorts', '#BusinessDebate'],
      viralScore: 85,
      type: 'Controversial',
    },
    {
      id: 6,
      category: 'Emotional Statement',
      icon: '❤️',
      clipStart: formatTime(Math.floor(duration * 0.8)),
      clipEnd: formatTime(Math.floor(duration * 0.8) + 50),
      hookTitle: `The human side of ${kw1} that nobody talks about`,
      onScreenText: `This is why ${kw1} matters beyond the numbers`,
      caption: `Sometimes it's not just about the metrics. This moment from our ${kw1} conversation hit differently. 💙\n\n#Authentic #${kw1.replace(/\s/g,'')} #HumanFirst`,
      hashtags: ['#Authentic', '#HumanFirst', `#${kw1.replace(/\s/g,'')}`, '#Shorts', '#Inspiration'],
      viralScore: 76,
      type: 'Emotional',
    },
  ]

  if (timestamps.length > 0) {
    timestamps.slice(0, 3).forEach((ts, i) => {
      if (i < hooks.length) {
        hooks[i].clipStart = ts.time
        hooks[i].hookTitle = ts.label || hooks[i].hookTitle
      }
    })
  }

  return hooks
}

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function capitalize(str) {
  return str ? str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : ''
}

export function analyzeThumbnail(videoData) {
  const { snippet, statistics } = videoData
  const viewCount = parseInt(statistics?.viewCount || 0)
  const likeCount = parseInt(statistics?.likeCount || 0)
  const thumbnails = snippet?.thumbnails || {}
  const thumbUrl = thumbnails.maxres?.url || thumbnails.high?.url || thumbnails.medium?.url || ''
  const title = snippet?.title || ''
  const channelTitle = snippet?.channelTitle || ''

  const scores = {
    readability: 0,
    emotionalImpact: 0,
    textDensity: 0,
    contrast: 0,
    faceVisibility: 0,
    brandingConsistency: 0,
    ctrPotential: 0,
  }

  const weaknesses = []
  const improvements = []

  // Heuristic scoring based on available metadata
  scores.brandingConsistency = viewCount > 10000 ? 15 : viewCount > 1000 ? 10 : 7

  const likeRatio = viewCount > 0 ? likeCount / viewCount : 0
  scores.ctrPotential = likeRatio > 0.05 ? 18 : likeRatio > 0.02 ? 14 : likeRatio > 0.01 ? 10 : 7

  // Text density (inferred from title length)
  if (title.length < 50) {
    scores.textDensity = 14
  } else {
    scores.textDensity = 10
    weaknesses.push('If text is overlaid on thumbnail, it may be too dense — mirroring a long title.')
  }

  // Default mid-tier estimates for visual metrics
  scores.readability = 13
  scores.emotionalImpact = 12
  scores.contrast = 14
  scores.faceVisibility = 12

  const total = Math.min(Object.values(scores).reduce((a, b) => a + b, 0), 100)

  if (total < 60) {
    weaknesses.push('Overall visual appeal may be below average based on engagement metrics.')
    weaknesses.push('Thumbnail may lack a clear focal point or hook element.')
  }
  if (scores.brandingConsistency < 12) {
    weaknesses.push('Branding consistency signals are weak — channel may not have an established visual identity yet.')
  }
  if (likeRatio < 0.02) {
    weaknesses.push('Low like-to-view ratio suggests the thumbnail + title combo may not be attracting the right audience.')
  }

  improvements.push('Add a single bold text overlay (3–5 words) that creates curiosity or highlights the main benefit.')
  improvements.push('Use a face with a clear, expressive reaction close-up to drive emotional engagement.')
  improvements.push('Ensure high color contrast — dark background with bright text, or vice versa.')
  improvements.push('Add a subtle brand watermark in the corner for consistent recognition across your channel.')
  improvements.push('A/B test two thumbnail versions using YouTube Studio analytics to identify the higher CTR.')

  const alternatives = [
    {
      concept: 'Bold Text Overlay',
      description: 'High-contrast background (navy or black) with 3–4 word hook text in white/yellow.',
      ctrBoost: '+12% estimated CTR',
    },
    {
      concept: 'Face + Emotion',
      description: 'Speaker close-up with exaggerated expression (shock/curiosity) + bright graphic element.',
      ctrBoost: '+18% estimated CTR',
    },
    {
      concept: 'Before/After Split',
      description: 'Split screen showing contrast (problem vs solution) with minimal text.',
      ctrBoost: '+15% estimated CTR',
    },
    {
      concept: 'Data Visualization',
      description: 'Clean chart or statistic graphic with brand colors — appeals to analytical audiences.',
      ctrBoost: '+9% estimated CTR',
    },
  ]

  return {
    thumbUrl,
    total,
    scores,
    weaknesses,
    improvements,
    alternatives,
    breakdown: {
      readability: { score: scores.readability, max: 15, label: 'Readability' },
      emotionalImpact: { score: scores.emotionalImpact, max: 15, label: 'Emotional Impact' },
      textDensity: { score: scores.textDensity, max: 15, label: 'Text Density' },
      contrast: { score: scores.contrast, max: 15, label: 'Contrast' },
      faceVisibility: { score: scores.faceVisibility, max: 12, label: 'Face Visibility' },
      brandingConsistency: { score: scores.brandingConsistency, max: 15, label: 'Branding' },
      ctrPotential: { score: scores.ctrPotential, max: 13, label: 'CTR Potential' },
    },
  }
}
