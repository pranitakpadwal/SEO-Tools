'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface SidebarSection {
  id: string;
  label: string;
  icon: string;
  score?: number;
}

interface SidebarProps {
  sections: SidebarSection[];
  activeSection?: string;
}

function getScoreColor(score?: number) {
  if (score === undefined) return '';
  if (score >= 75) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

export function Sidebar({ sections, activeSection }: SidebarProps) {
  const [active, setActive] = useState(activeSection || sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // Get the topmost visible section
          const topmost = visible.reduce((prev, curr) => {
            return prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr;
          });
          setActive(topmost.target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActive(id);
    }
  };

  return (
    <div className="sticky top-20 h-fit">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-3">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-3">
          Jump to
        </p>
        <nav className="space-y-0.5">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-150',
                active === section.id
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{section.icon}</span>
                <span className="truncate">{section.label}</span>
              </span>
              {section.score !== undefined && (
                <span className={cn('text-xs font-bold tabular-nums', getScoreColor(section.score))}>
                  {section.score}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
