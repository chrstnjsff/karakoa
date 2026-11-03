import { expect, test, type Page } from "@playwright/test";
import { NAV, channels, contact, hero, services, techStack } from "../src/data/site";

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

    for (const item of [...NAV, { href: "#contact", label: "Contact" }]) {
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
      const link = page.locator(`#contact a[href="${c.href}"]`).first();
      if (c.value && c.href) await expect(link, `${c.label} link`).toBeVisible();
      else await expect(page.getByText(c.label, { exact: true })).toHaveCount(0);
    }
  });

  test("every booking button opens Calendly in a new tab", async ({ page }) => {
    await page.goto("/");
    const calendly = channels.find((c) => c.id === "calendly")!.href;
    const links = page.locator(`a[href="${calendly}"]`);
    expect(await links.count()).toBeGreaterThanOrEqual(3);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  });

  test("shows the time in Manila", async ({ page, isMobile }) => {
    test.skip(isMobile, "the clock shows from 1024px");
    await page.goto("/");
    await expect(page.locator("[data-clock]")).toHaveText(/^Manila \d{1,2}:\d{2} (AM|PM)$/);
  });
});

// Stand-in for Cloudflare Turnstile that hands back a token at once, so the
// tests never depend on Cloudflare's challenge page.
async function fakeTurnstile(page: Page) {
  await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js*", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: "window.turnstile = { render(el, o) { setTimeout(() => o.callback('test-token'), 10); return 'w1'; }, reset() {} };",
    }),
  );
}

async function fillForm(page: Page, type = "Website") {
  await page.getByLabel("Name", { exact: true }).fill("Test Person");
  await page.getByLabel("Email", { exact: true }).fill("test@example.com");
  await page.getByLabel("Project type").selectOption(type);
  await page.getByLabel("Message", { exact: true }).fill("Checking the form end to end.");
}

test.describe("message form", () => {
  test("empty submit shows inline errors without a network call", async ({ page }) => {
    let posted = false;
    page.on("request", (req) => {
      if (req.url().includes("/api/contact")) posted = true;
    });
    await fakeTurnstile(page);
    await page.goto("/#message");
    await settle(page);
    await page.getByRole("button", { name: "Send message" }).click();
    for (const id of ["msg-name", "msg-email", "msg-type", "msg-body"]) {
      await expect(page.locator(`#${id}-error`)).toBeVisible();
      await expect(page.locator(`#${id}`)).toHaveAttribute("aria-invalid", "true");
    }
    await expect(page.locator("#msg-name")).toBeFocused();
    expect(posted).toBe(false);
  });

  test("a valid message goes to the Worker with a Turnstile token, and success takes focus", async ({ page }) => {
    let body: Record<string, string> = {};
    await fakeTurnstile(page);
    await page.route("**/api/contact", async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ json: { ok: true } });
    });
    await page.goto("/#message");
    await settle(page);
    await fillForm(page);
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByRole("heading", { name: "Message sent" })).toBeFocused();
    expect(body).toMatchObject({
      name: "Test Person",
      email: "test@example.com",
      service: "Website",
      "cf-turnstile-response": "test-token",
    });
    expect(body).not.toHaveProperty("botcheck");
  });

  test("a field the server refuses is flagged inline", async ({ page }) => {
    await fakeTurnstile(page);
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 422, json: { ok: false, error: "Check the highlighted fields.", fields: { email: "Enter an email address like name@example.com." } } }),
    );
    await page.goto("/#message");
    await settle(page);
    await fillForm(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.locator("#msg-email-error")).toHaveText("Enter an email address like name@example.com.");
    await expect(page.locator("#msg-email")).toBeFocused();
    await expect(page.locator("[data-success]")).toBeHidden();
  });

  test("a failed send explains itself and offers the email address", async ({ page }) => {
    await fakeTurnstile(page);
    await page.route("**/api/contact", (route) => route.abort());
    await page.goto("/#message");
    await settle(page);
    await fillForm(page, "Consultation");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("alert")).toContainText("could not be sent");
    await expect(page.getByRole("alert").getByRole("link")).toHaveAttribute("href", "mailto:hello@karakoa.dev");
    await expect(page.locator("[data-success]")).toBeHidden();
  });

  test("a blocked spam check stops the send and says why", async ({ page }) => {
    let posted = false;
    page.on("request", (req) => {
      if (req.url().includes("/api/contact")) posted = true;
    });
    await page.route("https://challenges.cloudflare.com/**", (route) => route.abort());
    await page.goto("/#message");
    await settle(page);
    await fillForm(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("alert")).toContainText("spam check could not load");
    expect(posted).toBe(false);
  });

  test("a service card opens the form with its project type picked", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    const store = services.find((s) => s.id === "ecommerce")!;
    await page.locator(`a.svc[data-type="${store.formType}"]`).click();
    await expect(page).toHaveURL(/#message$/);
    await expect(page.getByLabel("Project type")).toHaveValue(store.formType);
    expect(contact.projectTypes).toContain(store.formType);
  });
});

test.describe("hero sample screens", () => {
  test("tabs switch screens by click and by arrow keys", async ({ page }) => {
    await page.goto("/");
    const tabs = page.getByRole("tablist", { name: "Sample screens" }).getByRole("tab");
    await expect(tabs).toHaveCount(hero.tabs.length);
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");

    await tabs.nth(2).click();
    await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#hero-panel-2")).toBeVisible();
    await expect(page.locator("#hero-panel-0")).toBeHidden();
    // Choosing a tab stops the automatic advance.
    await expect(page.locator("[data-hero-root]")).not.toHaveAttribute("data-auto");

    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(3)).toBeFocused();
    await expect(tabs.nth(3)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
  });

  test("moves on to the next screen by itself", async ({ page }) => {
    await page.goto("/");
    await page.locator("[data-window]").scrollIntoViewIfNeeded();
    // Hovering pauses the advance; keep the pointer away from the hero.
    await page.mouse.move(1, page.viewportSize()!.height - 1);
    const second = page.getByRole("tab", { name: hero.tabs[1] });
    await expect(second).toHaveAttribute("aria-selected", "true", { timeout: 10_000 });
  });

  test("holds still for reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("[data-hero-root]")).not.toHaveAttribute("data-auto");
    await expect(page.locator("#hero-panel-0")).toBeVisible();
  });

  test("tools strip lists every tool once for readers and can be paused", async ({ page }) => {
    await page.goto("/");
    const strip = page.locator("[data-marquee]");
    await expect(strip.locator("ul:not([aria-hidden]) li")).toHaveCount(techStack.items.length);
    await strip.getByRole("button", { name: "Pause the moving tools list" }).click();
    await expect(strip).toHaveAttribute("data-paused", "");
    await expect(strip.getByRole("button", { name: "Play the moving tools list" })).toBeVisible();
  });
});

test.describe("mobile menu", () => {
  test("opens, traps focus, and closes on Escape", async ({ page }) => {
    test.skip(page.viewportSize()!.width >= 768, "the menu only exists below 768px");
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
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Message sent");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");

    const res = await page.goto("/this-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  });

  test("about page renders with the founder", async ({ page }) => {
    await page.goto("/about/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("About Karakoa");
    await expect(page.getByText("Christian Josef Aquino").first()).toBeVisible();
  });

  test("faq page answers open and close", async ({ page }) => {
    await page.goto("/faq/");
    await settle(page);
    const first = page.locator("details").first();
    await first.locator("summary").click();
    await expect(first).toHaveAttribute("open", "");
    await expect(first.locator("p")).toBeVisible();
    expect(await page.locator('script[type="application/ld+json"]').allTextContents()).toContainEqual(
      expect.stringContaining('"FAQPage"'),
    );
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

  test("home, about, faq, and service pages have their own share image", async ({ page, request }) => {
    for (const path of ["/", "/about/", "/faq/", `/services/${services[0].slug}/`]) {
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
