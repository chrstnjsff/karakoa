# Karakoa redesign: implementation plan

Branch: `redesign-v5`.
Visual source of truth: the approved v5 mockup (single static HTML, Tailwind CDN + GSAP).
Content and integration source: this repo and the live site.

## Current architecture

- Astro 7 static site, Tailwind v4 (CSS-first tokens in `src/styles/global.css`), self-hosted Fontsource fonts.
- All copy in `src/data/site.ts`; sections in `src/components/sections/*.astro`; layout, theme, mobile menu, reveal and scroll-spy scripts in `src/layouts/Base.astro`.
- Contact: Web3Forms form (`ContactForm.astro` + `src/scripts/contact.ts`), works with and without JS; Calendly booking link.
- SEO: per-page titles and descriptions, canonical, Open Graph images generated at build (`src/lib/og.ts`), JSON-LD, sitemap, robots.
- Deploy: Cloudflare Workers Builds builds `main` and runs `wrangler deploy` (assets-only Worker `karakoa`). Branch builds are off.
- Gates: `npm run verify` (astro check, dash lint, vitest, build, html-validate, linkinator) and `npm run test:e2e` (Playwright, Chromium).

## Scope

Rebuild the home page to match the approved mockup and carry its look (navy, coral, cream, Roboto) to every other page through the shared tokens, header, and footer.

### Reuse

- Web3Forms setup and validation logic (`contact.ts`), honeypot, no-JS redirect to `/contact/thanks/`.
- Mascot rig (`MascotSvg.astro`), icon set (`Icon.astro`), founder photo, OG image pipeline, service and guide pages, JSON-LD, sitemap, headers, the mobile dialog and scroll-spy logic in `Base.astro`.

### Modify

- `global.css`: mockup tokens; existing token names (ink, muted, accent, surface) mapped onto them so the subpages restyle without rewrites.
- `site.ts`: mockup copy (hero, services, process, stats, work, founder, pricing, contact project types).
- `Header`, `SiteFooter`, `Logo`, `ContactForm`, `contact.ts`, `Base.astro`, `index.astro`, `og.ts`, privacy copy (form fields changed).

### New

- Sections: Hero (tabs + sample screens), ToolsStrip, Services (8 illustrated cards), Process (plotted course), TrackRecord, Work (6 animated thumbnails), About (founder), Pricing, NameStrip, Contact.
- `Sky.astro`: the star chart rendered at build time from a seed (no runtime DOM building).
- `/faq/` page: the FAQ leaves the home page in the mockup; it keeps its content, schema, and footer link here.
- Small scripts per concern: hero tabs, process route, service cards, header clock, shared motion helpers.

### Remove

- Hero film, Heritage, old About, Founder card, ThemeSwitch and dark mode (the approved design is a single light theme with navy fields), Fredoka and Nunito Sans.

### Decisions

- No GSAP. The mockup's motion is rebuilt with CSS transitions, SMIL, IntersectionObserver, and one small scroll handler. Same timing and easing, a fraction of the JavaScript.
- Section anchors keep the old ids (`#services`, `#process`) so existing links and breadcrumbs still work.
- Additions the mockup lacks but the brief requires: a mobile menu below 768px, footer contact and social links, GitHub and LinkedIn links in About, a pause button on the moving tools strip (WCAG 2.2.2).

## Phases

- [ ] 1. Tokens, fonts, Base, Header, Footer, Logo (subpages restyle with them)
- [ ] 2. site.ts copy and data
- [ ] 3. Home sections, static first
- [ ] 4. Motion: sky, hero tabs, reveals and counters, process route, service cards, work thumbnails
- [ ] 5. Contact form and booking
- [ ] 6. FAQ page, OG images, privacy copy, tests updated
- [ ] 7. Verify: `npm run verify`, `npm run test:e2e`, browser checks at 375, 390, 768, 1024, 1440, 1920, reduced motion, keyboard
- [ ] 8. Commit, push branch, Cloudflare preview if possible

## Verification

- Automated: the full gate above, plus e2e updated for the new page (tabs, service prefill, form validation, mobile menu, reduced motion).
- Manual in a real browser: every width listed, hover, keyboard focus, touch, reduced motion, console errors, overflow, side-by-side screenshots against the mockup.
- The form is tested up to the network call. A live submission needs the owner's go-ahead because it sends a real email.

## Deployment and rollback

- Production is `main`; nothing merges without the owner's approval.
- Preview: a non-production version on Cloudflare if it can be done without touching the live Worker, otherwise the local production build.
- Rollback: revert the merge commit on `main` (Workers Builds redeploys), or roll back to the previous version in the Cloudflare dashboard.
