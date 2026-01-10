const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const CONTENT_DIR = path.join(__dirname, 'content', 'blogs');
const TEMPLATE_PATH = path.join(__dirname, 'admin', 'blog-template.html');
const OUTPUT_DIR = path.join(__dirname, 'html', 'blogs');
const DATA_FILE = path.join(__dirname, 'js', 'blog-posts-data.js');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
const blogPosts = [];

const files = fs.readdirSync(CONTENT_DIR);

files.forEach(file => {
    if (!file.endsWith('.md')) return;

    const filePath = path.join(CONTENT_DIR, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    const slug = file.replace('.md', '');

    // Meta data for JSON listing
    blogPosts.push({
        title: data.title,
        slug: slug,
        date: data.date ? new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
        metaDescription: data.metaDescription || '',
        thumbnail: data.thumbnail || 'assets/images/cultural.png',
        thumbnailAlt: data.thumbnailAlt || data.title,
        category: data.category || 'Travel Guide'
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

// Update the listing data file
const dataContent = `const blogPosts = ${JSON.stringify(blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date)), null, 2)};`;
fs.writeFileSync(DATA_FILE, dataContent);

console.log(`Build complete! Generated ${blogPosts.length} blog posts.`);
