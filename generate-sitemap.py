#!/usr/bin/env python3
"""
Sitemap Generator for Tunes of Dunes
This script generates sitemap.xml by scanning the html/blogs directory
Run this if the Node.js build process fails
"""

import os
from datetime import datetime
from pathlib import Path

BASE_URL = 'https://tunesofdunes.com'
SITEMAP_FILE = 'sitemap.xml'
BLOGS_DIR = 'html/blogs'

def generate_sitemap():
    print('🔄 Generating sitemap.xml...')
    
    # Static pages
    urls = [
        {'loc': f'{BASE_URL}/', 'priority': '1.0', 'changefreq': 'daily'},
        {'loc': f'{BASE_URL}/html/packages.html', 'priority': '0.9', 'changefreq': 'weekly'},
        {'loc': f'{BASE_URL}/html/hotels.html', 'priority': '0.9', 'changefreq': 'weekly'},
        {'loc': f'{BASE_URL}/html/blog.html', 'priority': '0.8', 'changefreq': 'weekly'}
    ]
    
    # Scan for blog posts
    if os.path.exists(BLOGS_DIR):
        blog_files = [f for f in os.listdir(BLOGS_DIR) if f.endswith('.html')]
        print(f'📝 Found {len(blog_files)} blog posts')
        
        for file in blog_files:
            file_path = os.path.join(BLOGS_DIR, file)
            mtime = os.path.getmtime(file_path)
            lastmod = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
            
            urls.append({
                'loc': f'{BASE_URL}/html/blogs/{file}',
                'priority': '0.7',
                'changefreq': 'monthly',
                'lastmod': lastmod
            })
            print(f'  ✓ {file}')
    
    # Generate XML
    today = datetime.now().strftime('%Y-%m-%d')
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for url in urls:
        lastmod = url.get('lastmod', today)
        xml_content += f'''    <url>
        <loc>{url['loc']}</loc>
        <lastmod>{lastmod}</lastmod>
        <changefreq>{url['changefreq']}</changefreq>
        <priority>{url['priority']}</priority>
    </url>\n'''
    
    xml_content += '</urlset>'
    
    # Write sitemap
    with open(SITEMAP_FILE, 'w', encoding='utf-8') as f:
        f.write(xml_content)
    
    print(f'✅ Sitemap generated with {len(urls)} URLs')
    print(f'📍 Location: {os.path.abspath(SITEMAP_FILE)}')

if __name__ == '__main__':
    generate_sitemap()
