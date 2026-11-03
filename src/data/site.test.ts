import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as site from "./site";

// Names that must never appear on the business site: the work section
// describes systems by kind only.
const forbidden = [
  "nova",
  "iron mountain",
  "one team anywhere",
  "stratpoint",
  "dxc",
  "bosch",
  "pulse",
  "finops",
  "hipaa",
  "zkidz",
];

function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => strings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => strings(v, out));
  return out;
}

const everyString = strings(site);

// The drawn app screens keep their sample data next to their markup, so
// the same name rules apply to the component and drawing sources.
function sources(dir: string, out: { file: string; text: string }[] = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) sources(path, out);
    else if (/\.(astro|ts)$/.test(entry.name)) out.push({ file: path, text: readFileSync(path, "utf8") });
  }
  return out;
}
const drawings = [...sources("src/components"), ...sources("src/lib")];

describe("copy rules", () => {
  it("has no em or en dashes", () => {
    const dash = new RegExp("[" + String.fromCharCode(0x2014, 0x2013) + "]");
    const hits = everyString.filter((s) => dash.test(s));
    expect(hits).toEqual([]);
  });

  it("names no real client, product, or app", () => {
    const hits = everyString.filter((s) => forbidden.some((f) => s.toLowerCase().includes(f)));
    expect(hits).toEqual([]);
  });

  it("names no real client, product, or app in the drawn sample screens", () => {
    expect(drawings.length, "component sources found").toBeGreaterThan(15);
    const hits = drawings.flatMap(({ file, text }) =>
      forbidden.filter((f) => new RegExp(`\\b${f}\\b`, "i").test(text)).map((f) => `${file}: ${f}`),
    );
    expect(hits).toEqual([]);
  });

  it("uses no emoji", () => {
    const hits = everyString.filter((s) => /\p{Extended_Pictographic}/u.test(s));
    expect(hits).toEqual([]);
  });
});

describe("structure", () => {
  it("has unique ids", () => {
    for (const list of [site.services, site.work, site.packages]) {
      const ids = list.map((x) => x.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("gives every service a unique slug and sane seo lengths", () => {
    const slugs = site.services.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of site.services) {
      expect(s.slug).toMatch(/^[a-z0-9-]+$/);
      expect(s.seoTitle.length, s.seoTitle).toBeLessThanOrEqual(60);
      expect(s.seoDescription.length, s.seoDescription).toBeGreaterThanOrEqual(100);
      expect(s.seoDescription.length, s.seoDescription).toBeLessThanOrEqual(165);
      expect(s.intro.length).toBeGreaterThanOrEqual(2);
      expect(s.examples.length).toBeGreaterThanOrEqual(3);
      expect(s.faq.length).toBeGreaterThanOrEqual(3);
    }
    expect(site.SITE.description.length).toBeLessThanOrEqual(160);
  });

  it("gives every service at least three bullets", () => {
    site.services.forEach((s) => expect(s.includes.length).toBeGreaterThanOrEqual(3));
  });

  it("only picks project types the form offers", () => {
    const types = site.contact.projectTypes;
    site.services.forEach((s) => expect(types, s.id).toContain(s.formType));
    site.packages.forEach((p) => p.formType && expect(types, p.id).toContain(p.formType));
  });

  it("has one figure per hero proof point and four track record figures", () => {
    expect(site.hero.proof).toHaveLength(3);
    expect(site.stats).toHaveLength(4);
  });

  it("points every nav link at an in-page anchor", () => {
    site.NAV.forEach((n) => expect(n.href).toMatch(/^#[a-z-]+$/));
  });
});

describe("contact links", () => {
  const byId = (id: site.ChannelId) => site.channels.find((c) => c.id === id)!;

  it("publishes no phone number anywhere", () => {
    const hits = everyString.filter((s) => /(\+63|\b09|\b639)\s?\d{2,3}\s?\d{3}\s?\d{4}/.test(s));
    expect(hits).toEqual([]);
  });

  it("uses a public calendly booking url", () => {
    expect(byId("calendly").href).toMatch(/^https:\/\/calendly\.com\/[\w-]+\/[\w-]+$/);
  });

  it("hides messenger until a page link exists", () => {
    const m = byId("messenger");
    if (m.value) expect(m.href).toMatch(/^https:\/\/m\.me\/[\w.]+$/);
    else expect(m.href).toBe("");
  });
});
