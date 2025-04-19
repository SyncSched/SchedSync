// SEO Metadata Configuration for SchedSync Client

// Base metadata that applies to all pages
export const siteConfig = {
  name: "SchedSync",
  description: "AI-powered task scheduler that helps you organize your day efficiently",
  url: "https://schedsync.com",
  ogImage: "https://schedsync.com/images/og-image.png",
  twitterHandle: "@schedsync",
  twitterCardType: "summary_large_image",
  locale: "en_US",
  themeColor: "#4F46E5", // Indigo color from the UI
  keywords: "AI scheduler, task management, productivity, calendar, time management, reminders",
  author: "SchedSync Team",
  icons: {
    icon: "/favicon-black.ico",
    apple: "/images/logo-192-black.png",
    shortcut: "/favicon-black.ico",
    androidChrome: {
      "192": "/images/logo-192-black.png",
      "512": "/images/logo-512-black.png",
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
  terms: {
    title: "Terms of Service - SchedSync",
    description: "Read the terms of service for using SchedSync, the AI-powered task scheduler.",
    keywords: "terms of service, legal terms, user agreement, terms and conditions",
    ogTitle: "SchedSync Terms of Service",
    ogDescription: "Read our terms of service to understand your rights and responsibilities when using SchedSync.",
  },
  privacy: {
    title: "Privacy Policy - SchedSync",
    description: "Learn how SchedSync protects your privacy and handles your personal information.",
    keywords: "privacy policy, data protection, personal information, privacy rights",
    ogTitle: "SchedSync Privacy Policy",
    ogDescription: "We value your privacy. Learn how we collect, use, and protect your personal information.",
  },
  contact: {
    title: "Contact Us - SchedSync",
    description: "Get in touch with the SchedSync team for support, feedback, or business inquiries.",
    keywords: "contact, support, help, feedback, customer service",
    ogTitle: "Contact SchedSync",
    ogDescription: "Have questions or feedback? Reach out to our team for assistance.",
  },
};

// Structured data for rich results
export const structuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SchedSync",
    url: "https://schedsync.com",
    logo: "https://schedsync.com/images/logo-512-black.png",
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
