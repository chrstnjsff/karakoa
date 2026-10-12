// One share image per page, generated at build time. Pages reference them
// as /og/<slug>.png through the Base layout's ogImage prop.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE, aboutPage, services } from "../../data/site";
import { homeCard, renderOg, type OgCard } from "../../lib/og";

export async function getStaticPaths() {
  const guides = await getCollection("guides");
  const cards: { slug: string; card: OgCard }[] = [
    { slug: "home", card: homeCard },
    {
      slug: "about",
      card: { eyebrow: "About", title: aboutPage.heading, line: "Who you work with, how we work, and why the studio is named after a ship." },
    },
    {
      slug: "guides",
      card: { eyebrow: "Guides", title: "Capstone and thesis guides for Philippine students", line: "Titles, chapters 1 to 5, defense questions, timelines, and getting help." },
    },
    ...services.map((s) => ({
      slug: `service-${s.slug}`,
      card: { eyebrow: "Service", title: s.heading, line: s.summary } satisfies OgCard,
    })),
    ...guides.map((g) => ({
      slug: `guide-${g.id}`,
      card: { eyebrow: `Guide for students, ${SITE.location.label}`, title: g.data.title, line: g.data.summary } satisfies OgCard,
    })),
  ];
  return cards.map(({ slug, card }) => ({ params: { slug }, props: { card } }));
}

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg(props.card as OgCard);
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
