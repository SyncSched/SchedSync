import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar';
import PageMetadata from '@/components/PageMetadata';
import { siteConfig, structuredData } from './metadata-config';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata is handled dynamically by the PageMetadata component

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon links with media queries for browser theme */}
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

        {/* Google Site Verification */}
        <meta name="google-site-verification" content="_DpLsLw2ZcBy38Nj9u_6Oy6odc5K_3UXTzVnRSyQEzQ" />

        {/* Primary Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content={siteConfig.description} />
        <meta name="keywords" content={siteConfig.keywords} />
        <meta name="author" content={siteConfig.author} />
        <meta name="theme-color" content={siteConfig.themeColor} />
        <meta name="application-name" content={siteConfig.name} />
        <meta name="apple-mobile-web-app-title" content={siteConfig.name} />

        {/* Icons */}
        <link rel="apple-touch-icon" href="/images/logo-192-black.png" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" href="/images/logo-192-white.png" media="(prefers-color-scheme: dark)" />
        <link rel="manifest" href="/manifest.json" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteConfig.url} />
        <meta property="og:title" content="SchedSync - AI Task Scheduler" />
        <meta property="og:description" content={siteConfig.description} />
        <meta property="og:image" content={siteConfig.ogImage} />
        <meta property="og:locale" content={siteConfig.locale} />
        <meta property="og:site_name" content={siteConfig.name} />

        {/* Twitter */}
        <meta name="twitter:card" content={siteConfig.twitterCardType} />
        <meta name="twitter:site" content={siteConfig.twitterHandle} />
        <meta name="twitter:title" content="SchedSync - AI Task Scheduler" />
        <meta name="twitter:description" content={siteConfig.description} />
        <meta name="twitter:image" content={siteConfig.ogImage} />

        {/* Canonical URL */}
        <link rel="canonical" href={siteConfig.url} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.organization)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.softwareApplication)
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Dynamic metadata component */}
        <PageMetadata />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
