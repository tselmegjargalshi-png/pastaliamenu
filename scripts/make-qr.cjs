const QR = require('qrcode'); const sharp = require('sharp'); const fs = require('fs');
const URL_ = process.argv[2], out = process.argv[3], logo = process.argv[4], logoLight = process.argv[5];
const ink = '#1f3a47';
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const qr = QR.create(URL_, { errorCorrectionLevel: 'H' });
  const n = qr.modules.size, q = 4, cell = 10, size = (n + q * 2) * cell;
  // rounded-dot modules, solid finder patterns
  const isFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  const hole = (r, c) => { const m = n / 2, h = n * 0.11; return Math.abs(r + .5 - m) < h && Math.abs(c + .5 - m) < h; };
  let dots = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (!qr.modules.get(r, c) || isFinder(r, c) || hole(r, c)) continue;
    dots += `<rect x="${(c + q) * cell + 0.2}" y="${(r + q) * cell + 0.2}" width="${cell - 0.4}" height="${cell - 0.4}" rx="2"/>`;
  }
  const finder = (r, c) => { const x = (c + q) * cell, y = (r + q) * cell;
    return `<rect x="${x + 5}" y="${y + 5}" width="${cell * 7 - 10}" height="${cell * 7 - 10}" rx="16" fill="none" stroke="${ink}" stroke-width="10"/><rect x="${x + cell * 2}" y="${y + cell * 2}" width="${cell * 3}" height="${cell * 3}" rx="8" fill="#5c9a83"/>`; };
  const logoB64 = fs.readFileSync(logo).toString('base64');
  const lw = n * 0.21 * cell, lh = lw * 826 / 571, cx = size / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
<rect width="100%" height="100%" fill="#fff"/>
<g fill="${ink}">${dots}</g>${finder(0, 0)}${finder(0, n - 7)}${finder(n - 7, 0)}
<rect x="${cx - n * 0.11 * cell}" y="${cx - n * 0.11 * cell}" width="${n * 0.22 * cell}" height="${n * 0.22 * cell}" rx="18" fill="#fff"/>
<image href="data:image/png;base64,${logoB64}" x="${cx - lw / 2 * 0.72}" y="${cx - lh / 2 * 0.72}" width="${lw * 0.72}" height="${lh * 0.72}"/>
</svg>`;
  fs.writeFileSync(`${out}/pastalia-menu-qr.svg`, svg);
  await sharp(Buffer.from(svg), { density: 300 }).resize(1600, 1600).png().toFile(`${out}/pastalia-menu-qr.png`);

  // printable table card (A6 portrait ratio, 1240x1748 @300dpi)
  const W = 1240, H = 1748, qs = 860;
  const qrPng = await sharp(Buffer.from(svg), { density: 300 }).resize(qs, qs).png().toBuffer();
  const lb = fs.readFileSync(logo).toString('base64');
  const card = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<rect width="100%" height="100%" fill="#f7f3ea"/>
<circle cx="140" cy="210" r="22" fill="#8fc4b0" opacity=".45"/><circle cx="1090" cy="300" r="34" fill="#8fc4b0" opacity=".35"/><circle cx="1010" cy="170" r="12" fill="#8fc4b0" opacity=".5"/><circle cx="220" cy="420" r="12" fill="#8fc4b0" opacity=".4"/>
<image href="data:image/png;base64,${lb}" x="${W / 2 - 150}" y="70" width="300" height="${300 * 826 / 571}"/>
<text x="${W / 2}" y="580" text-anchor="middle" font-family="DejaVu Serif, Georgia, serif" font-size="58" font-weight="bold" fill="${ink}">Menü · Menu</text>
<text x="${W / 2}" y="636" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="30" fill="#4d6670" letter-spacing="3">PIZZA &amp; MAKARNA · MILAS</text>
<rect x="${(W - qs) / 2 - 30}" y="680" width="${qs + 60}" height="${qs + 60}" rx="40" fill="#fff"/>
<text x="${W / 2}" y="1712" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="34" fill="#a97b43">Kamerayla okutun · Scan with your camera</text>
<text x="${W / 2}" y="1656" text-anchor="middle" font-family="DejaVu Sans Mono, monospace" font-size="32" fill="${ink}">${URL_.replace(/^https:\/\//, '')}</text>
</svg>`;
  await sharp(Buffer.from(card)).composite([{ input: qrPng, left: (W - qs) / 2, top: 710 }]).png().toFile(`${out}/pastalia-menu-qr-table-card.png`);
  console.log('ok', n);
})();
