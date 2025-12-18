# Deployment Guide - Files to Upload to Hosting

## Step 1: Build the Project

Before deploying, you need to build the project for production:

**In PowerShell (with Node.js in PATH):**
```powershell
cd "C:\Users\kelly\OneDrive\Desktop\Vault-Main\LegacyAftercareAssistant"
"C:\Program Files\nodejs\npm.cmd" run build
```

Or use the batch file I'll create below.

This creates a `dist` folder with all the production files.

## Step 2: Files to Upload

**Upload ONLY the contents of the `dist` folder** to your hosting site.

The `dist` folder will contain:
- `index.html` (main HTML file)
- `assets/` folder (all JavaScript, CSS, and other assets)
- `favicon.svg` (if included)

## Step 3: What NOT to Upload

**DO NOT upload:**
- `node_modules/` folder
- `src/` folder (source code)
- `dist/` folder itself (upload its CONTENTS)
- Any `.bat`, `.ps1`, or `.md` files
- `package.json`, `tsconfig.json`, etc.
- `electron/` folder
- `docs/` folder
- Any test files

## Step 4: Hosting Requirements

Your hosting needs to:
- Support static file hosting (HTML, CSS, JavaScript)
- Serve `index.html` for all routes (for React Router if you add it later)
- Support modern JavaScript (ES6+)

Most hosting providers support this:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any standard web hosting

## Quick Build Script

I'll create a build script for you below.


