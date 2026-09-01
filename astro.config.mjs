// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// Static site (default output) — built by GitHub Actions and served by GitHub Pages.
//
// Deployed as an ORG SITE at the repo `ideabiocore.github.io`, served from the custom
// domain in `public/CNAME`. Everything lives at the root, so /path and /images/... links
// work as-is. `www.ideabio.org.au` is 301-redirected to the apex by GitHub Pages.
export default defineConfig({
  site: 'https://ideabio.org.au',

  // These pages live at the old Wix URLs so existing links keep working;
  // the previous paths redirect to them.
  redirects: {
    '/team': '/team-3',
    '/about': '/strategy',
    '/services': '/clients',
  },

  integrations: [react()],
});