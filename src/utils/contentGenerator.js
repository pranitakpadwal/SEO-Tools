import { extractKeywords, extractHashtags } from './seoAnalyzer.js'

export function generateTitleVariations(originalTitle, keywords) {
  const kw1 = keywords[0] || 'your topic'
  const kw2 = keywords[1] || 'strategy'
  const kw3 = keywords[2] || 'insights'
  const year = new Date().getFullYear()

  const variations = [
    {
      type: 'SEO',
      badge: 'badge-seo',
      title: `${capitalize(kw1)} ${capitalize(kw2)}: Complete Guide [${year}]`,
    },
    {
      type: 'SEO',
      badge: 'badge-seo',
      title: `How to Master ${capitalize(kw1)}: Proven ${capitalize(kw2)} Framework`,
    },
    {
      type: 'SEO',
      badge: 'badge-seo',
      title: `${capitalize(kw1)} Explained: Everything You Need to Know`,
    },
    {
      type: 'CTR',
      badge: 'badge-ctr',
      title: `7 ${capitalize(kw1)} Mistakes Killing Your ${capitalize(kw2)} (Fix These Now)`,
    },
    {
      type: 'CTR',
      badge: 'badge-ctr',
      title: `I Tested ${capitalize(kw1)} for 90 Days — Here's What Actually Works`,
    },
    {
      type: 'CTR',
      badge: 'badge-ctr',
      title: `Why 90% of ${capitalize(kw1)} Strategies Fail (And What to Do Instead)`,
    },
    {
      type: 'Thought Leadership',
      badge: 'badge-thought',
      title: `The Future of ${capitalize(kw1)}: ${capitalize(kw3)} for Decision Makers`,
    },
    {
      type: 'Thought Leadership',
      badge: 'badge-thought',
      title: `${capitalize(kw1)} in ${year}: Executive Insights and Strategic Outlook`,
    },
    {
      type: 'Thought Leadership',
      badge: 'badge-thought',
      title: `Rethinking ${capitalize(kw1)}: A Data-Driven Leadership Perspective`,
    },
    {
      type: 'Shorts Hook',
      badge: 'badge-shorts',
      title: `This ${capitalize(kw1)} Trick Changes Everything 🚀`,
    },
  ]

  return variations.map(v => ({
    ...v,
    chars: v.title.length,
    charOk: v.title.length <= 70,
  }))
}

export function generateDescription(videoTitle, keywords, channelName = 'Your Channel') {
  const kw1 = keywords[0] || 'this topic'
  const kw2 = keywords[1] || 'strategy'
  const kw3 = keywords[2] || 'insights'
  const kw4 = keywords[3] || 'best practices'

  const hashtagList = generateHashtags(keywords).slice(0, 10).join(' ')

  return `In this video, we dive deep into ${kw1} and how it's reshaping the way professionals approach ${kw2} in today's competitive landscape. Whether you're a seasoned leader or just beginning to explore ${kw1}, this breakdown gives you a clear, actionable framework backed by real-world examples.

📌 What you'll learn:
• The fundamentals of ${kw1} and why it matters now
• How to build a ${kw2} strategy that delivers measurable results
• Key ${kw3} that top executives are leveraging in ${new Date().getFullYear()}
• Common pitfalls to avoid and ${kw4} that drive long-term success

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱ TIMESTAMPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0:00 — Introduction
1:30 — The Problem with Traditional ${capitalize(kw1)} Approaches
4:00 — Framework Overview
7:15 — Step-by-Step Breakdown
12:30 — Real-World Case Study
17:00 — Expert Insights & ${capitalize(kw3)}
21:00 — Key Takeaways & Action Steps
23:45 — Conclusion & Next Steps

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 RESOURCES & LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 Download the free ${capitalize(kw1)} Playbook → [LINK]
📊 Get the ${capitalize(kw2)} Template → [LINK]
🌐 Visit our website for more resources → [LINK]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📺 WATCH NEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ ${capitalize(kw1)} Masterclass (Full Playlist) → [LINK]
▶ ${capitalize(kw2)} Deep Dive Series → [LINK]
▶ Latest ${capitalize(kw3)} Insights → [LINK]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔔 CONNECT WITH US
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Subscribe for weekly ${capitalize(kw1)} insights → [SUBSCRIBE BUTTON]
🔔 Hit the notification bell so you never miss a video
👍 Like this video if you found it valuable
💬 Drop a comment below — what's your biggest challenge with ${kw1}?

Follow us:
🐦 Twitter/X: @${channelName.replace(/\s/g, '')}
💼 LinkedIn: [LINK]
📧 Newsletter: [LINK]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷 ABOUT ${channelName.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${channelName} is a professional B2B media publication delivering in-depth analysis, executive interviews, and strategic insights on ${kw1}, ${kw2}, and emerging ${kw3} trends.

#${capitalize(kw1).replace(/\s/g,'')
} #${capitalize(kw2).replace(/\s/g,'')} ${hashtagList}

Keywords: ${kw1}, ${kw2}, ${kw3}, ${kw4}, ${kw1} strategy, ${kw2} tips, ${kw3} insights, professional development, business strategy ${new Date().getFullYear()}`
}

export function generateHashtags(keywords) {
  const year = new Date().getFullYear()
  const base = keywords.slice(0, 6).map(k => `#${k.replace(/\s+/g, '')}`)
  const generic = [
    '#BusinessStrategy', '#ExecutiveInsights', `#B2B${year}`,
    '#LeadershipTips', '#DigitalTransformation', '#ProfessionalDevelopment',
    '#BusinessGrowth', '#MarketingStrategy', '#ContentMarketing',
    '#ThoughtLeadership', '#Innovation', '#FutureOfWork',
    '#DataDriven', '#ROI', '#GrowthStrategy',
  ]
  const combined = [...base, ...generic]
  const seen = new Set()
  return combined.filter(h => {
    if (seen.has(h.toLowerCase())) return false
    seen.add(h.toLowerCase())
    return true
  }).slice(0, 15)
}

function capitalize(str) {
  if (!str) return ''
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
