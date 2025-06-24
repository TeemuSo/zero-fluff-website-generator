// Simple sitemap & robots generator
import fs from 'node:fs/promises';
import path from 'node:path';
import { globby } from 'globby';

const dist = path.resolve('dist');
const domain = process.env.SITE_URL || 'https://example.com';

const pages = await globby('**/*.html', { cwd: dist });
const urls = pages.map(p => {
  const loc = new URL(p.replace(/index\.html$/, ''), domain).href;
  return `<url><loc>${loc}</loc></url>`;
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

await fs.writeFile(path.join(dist, 'sitemap.xml'), sitemap.trim());
await fs.writeFile(path.join(dist, 'robots.txt'), `Sitemap: ${domain}/sitemap.xml\nUser-agent: *\nAllow: /`);

console.log('🗺  sitemap.xml and robots.txt created');
