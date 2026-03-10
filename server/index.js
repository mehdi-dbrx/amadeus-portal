import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8000;
// Brand Search API: search by company name (https://docs.brandfetch.com/reference/brand-search-api)
const BRANDFETCH_SEARCH_BASE = 'https://api.brandfetch.io/v2/search';
// Brand API: fetch by domain for fallback when search returns no icon (https://docs.brandfetch.com/brand-api/overview)
const BRANDFETCH_BRANDS_BASE = 'https://api.brandfetch.io/v2/brands';

const app = express();

// Load .env.local when present (e.g. in development)
try {
  const dotenv = await import('dotenv');
  dotenv.default.config({ path: path.join(__dirname, '..', '.env.local') });
} catch {
  // dotenv not installed or failed
}
const BRANDFETCH_API_KEY = process.env.BRANDFETCH_API_KEY?.trim();

// CORS: allow same-origin; in production the app is same-origin
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Brand proxy: GET /api/brand?name=Amadeus — uses Brand Search API (by company name)
app.get('/api/brand', async (req, res) => {
  const name = (req.query.name ?? '').toString().trim();
  if (!name) {
    return res.status(400).json({ error: 'Missing or empty brand name' });
  }

  if (!BRANDFETCH_API_KEY) {
    return res.status(503).json({ error: 'Brandfetch API key not configured (set BRANDFETCH_API_KEY)' });
  }

  try {
    // Brand Search API: search by name (Bearer token)
    const searchUrl = `${BRANDFETCH_SEARCH_BASE}/${encodeURIComponent(name)}`;
    const searchRes = await fetch(searchUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${BRANDFETCH_API_KEY}` },
    });
    const searchBody = await searchRes.text();

    if (!searchRes.ok) {
      console.error('Brandfetch search failed:', searchRes.status, searchBody.slice(0, 200));
      return res.status(searchRes.status === 404 ? 404 : 502).json({
        error: searchRes.status === 404 ? 'Brand not found' : `Brandfetch search error: ${searchRes.status}`,
      });
    }

    let results;
    try {
      results = JSON.parse(searchBody);
    } catch (parseErr) {
      console.error('Brandfetch response not JSON:', searchBody.slice(0, 200));
      return res.status(502).json({ error: 'Invalid response from Brandfetch' });
    }
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(404).json({ error: 'No brand found for this name' });
    }

    const first = results[0];
    if (!first || typeof first !== 'object') {
      return res.status(502).json({ error: 'Unexpected Brandfetch response shape' });
    }
    let logoUrl = first.icon || null;

    // If Search API didn't return an icon, try Brand API by domain to get logos
    if (!logoUrl && first.domain) {
      const domain = String(first.domain).replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
      const brandRes = await fetch(`${BRANDFETCH_BRANDS_BASE}/domain/${encodeURIComponent(domain)}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${BRANDFETCH_API_KEY}` },
      });
      const brandBody = await brandRes.text();
      if (brandRes.ok) {
        try {
          const brandData = JSON.parse(brandBody);
          const logos = brandData.logos ?? [];
          const preferred = logos.find((l) => l.type === 'logo' || l.type === 'icon') ?? logos[0];
          if (preferred?.formats?.length) {
            const formats = preferred.formats;
            const svg = formats.find((f) => (f.format || '').toLowerCase() === 'svg');
            const best = svg ?? formats[0];
            logoUrl = best.src || best.url || null;
          }
        } catch {
          // ignore parse error for fallback
        }
      }
    }

    if (!logoUrl) {
      return res.status(404).json({ error: 'No logo found for this brand' });
    }
    res.json({ logoUrl });
  } catch (err) {
    console.error('Brandfetch proxy error:', err);
    res.status(502).json({ error: err instanceof Error ? err.message : 'Failed to fetch brand data' });
  }
});

// Static files (SPA)
const distDir = path.join(__dirname, '..', 'dist');
app.use(express.static(distDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
