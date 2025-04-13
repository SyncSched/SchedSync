// SEO Metadata Configuration for SchedSync Landing Page

// Base metadata that applies to all pages
export const siteConfig = {
  name: "SchedSync",
  description: "AI-powered personal secretary to help manage your tasks, schedule, and life effortlessly.",
  url: "https://schedsync.com",
  ogImage: "https://schedsync.com/images/og-image.png",
  twitterHandle: "@schedsync",
  twitterCardType: "summary_large_image",
  locale: "en_US",
  themeColor: "#4F46E5", // Indigo color from the UI
  keywords: "AI assistant, personal secretary, task management, productivity, calendar, time management, reminders",
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
    title: "SchedSync - Your Personal AI Assistant",
    description: "AI-powered personal secretary to help manage your tasks, schedule, and life effortlessly.",
    keywords: "AI assistant, personal secretary, task management, productivity tool",
    ogTitle: "SchedSync - Your Personal AI Assistant",
    ogDescription: "Let AI help you manage your tasks, schedule, and life effortlessly.",
  },
  features: {
    title: "Features - SchedSync",
    description: "Discover the powerful features of SchedSync that will transform how you manage your time.",
    keywords: "AI features, smart scheduling, task management, email assistant",
    ogTitle: "SchedSync Features - Work Smarter, Not Harder",
    ogDescription: "Explore the powerful AI features that make SchedSync your ultimate productivity companion.",
  },
  pricing: {
    title: "Pricing - SchedSync",
    description: "Affordable plans for individuals and teams to boost productivity with SchedSync.",
    keywords: "SchedSync pricing, subscription plans, free trial",
    ogTitle: "SchedSync Pricing - Plans for Every Need",
    ogDescription: "Choose the perfect plan to boost your productivity with SchedSync's AI assistant.",
  },
  contact: {
    title: "Contact Us - SchedSync",
    description: "Get in touch with the SchedSync team for support, feedback, or partnership inquiries.",
    keywords: "contact SchedSync, support, help, feedback",
    ogTitle: "Contact SchedSync - We're Here to Help",
    ogDescription: "Reach out to our team for any questions, support, or feedback about SchedSync.",
  },
};
