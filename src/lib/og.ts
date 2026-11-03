// Build-time share images: satori lays out a small card as SVG, sharp
// rasterises it to a 1200x630 PNG in the site's navy, coral, and Roboto.
// Fonts come from the static Fontsource package (satori reads woff, not
// woff2) and the mark is the app icon.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";
import { SITE } from "../data/site";

const root = process.cwd();
const font = (pkg: string, file: string) => readFileSync(join(root, "node_modules", "@fontsource", pkg, "files", file));

const fonts = [
  { name: "Roboto", data: font("roboto", "roboto-latin-600-normal.woff"), weight: 600 as const, style: "normal" as const },
  { name: "Roboto", data: font("roboto", "roboto-latin-500-normal.woff"), weight: 500 as const, style: "normal" as const },
  { name: "Roboto", data: font("roboto", "roboto-latin-400-normal.woff"), weight: 400 as const, style: "normal" as const },
];

const icon = `data:image/png;base64,${readFileSync(join(root, "src", "assets", "brand", "karakoa-app-icon.png")).toString("base64")}`;

const navy = "#0b2c44";
const white = "#ffffff";
const mist = "#a9b6c1";
const coral = "#f4704f";
const gold = "#f4d58d";

export interface OgCard {
  /** Small label above the title, for example "Guide" or "Service". */
  eyebrow: string;
  title: string;
  /** One line under the title; kept short so it never wraps past two lines. */
  line: string;
}

const h = (type: string, style: Record<string, unknown>, children?: unknown) => ({ type, props: { style, children } });

export async function renderOg(card: OgCard): Promise<Buffer> {
  const titleSize = card.title.length > 60 ? 52 : card.title.length > 40 ? 60 : 68;

  const tree = h(
    "div",
    {
      // Satori adds padding outside a fixed width, so size the root to the canvas.
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "64px 72px 56px",
      backgroundColor: navy,
      color: white,
      fontFamily: "Roboto",
    },
    [
      h("div", { display: "flex", alignItems: "center", gap: 20 }, [
        { type: "img", props: { src: icon, width: 72, height: 72, style: { borderRadius: 18 } } },
        h("div", { display: "flex", fontWeight: 600, fontSize: 40, letterSpacing: -0.4 }, [
          h("span", {}, "karakoa"),
          h("span", { color: coral, fontWeight: 400 }, ".dev"),
        ]),
      ]),
      h("div", { display: "flex", flexDirection: "column", gap: 18 }, [
        h(
          "div",
          { fontSize: 26, fontWeight: 500, color: gold },
          card.eyebrow,
        ),
        h(
          "div",
          { fontWeight: 600, fontSize: titleSize, lineHeight: 1.08, letterSpacing: -1.5, maxWidth: 1000 },
          card.title,
        ),
      ]),
      h("div", { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 40 }, [
        h("div", { fontSize: 24, color: mist, maxWidth: 820, lineHeight: 1.4 }, card.line),
        h("div", { width: 120, height: 8, borderRadius: 4, backgroundColor: coral, flexShrink: 0 }),
      ]),
    ],
  );

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}

/** The site-wide card, used by the home page and as the fallback. */
export const homeCard: OgCard = {
  eyebrow: SITE.location.label,
  title: "Websites, mobile apps, and custom systems, built in the Philippines",
  line: "Founder-led software studio. Websites, mobile apps, custom software, and capstone or thesis systems.",
};
