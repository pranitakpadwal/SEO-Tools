import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SEO Audit Pro — AI-Powered Website Health Analyzer',
    template: '%s | SEO Audit Pro',
  },
  description:
    'Get a comprehensive SEO health report for any website. Analyze Core Web Vitals, technical SEO, on-page content, mobile performance, and structured data in seconds.',
  keywords: ['SEO audit', 'website health', 'Core Web Vitals', 'technical SEO', 'page speed'],
  authors: [{ name: 'SEO Audit Pro' }],
  openGraph: {
    title: 'SEO Audit Pro — AI-Powered Website Health Analyzer',
    description: 'Get a comprehensive SEO health report for any website.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEO Audit Pro — AI-Powered Website Health Analyzer',
    description: 'Get a comprehensive SEO health report for any website.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
