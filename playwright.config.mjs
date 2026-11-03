import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL: "http://127.0.0.1:4173/",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        permissions: ["camera", "microphone"],
        launchOptions: { args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", "--autoplay-policy=no-user-gesture-required", "--auto-select-desktop-capture-source=Entire screen", "--enable-usermedia-screen-capturing"] },
      },
    },
    {
      // Safari's engine (the founder tests on a Mac): public pages, registration and both sign-ins must boot and
      // work there too. The live-class flow stays Chromium-only because its fake camera/screen flags are Chromium's.
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
      grep: /public site|registration pays|protected areas|preview shortcuts|course material/,
    },
  ],
  webServer: {
    command: "node tests/serve.mjs",
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
