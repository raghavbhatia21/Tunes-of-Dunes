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

    // 1. Generate Markdown with Frontmatter
    const frontmatter = `---
title: ${title}
slug: ${slug}
date: ${date || new Date().toISOString()}
category: ${category || 'Travel Guide'}
metaDescription: ${metaDescription || ''}
keywords: ${keywords || ''}
thumbnail: ${thumbnail || '../assets/images/cultural.png'}
thumbnailAlt: ${thumbnailAlt || title}
---
${content}`;

    // 2. Save Markdown File
    const contentDir = path.join(__dirname, '..', 'content', 'blogs');
    if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true });

    const mdFilePath = path.join(contentDir, `${slug}.md`);
    fs.writeFileSync(mdFilePath, frontmatter);
    console.log(`Saved markdown file: ${mdFilePath}`);

    // 3. Trigger build.js to update everything
    const buildScript = path.join(__dirname, '..', 'build.js');
    console.log('Running build script to update HTML, Data, and Sitemap...');

    try {
        // Use require to run the script in the same process
        delete require.cache[require.resolve(buildScript)];
        require(buildScript);
        console.log('Build completed successfully.');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            message: 'Blog published and sitemap updated.',
            path: `html/blogs/${slug}.html`
        }));
    } catch (err) {
        console.error('Error running build script:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
    }
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
            if (filename && filename.endsWith('.md')) {
                // Debounce build to avoid running multiple times for a single save
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    console.log(`Change detected in ${filename}. Running build...`);
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
