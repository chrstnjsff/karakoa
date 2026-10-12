# Karakoa site

Business website for Karakoa (karakoa.dev), a founder-led software studio.
Astro 7 static site, Tailwind v4 (CSS-first tokens in `src/styles/global.css`), self-hosted Fontsource fonts, deployed as a Cloudflare Worker with static assets only.

## Where things live

- All copy: `src/data/site.ts`. Sections take their slice as props; `src/pages/index.astro` is the only importer.
- Layout and head: `src/layouts/Base.astro`. Theme is a `.dark` class on `<html>`, set before first paint.
- Sections: `src/components/sections/*.astro`.
- Contact form: `src/components/ContactForm.astro` + `src/scripts/contact.ts` (Web3Forms, works with and without JS).
- Brand sources: `src/assets/brand/*.png`; derived icons and the share image are built by `npm run brand` into `public/`.

## Rules

- No em dashes anywhere (code, copy, docs). `npm run lint:dash` fails the build if one slips in.
- Never name real clients, products, or apps in the work section; describe the kind of system only. `npm test` carries a deny-list.
- No fabricated reviews, metrics, or testimonials.
- Commits carry no `Co-Authored-By` line. Pull requests carry no "Generated with Claude Code" footer.
- Plan work in `tasks/todo.md` (gitignored) before building; record lessons in `tasks/lessons.md`.
- Dev server: `npm run dev`. Full gate: `npm run verify`, then `npm run test:e2e` against `npm run preview`.

## Deploy

Workers Builds (personal Cloudflare account) builds `main` with `npm run build` and deploys with `npx wrangler deploy`.
The Worker name `karakoa` in `wrangler.jsonc` must match the dashboard. Non-production branch builds are off; merge to `main` is the deploy.
