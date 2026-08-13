# CLAUDE.md — design & change workflow

Standing instructions for Claude Code in this repo. Claude reads this file at the
start of every session.

**Project:** IDEA Bio's marketing site. Astro 5, static output, plain CSS with
design tokens. No Tailwind, no UI library, no CSS-in-JS, no external CDNs.

---

## 0. The one rule that fixes most bad design

**Read before you write.** Inconsistent design almost always comes from an agent
inventing new colours, spacings and font sizes instead of using the ones the
project already defines.

Before creating or restyling anything, read in this order:

1. `src/styles/global.css` — the design tokens (colours, type scale, radius, shadow).
2. `src/layouts/BaseLayout.astro` — fonts, `<head>`, theme toggle, the reveal script.
3. One or two existing components/pages that already do something similar.

Only then write markup or CSS. **Never introduce a hard-coded colour or font size
when a token already exists for it.**

---

## 1. Use design tokens — never magic numbers

Everything visual is a CSS custom property in `src/styles/global.css:9`. New work
consumes those variables, not literal values.

### Palette — "Monochrome + Electric Violet"

The values below are a **snapshot for reference**; `global.css` is the source of
truth. Write `var(--accent)` in your CSS, never `#6D4AFF`. The hexes are here so
you can judge contrast and pick the right token — not so you can paste them.

| Token | Use | Light | Dark |
|---|---|---|---|
| `--bg` | Page background | `#F7F6F3` warm paper | `#0E0E11` |
| `--surface` | Cards, header, modals | `#FFFFFF` | `#17171C` |
| `--surface-2` | Sunken/raised panels | `#EFEDE7` | `#1E1E25` |
| `--ink` | Headings + body | `#0E0E11` | `#F2F1EE` |
| `--ink-soft` | Long-form body copy | `#2C2B31` | `#CFCED6` |
| `--muted` | Secondary text | `#6B6B72` | `#9A99A3` |
| `--accent` | Violet fills, focus rings | `#6D4AFF` | `#8B78FF` |
| `--accent-press` | Pressed / hover fill | `#4A2FE0` | `#7358FF` |
| `--accent-text` | **Small violet text** (AA) | `#5326D6` | `#AC9DFF` |
| `--on-accent` | Text on a violet fill | `#FFFFFF` | `#FFFFFF` |
| `--hairline` | Borders + rules | `#E6E4DE` | `rgba(255,255,255,.11)` |
| `--shadow` | Card elevation | `24px 42px -28px rgba(24,18,55,.26)` | `…rgba(0,0,0,.6)` |
| `--shadow-sm` | Subtle elevation | `0 10px 24px -16px rgba(24,18,55,.32)` | `…rgba(0,0,0,.65)` |

Notes on using the palette:

- **One accent only.** There is no secondary or tertiary brand colour, and no
  semantic success/warning/error palette. If you need one, add it as a token pair
  (light + dark) rather than inlining a green or red.
- **`--accent` vs `--accent-text`.** The bright accent is for *fills*, borders and
  focus rings. For small violet **text** on a light background use `--accent-text`
  (the deeper `#5326D6`), which is the one that passes AA. Getting this backwards
  is the most common contrast bug here.
- **The greys are warm in light, cool in dark.** Paper `#F7F6F3` and `#EFEDE7`
  carry a yellow cast; the dark surfaces carry a blue-violet one. Don't substitute
  a neutral `#F5F5F5` or `#181818` — it reads as a different brand.
- **Dark `--hairline` is an alpha white,** not a solid hex, so it works over any
  surface. Keep that property if you edit it.
- **Tints come from `color-mix`**, never a new hex:
  `color-mix(in srgb, var(--accent) 12%, transparent)`. That single expression
  builds every glow, wash and hover border in the codebase.

### Type

Self-hosted **Geist Sans** and **Geist Mono** — no Google Fonts, no CDN.

| Token | Value |
|---|---|
| `--font-sans`, `--font-display` | `'Geist Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` |
| `--font-mono` | `'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace` |

Fluid scale — always use these, never a fixed `px` size:

| Step | Clamp | Used for |
|---|---|---|
| `--step--1` | `clamp(0.83rem, 0.80rem + 0.15vw, 0.9rem)` | fine print, `.eyebrow` |
| `--step-0` | `clamp(1rem, 0.96rem + 0.2vw, 1.09rem)` | body (`body` default) |
| `--step-1` | `clamp(1.18rem, 1.10rem + 0.38vw, 1.4rem)` | `h4`, `.lead` |
| `--step-2` | `clamp(1.42rem, 1.30rem + 0.6vw, 1.85rem)` | `h3` |
| `--step-3` | `clamp(1.72rem, 1.52rem + 1.0vw, 2.4rem)` | `h2` |
| `--step-4` | `clamp(2.07rem, 1.75rem + 1.55vw, 3.15rem)` | page-hero `h1` |
| `--step-5` | `clamp(2.5rem, 2.0rem + 2.45vw, 4.2rem)` | `h1` |

Baseline treatment already set globally (don't re-declare it per component):

- `body` — `--step-0`, `line-height: 1.6`, antialiased.
- `h1`–`h4` — weight `700`, `line-height: 1.07`, `letter-spacing: -0.025em`,
  `text-wrap: balance`. `h1` goes heavier: weight `800`, `-0.032em`.
- `p` — `text-wrap: pretty`.
- Mono is for **micro-labels only** — roles, eyebrows, "read more", metadata —
  at roughly `0.72`–`0.78rem`, uppercase for actions.

### Spacing & shape

| Token | Value | Use |
|---|---|---|
| `--container` | `1160px` | `.container` (also `--wide` 1320px, `--narrow` 760px) |
| `--gap` | `clamp(1.5rem, 1rem + 2vw, 2.75rem)` | grid/flex gutters |
| `--radius` | `18px` | cards, modals, media |
| `--radius-sm` | `10px` | small inline media, chips |

Buttons are pills (`border-radius: 999px`) — that is deliberate and is the only
place a hard-coded radius is correct. Section rhythm comes from `.section`
(`padding-block: clamp(58px, 8vw, 116px)`). Prefer `clamp(min, preferred, max)`
for anything that should breathe across viewports.

**Rule of thumb:** if you're typing a hex code, a `px` font-size or a one-off
margin, stop and check whether a token or utility class already covers it.

---

## 2. Reuse the shared building blocks

Before writing custom CSS, use what exists:

- **Buttons**: `.btn` + `.btn--primary` / `.btn--ghost` / `.btn--sm`. New interactive
  controls should borrow the ghost treatment — hairline border, hover → `--accent`
  border + `--accent-text`.
- **Cards**: `.surface-card` — `--surface` + 1px `--hairline` + `--radius`.
- **Section kickers**: `.eyebrow` — mono, uppercase, `0.14em` tracking, 1.6rem accent
  rule via `::before` (`.eyebrow--plain` drops the rule).
- **Intro copy**: `.lead`.
- **Layout**: `.container`, `.section`, `.stack`. Never set your own page padding.

Component-local styles go in that component's `<style>` block (Astro scopes them
automatically). Shared patterns go in `global.css`. Don't duplicate a global pattern
locally.

---

## 3. Design principles this project follows

Verified conventions, not aspirations — each one is already in the codebase:

- **One accent, used sparingly.** Monochrome paper/ink base plus a single violet.
  Colour earns attention; don't spread it around.
- **Tight, confident headings.** `letter-spacing: -0.025em` and `text-wrap: balance`
  on headings (`-0.032em` on `h1`); `text-wrap: pretty` on paragraphs.
- **Readable measure.** Body copy capped around 42–54ch, `--muted` for calm.
- **Alternating rhythm** on repeated rows so long pages don't feel monotonous —
  see `.svc:nth-child(even)` in `src/pages/clients.astro:93`.
- **Soft depth, not heavy boxes.** Long low-opacity shadows and 1px hairlines
  instead of thick outlines.
- **Accent glow** is the signature motif: an absolutely-positioned `blur(28px)`
  radial gradient of `--accent` at low opacity, `pointer-events: none`, behind the
  content (`z-index: 0`, content at `1`). See `PageHero.astro`, `index.astro`,
  and the bio modal in `team.astro`.
- **Motion is a subtle enhancement.** Hover lifts of `translateY(-3px)`/`(-4px)`,
  transitions `.15s`–`.16s ease`, entrances `.22s`. Never bounce. Cross-page
  navigation uses the native View Transitions API (`@view-transition` in
  `global.css`, opt-in only under `prefers-reduced-motion: no-preference`);
  the accent glows drift on scroll via the `.glow-drift` class (CSS
  scroll-driven animation, `@supports`-guarded).
- **Portraits are 4:5 rectangles** with `--radius` on cards, `--radius-sm` inline.
  **There are no circular images anywhere on this site** — don't introduce one.
- **Responsive by construction.** `clamp()` for fluid type and space; grids collapse
  at the breakpoints already in use (900px is the most common; the team grid steps
  4 → 3 → 2 at 860px and 620px). The body must never scroll horizontally.

---

## 4. Non-negotiables (accessibility & robustness)

- **Contrast meets WCAG AA.** Use `--accent-text` for small violet text on light
  backgrounds, not the brighter `--accent`.
- **Keyboard & focus.** Never remove focus outlines; keep a visible `:focus-visible`
  style (`global.css:125`) and keep the skip-link working (`global.css:206`).
- **Dark mode is not optional.** Every colour comes from a token so both theming
  paths keep working. Dark is defined **twice** and both must stay in sync:
  - `@media (prefers-color-scheme: dark)` → `global.css:49` (OS preference)
  - `:root[data-theme="dark"]` → `global.css:69` (header toggle)
- **Reduced motion.** All animation must be disabled under
  `@media (prefers-reduced-motion: reduce)` — handled globally at `global.css:236`.
  Don't add motion that bypasses it.
- **Semantics & alt text.** Correct heading order, real `alt`, lists are lists.
  External links: `target="_blank" rel="noopener"`.
- **Images.** Always set `width`/`height` (prevents layout shift) and
  `loading="lazy"` below the fold.
- **Keep JavaScript minimal and progressive.** The site ships almost none. Prefer
  native elements (`<dialog>`, `<details>`) over scripted equivalents.
- **No external CDNs** for fonts or scripts — self-host, so the site stays fast and private.

---

## 5. Gotchas that have already bitten

- **`* { margin: 0 }`** in the reset (`global.css:88`) kills `<dialog>`'s default
  centring. Any modal needs an explicit `margin: auto`.
- **The dev server can serve stale CSS.** If a new class appears to have *no* styles
  at all, restart `npm run dev` before debugging the CSS — and check the port it
  printed, since it picks 4322+ when 4321 is taken.
- **Astro scopes `<style>` per file.** Styles in a `.astro` file only reach that
  file's own markup.
- **Two dark-mode blocks.** Adding a token to only one produces a bug that appears
  solely for users on the other path.

---

## 6. Content lives in data, not markup

| To change | Edit |
|---|---|
| Page copy | the matching file in `src/pages/` |
| A project | a `.md` in `src/content/projects/` |
| A team member (incl. `bio`) | `src/data/team.json` |
| An image | drop in `public/images/`, reference `/images/…` (see `ASSETS.md`) |

Team bios are optional. A member with a `bio` field automatically gets a "Read more"
button that opens the accessible bio modal; blank lines (`\n\n`) in the string become
separate paragraphs. Don't add per-person markup to `team.astro`.

---

## 7. Workflow for every change

1. **Read the tokens and one sibling file first** (§0). Match the surrounding code's
   naming, comment density and idiom.
2. **Make the smallest change that fully solves it.** Don't restyle unrelated areas
   or refactor for taste unless asked.
3. **Reuse tokens and shared classes** (§1–2). Add new CSS only when nothing fits,
   and put it at the right scope.
4. **Build it** — `npm run build` must pass; it typechecks the `.astro` files.
5. **Actually look at it.** Run `npm run dev` and view the change in **both** themes
   and at a narrow viewport. Don't assume compiling means working.
6. **Report honestly.** What changed, where (with file paths), what you verified,
   and what you deliberately left alone.

---

## 8. Skills and commands

Claude Code loads "skills" — packaged instruction sets — for specific kinds of work.
**Verified available in this install:**

| Skill | Use it for | Trigger |
|---|---|---|
| `/run` | Launch and drive the app to see a change in the real UI | "run it", "show me", "does it work" |
| `/dataviz` | **Any** chart, graph, dashboard, stat tile or plot. Load it *before* writing the first line of chart code | "chart", "graph", "dashboard", "visualize", "heatmap" |
| `/artifact-design` | Design fundamentals — hierarchy, type, spacing, colour restraint, light/dark. Scoped to standalone published Artifacts, but the fundamentals transfer | Designing a page or section from scratch |
| `/simplify` | Review the diff for reuse, simplification and efficiency, then apply fixes. Quality only — it does not hunt for bugs | After a feature is built |
| `/code-review` | Review the working diff for correctness bugs | Before committing something non-trivial |
| `/security-review` | Security review of pending changes on the branch | Before shipping anything handling input |
| `/init` | Regenerate this file from the current codebase | This file has drifted badly |

**There is no `/verify` skill in this install** — verification is step 5 of §7, done
with `/run` plus your own eyes. Ask *"what skills are available?"* to see the current
set, since it varies by install and by what's in `.claude/skills/`.

You can also describe the task and let Claude pick the matching skill, or name it
directly: *"use the artifact-design skill and redo this landing section."*

---

## 9. Keeping this file current

This file is only useful while it matches reality. Update it when:

- A **token is added, renamed or removed** in `global.css` → update the tables in §1.
- A **token's value changes** → the hexes and `clamp()`s in §1 are a snapshot and
  will silently go stale. Re-sync them, then re-run the check below.
- A **new shared class** lands in `global.css` → add it to §2, so it gets reused
  instead of reinvented.
- A **gotcha costs more than ten minutes** → add it to §5. That section is the
  highest-value part of this file; every entry is time someone else won't lose.
- A **line reference goes stale** → the `file:line` pointers here and in §10 are the
  first thing to rot. Re-check them with a grep after any large edit to `global.css`:
  ```bash
  grep -nE '^:root \{|^\.btn \{|^\.eyebrow \{|^\.container \{' src/styles/global.css
  ```

**Check the palette snapshot against the CSS** — catches drift in §1 and, more
importantly, catches the two dark-mode blocks falling out of sync:

```bash
python - <<'PY'
import re
css = open('src/styles/global.css', encoding='utf-8').read()
doc = open('CLAUDE.md', encoding='utf-8').read()

def block(pat):
    i = re.search(pat, css, re.M).start(); depth = 0; j = i
    while True:
        if css[j] == '{': depth += 1
        elif css[j] == '}':
            depth -= 1
            if depth == 0: return css[i:j]
        j += 1

toks = lambda b: {m[0]: m[1].strip() for m in re.findall(r'(--[\w-]+):\s*([^;]+);', b)}
light = toks(block(r'^:root \{'))
dark  = toks(block(r'^:root\[data-theme="dark"\] \{'))
osdark= toks(block(r'^@media \(prefers-color-scheme: dark\) \{'))

drift = {k for k in dark if k in osdark and dark[k] != osdark[k]} | (set(dark) ^ set(osdark))
print('dark blocks in sync:', not drift, drift or '')
print('tokens documented:', len([k for k in light if k in doc]), 'of', len(light))
stale = {h.upper() for h in re.findall(r'#[0-9A-Fa-f]{6}', doc)} - \
        {h.upper() for h in re.findall(r'#[0-9A-Fa-f]{6}', css)}
print('hexes in doc not in css:', stale - {'#F5F5F5', '#181818'} or 'none')
PY
```

`#F5F5F5` and `#181818` are excluded on purpose — they appear in §1 only as
counter-examples of neutrals you should *not* substitute for the warm greys.

Fast ways to do it:

- Type `#` in Claude Code followed by the rule, to append it to memory.
- Run `/init` to regenerate this file from the codebase, then re-add §3–§5 and §8–§9
  by hand — `/init` documents structure, not conventions or hard-won gotchas.
- Ask Claude directly: *"update CLAUDE.md — I added a `--surface-3` token."*

---

## 10. References

**Anchors in this repo** (re-verify with grep after a large refactor):

| What | Where |
|---|---|
| Token definitions (light) | `src/styles/global.css:9` |
| Dark theme — OS preference | `src/styles/global.css:49` |
| Dark theme — manual toggle | `src/styles/global.css:69` |
| Global reset (`* { margin: 0 }`) | `src/styles/global.css:88` |
| Heading treatment | `src/styles/global.css:112` |
| `:focus-visible` | `src/styles/global.css:125` |
| `.container` | `src/styles/global.css:132` |
| `.section` | `src/styles/global.css:141` |
| `.eyebrow` | `src/styles/global.css:150` |
| `.lead` | `src/styles/global.css:170` |
| `.btn` | `src/styles/global.css:176` |
| `.surface-card` | `src/styles/global.css:199` |
| Skip link | `src/styles/global.css:206` |
| Scroll reveal (`[data-reveal]`) | `src/styles/global.css:223`, observer in `BaseLayout.astro:63` |
| Reduced-motion override | `src/styles/global.css:236` |
| Accent glow pattern | `src/components/PageHero.astro:44` |
| Alternating rows | `src/pages/services.astro:93` |
| Modal pattern (`<dialog>`) | `src/pages/team-3.astro` |
| Image inventory | `ASSETS.md` |
| Deploy, and DNS rollback to Wix | `README.md` |

**External docs:**

- Astro — https://docs.astro.build (scoped styles, content collections, `astro build`)
- MDN `<dialog>` — https://developer.mozilla.org/docs/Web/HTML/Element/dialog
- MDN `color-mix()` — https://developer.mozilla.org/docs/Web/CSS/color_value/color-mix
- WCAG 2.2 contrast (AA) — https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum
- `prefers-reduced-motion` — https://developer.mozilla.org/docs/Web/CSS/@media/prefers-reduced-motion
- Claude Code memory & CLAUDE.md — https://docs.claude.com/en/docs/claude-code/memory
