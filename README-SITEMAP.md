# Sitemap Management Guide

## How It Works

The sitemap is automatically generated when you deploy to Netlify. Here's the process:

1. **Add a blog post** via Decap CMS admin panel (`/admin`)
2. **Netlify detects** the new `.md` file in `content/blogs/`
3. **Build triggers** automatically
4. **Build script** (`build.js`) runs:
   - Converts markdown to HTML
   - Updates `js/blog-posts-data.js`
   - **Regenerates `sitemap.xml`** with all blog URLs
5. **Deploy completes** with updated sitemap

## Automatic Updates

The sitemap should update automatically on every deploy. If you notice it's not updating:

### Option 1: Trigger Manual Deploy (Easiest)
1. Go to Netlify dashboard
2. Click "Deploys" tab
3. Click "Trigger deploy" → "Deploy site"
4. Wait for build to complete

### Option 2: Run Update Script on Netlify
If you have SSH access or can run commands on Netlify:
```bash
npm run update-sitemap
```

### Option 3: Run Python Script Locally
If you don't have Node.js installed locally:
```bash
python generate-sitemap.py
```
Then commit and push the updated `sitemap.xml`.

### Option 4: Manual Entry
If all else fails, manually add entries to `sitemap.xml`:

```xml
<url>
    <loc>https://tunesofdunes.com/html/blogs/your-new-post.html</loc>
    <lastmod>2026-01-26</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
</url>
```

## Verifying Sitemap

After any update, verify your sitemap:
1. Visit: https://tunesofdunes.com/sitemap.xml
2. Check that all blog posts are listed
3. Submit to Google Search Console

## Troubleshooting

**Sitemap not updating after new blog post?**
- Check Netlify build logs for errors
- Ensure `content/blogs/*.md` files are being committed
- Verify `build.js` is running during deploy
- Try triggering a manual deploy

**Build failing?**
- Check that `package.json` dependencies are correct
- Ensure Node.js version 20 is being used (set in `netlify.toml`)
- Look for syntax errors in markdown frontmatter

**Need immediate fix?**
- Use the Python script: `python generate-sitemap.py`
- Or manually edit `sitemap.xml`
- Commit and push changes

## Files Involved

- `build.js` - Main build script (generates everything)
- `update-sitemap.js` - Quick sitemap-only update
- `generate-sitemap.py` - Python alternative (no Node.js needed)
- `netlify.toml` - Netlify build configuration
- `sitemap.xml` - The actual sitemap file

## Questions?

If the sitemap continues to have issues, check:
1. Netlify build logs
2. That markdown files have proper frontmatter
3. That file names match the `slug` field in frontmatter
