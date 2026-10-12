# karakoa.dev

Business website for Karakoa, a founder-led software studio in the Philippines: websites, mobile apps, custom systems, and capstone projects.

## Stack

- [Astro 7](https://astro.build), static output, no client framework
- Tailwind CSS v4 with CSS-first tokens in `src/styles/global.css`
- Fredoka and Nunito Sans, self-hosted through Fontsource
- Cloudflare Workers static assets (`wrangler.jsonc`), deployed by Workers Builds on every push to `main`

## Develop

```sh
npm install
npm run dev
```

All copy lives in `src/data/site.ts`.
Brand files in `public/` are generated from `src/assets/brand/` with `npm run brand`.

## Check

```sh
npm run verify      # types, dash lint, unit tests, build, HTML validation, link check
npm run test:e2e    # Playwright smoke at phone, tablet, and desktop widths
```
