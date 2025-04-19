'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { pageMetadata, siteConfig } from '../app/metadata-config';

type PageType = 'home' | 'terms' | 'privacy' | 'contact';

const PageMetadata = () => {
  const pathname = usePathname();
  
  useEffect(() => {
    // Determine which page we're on
    let pageType: PageType = 'home';
    
    if (pathname === '/') {
      pageType = 'home';
    } else if (pathname === '/terms') {
      pageType = 'terms';
    } else if (pathname === '/privacy') {
      pageType = 'privacy';
    } else if (pathname === '/contact') {
      pageType = 'contact';
    }
    
    // Get the metadata for this page
    const metadata = pageMetadata[pageType];
    
    // Update the document title
    document.title = metadata.title;
    
    // Update meta description
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', metadata.description);
    }
    
    // Update meta keywords
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) {
      keywordsMeta.setAttribute('content', metadata.keywords);
    }
    
    // Update Open Graph title
    const ogTitleMeta = document.querySelector('meta[property="og:title"]');
    if (ogTitleMeta) {
      ogTitleMeta.setAttribute('content', metadata.ogTitle);
    }
    
    // Update Open Graph description
    const ogDescriptionMeta = document.querySelector('meta[property="og:description"]');
    if (ogDescriptionMeta) {
      ogDescriptionMeta.setAttribute('content', metadata.ogDescription);
    }
    
    // Update Twitter title
    const twitterTitleMeta = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleMeta) {
      twitterTitleMeta.setAttribute('content', metadata.ogTitle);
    }
    
    // Update Twitter description
    const twitterDescriptionMeta = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescriptionMeta) {
      twitterDescriptionMeta.setAttribute('content', metadata.ogDescription);
    }
    
    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${siteConfig.url}${pathname}`);
    }
    
  }, [pathname]);
  
  return null; // This component doesn't render anything
};

export default PageMetadata;
