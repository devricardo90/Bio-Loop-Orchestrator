import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export function loadLocalEnv(rootDir) {
  const envFiles = [
    path.join(rootDir, ".env.example"),
    path.join(rootDir, ".env"),
    path.join(rootDir, ".env.local"),
    path.join(rootDir, "apps", "api", ".env"),
    path.join(rootDir, "apps", "web", ".env.local")
  ];

  const loaded = {};

  for (const envFile of envFiles) {
    if (!existsSync(envFile)) {
      continue;
    }

    const content = readFileSync(envFile, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const separatorIndex = line.indexOf("=");
      if (separatorIndex < 1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      let value = line.slice(separatorIndex + 1).trim();
      if (
        ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) &&
        value.length >= 2
      ) {
        value = value.slice(1, -1);
      }

      loaded[key] = value;
    }
  }

  return {
    ...loaded,
    ...process.env
  };
}
