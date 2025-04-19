# SchedSync SEO Implementation Guide

This document provides a comprehensive overview of the SEO implementation for SchedSync and serves as a guide for making future changes to the SEO configuration.

## Table of Contents

1. [Overview](#overview)
2. [Implementation Details](#implementation-details)
3. [File Structure](#file-structure)
4. [Adding a New Page](#adding-a-new-page)
5. [Removing a Page](#removing-a-page)
6. [Updating Metadata](#updating-metadata)
7. [Social Media Images](#social-media-images)
8. [Best Practices](#best-practices)

## Overview

The SEO implementation for SchedSync follows modern best practices to ensure optimal visibility in search engines and proper display when shared on social media platforms. The implementation includes:

- Metadata configuration for all pages
- Dynamic metadata updates based on the current page
- Open Graph and Twitter Card support for social media sharing
- Structured data for rich results in search engines
- Theme-aware favicons
- Proper sitemap and robots.txt files
- Google site verification

## Implementation Details

### Core Components

1. **metadata-config.ts**: Central configuration file containing all SEO-related metadata
2. **PageMetadata.tsx**: Component that dynamically updates metadata based on the current page
3. **layout.tsx**: Root layout file that includes all base metadata tags
4. **robots.txt**: Instructions for search engine crawlers
5. **sitemap.xml**: XML sitemap for search engines
6. **manifest.json**: Web app manifest for PWA support

### Configuration Structure

The metadata configuration is organized into three main sections:

1. **siteConfig**: Base metadata that applies to all pages
2. **pageMetadata**: Page-specific metadata
3. **structuredData**: Structured data for rich results in search engines

## File Structure

```
client/
├── public/
│   ├── images/
│   │   ├── logo-192-black.png
│   │   ├── logo-192-white.png
│   │   ├── logo-512-black.png
│   │   ├── logo-512-white.png
│   │   ├── og-image.png
│   │   └── README.md
│   ├── favicon-black.ico
│   ├── favicon-white.ico
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── app/
│   │   ├── metadata-config.ts
│   │   └── layout.tsx
│   └── components/
│       └── PageMetadata.tsx
```

## Adding a New Page

To add SEO metadata for a new page, follow these steps:

1. **Update the metadata-config.ts file**:

```typescript
// In src/app/metadata-config.ts
export const pageMetadata = {
  // Existing pages...
  
  // Add your new page
  newPage: {
    title: "New Page - SchedSync",
    description: "Description of your new page.",
    keywords: "relevant, keywords, for, new, page",
    ogTitle: "New Page - SchedSync",
    ogDescription: "Social media description for your new page.",
  },
};
```

2. **Update the PageMetadata component**:

```typescript
// In src/components/PageMetadata.tsx

// Update the PageType type
type PageType = 'home' | 'terms' | 'privacy' | 'contact' | 'newPage';

const PageMetadata = () => {
  const pathname = usePathname();
  
  useEffect(() => {
    // Determine which page we're on
    let pageType: PageType = 'home';
    
    // Add your new page condition
    if (pathname === '/') {
      pageType = 'home';
    } else if (pathname === '/terms') {
      pageType = 'terms';
    } else if (pathname === '/privacy') {
      pageType = 'privacy';
    } else if (pathname === '/contact') {
      pageType = 'contact';
    } else if (pathname === '/new-page') { // Add this line
      pageType = 'newPage';                // Add this line
    }
    
    // Rest of the component remains the same
    // ...
  }, [pathname]);
  
  return null;
};
```

3. **Update the sitemap.xml file**:

```xml
<!-- In public/sitemap.xml -->
<url>
  <loc>https://schedsync.com/new-page</loc>
  <lastmod>2025-04-19</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

## Removing a Page

To remove SEO metadata for a page, follow these steps:

1. **Remove the page from metadata-config.ts**:
   - Delete the page entry from the `pageMetadata` object

2. **Update the PageMetadata component**:
   - Remove the page type from the `PageType` type
   - Remove the condition for the page in the `useEffect` hook

3. **Update the sitemap.xml file**:
   - Remove the `<url>` entry for the page

## Updating Metadata

### Site-wide Metadata

To update site-wide metadata, modify the `siteConfig` object in `metadata-config.ts`:

```typescript
// In src/app/metadata-config.ts
export const siteConfig = {
  name: "Updated Name",
  description: "Updated description",
  // Other properties...
};
```

### Page-specific Metadata

To update metadata for a specific page, modify the corresponding entry in the `pageMetadata` object:

```typescript
// In src/app/metadata-config.ts
export const pageMetadata = {
  home: {
    title: "Updated Title - SchedSync",
    description: "Updated description for the home page.",
    // Other properties...
  },
  // Other pages...
};
```

### Structured Data

To update structured data, modify the `structuredData` object:

```typescript
// In src/app/metadata-config.ts
export const structuredData = {
  organization: {
    // Update organization data...
  },
  softwareApplication: {
    // Update application data...
  },
};
```

## Social Media Images

Social media images are stored in the `public/images` directory. To update these images:

1. Create new images following the specifications in `public/images/README.md`
2. Replace the existing images with the new ones, keeping the same filenames
3. Update the `ogImage` property in `siteConfig` if the filename changes

Image specifications:
- **og-image.png**: 1200 x 630 pixels
- **logo-192-black.png** and **logo-192-white.png**: 192 x 192 pixels
- **logo-512-black.png** and **logo-512-white.png**: 512 x 512 pixels

## Best Practices

1. **Keep metadata concise and relevant**:
   - Titles should be 50-60 characters
   - Descriptions should be 150-160 characters
   - Keywords should be relevant to the page content

2. **Use unique metadata for each page**:
   - Each page should have a unique title and description
   - Avoid duplicate content across pages

3. **Regularly update the sitemap**:
   - Update the `lastmod` date when content changes
   - Add new pages and remove deleted pages

4. **Test social media sharing**:
   - Use tools like the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [Twitter Card Validator](https://cards-dev.twitter.com/validator) to test how your pages appear when shared

5. **Monitor search performance**:
   - Use Google Search Console to monitor your site's performance in search results
   - Address any issues reported by Google Search Console

6. **Keep structured data up-to-date**:
   - Test structured data using the [Google Rich Results Test](https://search.google.com/test/rich-results)
   - Update structured data when your application changes

7. **Maintain image quality**:
   - Use high-quality images for social media sharing
   - Optimize images for web to reduce load times

## Conclusion

This SEO implementation provides a solid foundation for SchedSync's visibility in search engines and appearance on social media platforms. By following this guide, you can maintain and improve the SEO configuration as the application evolves.

For more detailed information on SEO best practices, refer to:
- [Google's SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org](https://schema.org/) for structured data
