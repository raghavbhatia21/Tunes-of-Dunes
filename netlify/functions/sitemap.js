const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BASE_URL = 'https://tunesofdunes.com';

exports.handler = async (event, context) => {
    try {
        const todayIso = new Date().toISOString().split('T')[0];
        const entries = [
            { url: '', priority: '1.0', changefreq: 'daily', lastmod: todayIso },
            { url: '/html/packages.html', priority: '0.9', changefreq: 'weekly', lastmod: todayIso },
            { url: '/html/hotels.html', priority: '0.9', changefreq: 'weekly', lastmod: todayIso },
            { url: '/html/blog.html', priority: '0.9', changefreq: 'daily', lastmod: todayIso }
        ];

        // Path to blogs folder in function environment
        const contentDir = path.join(__dirname, '..', '..', 'content', 'blogs');

        if (fs.existsSync(contentDir)) {
            const files = fs.readdirSync(contentDir);
            files.forEach(file => {
                if (!file.endsWith('.md')) return;
                const filePath = path.join(contentDir, file);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const { data } = matter(fileContent);
                const slug = data.slug || file.replace('.md', '');

                let isoDate = todayIso;
                if (data.date) {
                    const d = new Date(data.date);
                    if (!isNaN(d.getTime())) {
                        isoDate = d.toISOString().split('T')[0];
                    }
                } else {
                    const stats = fs.statSync(filePath);
                    isoDate = stats.mtime.toISOString().split('T')[0];
                }

                entries.push({
                    url: `/html/blogs/${slug}.html`,
                    priority: '0.8',
                    changefreq: 'monthly',
                    lastmod: isoDate
                });
            });
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `
  <url>
    <loc>${BASE_URL}${e.url}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('')}
</urlset>`;

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=0, must-revalidate'
            },
            body: xml
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'text/plain' },
            body: `Error generating dynamic sitemap: ${err.message}`
        };
    }
};
