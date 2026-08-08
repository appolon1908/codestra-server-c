import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = new URL("..", import.meta.url).pathname;
const temporaryDirectory = mkdtempSync(join(tmpdir(), "codestra-industry-catalog-"));
const bundle = join(temporaryDirectory, "industry-config.mjs");

try {
  execFileSync(join(projectRoot, "node_modules/.bin/esbuild"), [
    join(projectRoot, "src/Pages/Industries/industryConfig.ts"),
    "--bundle",
    "--platform=node",
    "--format=esm",
    `--outfile=${bundle}`,
  ]);
  const { industryConfigs } = await import(`${pathToFileURL(bundle).href}?v=${Date.now()}`);
  const catalogPath = join(projectRoot, "src/locales/en/industries.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
  catalog.content = Object.fromEntries(industryConfigs.map(({ slug, campaign, ...content }) => [slug, content]));
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  for (const locale of ["es", "fr"]) {
    const localizedPath = join(projectRoot, `src/locales/${locale}/industries.json`);
    const localized = JSON.parse(readFileSync(localizedPath, "utf8"));
    localized.content ??= {};
    for (const [slug, content] of Object.entries(catalog.content)) {
      localized.content[slug] ??= content;
    }
    writeFileSync(localizedPath, `${JSON.stringify(localized, null, 2)}\n`);
  }
  console.log(`Synchronized ${industryConfigs.length} English industry records.`);
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
