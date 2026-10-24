// Finds licence-appropriate photo candidates (Openverse + Wikimedia Commons) for every menu item and
// renders one labelled contact sheet per item into scripts/images/review/ for manual picking.
// Usage: node scripts/images/search.mjs [id ...]   (no ids = every id not searched yet with the same query)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const dir = new URL('.', import.meta.url).pathname;
const queries = JSON.parse(await readFile(dir + 'queries.json', 'utf8'));
const candFile = dir + 'candidates.json';
let cands = {};
try { cands = JSON.parse(await readFile(candFile, 'utf8')); } catch {}
const only = process.argv.slice(2);
const UA = 'PastaliaMenuBot/1.0 (https://github.com/tselmegjargalshi-png/pastaliamenu)';
const OK_LICENSE = /^(cc0|pdm|by|by-sa|public domain|cc by(-sa)? [\d.]+|cc by(-sa)?)$/i;

async function get(url, as = 'json') {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(40000) });
      if (r.status === 429) { await sleep(8000); continue; }
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return as === 'json' ? r.json() : Buffer.from(await r.arrayBuffer());
    } catch (e) {
      if (i === 2) throw e;
      await sleep(2000);
    }
  }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (s) => String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120);

async function openverse(q) {
  const j = await get(`https://api.openverse.org/v1/images/?q=${encodeURIComponent(q)}&license_type=commercial&page_size=20&mature=false`);
  return (j.results || [])
    .filter((x) => (x.width || 0) >= 800 && (x.height || 0) >= 560 && OK_LICENSE.test(x.license))
    .map((x) => ({
      src: x.url, thumb: x.thumbnail, w: x.width, h: x.height, title: clean(x.title), creator: clean(x.creator),
      license: `${x.license === 'cc0' || x.license === 'pdm' ? x.license.toUpperCase() : 'CC ' + x.license.toUpperCase()} ${x.license === 'pdm' ? '' : x.license_version || ''}`.trim(),
      link: x.foreign_landing_url, via: x.source,
    }));
}

async function commons(q) {
  const u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=15'
    + `&gsrsearch=${encodeURIComponent(q + ' filetype:bitmap')}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1400`;
  const j = await get(u);
  const pages = Object.values(j.query?.pages || {}).sort((a, b) => a.index - b.index);
  return pages.map((p) => {
    const ii = p.imageinfo?.[0] || {}, m = ii.extmetadata || {};
    const lic = clean(m.LicenseShortName?.value);
    return {
      src: ii.thumburl || ii.url, thumb: ii.thumburl, w: ii.width, h: ii.height, title: clean(p.title.replace(/^File:/, '').replace(/\.\w+$/, '')),
      creator: clean(m.Artist?.value), license: lic, link: ii.descriptionurl, via: 'wikimedia',
    };
  }).filter((x) => x.w >= 800 && x.h >= 560 && /^(cc0|public domain|cc by(-sa)? [\d.]+|cc by(-sa)?)$/i.test(x.license));
}

await mkdir(dir + 'review', { recursive: true });
for (const [id, q] of Object.entries(queries)) {
  if (only.length ? !only.includes(id) : cands[id]?.query === q) continue;
  let list = [];
  try { list.push(...(await openverse(q)).slice(0, 6)); } catch (e) { console.error('openverse', id, e.message); }
  await sleep(1500);
  try { list.push(...(await commons(q)).slice(0, 4)); } catch (e) { console.error('commons', id, e.message); }
  const seen = new Set();
  list = list.filter((x) => x.src && !seen.has(x.src) && seen.add(x.src)).slice(0, 8);
  const tiles = [];
  for (const [i, c] of list.entries()) {
    try {
      const buf = await get(c.thumb || c.src, 'buf');
      const img = await sharp(buf).rotate().resize(300, 225, { fit: 'cover' }).jpeg().toBuffer();
      const label = Buffer.from(`<svg width="300" height="225"><rect x="0" y="0" width="34" height="30" fill="#000" opacity=".75"/><text x="17" y="22" font-size="20" font-family="DejaVu Sans" font-weight="bold" fill="#fff" text-anchor="middle">${i}</text></svg>`);
      tiles.push({ input: await sharp(img).composite([{ input: label }]).toBuffer(), left: (i % 4) * 302, top: Math.floor(i / 4) * 227 });
    } catch (e) {
      console.error('thumb', id, i, e.message);
    }
  }
  if (tiles.length) {
    await sharp({ create: { width: 1206, height: 452, channels: 3, background: '#222' } }).composite(tiles).jpeg({ quality: 70 }).toFile(`${dir}review/${id}.jpg`);
  }
  cands[id] = { query: q, list };
  console.log(id, list.length, 'candidates');
  await writeFile(candFile, JSON.stringify(cands, null, 1));
  await sleep(1500);
}
