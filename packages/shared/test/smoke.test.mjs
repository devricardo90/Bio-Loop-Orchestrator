import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const indexFile = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8");

assert.match(indexFile, /export \{\};/);
