#!/usr/bin/env node

/**
 * setup.mjs — Run once after filling out config.js
 *
 * Reads BUSINESS_NAME and SITE_URL from src/config.js, then auto-writes:
 *   1. astro.config.mjs
 *   2. public/robots.txt
 *   3. public/site.webmanifest
 *   4. package.json (updates "name" field only)
 *
 * Usage:  node setup.mjs
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// 1. Extract BUSINESS_NAME and SITE_URL from src/config.js
// ---------------------------------------------------------------------------

const configPath = path.resolve('src/config.js');
if (!fs.existsSync(configPath)) {
  console.error('❌  src/config.js not found. Run this from the project root.');
  process.exit(1);
}

const configSource = fs.readFileSync(configPath, 'utf-8');

function extractConst(name) {
  // Matches:  const NAME = "value";  or  const NAME = 'value';
  const regex = new RegExp(`const\\s+${name}\\s*=\\s*["']([^"']+)["']`);
  const match = configSource.match(regex);
  if (!match) {
    console.error(`❌  Could not find ${name} in src/config.js`);
    process.exit(1);
  }
  return match[1];
}

const BUSINESS_NAME = extractConst('BUSINESS_NAME');
const SITE_URL = extractConst('SITE_URL');

// Derive a kebab-case package name from the business name
const PACKAGE_NAME = BUSINESS_NAME
  .toLowerCase()
  .replace(/[&]/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

console.log(`\n🔧  Setting up files for: ${BUSINESS_NAME}`);
console.log(`    Site URL: ${SITE_URL}`);
console.log(`    Package name: ${PACKAGE_NAME}\n`);

// ---------------------------------------------------------------------------
// 2. Write astro.config.mjs
// ---------------------------------------------------------------------------

const astroConfig = `import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: '${SITE_URL}',
  integrations: [sitemap()],
});
`;

fs.writeFileSync('astro.config.mjs', astroConfig);
console.log('✅  astro.config.mjs');

// ---------------------------------------------------------------------------
// 3. Write public/robots.txt
// ---------------------------------------------------------------------------

const robotsTxt = `# Robots.txt for ${BUSINESS_NAME}
# ${SITE_URL}

User-agent: *
Allow: /

# Sitemap location
Sitemap: ${SITE_URL}/sitemap-index.xml
`;

fs.writeFileSync('public/robots.txt', robotsTxt);
console.log('✅  public/robots.txt');

// ---------------------------------------------------------------------------
// 4. Write public/site.webmanifest
// ---------------------------------------------------------------------------

const manifest = {
  name: BUSINESS_NAME,
  short_name: BUSINESS_NAME,
  icons: [
    { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
    { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
  ],
  theme_color: '#ffffff',
  background_color: '#ffffff',
  display: 'standalone',
};

fs.writeFileSync('public/site.webmanifest', JSON.stringify(manifest, null, 2));
console.log('✅  public/site.webmanifest');

// ---------------------------------------------------------------------------
// 5. Update package.json (name field only, preserves everything else)
// ---------------------------------------------------------------------------

const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
pkg.name = PACKAGE_NAME;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('✅  package.json');

// ---------------------------------------------------------------------------
console.log('\n🎉  Done! All files updated from config.js.\n');
