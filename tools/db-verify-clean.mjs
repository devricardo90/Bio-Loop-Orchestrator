import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { loadLocalEnv } from "./local-env.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = loadLocalEnv(rootDir);
const apiDir = path.join(rootDir, "apps", "api");
const commands = [
  ["exec", "prisma", "migrate", "reset", "--force", "--skip-generate", "--skip-seed", "--schema", "prisma/schema.prisma"],
  ["exec", "prisma", "migrate", "deploy", "--schema", "prisma/schema.prisma"],
  ["exec", "node", "prisma/seed.mjs"]
];

for (const args of commands) {
  const result = runPnpm(args, { cwd: apiDir, env });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
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
