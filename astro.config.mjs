// @ts-check
import { defineConfig } from 'astro/config';

// Static site (default output) — built by GitHub Actions and served by GitHub Pages.
//
// Deployed as an ORG SITE at the repo `ideabiocore.github.io`, served from the custom
// domain in `public/CNAME`. Everything lives at the root, so /path and /images/... links
// work as-is. `www.ideabio.org.au` is 301-redirected to the apex by GitHub Pages.
export default defineConfig({
  site: 'https://ideabio.org.au',
});
