// SEO Metadata Configuration for SchedSync

// Base metadata that applies to all pages
export const siteConfig = {
  name: "SchedSync",
  description: "AI-powered task scheduler that helps you organize your day efficiently",
  url: "https://ai.schedsync.com",
  ogImage: "https://ai.schedsync.com/images/og-image.png",
  twitterHandle: "@schedsync",
  twitterCardType: "summary_large_image",
  locale: "en_US",
  themeColor: "#4F46E5", // Indigo color from the UI
  keywords: "AI scheduler, task management, productivity, calendar, time management, reminders",
  author: "SchedSync Team",
  icons: {
    icon: "/favicon-black.ico",
    apple: "/images/logo-192.png",
    shortcut: "/favicon-black.ico",
    androidChrome: {
      "192": "/images/logo-192.png",
      "512": "/images/logo-512.png",
    },
  },
};

// Page-specific metadata
export const pageMetadata = {
  home: {
    title: "SchedSync - AI Task Scheduler",
    description: "Automate and personalize your daily schedule with AI-driven task management.",
    keywords: "AI scheduler, daily planner, task management, productivity tool",
    ogTitle: "SchedSync - Organize Your Day with AI",
    ogDescription: "Let AI help you plan your day efficiently with smart scheduling and reminders.",
  },
  calendar: {
    title: "Calendar - SchedSync",
    description: "View and manage your schedule with our integrated calendar. Sync with Google Calendar for a complete overview.",
    keywords: "calendar integration, schedule view, Google Calendar sync, event management",
    ogTitle: "SchedSync Calendar - Your Schedule at a Glance",
    ogDescription: "View your complete schedule and manage your time effectively with our integrated calendar.",
  },
  reminders: {
    title: "Reminders - SchedSync",
    description: "Never miss an important task with customizable reminders. Get notifications via email and Telegram",
    keywords: "task reminders, notification system reminders email notifications",
    ogTitle: "SchedSync Reminders - Stay on Top of Your Tasks",
    ogDescription: "Get timely notifications for your important tasks through multiple channels.",
  },
  settings: {
    title: "Settings - SchedSync",
    description: "Customize your SchedSync experience. Set your timezone, notification preferences, and personal information.",
    keywords: "user settings, notification preferences, timezone settings, profile customization",
    ogTitle: "SchedSync Settings - Personalize Your Experience",
    ogDescription: "Tailor SchedSync to your needs with customizable settings and preferences.",
  },
  login: {
    title: "Login - SchedSync",
    description: "Log in to your SchedSync account to access your personalized AI task scheduler.",
    keywords: "login, sign in, account access, user authentication",
    ogTitle: "Log in to SchedSync",
    ogDescription: "Access your personalized AI task scheduler and manage your schedule efficiently.",
  },
  onboarding: {
    title: "Get Started - SchedSync",
    description: "Set up your SchedSync profile and preferences to get a personalized scheduling experience.",
    keywords: "onboarding, setup, profile creation, preferences",
    ogTitle: "Get Started with SchedSync",
    ogDescription: "Complete your profile setup to get the most out of your AI task scheduler.",
  },
};

// Structured data for rich results
export const structuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SchedSync",
    url: "https://ai.schedsync.com",
    logo: "https://ai.schedsync.com/images/logo.png",
    sameAs: [
      "https://twitter.com/schedsync",
      "https://facebook.com/schedsync",
      "https://linkedin.com/company/schedsync"
    ],
  },
  softwareApplication: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SchedSync",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  }
};
