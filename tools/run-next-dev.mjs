import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const requireFromCwd = createRequire(path.join(process.cwd(), "package.json"));
const port = process.env.WEB_PORT ?? "3001";
const nextCli = requireFromCwd.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextCli, "dev", "--port", port], {
  cwd: process.cwd(),
  stdio: "inherit"
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
