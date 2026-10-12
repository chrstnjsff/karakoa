// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://karakoa.dev',
  integrations: [
    // The form thank-you page is a landing for the no-JS submit path only.
    sitemap({ filter: (page) => !page.includes('/contact/thanks') }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
