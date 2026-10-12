// Guides are Markdown files in src/content/guides. Each one is a page under
// /guides/<slug>/ and gets its own share image. The schema keeps the SEO
// fields honest; src/data/guides.test.ts checks the copy rules.
import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema: z.object({
    title: z.string(),
    /** Page title, under 60 characters. */
    seoTitle: z.string().max(60),
    /** Meta description, 100 to 165 characters. */
    description: z.string().min(100).max(165),
    /** One line under the title on the index and in the hero. */
    summary: z.string(),
    /** Who it is for, shown as the eyebrow. */
    audience: z.string(),
    updated: z.coerce.date(),
    /** Reading order on the index. */
    order: z.number().int(),
    sources: z.array(z.object({ label: z.string(), url: z.url() })),
  }),
});

export const collections = { guides };
