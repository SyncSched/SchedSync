import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'SchedSync',
  description: 'AI-powered personal secretary to help manage your tasks, schedule, and life effortlessly.',
  other: {
    'google-site-verification': '_DpLsLw2ZcBy38Nj9u_6Oy6odc5K_3UXTzVnRSyQEzQ'
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="_DpLsLw2ZcBy38Nj9u_6Oy6odc5K_3UXTzVnRSyQEzQ" />
        <link rel="icon" type="image/png" href="/favicon.ico" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="SchedSync - AI Task Scheduler" />
        <meta property="og:description" content="Automate and personalize your daily schedule with AI-driven task management." />
        <meta property="og:image" content="https://schedsync.com/favicon.ico" />
        <meta property="og:url" content="https://schedsync.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SchedSync - AI Task Scheduler" />
        <meta name="twitter:description" content="Automate and personalize your daily schedule with AI." />
        <meta name="twitter:image" content="https://schedsync.com/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
