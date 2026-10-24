// Downloads the chosen photo for each menu item (picks.json → candidates.json), crops it to 4:3 and
// saves an optimised WebP into assets/menu/<id>.webp. Attribution is written to data/image-credits.json.
// picks.json values: a candidate index (number) or { src, title, creator, license, link, via } for a manual pick.
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const root = new URL('../../', import.meta.url).pathname;
const dir = root + 'scripts/images/';
const picks = JSON.parse(await readFile(dir + 'picks.json', 'utf8'));
const cands = JSON.parse(await readFile(dir + 'candidates.json', 'utf8'));
const credFile = root + 'data/image-credits.json';
let credits = {};
try { credits = JSON.parse(await readFile(credFile, 'utf8')); } catch {}
const UA = 'PastaliaMenuBot/1.0 (https://github.com/tselmegjargalshi-png/pastaliamenu)';

for (const [id, pick] of Object.entries(picks)) {
  const c = typeof pick === 'number' ? cands[id]?.list?.[pick] : (pick.position ? { ...cands[id]?.list?.[pick.index], ...pick } : pick);
  if (!c?.src) { console.error('no candidate', id, pick); continue; }
  if (credits[id]?.src === c.src && credits[id]?.position === (pick.position || 'attention')) continue;
  try {
    const r = await fetch(c.src, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60000) });
    if (!r.ok) throw new Error(String(r.status));
    const buf = Buffer.from(await r.arrayBuffer());
    const position = pick.position || 'attention';
    await sharp(buf).rotate()
      .resize(960, 720, { fit: 'cover', position: position === 'attention' ? sharp.strategy.attention : position })
      .modulate({ saturation: 1.04 })
      .webp({ quality: 74, effort: 6 })
      .toFile(`${root}assets/menu/${id}.webp`);
    credits[id] = { src: c.src, position, title: c.title, creator: c.creator, license: c.license, link: c.link, via: c.via };
    console.log('saved', id);
  } catch (e) {
    console.error('failed', id, e.message);
  }
}
await writeFile(credFile, JSON.stringify(credits, null, 1));
