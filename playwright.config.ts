import { defineConfig, devices } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = __dirname;
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const env = loadLocalEnv(repoRoot);
const appUrl = "http://localhost:3101";
const apiUrl = "http://localhost:4101";
const e2eEnv = {
  ...env,
  PORT: "4101",
  APP_URL: appUrl,
  API_URL: apiUrl,
  NEXT_PUBLIC_API_URL: apiUrl,
  ALLOWED_ORIGINS: appUrl,
  DATABASE_URL: "postgresql://bio_loop:bio_loop_dev@localhost:15432/bio_loop",
  REDIS_URL: "redis://localhost:16379"
};

export default defineConfig({
  testDir: path.join(repoRoot, "tests", "e2e"),
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000
  },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: appUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  globalTeardown: path.join(repoRoot, "tests", "e2e", "global-teardown.ts"),
  webServer: [
    {
      command: `docker compose -f docker-compose.e2e.yml up -d --wait postgres redis && ${pnpmCommand} --filter @bio-loop/api prisma:generate && ${pnpmCommand} --filter @bio-loop/api exec prisma migrate deploy --schema prisma/schema.prisma && node apps/api/prisma/seed.mjs && ${pnpmCommand} --filter @bio-loop/api build && ${pnpmCommand} --filter @bio-loop/api start`,
      url: `${apiUrl}/health`,
      cwd: repoRoot,
      timeout: 240_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        ...e2eEnv
      }
    },
    {
      command: `${pnpmCommand} --filter @bio-loop/web exec next dev --hostname localhost --port 3101`,
      url: `${appUrl}/login`,
      cwd: repoRoot,
      timeout: 120_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        ...e2eEnv,
        NEXT_TELEMETRY_DISABLED: "1"
      }
    }
  ],
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ]
});

function loadLocalEnv(root: string) {
  const envPath = existsSync(path.join(root, ".env")) ? path.join(root, ".env") : path.join(root, ".env.example");
  const content = readFileSync(envPath, "utf8");
  const entries = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map((line) => {
      const separatorIndex = line.indexOf("=");
      const key = separatorIndex >= 0 ? line.slice(0, separatorIndex).trim() : line;
      const value = separatorIndex >= 0 ? line.slice(separatorIndex + 1).trim() : "";
      return [key, value] as const;
    });

  return Object.fromEntries(entries);
}
