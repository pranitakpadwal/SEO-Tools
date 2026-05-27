const POWER_WORDS = [
  'ultimate','complete','proven','expert','step-by-step','how to','why','best',
  'top','guide','tips','strategy','secrets','mistakes','avoid','boost','grow',
  'increase','improve','master','advanced','beginner','free','fast','easy',
  'simple','powerful','effective','essential','critical','important','key',
  'transform','revolutionize','discover','learn','reveal','exclusive','insider',
]

const CTA_PHRASES = [
  'subscribe','like','comment','click','visit','download','sign up','follow',
  'check out','learn more','watch','join','get started','find out','explore',
  'register','share','hit the bell','leave a comment','let me know',
]

export function extractHashtags(text) {
  return (text.match(/#\w+/g) || []).map(h => h.toLowerCase())
}

export function extractKeywords(title, description = '') {
  const combined = (title + ' ' + description.slice(0, 500)).toLowerCase()
  const words = combined.match(/\b[a-z]{4,}\b/g) || []
  const freq = {}
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1 })
  const stopWords = new Set(['that','this','with','from','they','have','what','been','were','will','would','could','should','their','about','which','when','your','some','into','more','also','then','than','very','just','like','most','over','such','only','both','each','much','many','time','used','using','these','those','make','made','take','does','want','know','need','here','there','even','other','well','said','same','next','back','good','give','come','look','after','before','where','still','being','every','while','under','never','might','must'])
  return Object.entries(freq)
    .filter(([w]) => !stopWords.has(w) && w.length > 3)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word)
}

export function analyzeSEO(videoData) {
  if (!videoData) return null
  const { snippet, statistics, contentDetails } = videoData
  const title = snippet?.title || ''
  const description = snippet?.description || ''
  const tags = snippet?.tags || []
  const captions = contentDetails?.caption === 'true'
  const viewCount = parseInt(statistics?.viewCount || 0)
  const likeCount = parseInt(statistics?.likeCount || 0)
  const commentCount = parseInt(statistics?.commentCount || 0)
  const publishedAt = snippet?.publishedAt || ''
  const hashtags = extractHashtags(description)
  const descWords = description.trim().split(/\s+/).filter(Boolean).length
  const titleLower = title.toLowerCase()
  const scores = {}
  const issues = []
  const suggestions = []

  let titleScore = 0
  const titleLen = title.length
  if (titleLen >= 40 && titleLen <= 70) { titleScore += 8 }
  else if (titleLen >= 20 && titleLen < 40) { titleScore += 4; issues.push({ type: 'warning', category: 'Title', msg: `Title is short (${titleLen} chars). Aim for 40-70 characters for best search visibility.` }) }
  else if (titleLen > 70) { titleScore += 4; issues.push({ type: 'warning', category: 'Title', msg: `Title is long (${titleLen} chars). YouTube truncates at ~70 chars in search results.` }) }
  else { issues.push({ type: 'error', category: 'Title', msg: `Title is very short. This severely limits discoverability.` }) }

  const hasNumber = /\d/.test(title)
  if (hasNumber) titleScore += 4
  else { suggestions.push('Add a specific number to the title (e.g., "7 Strategies", "2024 Guide") to improve CTR by up to 36%.') }

  const hasPowerWord = POWER_WORDS.some(w => titleLower.includes(w))
  if (hasPowerWord) titleScore += 4
  else { suggestions.push('Include a power word in the title (e.g., "Ultimate", "Proven", "Expert") to increase click-through rates.') }

  const hasQuestion = title.includes('?') || /^(how|what|why|when|where|who|which)/i.test(title)
  if (hasQuestion) titleScore += 3
  else { suggestions.push('Consider framing the title as a question or starting with an action verb to boost engagement.') }

  const isAllCaps = title === title.toUpperCase() && title.length > 5
  if (!isAllCaps) titleScore += 3
  else { issues.push({ type: 'error', category: 'Title', msg: 'Title is in ALL CAPS. This looks spammy and hurts professionalism.' }) }

  const hasColon = title.includes(':') || title.includes('|') || title.includes('-')
  if (hasColon) titleScore += 3
  else { suggestions.push('Use ":" or "|" to separate a hook from the main topic for better title structure.') }

  scores.title = Math.min(titleScore, 25)

  let descScore = 0
  if (descWords >= 150) { descScore += 8 }
  else if (descWords >= 50) { descScore += 4; issues.push({ type: 'warning', category: 'Description', msg: `Description has only ${descWords} words. Aim for 150-300 words for optimal SEO.` }) }
  else if (descWords > 0) { descScore += 1; issues.push({ type: 'error', category: 'Description', msg: `Description is very thin (${descWords} words). YouTube uses description text for search indexing.` }) }
  else { issues.push({ type: 'error', category: 'Description', msg: 'No description provided. This is a critical SEO gap.' }) }

  const first150 = description.slice(0, 150).toLowerCase()
  const keywords = extractKeywords(title)
  const primaryKw = keywords[0] || ''
  const keywordInOpening = primaryKw && first150.includes(primaryKw)
  if (keywordInOpening) { descScore += 5 }
  else {
    issues.push({ type: 'warning', category: 'Description', msg: 'Primary keyword not found in the first 150 characters of description.' })
    suggestions.push(`Start your description with your primary keyword "${primaryKw || 'main topic'}" within the first 2-3 sentences.`)
  }

  const hasCTA = CTA_PHRASES.some(c => description.toLowerCase().includes(c))
  if (hasCTA) { descScore += 5 }
  else {
    issues.push({ type: 'error', category: 'CTA', msg: 'No Call-to-Action found in description. Missing subscriber, like, or engagement prompts.' })
    suggestions.push('Add a clear CTA: "Subscribe for weekly insights", "Drop a comment below".')
  }

  const hasTimestamps = /\d+:\d{2}/.test(description)
  if (hasTimestamps) { descScore += 4 }
  else {
    issues.push({ type: 'warning', category: 'Description', msg: 'No timestamps found. Adding chapter timestamps improves watch time and search indexing.' })
    suggestions.push('Add video chapters with timestamps (e.g., 0:00 Intro, 2:30 Main Topic).')
  }

  const hasLinks = /https?:\/\//.test(description)
  if (hasLinks) { descScore += 3 }
  else { issues.push({ type: 'warning', category: 'Description', msg: 'No external links found. Including relevant links improves credibility.' }) }

  scores.description = Math.min(descScore, 25)

  let tagScore = 0
  if (hashtags.length > 0) {
    tagScore += 8
    if (hashtags.length < 3) { issues.push({ type: 'warning', category: 'Hashtags', msg: `Only ${hashtags.length} hashtag(s) found. Use 3-15 hashtags for maximum discoverability.` }); tagScore -= 3 }
    else if (hashtags.length > 15) { issues.push({ type: 'warning', category: 'Hashtags', msg: `${hashtags.length} hashtags found. YouTube may ignore hashtags beyond 15.` }); tagScore -= 2 }
  } else {
    issues.push({ type: 'error', category: 'Hashtags', msg: 'No hashtags found in description. Hashtags significantly boost discoverability.' })
    suggestions.push('Add 5-10 relevant hashtags at the end of your description.')
  }

  if (tags.length >= 5) { tagScore += 7 }
  else if (tags.length > 0) { tagScore += 3; issues.push({ type: 'warning', category: 'Tags', msg: `Only ${tags.length} tag(s) set. Use 5-15 relevant tags.` }) }
  else { issues.push({ type: 'error', category: 'Tags', msg: 'No video tags found.' }); suggestions.push('Add 8-12 tags covering broad and specific terms.') }

  if (tags.length > 0) tagScore += 5
  scores.tags = Math.min(tagScore, 20)

  let techScore = 0
  if (captions) { techScore += 5 }
  else { issues.push({ type: 'warning', category: 'Accessibility', msg: 'No captions/subtitles detected. Captions improve accessibility and SEO.' }); suggestions.push('Upload a manually corrected transcript or enable auto-captions.') }

  if (contentDetails?.definition === 'hd') { techScore += 3 }
  else { issues.push({ type: 'warning', category: 'Technical', msg: 'Video is not HD. High-definition videos rank better.' }) }

  techScore += 4

  const publishDate = new Date(publishedAt)
  const monthsOld = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  if (monthsOld <= 12) { techScore += 3 }
  else if (monthsOld <= 24) { techScore += 2 }
  else { suggestions.push('Consider refreshing this older video with an updated thumbnail, title, and description.') }

  scores.technical = Math.min(techScore, 15)

  let engScore = 0
  if (viewCount > 0) {
    const likeRatio = likeCount / viewCount
    if (likeRatio >= 0.05) engScore += 5
    else if (likeRatio >= 0.02) engScore += 3
    else engScore += 1

    const commentRatio = commentCount / viewCount
    if (commentRatio >= 0.005) engScore += 5
    else if (commentRatio >= 0.001) engScore += 3
    else engScore += 1

    if (viewCount >= 100000) engScore += 5
    else if (viewCount >= 10000) engScore += 4
    else if (viewCount >= 1000) engScore += 3
    else if (viewCount >= 100) engScore += 2
    else engScore += 1
  }
  scores.engagement = Math.min(engScore, 15)

  const total = Object.values(scores).reduce((a, b) => a + b, 0)

  const keywordIssues = []
  const extractedKws = extractKeywords(title, description)
  if (extractedKws.length > 0) {
    const titleKws = extractedKws.filter(kw => titleLower.includes(kw))
    const descKws = extractedKws.filter(kw => description.toLowerCase().includes(kw))
    if (titleKws.length < 2) keywordIssues.push('Primary and secondary keywords are not prominent in the title.')
    if (!keywordInOpening) keywordIssues.push('Keywords are not placed in the critical "above the fold" area (first 150 chars) of the description.')
    if (description.length > 0) {
      const density = (descKws.length / Math.max(descWords, 1)) * 100
      if (density > 5) keywordIssues.push("Keyword density may be too high — could appear as keyword stuffing to YouTube's algorithm.")
      else if (density < 0.5 && descWords > 50) keywordIssues.push('Very low keyword presence in description. Include natural variations of your main topic.')
    }
  }

  const longTailSuggestions = generateLongTailKeywords(title, extractedKws)
  const internalLinkingTips = [
    'Add a pinned comment with a link to a related playlist.',
    'Mention a "previous video" link in the first 3 lines of description.',
    'Use the End Screen to feature your most relevant video.',
    'Add Cards mid-video pointing to complementary content.',
    `Link to your full "${extractedKws[0] || 'topic'}" playlist in the description.`,
    'Create a resource page on your website and link it for deeper engagement.',
  ]

  return {
    total, scores, issues, suggestions, keywordIssues, hashtags, hasCTA, hasTimestamps,
    titleSearchable: titleLen >= 30 && (hasPowerWord || hasQuestion || hasNumber),
    descriptionOptimized: scores.description >= 18,
    primaryKeyword: extractedKws[0] || '',
    extractedKeywords: extractedKws,
    longTailKeywords: longTailSuggestions,
    internalLinkingTips,
    missingElements: [
      { label: 'Hashtags (3-15)', present: hashtags.length >= 3 && hashtags.length <= 15 },
      { label: 'Video Tags', present: tags.length >= 5 },
      { label: 'Captions / Subtitles', present: captions },
      { label: 'Call-to-Action in Description', present: hasCTA },
      { label: 'Chapter Timestamps', present: hasTimestamps },
      { label: 'Description (150+ words)', present: descWords >= 150 },
      { label: 'Optimal Title Length (40-70 chars)', present: titleLen >= 40 && titleLen <= 70 },
      { label: 'External Links in Description', present: hasLinks },
    ],
  }
}

function generateLongTailKeywords(title, keywords) {
  const modifiers = ['for beginners','tutorial','step by step','explained','in 2025','how to','best practices','tips and tricks','complete guide','case study','for executives','B2B strategy','ROI analysis','advanced techniques']
  const base = keywords.slice(0, 4)
  const results = []
  for (const kw of base) {
    const picks = modifiers.sort(() => Math.random() - 0.5).slice(0, 3)
    for (const mod of picks) {
      const lt = `${kw} ${mod}`
      if (lt.length <= 60) results.push(lt)
    }
  }
  return results.slice(0, 10)
}

export function getScoreColor(score, max = 100) {
  const pct = (score / max) * 100
  if (pct >= 80) return 'excellent'
  if (pct >= 60) return 'good'
  if (pct >= 40) return 'average'
  return 'poor'
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Needs Work'
  return 'Poor'
}
