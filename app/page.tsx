import { Header } from '@/components/layout/Header';
import { AuditForm } from '@/components/audit/AuditForm';
import { FeatureGrid } from '@/components/audit/FeatureGrid';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-400/5 blur-3xl" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900/50 text-brand-700 dark:text-brand-300 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-slow" />
              AI-Powered SEO Analysis
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Complete Website{' '}
              <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                SEO Health
              </span>{' '}
              Audit
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
              Analyze any website&apos;s technical SEO, Core Web Vitals, on-page optimization,
              and structured data in seconds. Get actionable AI-powered recommendations.
            </p>

            {/* URL Input Form */}
            <AuditForm />

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-500">
              {[
                '✓ Technical SEO',
                '✓ Core Web Vitals',
                '✓ On-Page Analysis',
                '✓ Schema Validation',
                '✓ Mobile SEO',
              ].map((item) => (
                <span key={item} className="flex items-center gap-1">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <FeatureGrid />

        {/* How it works */}
        <section className="py-16 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                Three steps to a complete SEO health report
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Enter URL',
                  description: 'Paste any website URL and click Analyze. We\'ll handle the rest.',
                  icon: '🔗',
                },
                {
                  step: '02',
                  title: 'Instant Analysis',
                  description: 'Our engine crawls your site, runs 20+ checks, and processes Core Web Vitals data.',
                  icon: '⚡',
                },
                {
                  step: '03',
                  title: 'Get Your Report',
                  description: 'Receive a detailed health score with prioritized fixes and AI recommendations.',
                  icon: '📊',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-card"
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="absolute top-4 right-4 text-5xl font-bold text-gray-100 dark:text-gray-800 select-none">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-500">
          <p>
            SEO Audit Pro — Professional website health analysis tool.
            Built with Next.js, TypeScript &amp; Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}
