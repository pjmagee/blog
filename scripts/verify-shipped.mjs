import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(rel) {
  const path = join(root, rel);
  if (!existsSync(path)) {
    fail(`missing ${rel}`);
    return "";
  }
  return readFileSync(path, "utf8");
}

function token(css, name) {
  return css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1] ?? "";
}

const css = read("src/styles/global.css");
const site = read("src/data/site.ts");
const built = read("dist/index.html");
const workflow = read(".github/workflows/main.yml");
const pkg = read("package.json");

const bg = token(css, "bg");
const accent = token(css, "accent");
if (bg !== "#0b0f14") fail(`src/styles/global.css --bg is ${bg || "(missing)"}`);
if (accent !== "#58a6ff") fail(`src/styles/global.css --accent is ${accent || "(missing)"}`);
if (!css.includes("Inter")) fail("src/styles/global.css does not set Inter");

if (!site.includes('url: "https://blog.ghp.magaoidh.pro"')) fail("site.ts missing blog url");
if (!site.includes('portfolio: "https://magaoidh.pro"')) fail("site.ts missing portfolio url");
if (!site.includes('label: "Portfolio"')) fail("site.ts missing Portfolio nav label");

if (!pkg.includes("astro build")) fail("package.json is not an Astro build");
if (existsSync(join(root, "Program.cs")) || existsSync(join(root, "pjmagee.github.io.csproj"))) {
  fail("Statiq/.NET entrypoint still present");
}

if (!built) {
  fail("dist/index.html missing — run npm run build first");
} else {
  if (!built.includes("Inter")) fail("built index.html does not reference Inter");
  if (!built.includes("#0b0f14") && !built.includes(bg)) fail("built index.html missing canvas token");
  if (!built.includes("#58a6ff") && !built.includes(accent)) fail("built index.html missing accent token");
  if (!built.includes("https://magaoidh.pro")) fail("built index.html missing portfolio link");
}

const postsDir = join(root, "dist/posts");
const tagsDir = join(root, "dist/tags");
if (!existsSync(postsDir) || !readdirSync(postsDir).some((name) => statSync(join(postsDir, name)).isDirectory())) {
  fail("dist/posts has no post routes");
}
if (!existsSync(tagsDir)) fail("dist/tags missing");

if (!workflow.includes("npm run build")) fail("workflow does not run npm run build");
if (!workflow.includes("publish_dir: ./dist")) fail("workflow does not publish dist");
if (!workflow.includes("cname: blog.ghp.magaoidh.pro")) fail("workflow missing CNAME blog.ghp.magaoidh.pro");
if (!workflow.includes("branches: [main]")) fail("workflow is not triggered on main");

if (failures.length) {
  console.error(failures.map((item) => `FAIL ${item}`).join("\n"));
  process.exit(1);
}
console.log("ok blog shipped theme, routes, portfolio link, and Pages workflow");
