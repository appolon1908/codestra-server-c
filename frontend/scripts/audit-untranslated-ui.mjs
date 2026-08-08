import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import ts from "typescript";

const root = new URL("../src", import.meta.url).pathname;
const allow = new Set(JSON.parse(readFileSync(new URL("../docs/localization-string-allowlist.json", import.meta.url), "utf8")));
const files = [];
const walk = (dir) => readdirSync(dir).forEach((name) => { const path=join(dir,name); statSync(path).isDirectory()?walk(path):/\.tsx$/.test(name)&&files.push(path); });
walk(root);
const matches=[];
for (const file of files) {
  const source=readFileSync(file,"utf8");
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (node) => {
    if (ts.isJsxText(node)) {
      const value = node.text.replace(/\s+/g, " ").trim();
      if (value.length > 2 && /[A-Za-zÀ-ÿ]/.test(value) && !allow.has(value)) matches.push(`${relative(root,file)}: ${value}`);
    }
    if (ts.isJsxAttribute(node) && ["alt", "aria-label", "placeholder", "title"].includes(node.name.text) && node.initializer && ts.isStringLiteral(node.initializer)) {
      const value = node.initializer.text.trim();
      if (value && /[A-Za-zÀ-ÿ]/.test(value) && !allow.has(value)) matches.push(`${relative(root,file)}: ${value}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
}

const catalogRoot = new URL("../src/locales/en", import.meta.url).pathname;
const catalogValues = new Set();
const collectValues = (value) => {
  if (typeof value === "string") catalogValues.add(value);
  else if (Array.isArray(value)) value.forEach(collectValues);
  else if (value && typeof value === "object") Object.values(value).forEach(collectValues);
};
readdirSync(catalogRoot).filter((name) => name.endsWith(".json")).forEach((name) =>
  collectValues(JSON.parse(readFileSync(join(catalogRoot, name), "utf8"))),
);

const technicalValue = (value) =>
  allow.has(value) ||
  /^\.\/.+/.test(value) ||
  /^(?:problems|integrations|scenarios|faq|routing)$/.test(value) ||
  /^(?:[A-Z][A-Z0-9_]+|[a-z0-9]+(?:[-_][a-z0-9]+)+|Supported|Planned)$/.test(value) ||
  /^(?:Odoo(?: CRM)?|n8n|VICIdial|Google Calendar|Microsoft Outlook|Shopify)$/.test(value);

for (const relativePath of [
  "Pages/Industries/industryConfig.ts",
  "Pages/Industries/industryConfigExpansion.ts",
]) {
  const file = join(root, relativePath);
  const source = readFileSync(file, "utf8");
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const visit = (node) => {
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
        /[A-Za-zÀ-ÿ]/.test(node.text) &&
        !technicalValue(node.text) &&
        !catalogValues.has(node.text)) {
      const { line } = tree.getLineAndCharacterOfPosition(node.getStart(tree));
      matches.push(`${relativePath}:${line + 1}: ${node.text}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
}
if(matches.length){ console.error(matches.join("\n")); console.error(`Found ${matches.length} untranslated UI strings.`); process.exit(1); }
console.log("No unapproved hard-coded UI strings found.");
