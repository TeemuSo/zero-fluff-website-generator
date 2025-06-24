// Build script: compile Tailwind, minify HTML, optimise images
import { execSync as sh } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { globby } from 'globby';
import { minify } from 'html-minifier-terser';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'src');
const distDir = path.join(root, 'dist');
await fs.rm(distDir, { recursive: true, force: true });
await fs.mkdir(distDir, { recursive: true });

// 1. Compile Tailwind
console.log('🔧 Compiling Tailwind…');
sh(`npx tailwindcss -i ${path.join(srcDir, 'tailwind.css')} -o ${path.join(distDir, 'style.css')} --minify --content "${srcDir}/**/*.html"`, { stdio: 'inherit' });

// 2. Minify + copy HTML
console.log('📄 Minifying HTML…');
const htmlFiles = await globby('**/*.html', { cwd: srcDir });
for (const file of htmlFiles) {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(distDir, file);
  const html = await fs.readFile(srcPath, 'utf8');
  const min = await minify(html, { collapseWhitespace: true, removeComments: true, minifyCSS: true });
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, min, 'utf8');
}

// 3. Optimise images (AVIF + WebP)
console.log('🖼  Optimising images…');
sh(`npx squoosh-cli -d ${distDir} ${srcDir}`, { stdio: 'inherit' });

console.log('✅ Build done – files in /dist');
