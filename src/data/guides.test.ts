import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The same copy rules as site.test.ts, applied to the Markdown guides.
const dir = join(process.cwd(), "src", "content", "guides");
const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
const guides = files.map((f) => ({ file: f, text: readFileSync(join(dir, f), "utf8") }));

const forbidden = ["nova", "iron mountain", "one team anywhere", "stratpoint", "dxc", "bosch", "pulse", "finops", "hipaa", "zkidz"];

function field(text: string, name: string): string {
  const m = text.match(new RegExp(`^${name}: "(.*)"$`, "m"));
  return m ? m[1] : "";
}

describe("guides", () => {
  it("exist", () => {
    expect(guides.length).toBeGreaterThanOrEqual(5);
  });

  it("have no em or en dashes", () => {
    const dash = new RegExp("[" + String.fromCharCode(0x2014, 0x2013) + "]");
    expect(guides.filter((g) => dash.test(g.text)).map((g) => g.file)).toEqual([]);
  });

  it("name no real client, product, or app", () => {
    const hits = guides.filter((g) => forbidden.some((f) => g.text.toLowerCase().includes(f)));
    expect(hits.map((g) => g.file)).toEqual([]);
  });

  it("use no emoji", () => {
    const emoji = /\p{Extended_Pictographic}/u;
    expect(guides.filter((g) => emoji.test(g.text)).map((g) => g.file)).toEqual([]);
  });

  it("keep SEO fields in range", () => {
    for (const g of guides) {
      expect(field(g.text, "seoTitle").length, `${g.file} seoTitle`).toBeLessThanOrEqual(60);
      const d = field(g.text, "description").length;
      expect(d, `${g.file} description`).toBeGreaterThanOrEqual(100);
      expect(d, `${g.file} description`).toBeLessThanOrEqual(165);
    }
  });

  it("put each sentence on its own line in the body", () => {
    for (const g of guides) {
      const body = g.text.split("\n---\n")[1] ?? "";
      const bad = body
        .split("\n")
        .filter((l) => !l.startsWith("#") && !l.startsWith("-") && !l.includes(': "'))
        .filter((l) => /[a-z]\. [A-Z]/.test(l));
      expect(bad, `${g.file} has multiple sentences on one line`).toEqual([]);
    }
  });

  it("publish no phone number", () => {
    const phone = /(\+63|\b09|\b639)\s?\d{2,3}\s?\d{3}\s?\d{4}/;
    expect(guides.filter((g) => phone.test(g.text)).map((g) => g.file)).toEqual([]);
  });
});
