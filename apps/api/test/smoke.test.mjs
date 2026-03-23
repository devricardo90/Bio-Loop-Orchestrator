import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
const module = readFileSync(
  new URL("../src/app.module.ts", import.meta.url),
  "utf8"
);
const controller = readFileSync(
  new URL("../src/app.controller.ts", import.meta.url),
  "utf8"
);

assert.match(main, /NestFactory\.create/);
assert.match(module, /AppController/);
assert.match(controller, /@Get\("health"\)/);
