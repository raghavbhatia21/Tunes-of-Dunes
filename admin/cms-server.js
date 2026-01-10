const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/publish') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const data = JSON.parse(body);
            publishBlog(data, res);
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

function publishBlog(data, res) {
    const { title, slug, metaDescription, keywords, content, thumbnail, category, author, date } = data;

    // 1. Load Template
    const templatePath = path.join(__dirname, 'blog-template.html');
    let template = fs.readFileSync(templatePath, 'utf8');

    // 2. Replace Placeholders
    const htmlContent = template
        .replace(/{{TITLE}}/g, title)
        .replace(/{{META_DESCRIPTION}}/g, metaDescription)
        .replace(/{{KEYWORDS}}/g, keywords)
        .replace(/{{CONTENT}}/g, content)
        .replace(/{{THUMBNAIL}}/g, thumbnail || '../../assets/images/cultural.png')
        .replace(/{{DATE}}/g, date)
        .replace(/{{AUTHOR}}/g, author || 'Tunes of Dunes')
        .replace(/{{SLUG}}/g, slug);

    // 3. Save Blog HTML
    const blogFilePath = path.join(__dirname, '..', 'html', 'blogs', `${slug}.html`);
    fs.writeFileSync(blogFilePath, htmlContent);

    // 4. Update Metadata File
    const dataPath = path.join(__dirname, '..', 'js', 'blog-posts-data.js');
    let posts = [];
    if (fs.existsSync(dataPath)) {
        const fileContent = fs.readFileSync(dataPath, 'utf8');
        // Extract JSON from const blogPosts = [...];
        const match = fileContent.match(/const blogPosts = (\[.*\]);/s);
        if (match) {
            posts = JSON.parse(match[1]);
        }
    }

    // Add new post or update existing
    const existingIndex = posts.findIndex(p => p.slug === slug);
    const newPost = {
        title,
        slug,
        date,
        metaDescription,
        thumbnail: thumbnail || '../assets/images/cultural.png',
        category: category || 'Travel Guide'
    };

    if (existingIndex > -1) {
        posts[existingIndex] = newPost;
    } else {
        posts.unshift(newPost); // Add to beginning
    }

    const updatedData = `const blogPosts = ${JSON.stringify(posts, null, 4)};`;
    fs.writeFileSync(dataPath, updatedData);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, path: `html/blogs/${slug}.html` }));
}

server.listen(PORT, () => {
    console.log(`CMS Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop.');
});
