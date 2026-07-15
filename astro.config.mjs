// @ts-check
import { defineConfig } from 'astro/config';

// Static site (default output) — built by GitHub Actions and served by GitHub Pages.
//
// Deployed as an ORG SITE at the repo `ideabiocore.github.io`, so it lives at the
// root (https://ideabiocore.github.io/) and every /path and /images/... link works
// as-is. When the custom domain is ready, point DNS at Pages and add a
// `public/CNAME` file containing `www.ideabio.org.au`, then update `site` below.
export default defineConfig({
  site: 'https://ideabiocore.github.io',
});
