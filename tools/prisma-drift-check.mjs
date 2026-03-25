import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadLocalEnv } from "./local-env.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = loadLocalEnv(rootDir);
const shadowDatabaseUrl = env.SHADOW_DATABASE_URL ?? deriveShadowDatabaseUrl(env.DATABASE_URL);

if (!shadowDatabaseUrl) {
  console.error("SHADOW_DATABASE_URL or DATABASE_URL is required for prisma:drift");
  process.exit(1);
}

const result = runPnpm(
  [
    "exec",
    "prisma",
    "migrate",
    "diff",
    "--from-migrations",
    "prisma/migrations",
    "--to-schema-datamodel",
    "prisma/schema.prisma",
    "--shadow-database-url",
    shadowDatabaseUrl,
    "--exit-code"
  ],
  {
    cwd: path.join(rootDir, "apps", "api"),
    env
  }
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);

function deriveShadowDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    return null;
  }

  try {
    const parsed = new URL(databaseUrl);
    const pathname = parsed.pathname.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname;
    if (!pathname) {
      return null;
    }

    parsed.pathname = `/${pathname}_shadow`;
    return parsed.toString();
  } catch {
    return null;
  }
}

function runPnpm(args, options) {
  if (process.platform === "win32") {
    return spawnSync("cmd.exe", ["/d", "/s", "/c", `pnpm.cmd ${args.map(quoteArg).join(" ")}`], {
      ...options,
      stdio: "inherit"
    });
  }

  return spawnSync("pnpm", args, {
    ...options,
    stdio: "inherit"
  });
}

function quoteArg(value) {
  return /[\s"]/u.test(value) ? `"${value.replaceAll('"', '\\"')}"` : value;
}
