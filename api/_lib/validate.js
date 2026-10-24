// Normalises a menu document coming from the admin panel; throws on anything malformed.
export const ALLERGENS = ['peanut', 'nuts', 'crustaceans', 'molluscs', 'fish', 'egg', 'milk', 'gluten', 'soy', 'sesame', 'celery', 'mustard', 'lupin', 'sulphites'];

const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const tx = (v, max = 300) => ({ tr: str(v?.tr, max), en: str(v?.en, max) });
const num = (v, label = 'Geçersiz fiyat', max = 1e7) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > max) throw bad(label);
  return Math.round(n * 100) / 100;
};
const id = (v) => {
  const s = str(v, 80);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(s)) throw bad(`Geçersiz kimlik: ${s}`);
  return s;
};
const url = (v) => {
  const s = str(v, 600);
  if (!s) return '';
  if (s.startsWith('/') && !s.startsWith('//')) return s;
  if (/^https:\/\/[^\s"'<>]+$/.test(s)) return s;
  throw bad('Geçersiz görsel adresi');
};
function bad(message) {
  return Object.assign(new Error(message), { status: 400 });
}

export function validateMenu(m) {
  if (!m || typeof m !== 'object' || !Array.isArray(m.categories) || !Array.isArray(m.items)) throw bad('Menü biçimi hatalı');
  if (m.categories.length > 60 || m.items.length > 800) throw bad('Çok fazla kayıt');
  const s = m.settings || {};
  const settings = { name: str(s.name, 80) || 'Pastalia' };
  for (const k of ['subtitle', 'tagline', 'hours', 'orderNote', 'allergenNote']) settings[k] = tx(s[k], 300);
  for (const k of ['city', 'address', 'phone', 'instagram', 'currency', 'mealCards', 'delivery']) settings[k] = str(s[k], 300);
  settings.currency ||= '₺';
  settings.instagram = settings.instagram.replace(/^@/, '').replace(/[^A-Za-z0-9._]/g, '');
  settings.mapsUrl = /^https:\/\//.test(str(s.mapsUrl, 600)) ? str(s.mapsUrl, 600) : '';

  const categories = m.categories.map((c) => {
    const cat = { id: id(c.id), name: tx(c.name, 80), note: tx(c.note, 200), layout: c.layout === 'list' ? 'list' : 'cards', hidden: Boolean(c.hidden) };
    if (!cat.name.tr) throw bad('Kategori adı (TR) boş olamaz');
    cat.name.en ||= cat.name.tr;
    return cat;
  });
  const catIds = new Set(categories.map((c) => c.id));
  if (catIds.size !== categories.length) throw bad('Tekrarlanan kategori');

  const seen = new Set();
  const items = m.items.map((it) => {
    const item = {
      id: id(it.id),
      cat: id(it.cat),
      name: tx(it.name, 120),
      desc: tx(it.desc, 500),
      price: num(it.price),
      kcal: num(it.kcal, 'Geçersiz kalori', 10000),
      allergens: [...new Set((Array.isArray(it.allergens) ? it.allergens : []).filter((a) => ALLERGENS.includes(a)))],
      img: url(it.img),
      credit: str(it.credit, 300),
      badge: tx(it.badge, 30),
      featured: Boolean(it.featured),
      available: it.available !== false,
      hidden: Boolean(it.hidden),
    };
    if (!item.name.tr) throw bad('Ürün adı (TR) boş olamaz');
    item.name.en ||= item.name.tr;
    if (!catIds.has(item.cat)) throw bad(`"${item.name.tr}" için kategori bulunamadı`);
    if (seen.has(item.id)) throw bad(`Tekrarlanan ürün: ${item.name.tr}`);
    seen.add(item.id);
    return item;
  });
  return { version: 2, settings, categories, items };
}
