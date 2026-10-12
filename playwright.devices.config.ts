import { defineConfig, devices, type Project } from "@playwright/test";

// Device matrix: every phone and tablet in Playwright's device list, plus
// newer models it lacks, each in portrait and landscape. Apple devices run
// on WebKit (Safari's engine), everything else on Chromium. Kept apart from
// playwright.config.ts so `npm run test:e2e` stays fast.
//
//   npm run test:devices                              all devices
//   npm run test:devices -- --project "iPhone SE*"    one device, both orientations
//   SHOTS_DIR=/some/dir npm run test:devices          also save full-page screenshots

type Device = (typeof devices)[string];

const IPHONE_UA = devices["iPhone 17 Pro"].userAgent;
const IPAD_UA = devices["iPad Pro 11"].userAgent;
const GALAXY_UA = devices["Galaxy S24"].userAgent;

// Models Playwright lacks, as [width, height, pixel ratio, user agent] in
// portrait CSS px. Each size is listed by at least two of ios-resolution.com,
// screensize.io, useyourloaf.com, yesviz.com, and screensizechecker.com
// (checked 2026-10-12). Heights are the full screen, not screen minus the
// browser bars, so they run taller than Playwright's own Apple entries.
const newer: Record<string, [number, number, number, string]> = {
  "iPhone 18 Pro": [402, 874, 3, IPHONE_UA],
  "iPhone 18 Pro Max": [440, 956, 3, IPHONE_UA],
  "iPhone Duo Cover": [466, 678, 3, IPHONE_UA],
  "iPhone Duo": [626, 890, 3, IPHONE_UA],
  "iPad mini (A17 Pro)": [744, 1133, 2, IPAD_UA],
  "iPad Air 11 (M3)": [820, 1180, 2, IPAD_UA],
  "iPad Air 13 (M3)": [1024, 1366, 2, IPAD_UA],
  "iPad Pro 11 (M5)": [834, 1210, 2, IPAD_UA],
  "iPad Pro 13 (M5)": [1032, 1376, 2, IPAD_UA],
  "Galaxy S25": [360, 780, 3, GALAXY_UA],
  "Galaxy S25+": [412, 891, 3.5, GALAXY_UA],
  "Galaxy S26 Ultra": [412, 891, 3.5, GALAXY_UA],
};

const isApple = (name: string) => /^(iPhone|iPad)/.test(name);

function custom(name: string, width: number, height: number, deviceScaleFactor: number, userAgent: string): Device {
  return {
    userAgent,
    viewport: { width, height },
    deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
    defaultBrowserType: isApple(name) ? "webkit" : "chromium",
  };
}

const matrix: Record<string, Device> = {};
for (const [name, device] of Object.entries(devices)) {
  if (device.isMobile) matrix[name] = device;
}
for (const [name, [w, h, scale, ua]] of Object.entries(newer)) {
  matrix[name] = custom(name, w, h, scale, ua);
  matrix[`${name} landscape`] = custom(name, h, w, scale, ua);
}

const project = (name: string, device: Device, extra: Project["use"] = {}): Project => ({
  name,
  use: { ...device, browserName: isApple(name) ? "webkit" : "chromium", ...extra },
});

const projects = Object.entries(matrix).map(([name, device]) => project(name, device));

// Dark mode on the smallest iPhone, a mid Android, an iPad, and an Android tablet.
for (const name of ["iPhone SE", "Pixel 7", "iPad Mini", "Galaxy Tab S9"]) {
  projects.push(project(`${name} dark`, matrix[name], { colorScheme: "dark" }));
}

export default defineConfig({
  testDir: "./tests",
  testMatch: "devices.spec.ts",
  fullyParallel: true,
  // Thousands of short page checks: use most cores.
  workers: "75%",
  reporter: [["dot"]],
  use: {
    baseURL: "http://localhost:4321",
  },
  webServer: {
    command: "npm run preview -- --port 4321",
    url: "http://localhost:4321",
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects,
});
