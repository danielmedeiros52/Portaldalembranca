/**
 * Script para gerar sitemap.xml dinâmico
 * Execute com: node scripts/generate-sitemap.cjs
 */

const fs = require('fs');
const path = require('path');

// Ler dados dos memoriais
const memorialsPath = path.join(__dirname, '../client/src/data/memorials.json');
const memorialsData = JSON.parse(fs.readFileSync(memorialsPath, 'utf8'));

const BASE_URL = 'https://portaldalembranca.com.br';
const today = new Date().toISOString().split('T')[0];

// Páginas estáticas
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/memoriais', priority: '0.9', changefreq: 'daily' },
  { url: '/sobre', priority: '0.7', changefreq: 'monthly' },
  { url: '/contato', priority: '0.6', changefreq: 'monthly' },
  { url: '/planos', priority: '0.8', changefreq: 'monthly' },
];

// Gerar URLs dos memoriais
const memorialPages = memorialsData.memorials
  .filter(m => m.status === 'active' && m.visibility === 'public')
  .map(memorial => ({
    url: `/m/${memorial.slug}`,
    priority: memorial.isHistorical ? '0.9' : '0.8',
    changefreq: 'weekly',
    lastmod: memorial.updatedAt ? memorial.updatedAt.split('T')[0] : today,
  }));

// Construir XML
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

// Adicionar páginas estáticas
staticPages.forEach(page => {
  sitemap += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
});

// Adicionar memoriais
memorialPages.forEach(page => {
  sitemap += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
});

sitemap += `</urlset>`;

// Salvar sitemap
const outputPath = path.join(__dirname, '../client/public/sitemap.xml');
fs.writeFileSync(outputPath, sitemap);

console.log(`Sitemap gerado com sucesso!`);
console.log(`- Páginas estáticas: ${staticPages.length}`);
console.log(`- Memoriais: ${memorialPages.length}`);
console.log(`- Total de URLs: ${staticPages.length + memorialPages.length}`);
console.log(`- Arquivo: ${outputPath}`);
