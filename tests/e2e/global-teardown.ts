import { execFileSync } from "node:child_process";
import path from "node:path";

export default async function globalTeardown() {
  const repoRoot = path.resolve(__dirname, "..", "..");
  execFileSync("docker", ["compose", "-f", "docker-compose.e2e.yml", "down", "-v"], {
    cwd: repoRoot,
    stdio: "inherit"
  });
}
