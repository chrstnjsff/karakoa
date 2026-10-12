import { defineConfig, devices } from "@playwright/test";

// Smoke tests run against `astro preview` (the built dist/), not the dev
// server: no HMR socket, so headless Chrome never stalls on it.
export default defineConfig({
  testDir: "./tests",
  // The device matrix has its own config: npm run test:devices.
  testIgnore: "devices.spec.ts",
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4321",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview -- --port 4321",
    url: "http://localhost:4321",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    // Chromium-only so one browser download covers every project.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    {
      name: "tablet",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true },
    },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
});
