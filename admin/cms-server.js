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
    const { title, slug, metaDescription, keywords, content, thumbnail, thumbnailAlt, category, author, date } = data;

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
        .replace(/{{THUMBNAIL_ALT}}/g, thumbnailAlt || title)
        .replace(/{{DATE}}/g, date)
        .replace(/{{AUTHOR}}/g, author || 'Tunes of Dunes')
        .replace(/{{SLUG}}/g, slug);

    // 3. Save Blog HTML
    const blogFilePath = path.join(__dirname, '..', 'html', 'blogs', `${slug}.html`);
    fs.writeFileSync(blogFilePath, htmlContent);

    // 4. Update Metadata File
    const dataPath = path.join(__dirname, '..', 'js', 'blog-posts-data.js');
    console.log(`Updating metadata file: ${dataPath}`);
    let posts = [];
    if (fs.existsSync(dataPath)) {
        const fileContent = fs.readFileSync(dataPath, 'utf8');
        // Extract JSON from const blogPosts = [...]; (semicolon is optional)
        const match = fileContent.match(/const blogPosts = (\[.*\]);?/s);
        if (match) {
            try {
                posts = JSON.parse(match[1]);
                console.log(`Loaded ${posts.length} existing posts.`);
            } catch (err) {
                console.error('Error parsing blog-posts-data.js:', err);
            }
        } else {
            console.warn('Could not find blogPosts array in blog-posts-data.js');
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
        console.log(`Updated existing post: ${slug}`);
    } else {
        posts.unshift(newPost); // Add to beginning
        console.log(`Added new post: ${slug}`);
    }

    const updatedData = `const blogPosts = ${JSON.stringify(posts, null, 4)};`;
    fs.writeFileSync(dataPath, updatedData);
    console.log('Metadata file updated successfully.');

    // 5. Update Sitemap
    console.log('Updating sitemap...');
    const BASE_URL = 'https://tunesofdunes.com';
    const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
    const sitemapUrls = [
        { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
        { loc: `${BASE_URL}/html/packages.html`, priority: '0.9', changefreq: 'weekly' },
        { loc: `${BASE_URL}/html/blog.html`, priority: '0.8', changefreq: 'weekly' }
    ];

    // Add all posts to sitemap
    posts.forEach(post => {
        let lastmod = new Date().toISOString().split('T')[0];
        if (post.date) {
            try {
                const d = new Date(post.date);
                if (!isNaN(d.getTime())) {
                    lastmod = d.toISOString().split('T')[0];
                }
            } catch (e) {
                console.warn(`Invalid date for post ${post.slug}: ${post.date}`);
            }
        }
        sitemapUrls.push({
            loc: `${BASE_URL}/html/blogs/${post.slug}.html`,
            priority: '0.7',
            changefreq: 'monthly',
            lastmod: lastmod
        });
    });

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `    <url>
        <loc>${url.loc}</loc>
        <lastmod>${url.lastmod}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>`).join('\n')}
</urlset>`;
    fs.writeFileSync(sitemapPath, sitemapContent);
    console.log(`Sitemap updated successfully with ${sitemapUrls.length} entries.`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, path: `html/blogs/${slug}.html` }));
}

server.listen(PORT, () => {
    console.log(`CMS Server running at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop.');

    // Add File Watcher to trigger build.js automatically
    const contentDir = path.join(__dirname, '..', 'content', 'blogs');
    const buildScript = path.join(__dirname, '..', 'build.js');

    if (fs.existsSync(contentDir)) {
        console.log(`Watching for changes in: ${contentDir}`);
        let timeout;
        fs.watch(contentDir, (eventType, filename) => {
            if (filename) {
                // Debounce build to avoid running multiple times for a single save
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    console.log(`Change detected in ${filename}. Running build...`);
                    // Use require to run the script instead of exec to avoid dependency on global 'node'
                    try {
                        delete require.cache[require.resolve(buildScript)];
                        require(buildScript);
                        console.log('Build completed successfully.');
                    } catch (err) {
                        console.error('Error running build script:', err);
                    }
                }, 1000);
            }
        });
    } else {
        console.warn(`Content directory not found for watching: ${contentDir}`);
    }
});
