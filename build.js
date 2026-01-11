const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const CONTENT_DIR = path.join(__dirname, 'content', 'blogs');
const TEMPLATE_PATH = path.join(__dirname, 'admin', 'blog-template.html');
const OUTPUT_DIR = path.join(__dirname, 'html', 'blogs');
const DATA_FILE = path.join(__dirname, 'js', 'blog-posts-data.js');
const SITEMAP_FILE = path.join(__dirname, 'sitemap.xml');
const BASE_URL = 'https://tunesofdunes.netlify.app';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
const blogPosts = [];
const sitemapUrls = [
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${BASE_URL}/html/packages.html`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${BASE_URL}/html/blog.html`, priority: '0.8', changefreq: 'weekly' }
];

console.log(`Starting build from: ${CONTENT_DIR}`);
const files = fs.readdirSync(CONTENT_DIR);
console.log(`Found ${files.length} files in content directory.`);

// Get list of expected HTML files for cleanup
const expectedHtmlFiles = new Set();

files.forEach(file => {
    if (!file.endsWith('.md')) {
        console.log(`Skipping non-markdown file: ${file}`);
        return;
    }

    const filePath = path.join(CONTENT_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    // Use custom slug if provided, otherwise fallback to filename slug
    const slug = data.slug || file.replace('.md', '');
    expectedHtmlFiles.add(`${slug}.html`);

    console.log(`Processing blog: ${slug} (${data.title})`);

    // Meta data for JSON listing
    blogPosts.push({
        title: data.title,
        slug: slug,
        date: data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
        timestamp: data.date ? new Date(data.date).getTime() : 0,
        metaDescription: data.metaDescription || '',
        thumbnail: data.thumbnail || 'assets/images/cultural.png',
        thumbnailAlt: data.thumbnailAlt || data.title,
        category: data.category || 'Travel Guide'
    });

    // Add to sitemap
    sitemapUrls.push({
        loc: `${BASE_URL}/html/blogs/${slug}.html`,
        priority: '0.7',
        changefreq: 'monthly',
        lastmod: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });

    // Generate HTML for individual post
    const htmlBody = marked(content);
    const finalHtml = template
        .replace(/{{TITLE}}/g, data.title)
        .replace(/{{META_DESCRIPTION}}/g, data.metaDescription || '')
        .replace(/{{KEYWORDS}}/g, data.keywords || '')
        .replace(/{{CONTENT}}/g, htmlBody)
        .replace(/{{THUMBNAIL}}/g, data.thumbnail || 'assets/images/cultural.png')
        .replace(/{{THUMBNAIL_ALT}}/g, data.thumbnailAlt || data.title)
        .replace(/{{DATE}}/g, data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '')
        .replace(/{{AUTHOR}}/g, 'Tunes of Dunes')
        .replace(/{{SLUG}}/g, slug);

    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), finalHtml);
});

// Cleanup orphan HTML files
const existingHtmlFiles = fs.readdirSync(OUTPUT_DIR);
existingHtmlFiles.forEach(file => {
    if (file.endsWith('.html') && !expectedHtmlFiles.has(file)) {
        console.log(`Removing orphan blog file: ${file}`);
        fs.unlinkSync(path.join(OUTPUT_DIR, file));
    }
});

// Update the listing data file
// Sort by timestamp descending
const sortedPosts = blogPosts.sort((a, b) => b.timestamp - a.timestamp);
const dataContent = `const blogPosts = ${JSON.stringify(sortedPosts, null, 2)};`;
fs.writeFileSync(DATA_FILE, dataContent);

// Update Sitemap
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `    <url>
        <loc>${url.loc}</loc>
        <lastmod>${url.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>`).join('\n')}
</urlset>`;
fs.writeFileSync(SITEMAP_FILE, sitemapContent);

console.log(`Build complete! Generated ${blogPosts.length} blog posts and updated sitemap.`);
