const FEATURES = [
  {
    icon: '🔍',
    title: 'Technical SEO Audit',
    description: 'Robots.txt validation, XML sitemap detection, canonical tag analysis, and crawl issues.',
    color: 'from-violet-500/10 to-purple-500/10',
    border: 'border-violet-100 dark:border-violet-900/30',
  },
  {
    icon: '⚡',
    title: 'Core Web Vitals',
    description: 'LCP, CLS, INP, TTFB analysis using Google PageSpeed Insights API data.',
    color: 'from-yellow-500/10 to-orange-500/10',
    border: 'border-yellow-100 dark:border-yellow-900/30',
  },
  {
    icon: '📱',
    title: 'Mobile SEO',
    description: 'Viewport meta validation, mobile-friendliness signals, and tap target analysis.',
    color: 'from-blue-500/10 to-cyan-500/10',
    border: 'border-blue-100 dark:border-blue-900/30',
  },
  {
    icon: '📝',
    title: 'On-Page Analysis',
    description: 'Title tags, meta descriptions, H1–H6 heading hierarchy, and semantic structure.',
    color: 'from-green-500/10 to-emerald-500/10',
    border: 'border-green-100 dark:border-green-900/30',
  },
  {
    icon: '🔒',
    title: 'Security Checks',
    description: 'HTTPS validation and mixed content detection to keep your site secure.',
    color: 'from-red-500/10 to-pink-500/10',
    border: 'border-red-100 dark:border-red-900/30',
  },
  {
    icon: '🧩',
    title: 'Structured Data',
    description: 'JSON-LD and microdata schema detection, type identification, and validation.',
    color: 'from-indigo-500/10 to-blue-500/10',
    border: 'border-indigo-100 dark:border-indigo-900/30',
  },
];

export function FeatureGrid() {
  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need to rank
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            A comprehensive audit covering all the factors that impact your search visibility
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={`rounded-2xl border bg-gradient-to-br p-5 ${feature.color} ${feature.border} transition-all duration-200 hover:shadow-card-lg hover:-translate-y-0.5`}
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
