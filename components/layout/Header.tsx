'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { ExternalLink, Gauge } from 'lucide-react';

interface HeaderProps {
  auditUrl?: string;
}

export function Header({ auditUrl }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-sm group-hover:shadow-glow transition-all">
              <Gauge size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white tracking-tight text-base">
              SEO Audit <span className="text-brand-600 dark:text-brand-400">Pro</span>
            </span>
          </Link>

          {/* Center: Current audit URL */}
          {auditUrl && (
            <div className="hidden md:flex items-center gap-2 max-w-xs lg:max-w-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 truncate">
                <ExternalLink size={11} className="flex-shrink-0" />
                <span className="truncate font-mono">{auditUrl}</span>
              </div>
            </div>
          )}

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
            >
              New Audit
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
