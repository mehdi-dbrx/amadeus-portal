#!/usr/bin/env node
/**
 * Test the brand logo REST API call (Brandfetch) without starting the full app.
 *
 * Usage:
 *   node scripts/test-brand-api.js [name]
 *   node scripts/test-brand-api.js Amadeus
 *   npm run test:brand-api -- Amadeus
 *
 * Requires BRANDFETCH_CLIENT_ID or BRANDFETCH_API_KEY in .env.local.
 * Calls Brandfetch Search API directly so you can see the raw response/errors.
 *
 * To test our server's /api/brand instead (server must be running on port 8000):
 *   curl -s "http://localhost:8000/api/brand?name=Amadeus"
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const name = process.argv[2]?.trim() || 'Amadeus';

// Load .env.local
try {
  const envPath = path.join(root, '.env.local');
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) {
      const val = m[2].replace(/^["']|["']$/g, '').trim();
      if (!process.env[m[1]]) process.env[m[1]] = val;
    }
  }
} catch (e) {
  console.warn('No .env.local found, using process env only');
}

const BRANDFETCH_CLIENT_ID = process.env.BRANDFETCH_CLIENT_ID || process.env.BRANDFETCH_API_KEY;
const BRANDFETCH_SEARCH_BASE = 'https://api.brandfetch.io/v2/search';

async function main() {
  console.log('Testing Brandfetch Search API (by brand name)');
  console.log('  name:', name);
  console.log('  client ID set:', !!BRANDFETCH_CLIENT_ID);
  console.log('');

  if (!BRANDFETCH_CLIENT_ID) {
    console.error('ERROR: Set BRANDFETCH_CLIENT_ID or BRANDFETCH_API_KEY in .env.local');
    process.exit(1);
  }

  const url = `${BRANDFETCH_SEARCH_BASE}/${encodeURIComponent(name)}?c=${encodeURIComponent(BRANDFETCH_CLIENT_ID)}`;
  console.log('GET', url);
  console.log('');

  try {
    const res = await fetch(url);
    const body = await res.text();
    console.log('Status:', res.status, res.statusText);
    console.log('Response (first 500 chars):', body.slice(0, 500));
    if (body.length > 500) console.log('... (truncated)');
    console.log('');

    if (!res.ok) {
      console.error('Request failed:', res.status);
      process.exit(1);
    }

    const data = JSON.parse(body);
    if (Array.isArray(data) && data.length > 0) {
      const first = data[0];
      console.log('First result:', JSON.stringify({ name: first.name, domain: first.domain, icon: first.icon ? '(present)' : '(missing)' }, null, 2));
      if (first.icon) {
        console.log('Logo URL:', first.icon);
        console.log('OK');
      } else {
        console.log('No icon in first result (KO)');
        process.exit(1);
      }
    } else {
      console.error('No results or invalid shape (KO)');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
