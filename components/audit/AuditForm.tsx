'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { AuditData } from '@/types/audit';

const EXAMPLE_URLS = [
  'https://vercel.com',
  'https://github.com',
  'https://nextjs.org',
];

export function AuditForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setError(null);
    setLoading(true);
    setProgress('Initializing analysis...');

    const steps = [
      { delay: 500, msg: 'Fetching website content...' },
      { delay: 1500, msg: 'Checking robots.txt & sitemap...' },
      { delay: 3000, msg: 'Analyzing metadata & headings...' },
      { delay: 5000, msg: 'Validating schema markup...' },
      { delay: 7000, msg: 'Analyzing Core Web Vitals...' },
      { delay: 10000, msg: 'Generating AI recommendations...' },
    ];

    const timers = steps.map(({ delay, msg }) =>
      setTimeout(() => setProgress(msg), delay)
    );

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      timers.forEach(clearTimeout);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Audit failed. Please try again.');
      }

      const data: AuditData = await response.json();

      // Store in sessionStorage for instant page load
      sessionStorage.setItem(`audit-${data.id}`, JSON.stringify(data));

      setProgress('Redirecting to results...');
      router.push(`/audit/${data.id}`);
    } catch (err) {
      timers.forEach(clearTimeout);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-stretch gap-0 rounded-2xl shadow-card-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus-within:border-brand-400 dark:focus-within:border-brand-500 focus-within:shadow-glow transition-all">
          <div className="flex items-center pl-4 pr-2">
            <Search
              size={18}
              className="text-gray-400 dark:text-gray-500 flex-shrink-0"
            />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter website URL (e.g., https://example.com)"
            className="flex-1 py-4 pr-2 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-base outline-none min-w-0"
            disabled={loading}
            autoFocus
          />
          <div className="p-2 flex-shrink-0">
            <Button
              type="submit"
              size="lg"
              loading={loading}
              rightIcon={!loading ? <ArrowRight size={18} /> : undefined}
              className="h-full rounded-xl text-base font-semibold"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
        </div>
      </form>

      {/* Progress message */}
      {loading && progress && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 animate-fade-in">
          <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          {progress}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 border border-red-100 dark:border-red-800/50">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Example URLs */}
      {!loading && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">Try:</span>
          {EXAMPLE_URLS.map((exampleUrl) => (
            <button
              key={exampleUrl}
              type="button"
              onClick={() => setUrl(exampleUrl)}
              className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors font-mono"
            >
              {exampleUrl.replace('https://', '')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
