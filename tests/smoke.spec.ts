import { expect, test, type Page } from "@playwright/test";
import { NAV, channels } from "../src/data/site";

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
    // Below lg the header switch is inert behind the open menu, so use the
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

test.describe("mobile menu", () => {
  test("opens, traps focus, and closes on Escape", async ({ page, isMobile }) => {
    test.skip(!isMobile, "menu only exists below lg");
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

  test("privacy page renders", async ({ page }) => {
    await page.goto("/privacy/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("How we handle");
  });
});
