import { mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { NAV, services } from "../src/data/site";

// Rendering checks for every page on every device in
// playwright.devices.config.ts. Run with `npm run test:devices`.

const guides = readdirSync(new URL("../src/content/guides", import.meta.url))
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.replace(/\.md$/, ""))
  .sort();

const MISSING = "/does-not-exist/";
const PATHS = [
  "/",
  "/about/",
  "/privacy/",
  "/contact/thanks/",
  "/guides/",
  ...guides.map((g) => `/guides/${g}/`),
  ...services.map((s) => `/services/${s.slug}/`),
  MISSING,
];

// The mobile menu replaces the inline nav below Tailwind's xl breakpoint.
const XL = 1280;

/** Scroll top to bottom so lazy images load and reveals run, then show every reveal and wait for it to finish. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30)));
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) {
      window.scrollTo({ top: y, behavior: "instant" });
      await frame();
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    // A transition replaced mid-flight rejects its promise; that is fine.
    const done = Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {})));
    await Promise.race([done, new Promise((r) => setTimeout(r, 2000))]);
  });
}

/** Wait until smooth scrolling has stopped. */
async function scrollStops(page: Page) {
  let last = -1;
  await expect
    .poll(
      async () => {
        const y = await page.evaluate(() => scrollY);
        const still = y === last;
        last = y;
        return still;
      },
      { intervals: [150], timeout: 5000 },
    )
    .toBe(true);
}

/** Fully on screen, at least 24x24, and the topmost element at its center. */
async function expectTappable(target: Locator) {
  await target.scrollIntoViewIfNeeded();
  const name = (await target.getAttribute("aria-label")) ?? (await target.innerText()).trim();
  const hit = await target.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return {
      r: { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height },
      vw: document.documentElement.clientWidth,
      vh: innerHeight,
      onTop: !!top && el.contains(top),
    };
  });
  expect(hit.r.left, `"${name}" left edge on screen`).toBeGreaterThanOrEqual(-0.5);
  expect(hit.r.right, `"${name}" right edge on screen`).toBeLessThanOrEqual(hit.vw + 0.5);
  expect(hit.r.top, `"${name}" top edge on screen`).toBeGreaterThanOrEqual(-0.5);
  expect(hit.r.bottom, `"${name}" bottom edge on screen`).toBeLessThanOrEqual(hit.vh + 0.5);
  expect(hit.r.width, `"${name}" width`).toBeGreaterThanOrEqual(24);
  expect(hit.r.height, `"${name}" height`).toBeGreaterThanOrEqual(24);
  expect(hit.onTop, `"${name}" is not covered`).toBe(true);
}

/** Top of the heading inside `#id`, and the bottom of the sticky header. */
async function headingVsHeader(page: Page, id: string) {
  return page.evaluate((id) => {
    const target = document.getElementById(id)!;
    const heading = target.matches("h1, h2, h3") ? target : target.querySelector("h2, h3")!;
    return {
      heading: heading.getBoundingClientRect().top,
      header: document.querySelector("body > header")!.getBoundingClientRect().bottom,
      vh: innerHeight,
    };
  }, id);
}

/**
 * Layout audit, run inside the page. Returns one line per problem:
 * elements past the screen edge or spilling out of their parent, text
 * under 12px, form fields under 16px (iOS zooms into those), squeezed or
 * cramped button labels, tap targets under 24x24 (WCAG 2.2 AA 2.5.8,
 * with its inline and spacing exceptions), short words stranded alone on
 * a heading line, and words glued to a link.
 */
function audit() {
  const problems: string[] = [];
  const vw = document.documentElement.clientWidth;
  const css = (el: Element) => getComputedStyle(el);

  const describe = (el: Element) => {
    const parts: string[] = [];
    for (let e: Element | null = el; e && e !== document.body && parts.length < 4; e = e.parentElement) {
      let s = e.tagName.toLowerCase();
      if (e.id) {
        parts.unshift(`${s}#${e.id}`);
        break;
      }
      const cls = [...e.classList].slice(0, 3).join(".");
      if (cls) s += `.${cls}`;
      parts.unshift(s);
    }
    const text = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
    return `${parts.join(" > ")}${text ? ` "${text}"` : ""}`;
  };

  // Visible to a sighted user: rendered, not transparent, not visually hidden (sr-only).
  const shown = (el: Element) => {
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
    const r = el.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return false;
    for (let e: Element | null = el; e; e = e.parentElement) {
      if (css(e).clipPath === "inset(50%)") return false;
    }
    return true;
  };

  // Inside a box that clips or scrolls its own overflow.
  const contained = (el: Element) => {
    for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      if (p === document.body) return false;
      if (css(p).overflowX !== "visible") return true;
    }
    return false;
  };

  // 1. Nothing sticks out past the left or right edge of the screen.
  const flagged: Element[] = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (flagged.some((f) => f.contains(el)) || !shown(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.right <= vw + 0.5 && r.left >= -0.5) continue;
    if (contained(el)) continue;
    flagged.push(el);
    problems.push(`past the edge (${Math.round(r.left)} to ${Math.round(r.right)} of ${vw}px): ${describe(el)}`);
  }

  // 2. Nothing spills out of its parent's content box into the page
  //    gutter (say a grid column pushed wide by a long select option).
  //    Negative margins are deliberate and skipped.
  const spilled: Element[] = [];
  for (const el of document.body.querySelectorAll("*")) {
    if (spilled.some((f) => f.contains(el)) || !shown(el)) continue;
    const s = css(el);
    const parent = el.parentElement!;
    const ps = css(parent);
    if (/^(inline|contents)$/.test(s.display) || /absolute|fixed/.test(s.position)) continue;
    if (/^(inline|contents)$/.test(ps.display) || ps.overflowX !== "visible") continue;
    const r = el.getBoundingClientRect();
    const p = parent.getBoundingClientRect();
    const left = p.left + parseFloat(ps.borderLeftWidth) + parseFloat(ps.paddingLeft);
    const right = p.right - parseFloat(ps.borderRightWidth) - parseFloat(ps.paddingRight);
    const overRight = r.right > right + 1 && parseFloat(s.marginRight) >= 0;
    const overLeft = r.left < left - 1 && parseFloat(s.marginLeft) >= 0;
    if (!overRight && !overLeft) continue;
    spilled.push(el);
    problems.push(`wider than its parent (${Math.round(r.left)} to ${Math.round(r.right)} in ${Math.round(left)} to ${Math.round(right)}): ${describe(el)}`);
  }

  // 3. Readable text: nothing visible under 12px.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const checked = new Set<Element>();
  while (walker.nextNode()) {
    const el = walker.currentNode.parentElement;
    if (!el || checked.has(el) || !walker.currentNode.textContent?.trim()) continue;
    checked.add(el);
    if (!shown(el)) continue;
    const size = parseFloat(css(el).fontSize);
    if (size < 12) problems.push(`text ${size}px: ${describe(el)}`);
  }

  // 4. Form fields at 16px or more, so iOS does not zoom in on focus.
  for (const el of document.querySelectorAll("input:not([type=hidden], [type=checkbox], [type=radio]), select, textarea")) {
    if (!shown(el)) continue;
    const size = parseFloat(css(el).fontSize);
    if (size < 16) problems.push(`field font ${size}px: ${describe(el)}`);
  }

  // 5. Wrapped labels: a button wraps only when it already spans its whole
  //    row (a long label on a narrow screen), never because neighbours
  //    squeeze it, and a wrapped label in a min-height box (buttons, menu
  //    and list links) keeps clear of the box's top and bottom edges.
  for (const el of document.querySelectorAll(".btn, button, a[href]")) {
    if (!shown(el) || css(el).display === "inline") continue;
    const lines: DOMRect[] = [];
    const texts = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (texts.nextNode()) {
      if (!texts.currentNode.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(texts.currentNode);
      lines.push(...range.getClientRects());
    }
    if (!lines.length) continue;
    const top = Math.min(...lines.map((l) => l.top));
    const bottom = Math.max(...lines.map((l) => l.bottom));
    if (bottom - top < parseFloat(css(el).fontSize) * 2) continue;
    const box = el.getBoundingClientRect();
    if (el.matches(".btn, button")) {
      const row = el.parentElement!;
      const rowWidth = row.clientWidth - parseFloat(css(row).paddingLeft) - parseFloat(css(row).paddingRight);
      if (box.width < rowWidth - 1) problems.push(`label squeezed onto two lines: ${describe(el)}`);
    }
    const minHeight = parseFloat(css(el).minHeight) || 0;
    if (minHeight > 0 && (top - box.top < 4 || box.bottom - bottom < 4)) {
      problems.push(`wrapped label touches the edge: ${describe(el)}`);
    }
  }

  // 6. Tap targets at least 24x24, unless inline in a sentence or spaced
  //    so a 24px circle on each one touches no other target.
  const targets = [
    ...document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button]"),
  ].filter(shown);
  const boxes = targets.map((el) => el.getBoundingClientRect());
  const small = (r: DOMRect) => r.width < 24 || r.height < 24;
  const inSentence = (el: Element) => {
    if (css(el).display !== "inline") return false;
    let block = el.parentElement;
    while (block && css(block).display.startsWith("inline")) block = block.parentElement;
    const own = (el.textContent ?? "").trim().length;
    return !!block && (block.textContent ?? "").trim().length > own;
  };
  targets.forEach((el, i) => {
    const r = boxes[i];
    if (!small(r) || inSentence(el)) return;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const crowded = boxes.some((o, j) => {
      if (j === i || targets[j].contains(el) || el.contains(targets[j])) return false;
      const dx = Math.max(o.left - cx, 0, cx - o.right);
      const dy = Math.max(o.top - cy, 0, cy - o.bottom);
      if (Math.hypot(dx, dy) < 12) return true;
      return small(o) && Math.hypot(o.left + o.width / 2 - cx, o.top + o.height / 2 - cy) < 24;
    });
    if (crowded) problems.push(`target ${Math.round(r.width)}x${Math.round(r.height)}px: ${describe(el)}`);
  });

  // 7. Headings never leave a short word alone on a line ("on / time.").
  for (const h of document.querySelectorAll("h1, h2, h3")) {
    if (!shown(h)) continue;
    const lines: { top: number; words: string[] }[] = [];
    const texts = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    while (texts.nextNode()) {
      const node = texts.currentNode;
      if (!shown(node.parentElement!)) continue;
      for (const m of node.textContent!.matchAll(/\S+/g)) {
        const range = document.createRange();
        range.setStart(node, m.index);
        range.setEnd(node, m.index + m[0].length);
        const top = range.getClientRects()[0]?.top;
        if (top === undefined) continue;
        const line = lines.find((l) => Math.abs(l.top - top) < 4);
        if (line) line.words.push(m[0]);
        else lines.push({ top, words: [m[0]] });
      }
    }
    if (lines.length < 2) continue;
    for (const { words } of lines) {
      if (words.length === 1 && words[0].replace(/\W/g, "").length <= 4) {
        problems.push(`lone word "${words[0]}" on a heading line: ${describe(h)}`);
      }
    }
  }

  // 8. Inline links keep their spaces ("by Web3Forms to", not "Web3Formsto");
  //    Astro drops the line break next to an element in a template.
  for (const a of document.querySelectorAll("a[href]")) {
    if (css(a).display !== "inline" || !shown(a)) continue;
    const before = a.previousSibling?.nodeType === Node.TEXT_NODE ? a.previousSibling.textContent! : "";
    const after = a.nextSibling?.nodeType === Node.TEXT_NODE ? a.nextSibling.textContent! : "";
    if (/\p{L}$/u.test(before) || /^\p{L}/u.test(after)) problems.push(`text glued to a link: ${describe(a.parentElement!)}`);
  }

  return problems;
}

for (const path of PATHS) {
  test(`renders ${path}`, async ({ page, baseURL }, testInfo) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      // The browser logs the 404 status of the missing page itself.
      if (path === MISSING && /status of 404/.test(msg.text())) return;
      errors.push(`console: ${msg.text()}`);
    });
    page.on("pageerror", (err) => errors.push(`page error: ${err.message}`));
    page.on("requestfailed", (req) => {
      if (req.url().startsWith(baseURL!)) errors.push(`failed: ${req.url()} ${req.failure()?.errorText}`);
    });
    page.on("response", (res) => {
      const expected = path === MISSING && res.request().isNavigationRequest();
      if (res.url().startsWith(baseURL!) && res.status() >= 400 && !expected) {
        errors.push(`HTTP ${res.status()}: ${res.url()}`);
      }
    });

    const res = await page.goto(path);
    expect(res?.status()).toBe(path === MISSING ? 404 : 200);

    // The sticky header sits above the H1 on load.
    const top = await page.evaluate(() => ({
      header: document.querySelector("body > header")!.getBoundingClientRect().bottom,
      h1: document.querySelector("h1")!.getBoundingClientRect().top,
    }));
    expect(top.h1, "H1 starts below the header").toBeGreaterThanOrEqual(top.header - 0.5);

    await settle(page);

    // Every image on the page has loaded.
    await expect
      .poll(() =>
        page.evaluate(() =>
          [...document.images]
            .filter((img) => img.checkVisibility() && img.getBoundingClientRect().width > 0)
            .filter((img) => !(img.complete && img.naturalWidth > 0))
            .map((img) => img.currentSrc || img.src),
        ),
      )
      .toEqual([]);

    // No sideways scrolling.
    const widths = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      layout: Math.min(innerWidth, document.documentElement.clientWidth),
    }));
    expect(widths.scroll, "no horizontal scroll").toBeLessThanOrEqual(Math.min(widths.layout, page.viewportSize()!.width));

    expect(await page.evaluate(audit)).toEqual([]);
    expect(errors).toEqual([]);

    const dir = process.env.SHOTS_DIR;
    if (dir) {
      const name = path === "/" ? "home" : path === MISSING ? "404" : path.replace(/^\/|\/$/g, "").replace(/\//g, "-");
      mkdirSync(join(dir, testInfo.project.name), { recursive: true });
      await page.screenshot({ path: join(dir, testInfo.project.name, `${name}.png`), fullPage: true, scale: "css" });
    }
  });
}

test("menu opens, every item is tappable, and it closes", async ({ page }) => {
  await page.goto("/");
  await settle(page);
  const open = page.getByRole("button", { name: "Open menu" });

  if (page.viewportSize()!.width >= XL) {
    await expect(open).toBeHidden();
    for (const link of await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link").all()) {
      await expectTappable(link);
    }
    return;
  }

  await expectTappable(open);
  await open.click();
  const dialog = page.getByRole("dialog", { name: "Menu" });
  await expect(dialog).toBeVisible();
  for (const target of await dialog.locator("a[href], button").all()) {
    await expectTappable(target);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(open).toBeFocused();

  await open.click();
  await page.getByRole("button", { name: "Close menu" }).click();
  await expect(dialog).toBeHidden();
});

test("nav links bring each section heading into view below the header", async ({ page }) => {
  await page.goto("/");
  await settle(page);
  const wide = page.viewportSize()!.width >= XL;

  for (const item of NAV) {
    if (wide) {
      await page.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link", { name: item.label, exact: true }).click();
    } else {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: item.label, exact: true }).click();
    }
    await scrollStops(page);
    const pos = await headingVsHeader(page, item.href.slice(1));
    expect(pos.heading, `${item.label} heading clears the header`).toBeGreaterThanOrEqual(pos.header - 0.5);
    expect(pos.heading, `${item.label} heading is on screen`).toBeLessThan(pos.vh);
  }
});

test("guide contents links bring each heading into view below the header", async ({ page }) => {
  await page.goto(`/guides/${guides[0]}/`);
  await settle(page);
  const links = page.getByRole("navigation", { name: "In this guide" }).getByRole("link");
  expect(await links.count()).toBeGreaterThan(0);

  for (const link of await links.all()) {
    const id = decodeURIComponent((await link.getAttribute("href"))!.slice(1));
    await link.click();
    await scrollStops(page);
    const pos = await headingVsHeader(page, id);
    expect(pos.heading, `#${id} clears the header`).toBeGreaterThanOrEqual(pos.header - 0.5);
    expect(pos.heading, `#${id} is on screen`).toBeLessThan(pos.vh);
  }
});
