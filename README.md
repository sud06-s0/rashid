# Rasid · Shop Billing

Offline billing and GST invoices for small shops. Plain HTML, CSS and JavaScript, with no backend and no build step.

## Files
- `index.html`: the whole app
- `manifest.json`: makes it installable
- `sw.js`: service worker for offline use (caches the app, the PDF and QR libraries, and the fonts)
- `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`: app icons

## Deploy on Vercel
1. Put this folder in a Git repo (or drag it into the Vercel dashboard).
2. Framework preset: **Other**. No build command. Output directory: the folder root.
3. Open the site once while online. After that it works fully offline.

## Install on a phone
- **Android (Chrome):** open the site, then tap ⋮ → *Install app* (or *Add to Home screen*).
- **iPhone (Safari):** open the site, tap Share → *Add to Home Screen*.

## Data
Everything is stored in the browser on that device (IndexedDB). Use **Settings → Backup now** every week and keep the file safe; **Restore** loads it on any phone.
