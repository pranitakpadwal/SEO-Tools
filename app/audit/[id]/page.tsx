'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { AuditData } from '@/types/audit';
import { Header } from '@/components/layout/Header';
import { AuditDashboard } from '@/components/audit/AuditDashboard';

export default function AuditResultPage() {
  const params = useParams();
  const router = useRouter();
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params.id as string;

    // First try sessionStorage (fast, no network request)
    const cached = sessionStorage.getItem(`audit-${id}`);
    if (cached) {
      try {
        const data = JSON.parse(cached) as AuditData;
        setAuditData(data);
        setLoading(false);
        return;
      } catch {
        // Invalid cache, fall through to API
      }
    }

    // Fall back to API
    fetch(`/api/audit?id=${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Audit not found');
        return res.json();
      })
      .then((data: AuditData) => {
        setAuditData(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading audit results...</p>
        </div>
      </div>
    );
  }

  if (error || !auditData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Audit Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This audit may have expired or the link is invalid. Please run a new audit.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors"
          >
            ← Run New Audit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header auditUrl={auditData.url} />
      <AuditDashboard data={auditData} />
    </div>
  );
}
