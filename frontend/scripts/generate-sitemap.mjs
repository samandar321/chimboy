// Generates public/sitemap.xml from the product catalog. Runs before `vite build`.
// Change SITE_URL when the site moves to its own domain (e.g. https://chimboy.uz).
import { writeFileSync } from 'node:fs';
import { createServer } from 'vite';

// mockData.js uses Vite-style extensionless imports, so load it through Vite.
const vite = await createServer({ configFile: false, server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
const { products } = await vite.ssrLoadModule('/src/services/mockData.js');
await vite.close();

const SITE_URL = 'https://chimboy-rose.vercel.app';
const today = new Date().toISOString().slice(0, 10);

const pages = [
  { path: '/', priority: '1.0' },
  { path: '/products', priority: '0.9' },
  { path: '/promotions', priority: '0.7' },
  { path: '/stores', priority: '0.7' },
  { path: '/about', priority: '0.6' },
  { path: '/contact', priority: '0.6' },
  ...products.map((p) => ({ path: `/products/${p.id}`, priority: '0.8' })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((p) => `  <url><loc>${SITE_URL}${p.path}</loc><lastmod>${today}</lastmod><priority>${p.priority}</priority></url>`)
  .join('\n')}
</urlset>
`;

writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml: ${pages.length} URLs`);
