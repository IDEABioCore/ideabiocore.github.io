# IDEA Bio — website

Marketing site for **IDEA Bio**, a synthetic biology biofoundry at the AIBN, The University of Queensland.
Built with **[Astro](https://astro.build/)** — fast, static, and simple enough that anyone can maintain it.

## Tech stack

- **Astro 5** (static output — plain HTML/CSS/JS at build time, minimal JavaScript shipped)
- **Plain CSS with design tokens** (no Tailwind) — the whole look is driven by CSS variables in one file
- **Self-hosted fonts** (Geist, Geist Mono) — no external CDN
- Deploys to **Vercel** with zero config

## Run it locally

```bash
npm install       # first time only
npm run dev       # start the dev server → http://localhost:4321
```

Other commands:

```bash
npm run build     # build the static site into dist/
npm run preview   # preview the production build locally
```

## Project structure

```
src/
  layouts/BaseLayout.astro     # <head>, fonts, header + footer, theme + reveal scripts
  components/                  # Header, Footer, PageHero, MolecularField, VideoEmbed
  pages/                       # one file per page: index, about, services, projects, team, contact
  content/projects/*.md        # one Markdown file per project (the Projects page)
  data/team.json               # the team roster (Team page)
  styles/global.css            # design tokens (colours, fonts, spacing) + base styles
public/
  images/                      # all photos & logos (see ASSETS.md for the map)
```

## How to edit common things

| I want to…                     | Edit this |
|--------------------------------|-----------|
| Change page text               | the matching file in `src/pages/` |
| Add / edit a **project**       | create or edit a `.md` file in `src/content/projects/` |
| Add / edit a **team member**   | `src/data/team.json` |
| Swap an **image**              | drop it in `public/images/` and reference `/images/your-file.jpg` (`ASSETS.md` lists them all) |
| Change **colours or fonts**    | the `:root` tokens at the top of `src/styles/global.css` |

The colour system is defined once in `global.css` as CSS custom properties (light + dark themes),
so re-theming the entire site means editing that one block.

## Deploy (GitHub Pages)

The site auto-deploys via GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main`.

**One-time setup:**
1. The repo is an **org site** named `ideabiocore.github.io`, so the site is served at the root: `https://ideabiocore.github.io/`.
2. In the repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Push to `main`. The workflow builds with Astro and publishes. Every later push redeploys automatically.

**Custom domain (later):** add a `public/CNAME` file containing `www.ideabio.org.au`, point the domain's DNS at GitHub Pages, and update `site` in `astro.config.mjs`.

`old/` (the archived previous Wix site) and the unused source video are excluded from git.
