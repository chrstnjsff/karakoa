// Fails when an em dash or en dash appears in source, copy, or docs.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const roots = ["src", "public", "scripts", "tests", "README.md", "AGENTS.md"];
const exts = new Set([".ts", ".mjs", ".astro", ".css", ".md", ".json", ".svg", ".txt", ".yml"]);
const bad = new RegExp("[" + String.fromCharCode(0x2014, 0x2013) + "]");
const hits = [];

function walk(path) {
  let info;
  try {
    info = statSync(path);
  } catch {
    return;
  }
  if (info.isDirectory()) {
    for (const name of readdirSync(path)) walk(join(path, name));
    return;
  }
  if (!exts.has(extname(path))) return;
  const lines = readFileSync(path, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (bad.test(line)) hits.push(`${path}:${i + 1}: ${line.trim()}`);
  });
}

roots.forEach(walk);

if (hits.length) {
  console.error("Em or en dash found; use a plain dash instead:\n" + hits.join("\n"));
  process.exit(1);
}
console.log("lint:dash ok");
