// Six distinct tone styles — one is picked randomly each analysis run
const TONES = [
  {
    name: 'Professional B2B',
    instruction: 'Write in a formal, authoritative B2B tone for executives and decision-makers. Focus on ROI, strategic value, and competitive advantage. Use industry terminology confidently.',
  },
  {
    name: 'Conversational & Friendly',
    instruction: 'Write in a warm, friendly tone as if talking to a colleague over coffee. Use "you" frequently, keep sentences short, and be approachable. Avoid jargon.',
  },
  {
    name: 'Storytelling & Narrative',
    instruction: 'Open with a compelling scenario or problem the viewer faces. Build tension, then reveal how this video solves it. Make it feel like a journey the viewer will experience.',
  },
  {
    name: 'Educational & Step-by-Step',
    instruction: 'Write like a knowledgeable mentor. Explain the "why" behind each point, use numbered steps where helpful, and make complex ideas easy to follow.',
  },
  {
    name: 'Bold & Urgent',
    instruction: 'Write with energy and urgency using short, powerful sentences. Create FOMO. Make bold claims the video backs up. The viewer should feel they cannot afford to miss this.',
  },
  {
    name: 'Data-Driven & Analytical',
    instruction: 'Emphasize measurable outcomes, evidence, and proven frameworks. Appeal to analytical thinkers. Reference that the video includes data, research, or case studies.',
  },
]

async function callGemini(prompt, geminiKey) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, geminiKey }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Gemini API error')
  return data.text
}

export async function generateDescription(videoTitle, keywords, channelName = 'Your Channel', geminiKey) {
  const tone = TONES[Math.floor(Math.random() * TONES.length)]
  const kws = keywords.slice(0, 6).join(', ')

  const prompt = `You are a YouTube SEO copywriter. Write a complete, optimized YouTube video description.

Video Title: "${videoTitle}"
Channel: ${channelName}
Keywords: ${kws}
Tone Style: ${tone.name} — ${tone.instruction}

Structure (in this order, no markdown symbols like ** or ##):

Opening paragraph — 2-3 sentences, naturally include the primary keyword, match the tone style exactly.

What You Will Learn:
- Bullet point 1
- Bullet point 2
- Bullet point 3
- Bullet point 4
- Bullet point 5

TIMESTAMPS
0:00 - Introduction
[add 5 more realistic chapters with times]

RESOURCES
[3 placeholder resource links relevant to the topic]

[Call to action matching the tone — subscribe, like, comment]

About ${channelName}: [1-2 sentences about the channel]

[10 relevant hashtags]

Keep total length under 1800 characters. Plain text only, no markdown.`

  try {
    return await callGemini(prompt, geminiKey)
  } catch {
    return fallbackDescription(videoTitle, keywords, channelName)
  }
}

export async function generateTitleVariations(originalTitle, keywords, geminiKey) {
  const prompt = `You are a YouTube SEO expert. Generate 12 title variations for this video.

Original Title: "${originalTitle}"
Keywords: ${keywords.slice(0, 5).join(', ')}

Generate EXACTLY:
- 3 SEO titles: keyword-rich, searchable, natural language, under 70 characters
- 3 CTR titles: curiosity gap, emotion, numbers, or urgency — under 70 characters
- 3 Thought Leadership titles: authoritative tone, executive audience — under 70 characters
- 3 Shorts Hook titles: under 55 characters, punchy, viral-style

Rules: No misleading clickbait. Vary structure significantly across all 12. No quotes inside title text.

Return ONLY a valid JSON array with no other text:
[{"type":"SEO","title":"..."},{"type":"CTR","title":"..."},{"type":"Thought Leadership","title":"..."},{"type":"Shorts Hook","title":"..."},...]`

  try {
    const text = await callGemini(prompt, geminiKey)
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON found')
    const parsed = JSON.parse(match[0])
    return parsed.map(t => ({ ...t, chars: t.title.length, charOk: t.title.length <= 70 }))
  } catch {
    return fallbackTitleVariations(originalTitle, keywords)
  }
}

export async function generateHashtags(keywords, videoTitle, geminiKey) {
  const prompt = `Generate exactly 15 YouTube hashtags for a video titled "${videoTitle}" with keywords: ${keywords.slice(0, 6).join(', ')}.

Mix: 5 niche-specific, 5 industry/category, 5 broad discovery hashtags.
Each must start with #. No spaces within a hashtag. No duplicates.

Return ONLY a JSON array, no other text: ["#tag1","#tag2",...]`

  try {
    const text = await callGemini(prompt, geminiKey)
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('No JSON found')
    return JSON.parse(match[0]).slice(0, 15)
  } catch {
    return fallbackHashtags(keywords)
  }
}

// --- Fallback templates used if Gemini API call fails ---

function fallbackDescription(videoTitle, keywords, channelName) {
  const kw1 = keywords[0] || 'this topic'
  const kw2 = keywords[1] || 'strategy'
  const kw3 = keywords[2] || 'insights'
  const hashtags = fallbackHashtags(keywords).slice(0, 10).join(' ')
  return `In this video, we explore ${kw1} and how it reshapes the way professionals approach ${kw2} today.

What You Will Learn:
- The fundamentals of ${kw1} and why it matters now
- How to build a ${kw2} strategy with measurable results
- Key ${kw3} top practitioners use in ${new Date().getFullYear()}
- Common pitfalls to avoid
- Actionable next steps you can apply immediately

TIMESTAMPS
0:00 - Introduction
1:30 - Background & Context
4:00 - Core Framework
7:15 - Step-by-Step Breakdown
12:30 - Real-World Examples
18:00 - Key Takeaways

RESOURCES
Free playbook: [LINK]
Template download: [LINK]
More resources: [LINK]

Subscribe for weekly insights. Like if this helped. Drop your questions below!

About ${channelName}: Expert analysis on ${kw1}, ${kw2}, and emerging ${kw3} trends.

${hashtags}`
}

function fallbackTitleVariations(originalTitle, keywords) {
  const kw1 = keywords[0] || 'your topic'
  const kw2 = keywords[1] || 'strategy'
  const year = new Date().getFullYear()
  const cap = s => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const variations = [
    { type: 'SEO', title: `${cap(kw1)} ${cap(kw2)}: Complete Guide [${year}]` },
    { type: 'SEO', title: `How to Master ${cap(kw1)}: Proven ${cap(kw2)} Framework` },
    { type: 'SEO', title: `${cap(kw1)} Explained: Everything You Need to Know` },
    { type: 'CTR', title: `7 ${cap(kw1)} Mistakes Killing Your ${cap(kw2)} (Fix These Now)` },
    { type: 'CTR', title: `I Tested ${cap(kw1)} for 90 Days — Here's What Actually Works` },
    { type: 'CTR', title: `Why 90% of ${cap(kw1)} Strategies Fail (And What to Do Instead)` },
    { type: 'Thought Leadership', title: `The Future of ${cap(kw1)}: What Executives Need to Know` },
    { type: 'Thought Leadership', title: `${cap(kw1)} in ${year}: Strategic Outlook for Leaders` },
    { type: 'Thought Leadership', title: `Rethinking ${cap(kw1)}: A Data-Driven Perspective` },
    { type: 'Shorts Hook', title: `This ${cap(kw1)} Trick Changes Everything` },
    { type: 'Shorts Hook', title: `Nobody Talks About This ${cap(kw1)} Strategy` },
    { type: 'Shorts Hook', title: `${cap(kw1)} Secret Revealed in 60 Seconds` },
  ]
  return variations.map(v => ({ ...v, chars: v.title.length, charOk: v.title.length <= 70 }))
}

function fallbackHashtags(keywords) {
  const base = keywords.slice(0, 6).map(k => `#${k.replace(/\s+/g, '')}`)
  const generic = ['#BusinessStrategy', '#ExecutiveInsights', '#B2B', '#LeadershipTips', '#DigitalTransformation', '#ProfessionalDevelopment', '#BusinessGrowth', '#MarketingStrategy', '#ContentMarketing', '#ThoughtLeadership', '#Innovation', '#GrowthStrategy', '#DataDriven', '#ROI', '#FutureOfWork']
  return [...new Set([...base, ...generic])].slice(0, 15)
}
