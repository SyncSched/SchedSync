'use client';

import { useState } from 'react';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import { usePathname } from 'next/navigation';
import Header from './components/Header';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { siteConfig } from './metadata-config';
import PageMetadata from './components/PageMetadata';
import AddTaskModal from './components/AddTaskModal';

const inter = Inter({ subsets: ['latin'] });



interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const pathname = usePathname();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Get page title and subtitle based on pathname
  const getPageMeta = () => {
    switch (pathname) {
      case '/':
        return {
          title: "Today's Schedule",
          subtitle: "Plan your day effectively"
        };
      case '/settings':
        return {
          title: "Settings",
          subtitle: "Customize your preferences"
        };
      case '/calendar':
        return {
          title: "Calendar",
          subtitle: "View your monthly schedule"
        };
      case '/tools':
        return {
          title: "Tools",
          subtitle: "Productivity tools and integrations"
        };
      case '/reminders':
        return {
          title: "Reminders",
          subtitle: "Manage your reminders"
        };
      default:
        return {
          title: "SchedSync",
          subtitle: "Manage your schedule"
        };
    }
  };

  // Don't show sidebar and header on login and onboarding pages
  if (pathname === '/login' || pathname === '/onboarding') {
    return <>{children}</>;
  }

  const { title, subtitle } = getPageMeta();

  return (
    <div className={`flex flex-col md:flex-row h-screen ${isDark ? 'bg-gray-900' : 'bg-white'} overflow-hidden transition-colors duration-300`}>
      {/* Dynamic metadata component */}
      <PageMetadata />

      {/* Mobile Header */}
      <div className={`md:hidden flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} relative z-40 transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          {isSidebarOpen ? (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className={`p-1.5 ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-black'} rounded-lg transition-colors duration-300`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-1.5 ${isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-black'} rounded-lg transition-colors duration-300`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          )}
          <h1 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} transition-colors duration-300`}>{title}</h1>
        </div>
      </div>

      {/* Backdrop overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        user={user}
        onLogout={logout}
        onAddTask={() => setIsAddTaskModalOpen(true)}
      />

      {/* Main Content */}
      <main className={`flex-1 overflow-hidden w-full ${isDark ? 'bg-gray-900' : 'bg-[#F8F9FA]'} transition-colors duration-300`}>
        <div className="h-full flex flex-col">
          {/* Desktop Header - Fixed */}
          <div className="hidden md:block p-8 pb-0">
            <Header
              onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              user={user}
              onProfileClick={() => setShowProfileModal(!showProfileModal)}
              showProfileModal={showProfileModal}
              onLogout={logout}
              setShowProfileModal={setShowProfileModal}
              onAddTask={() => setIsAddTaskModalOpen(true)}
              title={title}
              subtitle={subtitle}
            />
          </div>

          {/* Scrollable Content Area */}
          <div className={`flex-1 overflow-auto p-3 md:p-8 md:pt-8 ${isDark ? 'bg-gray-900' : 'bg-[#F8F9FA]'} transition-colors duration-300`}>
            {children}
          </div>
        </div>
      </main>

      {/* Add Task Modal */}
      <AddTaskModal isOpen={isAddTaskModalOpen} onClose={() => setIsAddTaskModalOpen(false)} />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

        {/* Google verification and site name */}
        <meta name="google-site-verification" content="_DpLsLw2ZcBy38Nj9u_6Oy6odc5K_3UXTzVnRSyQEzQ" />
        <meta name="application-name" content="SchedSync" />
        <meta name="apple-mobile-web-app-title" content="SchedSync" />

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
        <meta property="og:title" content="SchedSync - AI Task Scheduler" />
        <meta property="og:description" content="Automate and personalize your daily schedule with AI-driven task management." />
        <meta property="og:image" content={siteConfig.ogImage} />
        <meta property="og:locale" content={siteConfig.locale} />
        <meta property="og:site_name" content={siteConfig.name} />

        {/* Twitter */}
        <meta name="twitter:card" content={siteConfig.twitterCardType} />
        <meta name="twitter:site" content={siteConfig.twitterHandle} />
        <meta name="twitter:title" content="SchedSync - AI Task Scheduler" />
        <meta name="twitter:description" content="Automate and personalize your daily schedule with AI." />
        <meta name="twitter:image" content={siteConfig.ogImage} />

        {/* Canonical URL */}
        <link rel="canonical" href={siteConfig.url} />

        {/* Structured Data - Organization */}
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
              "url": "https://ai.schedsync.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://ai.schedsync.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-900`}>
        <ThemeProvider>
          <AuthProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
