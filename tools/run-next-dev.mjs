import { spawn } from "node:child_process";

const port = process.env.WEB_PORT ?? "3001";
const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const child = spawn(command, ["exec", "next", "dev", "--port", port], {
  cwd: process.cwd(),
  stdio: "inherit"
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
