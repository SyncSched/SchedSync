import { Inter } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnimatedBackground from '@/components/layout/AnimatedBackground';
import PageMetadata from '@/components/layout/PageMetadata';
import { siteConfig } from './metadata-config';
import './globals.css';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

// Static metadata (for build time)
export const metadata: Metadata = {
  metadataBase: new URL('https://schedsync.com'),
  title: 'SchedSync - Your Personal AI Assistant',
  description: 'AI-powered personal secretary to help manage your tasks, schedule, and life effortlessly.',
  applicationName: 'SchedSync',
  authors: [{ name: 'SchedSync Team' }],
  generator: 'Next.js',
  keywords: ['AI assistant', 'personal secretary', 'task management', 'productivity', 'calendar'],
  creator: 'SchedSync Team',
  publisher: 'SchedSync',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  icons: {
    icon: [
      { url: '/favicon-black.ico', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-white.ico', media: '(prefers-color-scheme: dark)' },
    ],
    shortcut: '/favicon-black.ico',
    apple: [
      { url: '/images/logo-192-black.png', media: '(prefers-color-scheme: light)' },
      { url: '/images/logo-192-white.png', media: '(prefers-color-scheme: dark)' },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'SchedSync',
    title: 'SchedSync - Your Personal AI Assistant',
    description: 'AI-powered personal secretary to help manage your tasks, schedule, and life effortlessly.',
    url: 'https://schedsync.com',
    images: [{
      url: '/images/og-image.png',
      width: 1200,
      height: 630,
      alt: 'SchedSync - Your Personal AI Assistant',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@schedsync',
    title: 'SchedSync - Your Personal AI Assistant',
    description: 'AI-powered personal secretary to help manage your tasks, schedule, and life effortlessly.',
    images: ['/images/og-image.png'],
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#4F46E5' }, { media: '(prefers-color-scheme: dark)', color: '#4F46E5' }],
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon links for light/dark mode */}
        <link
          rel="icon"
          type="image/x-icon"
          href="/favicon-black.ico"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          type="image/x-icon"
          href="/favicon-white.ico"
          media="(prefers-color-scheme: dark)"
        />

        {/* Site name and application metadata */}
        <meta name="application-name" content="SchedSync" />
        <meta name="apple-mobile-web-app-title" content="SchedSync" />
        <meta name="google-site-verification" content="" /> {/* Add your Google verification code when available */}

        {/* Primary Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={siteConfig.description} />
        <meta name="keywords" content={siteConfig.keywords} />
        <meta name="author" content={siteConfig.author} />
        <meta name="theme-color" content={siteConfig.themeColor} />

        {/* Favicon and App Icons */}
        <link rel="shortcut icon" type="image/x-icon" href="/favicon-black.ico" media="(prefers-color-scheme: light)" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon-white.ico" media="(prefers-color-scheme: dark)" />
        <link rel="icon" type="image/png" sizes="192x192" href="/images/logo-192-black.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/png" sizes="192x192" href="/images/logo-192-white.png" media="(prefers-color-scheme: dark)" />
        <link rel="icon" type="image/png" sizes="512x512" href="/images/logo-512-black.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" type="image/png" sizes="512x512" href="/images/logo-512-white.png" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/images/logo-192-black.png" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" href="/images/logo-192-white.png" media="(prefers-color-scheme: dark)" />
        <link rel="manifest" href="/manifest.json" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteConfig.url} />
        <meta property="og:title" content="SchedSync - Your Personal AI Assistant" />
        <meta property="og:description" content="AI-powered personal secretary to help manage your tasks, schedule, and life effortlessly." />
        <meta property="og:image" content={siteConfig.ogImage} />
        <meta property="og:locale" content={siteConfig.locale} />
        <meta property="og:site_name" content={siteConfig.name} />

        {/* Twitter */}
        <meta name="twitter:card" content={siteConfig.twitterCardType} />
        <meta name="twitter:site" content={siteConfig.twitterHandle} />
        <meta name="twitter:title" content="SchedSync - Your Personal AI Assistant" />
        <meta name="twitter:description" content="AI-powered personal secretary to help manage your tasks, schedule, and life effortlessly." />
        <meta name="twitter:image" content={siteConfig.ogImage} />

        {/* Canonical URL */}
        <link rel="canonical" href={siteConfig.url} />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "SchedSync",
              "url": "https://schedsync.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://schedsync.com/images/logo-512-black.png"
              },
              "sameAs": [
                "https://twitter.com/schedsync",
                "https://www.linkedin.com/company/schedsync"
              ]
            })
          }}
        />

        {/* Structured Data - SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "SchedSync",
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />

        {/* Structured Data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "SchedSync",
              "alternateName": "SchedSync AI Assistant",
              "url": "https://schedsync.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://schedsync.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <PageMetadata />
        <AnimatedBackground>
          <Navbar />
          {children}
          <Footer />
        </AnimatedBackground>
      </body>
    </html>
  );
}
