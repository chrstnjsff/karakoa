import { expect, test, type Page } from "@playwright/test";
import { NAV, channels, heroFilm, services, techStack } from "../src/data/site";

// Reveal animations wait for IntersectionObserver callbacks that never fire
// in a hidden automation tab; force the final state before asserting.
async function settle(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
  });
}

test.describe("landing page", () => {
  test("renders every section with no console errors or horizontal scroll", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await settle(page);

    for (const item of NAV) {
      const target = page.locator(item.href);
      await target.scrollIntoViewIfNeeded();
      await expect(target, `${item.href} is visible`).toBeVisible();
    }

    const widths = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(widths.scroll, "no horizontal overflow").toBeLessThanOrEqual(widths.client);
    expect(errors).toEqual([]);
  });

  test("shows only the contact channels that have a link", async ({ page }) => {
    await page.goto("/#contact");
    await settle(page);
    for (const c of channels) {
      const link = page.locator(`a[href="${c.href}"]`).first();
      if (c.value && c.href) await expect(link, `${c.label} link`).toBeVisible();
      else await expect(page.getByText(c.label, { exact: true })).toHaveCount(0);
    }
  });

  test("theme switch flips the dark class and persists", async ({ page, isMobile }) => {
    await page.goto("/");
    await settle(page);
    // Below xl the header switch is inert behind the open menu, so use the
    // copy inside the dialog there.
    let scope = page.locator("body");
    if (isMobile) {
      await page.getByRole("button", { name: "Open menu" }).click();
      scope = page.getByRole("dialog", { name: "Menu" });
    }
    await scope.getByRole("button", { name: "Dark theme" }).first().click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("empty form submit shows inline errors without a network call", async ({ page }) => {
    let posted = false;
    page.on("request", (req) => {
      if (req.url().includes("web3forms")) posted = true;
    });
    await page.goto("/#contact");
    await settle(page);
    await page.getByRole("button", { name: "Send project inquiry" }).click();
    await expect(page.locator("#contact-name-error")).toBeVisible();
    await expect(page.locator("#contact-name")).toBeFocused();
    expect(posted).toBe(false);
  });

  test("faq items open and close", async ({ page }) => {
    await page.goto("/#faq");
    await settle(page);
    const first = page.locator("#faq details").first();
    await first.locator("summary").click();
    await expect(first).toHaveAttribute("open", "");
    await expect(first.locator("p")).toBeVisible();
  });
});

test.describe("hero film", () => {
  test("shows one slide at a time, pauses, and jumps between slides", async ({ page }) => {
    await page.goto("/");
    const film = page.getByRole("region", { name: heroFilm.label });
    await expect(film).toBeVisible();
    await expect(film.locator("[data-slide][data-active]")).toHaveCount(1);
    await expect(film.locator("[data-slide]")).toHaveCount(heroFilm.slides.length);

    await film.getByRole("button", { name: "Pause slides" }).click();
    await expect(film).toHaveAttribute("data-paused", "");
    const clock = await film.evaluate((el) => el.querySelector("[data-seg][data-state='now'] .fill")?.getAnimations()[0]?.playState);
    expect(clock, "the slide clock stops").toBe("paused");

    const build = heroFilm.slides.findIndex((s) => s.id === "build");
    await film.locator("[data-seg]").nth(build).click();
    await expect(film.locator("[data-slide='build']")).toHaveAttribute("data-active", "");
    await expect(film.locator("[data-seg]").nth(build)).toHaveAttribute("aria-current", "step");
    expect(await film.locator("[data-slide]:not([data-active])").evaluateAll((els) => els.every((el) => (el as HTMLElement).inert))).toBe(true);

    await page.keyboard.press("ArrowRight");
    await expect(film.locator(`[data-slide='${heroFilm.slides[build + 1].id}']`)).toHaveAttribute("data-active", "");

    await film.getByRole("button", { name: "Play slides" }).click();
    await expect(film).not.toHaveAttribute("data-paused", "");
  });

  test("moves on to the next slide by itself", async ({ page }) => {
    await page.goto("/");
    // Below the fold (phones) the film holds still until it is seen.
    await page.locator("[data-film]").scrollIntoViewIfNeeded();
    const second = page.locator(`[data-slide='${heroFilm.slides[1].id}']`);
    await expect(second).toHaveAttribute("data-active", "", { timeout: heroFilm.slides[0].ms + 3000 });
  });

  test("starts paused when the reader asks for reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const film = page.getByRole("region", { name: heroFilm.label });
    await expect(film.getByRole("button", { name: "Play slides" })).toBeVisible();
    await expect(film).toHaveAttribute("data-paused", "");
  });

  test("tools strip lists every tool once for readers and can be paused", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    const strip = page.locator("[data-marquee]");
    await expect(strip.locator("ul:not([aria-hidden]) li")).toHaveCount(techStack.items.length);
    await strip.getByRole("button", { name: "Pause the moving tools list" }).click();
    await expect(strip).toHaveAttribute("data-paused", "");
    await expect(strip.getByRole("button", { name: "Play the moving tools list" })).toBeVisible();
  });
});

test.describe("mobile menu", () => {
  test("opens, traps focus, and closes on Escape", async ({ page, isMobile }) => {
    test.skip(!isMobile, "menu only exists below xl");
    await page.goto("/");
    await settle(page);
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });
});

test.describe("utility pages", () => {
  test("thanks page and 404 render and are noindex", async ({ page }) => {
    await page.goto("/contact/thanks/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Inquiry sent");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");

    const res = await page.goto("/this-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  });

  test("about page renders with the founder", async ({ page }) => {
    await page.goto("/about/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("About Karakoa");
    await expect(page.getByText("Christian Josef Aquino")).toBeVisible();
  });

  test("every service page renders its own title, h1, and faq", async ({ page }) => {
    for (const s of services) {
      await page.goto(`/services/${s.slug}/`);
      await expect(page).toHaveTitle(s.seoTitle);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(s.heading);
      await expect(page.locator("details")).toHaveCount(s.faq.length);
    }
  });

  test("guides index and every guide render with their share image", async ({ page, request }) => {
    await page.goto("/guides/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Capstone and thesis guides");
    const links = await page.locator("ol a.link-ul").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href")));
    expect(links.length).toBeGreaterThanOrEqual(5);
    for (const href of links) {
      await page.goto(href!);
      await expect(page.getByRole("heading", { level: 1 })).not.toBeEmpty();
      const og = await page.locator('meta[property="og:image"]').getAttribute("content");
      expect(og).toContain("/og/guide-");
      const res = await request.get(new URL(og!).pathname);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");
    }
  });

  test("home, about, and service pages have their own share image", async ({ page, request }) => {
    for (const path of ["/", "/about/", `/services/${services[0].slug}/`]) {
      await page.goto(path);
      const og = await page.locator('meta[property="og:image"]').getAttribute("content");
      expect(og).toMatch(/\/og\/[a-z0-9-]+\.png$/);
      const res = await request.get(new URL(og!).pathname);
      expect(res.status()).toBe(200);
    }
  });

  test("privacy page renders", async ({ page }) => {
    await page.goto("/privacy/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("How we handle");
  });
});
