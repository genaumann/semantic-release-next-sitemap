# semantic-release-sitemap-plugin

A semantic-release plugin for automatically generating and updating your `sitemap.xml` with fresh `lastmod` dates, based on commit messages and dynamic site structure.

---

## Features

- **Commit-driven lastmod:** Extracts sitemap paths and last modification dates from commit bodies using the `sitemap:` tag.
- **Pattern support:** Allows wildcards (`*`) in paths for bulk lastmod updates.
- **Dynamic integration:** Loads a custom sitemap generator (written in TypeScript or JavaScript) at runtime, compiles it if necessary, and merges its output.
- **XML merging:** Combines the existing `sitemap.xml` with new or updated lastmod dates and meta data.
- **Flexible & CI-friendly:** All logic runs automatically during semantic-release without manual pre-build steps.

---

## How It Works

1. **Commits are parsed** for `sitemap:` tags. Example:
   ```
   chore: update portfolio tools

   sitemap: /portfolio/tools/react,/portfolio/tools/*
   ```
   The plugin extracts all specified paths and maps them to the commit date.

2. **Your project’s `generateSitemap` function is called** (TypeScript file). The plugin compiles and imports it on-the-fly (using esbuild).
3. **All routes returned from `generateSitemap`** are updated with `lastmod` according to commit history (including wildcard support).
4. **The previous `sitemap.xml` is loaded** and merged, so existing meta data (such as alternate links, priorities) are preserved.
5. **A new `sitemap.xml` is generated**, reflecting all lastmod updates and the complete, up-to-date site structure.

---

## Example Commit

```
chore: update portfolio and contact pages

sitemap: /portfolio/*,/contact
```

---

## Example Usage

**Add the plugin to your `release.config.js`:**

```js
module.exports = {
  branches: ['main'],
  plugins: [
    [
      'semantic-release-sitemap-plugin',
      {
        sitemapFunction: 'lib/generateSitemap.ts',    // Path to your generator (TS)
        sitemapPath: 'app/sitemap.xml',              // Path to your current sitemap.xml
        sitemapBaseUrl: 'https://example.com'       // Prod Domain for absolute URLs
      },
      '@semantic-release/git',
       {
        assets: ['app/sitemap.xml'],                  // Ensure the updated sitemap is committed
        message: 'chore: Update sitemap.xml for release ${nextRelease.version}'
       }
    ]
  ]
}
```

---

## Required Setup

- **generateSitemap function:**  
  Export a default async function that returns an array of routes, e.g.:
  ```typescript
  // lib/generateSitemap.ts
  export default async function generateSitemap(): Promise<MetadataRoute.Sitemap> {
    return [
      {
        url: '/portfolio/tools/react',
        alternates: {
          languages: { en: '/en/portfolio/tools/react', de: '/portfolio/tools/react' }
        },
        changeFrequency: 'monthly',
        priority: 0.5
      },
      // ...more routes
    ]
  }
  ```

- **Dependencies:**  
  - `esbuild` for on-the-fly TypeScript/JS compilation (handled automatically).
  - `xml2js` for parsing and building XML

---

## Notes

- Wildcard support (`*`) in paths lets you update whole route groups with a single commit.
- No manual build step needed for TS generators; everything happens on-the-fly.
- Your alternate languages, change frequencies, and priorities from existing sitemap.xml are preserved.

---

## License

MIT
