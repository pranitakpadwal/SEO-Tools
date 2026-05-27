# 🔍 SEO Audit Pro

**AI-Powered Website Health & SEO Audit Tool**

A comprehensive, modern SEO audit tool built with Next.js 15, TypeScript, and Tailwind CSS. Analyze any website's SEO health in seconds with detailed reports, actionable recommendations, and beautiful visualizations.

---

## ✨ Features

### 🔧 Technical SEO Audit
- **robots.txt** validation — existence, directives, sitemap references
- **XML Sitemap** detection and URL count
- **Canonical tag** analysis and mismatch detection
- **HTTPS** validation
- **Mixed content** detection

### ⚡ Core Web Vitals & Performance
- **LCP** — Largest Contentful Paint
- **CLS** — Cumulative Layout Shift
- **INP** — Interaction to Next Paint
- **TTFB** — Time to First Byte
- **FCP** — First Contentful Paint
- **TBT** — Total Blocking Time
- Render-blocking script detection
- Image optimization analysis (alt text, dimensions, lazy loading)
- Powered by Google PageSpeed Insights API

### 📱 Mobile SEO
- Viewport meta tag validation
- Mobile-friendly configuration analysis

### 📝 On-Page SEO
- Title tag analysis with optimal length meter (30–60 chars)
- Meta description analysis with optimal length meter (120–160 chars)
- H1–H6 heading hierarchy validation
- Missing / multiple H1 detection

### 🔒 Security
- HTTPS status validation
- Mixed content resource detection

### 🧩 Structured Data
- JSON-LD and Microdata detection
- Schema type identification & validation

### 📊 Score Dashboard
- **Overall Health Score** (0–100) with animated gauge
- Weighted category scores (Technical 35% + Performance 30% + On-Page 20% + Schema 10% + Mobile 5%)
- Priority issues with expandable details and fixes
- AI-powered recommendations with effort level
- JSON report export

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Optional — enables real Core Web Vitals from Google PageSpeed Insights
# Without this key, estimated performance data is shown
GOOGLE_PAGESPEED_API_KEY=your_api_key_here
```

### Running the App

```bash
# Development
npm run dev

# Production build & start
npm run build && npm run start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Google PageSpeed API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **PageSpeed Insights API**
3. Create an API key under **Credentials**
4. Add to `.env.local`:
   ```env
   GOOGLE_PAGESPEED_API_KEY=AIza...
   ```

**Free tier:** 25,000 requests/day.

---

## 🗂 Project Structure

```
seo-audit-pro/
├── app/
│   ├── api/audit/route.ts        # Main audit API (POST + GET)
│   ├── audit/[id]/page.tsx       # Results page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Homepage
│
├── components/
│   ├── audit/                    # All audit section components
│   ├── charts/                   # ScoreGauge, DonutChart, MetricCard
│   ├── layout/                   # Header, Sidebar, ThemeToggle
│   └── ui/                       # Button, Card, Badge, ProgressBar
│
├── lib/
│   ├── analyzers/                # Individual SEO analyzers
│   ├── recommendations/          # AI issue & recommendation engine
│   ├── scoring/                  # Weighted score calculator
│   └── utils/                    # URL validator, HTML fetcher, mock data
│
├── types/audit.ts                # All TypeScript interfaces
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🏗 Architecture

### Data Flow

```
User enters URL → POST /api/audit
→ Validate URL → Fetch HTML → Run analyzers in parallel
→ Calculate scores → Generate issues & AI recommendations
→ Store in memory + return AuditData
→ Client stores in sessionStorage → Navigate to /audit/[id]
→ AuditDashboard renders full report
```

### Scoring Algorithm

| Category         | Weight | Factors |
|-----------------|--------|---------|
| Technical SEO   | 35%    | robots.txt, sitemap, canonical, HTTPS |
| Performance     | 30%    | LCP, CLS, INP, TTFB, FCP, TBT |
| On-Page SEO     | 20%    | Title, meta description, headings |
| Structured Data | 10%    | Schema presence, types, validation |
| Mobile SEO      | 5%     | Viewport tag, configuration |

---

## 🧪 Sample Mock Data

Use `lib/utils/mockData.ts` to test the UI without real API calls:

```typescript
import { MOCK_AUDIT_DATA } from '@/lib/utils/mockData';
```

---

## 🎨 UI Features

- ✅ Dark/Light/System theme with next-themes
- ✅ Fully responsive (mobile → desktop)
- ✅ Sticky sidebar with active section highlighting
- ✅ Animated SVG score gauge
- ✅ Recharts donut chart for issue distribution
- ✅ Metric cards with status indicators
- ✅ Expandable priority issue cards
- ✅ AI recommendations with effort level + impact
- ✅ JSON export

---

## 📄 License

MIT
