const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://tunesofdunes.com';
const SITEMAP_FILE = path.join(__dirname, 'sitemap.xml');
const BLOGS_DIR = path.join(__dirname, 'html', 'blogs');

console.log('🔄 Updating sitemap.xml...');

// Static pages
const sitemapUrls = [
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${BASE_URL}/html/packages.html`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${BASE_URL}/html/hotels.html`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${BASE_URL}/html/blog.html`, priority: '0.8', changefreq: 'weekly' }
];

// Scan for blog posts
if (fs.existsSync(BLOGS_DIR)) {
    const blogFiles = fs.readdirSync(BLOGS_DIR).filter(f => f.endsWith('.html'));
    console.log(`📝 Found ${blogFiles.length} blog posts`);

    blogFiles.forEach(file => {
        const filePath = path.join(BLOGS_DIR, file);
        const stats = fs.statSync(filePath);
        const lastmod = stats.mtime.toISOString().split('T')[0];

        sitemapUrls.push({
            loc: `${BASE_URL}/html/blogs/${file}`,
            priority: '0.7',
            changefreq: 'monthly',
            lastmod: lastmod
        });

        console.log(`  ✓ ${file}`);
    });
}

// Generate sitemap XML
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `    <url>
        <loc>${url.loc}</loc>
        <lastmod>${url.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>`).join('\n')}
</urlset>`;

// Write sitemap
fs.writeFileSync(SITEMAP_FILE, sitemapContent);
console.log(`✅ Sitemap updated with ${sitemapUrls.length} URLs`);
console.log(`📍 Location: ${SITEMAP_FILE}`);
