import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const LAYERS = { "l-": "layout", "c-": "component", "p-": "page", "u-": "utility" };
const AUTO_LAYERS = new Set(["component", "layout"]);

const args = process.argv.slice(2);
const write = args.includes("--write");
const htmlFiles = args.filter((a) => !a.startsWith("--"));
const targets = htmlFiles.length ? htmlFiles : ["index.html"];

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const classFromHtml = (file) => {
  const html = readFileSync(file, "utf8");
  const set = new Set();
  for (const m of html.matchAll(/class\s*=\s*"([^"]*)"/g)) {
    for (const token of m[1].split(/\s+/)) {
      if (token && !token.startsWith("js-")) set.add(token);
    }
  }
  return set;
};

const definedBlocks = () => {
  const set = new Set();
  for (const file of walk("assets/scss").filter((f) => extname(f) === ".scss")) {
    for (const m of readFileSync(file, "utf8").matchAll(/\.([a-zA-Z][\w-]*)/g)) {
      set.add(m[1].split(/__|--/)[0]);
    }
  }
  return set;
};

const used = new Set();
for (const f of targets) for (const c of classFromHtml(f)) used.add(c);

const existing = definedBlocks();
const tree = {};

for (const cls of used) {
  const block = cls.split(/__|--/)[0];
  if (existing.has(block)) continue;
  const layer = LAYERS[block.slice(0, 2)] ?? "other";
  tree[layer] ??= {};
  tree[layer][block] ??= { mods: new Set(), els: {} };
  const node = tree[layer][block];
  const elMatch = cls.match(/__([\w-]+?)(?:--|$)/);
  const modMatch = cls.match(/--([\w-]+)$/);
  if (elMatch) {
    node.els[elMatch[1]] ??= new Set();
    if (modMatch) node.els[elMatch[1]].add(modMatch[1]);
  } else if (modMatch) {
    node.mods.add(modMatch[1]);
  }
}

const renderBlock = (name, node) => {
  let out = `.${name} {\n`;
  for (const [el, mods] of Object.entries(node.els)) {
    out += `  &__${el} {\n`;
    for (const mod of mods) out += `    &--${mod} {\n    }\n`;
    out += `  }\n`;
  }
  for (const mod of node.mods) out += `  &--${mod} {\n  }\n`;
  out += `}\n`;
  return out;
};

const renderFile = (layer, partial, body) =>
  `@use "../foundation" as f;\n\n` +
  `/*!\n${layer} > ${partial}\n------------------------------\n*/\n` +
  body;

if (!Object.keys(tree).length) {
  console.log("未定義クラスなし。全部 SCSS に存在する。");
  process.exit(0);
}

const created = [];
const manual = [];

for (const layer of ["layout", "component", "page", "utility", "other"]) {
  if (!tree[layer]) continue;
  for (const [block, node] of Object.entries(tree[layer])) {
    const body = renderBlock(block, node);
    const partial = block.replace(/^[a-z]-/, "");

    if (write && AUTO_LAYERS.has(layer)) {
      const file = `assets/scss/${layer}/_${partial}.scss`;
      if (existsSync(file)) {
        manual.push(`skip（既存）: ${file}`);
        continue;
      }
      writeFileSync(file, renderFile(layer, partial, body));

      const indexPath = `assets/scss/${layer}/_index.scss`;
      const indexSrc = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";
      const line = `@use "${partial}";`;
      if (!indexSrc.includes(line)) {
        writeFileSync(indexPath, indexSrc.replace(/\n*$/, "\n") + line + "\n");
      }
      created.push(file);
    } else {
      manual.push(`/* === ${layer}/ === */\n` + body);
    }
  }
}

if (created.length) {
  console.log("生成:");
  for (const f of created) console.log("  ✅ " + f);
  console.log("\n各 _index.scss に @use も追記済み。");
}
if (manual.length) {
  console.log(write ? "\n手動配置が必要（page/utility/その他・既存）:" : "");
  for (const m of manual) console.log(m);
}
