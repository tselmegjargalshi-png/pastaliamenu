(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const TRMAP = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', Ç: 'c', Ğ: 'g', İ: 'i', Ö: 'o', Ş: 's', Ü: 'u' };
  const slug = (s) => String(s || '').replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => TRMAP[c]).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'x';
  const norm = (s) => String(s || '').replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => TRMAP[c]).toLowerCase();
  const toNum = (v) => { const s = String(v ?? '').trim().replace(/\s/g, '').replace(',', '.'); if (!s) return null; const n = Number(s); return Number.isFinite(n) && n >= 0 ? n : NaN; };
  const AL = () => window.PASTALIA_ALLERGENS;
  const SETTINGS = [
    ['name', 'İşletme adı'], ['city', 'Şehir / ilçe'],
    ['subtitle', 'Alt başlık', 'tx'], ['hours', 'Çalışma saatleri', 'tx'],
    ['tagline', 'Slogan', 'tx-full'], ['orderNote', 'Sipariş notu', 'tx'], ['allergenNote', 'Alerjen uyarısı', 'tx'],
    ['address', 'Adres', 'full'], ['phone', 'Telefon'], ['instagram', 'Instagram kullanıcı adı'],
    ['mapsUrl', 'Google Haritalar bağlantısı (https://…)', 'full'],
    ['mealCards', 'Yemek kartları (virgülle ayırın)', 'full'], ['delivery', 'Online sipariş platformları (virgülle ayırın)', 'full'],
    ['currency', 'Para birimi simgesi'],
  ];

  let menu = null, dirty = false, editing = null, pendingImg;

  function toast(msg, bad) {
    const t = $('#toast'); t.textContent = msg; t.className = 'toast show' + (bad ? ' bad' : '');
    clearTimeout(toast.t); toast.t = setTimeout(() => (t.className = 'toast'), 2800);
  }
  async function api(path, opts = {}) {
    const r = await fetch(path, { credentials: 'same-origin', ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });
    let data = null; try { data = await r.json(); } catch {}
    if (r.status === 401 && path !== '/api/login') { showLogin(); throw new Error('Oturum süresi doldu, lütfen tekrar giriş yapın.'); }
    if (!r.ok) throw new Error((data && data.error) || `Hata ${r.status}`);
    return { status: r.status, data };
  }
  function setDirty(v = true) { dirty = v; $('#dirty').hidden = !v; $('#save').disabled = !v; counts(); }
  addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  // ── auth
  function showLogin() { $('#app').hidden = true; $('#login').hidden = false; setTimeout(() => $('#login-form [name=user]').focus(), 50); }
  $('.pw-eye').addEventListener('click', () => { const i = $('#login-form [name=password]'); i.type = i.type === 'password' ? 'text' : 'password'; });
  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, btn = f.querySelector('[type=submit]'); $('#login-err').textContent = ''; btn.disabled = true;
    try {
      await api('/api/login', { method: 'POST', body: JSON.stringify({ user: f.user.value, password: f.password.value }) });
      f.password.value = ''; await boot();
    } catch (err) { $('#login-err').textContent = err.message; }
    btn.disabled = false;
  });
  $('#logout').addEventListener('click', async () => {
    if (dirty && !confirm('Kaydedilmemiş değişiklikler kaybolacak. Çıkış yapılsın mı?')) return;
    setDirty(false); try { await api('/api/logout', { method: 'POST' }); } catch {} showLogin();
  });

  async function boot() {
    try { await api('/api/me'); } catch { showLogin(); return; }
    let data = null;
    try { const r = await api('/api/menu?fresh=1'); if (r.status === 200) data = r.data; } catch (e) { toast(e.message, true); }
    if (!data || !data.items) data = await (await fetch('/data/menu.json', { cache: 'no-cache' })).json();
    menu = data;
    menu.categories.forEach((c) => { c.hidden = !!c.hidden; });
    $('#login').hidden = true; $('#app').hidden = false;
    renderAll(); setDirty(false);
  }

  // ── tabs
  $$('.tabs button').forEach((b) => b.addEventListener('click', () => {
    $$('.tabs button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    for (const t of ['items', 'prices', 'cats', 'settings']) $('#tab-' + t).hidden = t !== b.dataset.tab;
    if (b.dataset.tab === 'prices') renderPrices();
    if (b.dataset.tab === 'items') renderItems();
  }));

  function renderAll() { renderFilter(); renderItems(); renderCats(); renderSettings(); counts(); }
  function counts() {
    if (!menu) return;
    $('#n-items').textContent = menu.items.length;
    const missing = menu.items.filter((i) => i.price == null && !i.hidden).length;
    $('#n-missing').textContent = missing ? `${missing} eksik` : '✓';
    $('#n-missing').className = missing ? 'warn' : '';
  }
  const catName = (id) => menu.categories.find((c) => c.id === id)?.name?.tr || '?';

  // ── items
  function renderFilter() {
    const cur = $('#f-cat').value;
    $('#f-cat').innerHTML = '<option value="">Tüm kategoriler</option>' + menu.categories.map((c) => `<option value="${esc(c.id)}">${esc(c.name.tr)}</option>`).join('');
    $('#f-cat').value = menu.categories.some((c) => c.id === cur) ? cur : '';
  }
  function renderItems() {
    const q = norm($('#f-q').value), cat = $('#f-cat').value, st = $('#f-state').value;
    const ok = (i) => (!cat || i.cat === cat) && (!q || norm(`${i.name.tr} ${i.name.en}`).includes(q))
      && (!st || (st === 'noprice' && i.price == null) || (st === 'out' && i.available === false) || (st === 'hidden' && i.hidden) || (st === 'featured' && i.featured));
    let html = '';
    for (const c of menu.categories) {
      const list = menu.items.filter((i) => i.cat === c.id && ok(i));
      if (!list.length) continue;
      html += `<h3 class="group-h">${esc(c.name.tr)} <small>${esc(c.name.en)}${c.hidden ? ' · kategori gizli' : ''}</small></h3>`;
      html += list.map((it) => `
        <div class="item${it.hidden ? ' is-hidden' : ''}${it.available === false ? ' is-out' : ''}" data-id="${esc(it.id)}">
          <div class="th" style="${it.img ? `background-image:url('${esc(it.img)}')` : ''}">${it.img ? '' : 'Görsel yok'}</div>
          <div class="nm"><b>${esc(it.name.tr)}</b><span>${esc(it.name.en)}${it.kcal ? ` · ${it.kcal} kcal` : ''}</span>
            <div class="flags">${it.price == null ? '<span class="flag red">Fiyat yok</span>' : ''}${it.available === false ? '<span class="flag red">Tükendi</span>' : ''}${it.hidden ? '<span class="flag">Gizli</span>' : ''}${it.featured ? '<span class="flag gold">★ Öne çıkan</span>' : ''}</div>
          </div>
          <div class="ctl">
            <input class="price-in" inputmode="decimal" value="${it.price ?? ''}" placeholder="Fiyat" aria-label="${esc(it.name.tr)} fiyatı" data-price>
            <label class="sw mini" title="Satışta"><input type="checkbox" data-toggle="available" ${it.available !== false ? 'checked' : ''}><span></span>Satışta</label>
            <button class="iconbtn" data-move="-1" title="Yukarı taşı" aria-label="Yukarı taşı">↑</button>
            <button class="iconbtn" data-move="1" title="Aşağı taşı" aria-label="Aşağı taşı">↓</button>
            <button class="btn small ghost" data-edit>Düzenle</button>
          </div>
        </div>`).join('');
    }
    $('#item-list').innerHTML = html || '<p class="hint">Ürün bulunamadı.</p>';
  }
  $('#f-q').addEventListener('input', renderItems);
  $('#f-cat').addEventListener('change', renderItems);
  $('#f-state').addEventListener('change', renderItems);

  $('#item-list').addEventListener('change', (e) => {
    const row = e.target.closest('.item'); if (!row) return;
    const it = menu.items.find((i) => i.id === row.dataset.id);
    if (e.target.matches('[data-price]')) {
      const n = toNum(e.target.value);
      if (Number.isNaN(n)) { toast('Geçersiz fiyat', true); e.target.value = it.price ?? ''; return; }
      it.price = n; setDirty(); renderItems();
    }
    if (e.target.matches('[data-toggle]')) { it[e.target.dataset.toggle] = e.target.checked; setDirty(); renderItems(); }
  });
  $('#item-list').addEventListener('click', (e) => {
    const row = e.target.closest('.item'); if (!row) return;
    const idx = menu.items.findIndex((i) => i.id === row.dataset.id);
    const mv = e.target.closest('[data-move]');
    if (mv) {
      const dir = +mv.dataset.move, cat = menu.items[idx].cat;
      let j = idx + dir;
      while (j >= 0 && j < menu.items.length && menu.items[j].cat !== cat) j += dir;
      if (j < 0 || j >= menu.items.length) return;
      [menu.items[idx], menu.items[j]] = [menu.items[j], menu.items[idx]];
      setDirty(); renderItems();
      return;
    }
    if (e.target.closest('[data-edit]') || e.target.closest('.th') || e.target.closest('.nm')) openItem(menu.items[idx]);
  });

  // ── item drawer
  const form = $('#item-form');
  function openItem(it) {
    editing = it; pendingImg = undefined;
    $('#drawer-title').textContent = it ? 'Ürünü düzenle' : 'Yeni ürün';
    form.cat.innerHTML = menu.categories.map((c) => `<option value="${esc(c.id)}">${esc(c.name.tr)}</option>`).join('');
    const v = it || { name: {}, desc: {}, badge: {}, allergens: [], available: true, cat: $('#f-cat').value || menu.categories[0]?.id };
    form.name_tr.value = v.name.tr || ''; form.name_en.value = v.name.en || '';
    form.desc_tr.value = v.desc?.tr || ''; form.desc_en.value = v.desc?.en || '';
    form.cat.value = v.cat; form.price.value = v.price ?? ''; form.kcal.value = v.kcal ?? '';
    form.badge_tr.value = v.badge?.tr || ''; form.badge_en.value = v.badge?.en || ''; form.credit.value = v.credit || '';
    form.available.checked = v.available !== false; form.hidden.checked = !!v.hidden; form.featured.checked = !!v.featured;
    $('#al-pick').innerHTML = AL().order.map((a) => `<label class="al-opt"><input type="checkbox" value="${a}" ${v.allergens?.includes(a) ? 'checked' : ''}>${AL().byId[a].svg}${esc(AL().byId[a].name.tr)}</label>`).join('');
    showImg(v.img);
    $('#del-item').hidden = !it;
    $('#img-status').textContent = 'JPG, PNG veya WebP. Otomatik küçültülür.';
    $('#drawer').hidden = false;
    form.name_tr.focus();
  }
  function showImg(url) {
    const p = $('#img-prev');
    p.style.backgroundImage = url ? `url('${url.replace(/'/g, '%27')}')` : '';
    p.textContent = url ? '' : 'Görsel yok';
  }
  function closeDrawer() { $('#drawer').hidden = true; editing = null; }
  $$('#drawer [data-close]').forEach((b) => b.addEventListener('click', closeDrawer));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#drawer').hidden) closeDrawer(); });

  $('#img-remove').addEventListener('click', () => { pendingImg = ''; showImg(''); form.credit.value = ''; });
  $('#img-file').addEventListener('change', async (e) => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    const st = $('#img-status'); st.textContent = 'Hazırlanıyor…';
    try {
      const blob = await shrink(file, 1400);
      st.textContent = 'Yükleniyor…';
      const data = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });
      const { data: out } = await api('/api/upload', { method: 'POST', body: JSON.stringify({ name: slug(form.name_tr.value || 'urun'), type: blob.type, data }) });
      pendingImg = out.url; showImg(out.url); form.credit.value = '';
      st.textContent = 'Görsel yüklendi. “Tamam” ve ardından “Kaydet & yayınla” deyin.';
    } catch (err) { st.textContent = err.message || 'Görsel yüklenemedi'; toast(st.textContent, true); }
  });
  async function shrink(file, max) {
    const bmp = await createImageBitmap(file).catch(() => null);
    if (!bmp) throw new Error('Bu görsel okunamadı. JPG veya PNG deneyin.');
    const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    let blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.82));
    if (!blob || blob.type !== 'image/webp') blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
    return blob;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameTr = form.name_tr.value.trim();
    if (!nameTr) { toast('Türkçe ürün adı gerekli', true); form.name_tr.focus(); return; }
    const price = toNum(form.price.value), kcal = toNum(form.kcal.value);
    if (Number.isNaN(price)) { toast('Fiyatı sayı olarak girin (ör. 320 veya 320,50)', true); form.price.focus(); return; }
    if (Number.isNaN(kcal)) { toast('Kaloriyi sayı olarak girin', true); form.kcal.focus(); return; }
    const it = editing || { id: uniqueId(slug(nameTr)), img: '' };
    Object.assign(it, {
      cat: form.cat.value,
      name: { tr: nameTr, en: form.name_en.value.trim() },
      desc: { tr: form.desc_tr.value.trim(), en: form.desc_en.value.trim() },
      price, kcal: kcal == null ? null : Math.round(kcal),
      badge: { tr: form.badge_tr.value.trim(), en: form.badge_en.value.trim() },
      credit: form.credit.value.trim(),
      allergens: $$('#al-pick input:checked').map((i) => i.value),
      available: form.available.checked, hidden: form.hidden.checked, featured: form.featured.checked,
    });
    if (pendingImg !== undefined) it.img = pendingImg;
    if (!editing) {
      const lastIdx = menu.items.map((i) => i.cat).lastIndexOf(it.cat);
      menu.items.splice(lastIdx + 1, 0, it);
    }
    closeDrawer(); setDirty(); renderItems();
    toast('Ürün güncellendi. Yayınlamak için “Kaydet & yayınla”.');
  });
  $('#del-item').addEventListener('click', () => {
    if (!editing || !confirm(`“${editing.name.tr}” silinsin mi?`)) return;
    menu.items = menu.items.filter((i) => i !== editing);
    closeDrawer(); setDirty(); renderItems();
  });
  $('#add-item').addEventListener('click', () => openItem(null));
  function uniqueId(base) { let id = base, n = 2; const ids = new Set([...menu.items.map((i) => i.id), ...menu.categories.map((c) => c.id)]); while (ids.has(id)) id = `${base}-${n++}`; return id; }

  // ── quick prices
  function renderPrices() {
    let html = '';
    for (const c of menu.categories) {
      const list = menu.items.filter((i) => i.cat === c.id);
      if (!list.length) continue;
      html += `<h3>${esc(c.name.tr)}</h3>` + list.map((it) => `<label class="prow" data-id="${esc(it.id)}"><span>${esc(it.name.tr)}${it.hidden ? ' <small class="hint">(gizli)</small>' : ''}</span><input inputmode="decimal" value="${it.price ?? ''}" placeholder="—" class="${it.price == null ? 'empty' : ''}"></label>`).join('');
    }
    $('#price-list').innerHTML = html;
  }
  $('#price-list').addEventListener('change', (e) => {
    const row = e.target.closest('.prow'); if (!row) return;
    const it = menu.items.find((i) => i.id === row.dataset.id), n = toNum(e.target.value);
    if (Number.isNaN(n)) { toast('Geçersiz fiyat', true); e.target.value = it.price ?? ''; return; }
    it.price = n; e.target.classList.toggle('empty', n == null); setDirty();
  });
  $('#price-list').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !e.target.matches('input')) return;
    e.preventDefault(); const all = $$('#price-list input'); all[all.indexOf(e.target) + 1]?.focus();
  });

  // ── categories
  function renderCats() {
    $('#cat-list').innerHTML = menu.categories.map((c, i) => `
      <div class="cat" data-i="${i}">
        <label>Ad (TR) <input data-k="name.tr" value="${esc(c.name.tr)}"></label>
        <label>Name (EN) <input data-k="name.en" value="${esc(c.name.en)}"></label>
        <div class="ctl">
          <button class="iconbtn" data-cmove="-1" aria-label="Yukarı">↑</button>
          <button class="iconbtn" data-cmove="1" aria-label="Aşağı">↓</button>
        </div>
        <label>Alt not (TR) <input data-k="note.tr" value="${esc(c.note?.tr)}"></label>
        <label>Note (EN) <input data-k="note.en" value="${esc(c.note?.en)}"></label>
        <span></span>
        <label>Düzen <select data-k="layout"><option value="cards" ${c.layout !== 'list' ? 'selected' : ''}>Kartlar (büyük görsel)</option><option value="list" ${c.layout === 'list' ? 'selected' : ''}>Liste (kompakt)</option></select></label>
        <label class="sw" style="align-self:center"><input type="checkbox" data-k="hidden" ${c.hidden ? 'checked' : ''}><span></span>Kategoriyi gizle</label>
        <div class="ctl"><span class="hint">${menu.items.filter((x) => x.cat === c.id).length} ürün</span><button class="btn small danger-btn" data-cdel>Sil</button></div>
      </div>`).join('');
  }
  $('#cat-list').addEventListener('change', (e) => {
    const box = e.target.closest('.cat'); if (!box || !e.target.dataset.k) return;
    const c = menu.categories[+box.dataset.i], [a, b] = e.target.dataset.k.split('.');
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value.trim();
    if (b) { c[a] = c[a] || {}; c[a][b] = val; } else c[a] = val;
    setDirty(); renderFilter();
  });
  $('#cat-list').addEventListener('click', (e) => {
    const box = e.target.closest('.cat'); if (!box) return;
    const i = +box.dataset.i;
    const mv = e.target.closest('[data-cmove]');
    if (mv) { const j = i + +mv.dataset.cmove; if (j < 0 || j >= menu.categories.length) return; [menu.categories[i], menu.categories[j]] = [menu.categories[j], menu.categories[i]]; setDirty(); renderCats(); renderFilter(); return; }
    if (e.target.closest('[data-cdel]')) {
      const c = menu.categories[i], n = menu.items.filter((x) => x.cat === c.id).length;
      if (!confirm(n ? `“${c.name.tr}” kategorisi ve içindeki ${n} ürün silinsin mi?` : `“${c.name.tr}” silinsin mi?`)) return;
      menu.categories.splice(i, 1); menu.items = menu.items.filter((x) => x.cat !== c.id);
      setDirty(); renderAll();
    }
  });
  $('#add-cat').addEventListener('click', () => {
    const name = prompt('Yeni kategori adı (Türkçe):'); if (!name?.trim()) return;
    menu.categories.push({ id: uniqueId(slug(name)), name: { tr: name.trim(), en: '' }, note: { tr: '', en: '' }, layout: 'cards', hidden: false });
    setDirty(); renderAll(); toast('Kategori eklendi. İngilizce adını girmeyi unutmayın.');
  });

  // ── settings
  function renderSettings() {
    const s = menu.settings || (menu.settings = {});
    $('#settings-form').innerHTML = SETTINGS.map(([k, label, kind = '']) => {
      if (kind.startsWith('tx')) {
        const v = s[k] || {};
        return `<label class="${kind === 'tx-full' ? 'full' : ''}">${esc(label)} (TR) <input data-s="${k}.tr" value="${esc(v.tr)}"></label><label class="${kind === 'tx-full' ? 'full' : ''}">${esc(label)} (EN) <input data-s="${k}.en" value="${esc(v.en)}"></label>`;
      }
      return `<label class="${kind}">${esc(label)} <input data-s="${k}" value="${esc(s[k])}"></label>`;
    }).join('');
  }
  $('#settings-form').addEventListener('input', (e) => {
    const [a, b] = (e.target.dataset.s || '').split('.'); if (!a) return;
    if (b) { menu.settings[a] = menu.settings[a] || {}; menu.settings[a][b] = e.target.value; } else menu.settings[a] = e.target.value;
    setDirty();
  });

  // ── backup
  $('#export').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(menu, null, 1)], { type: 'application/json' }));
    a.download = `pastalia-menu-${new Date().toISOString().slice(0, 10)}.json`; a.click();
  });
  $('#import').addEventListener('change', async (e) => {
    const f = e.target.files[0]; e.target.value = ''; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!Array.isArray(data.items) || !Array.isArray(data.categories)) throw new Error();
      if (!confirm('Mevcut menü bu yedekle değiştirilecek (kaydedince yayınlanır). Devam edilsin mi?')) return;
      menu = data; renderAll(); setDirty(); toast('Yedek yüklendi. Kontrol edip “Kaydet & yayınla” deyin.');
    } catch { toast('Geçerli bir menü yedeği değil', true); }
  });

  // ── save
  $('#save').addEventListener('click', async () => {
    const btn = $('#save'); btn.disabled = true; btn.textContent = 'Kaydediliyor…';
    try {
      await api('/api/menu', { method: 'PUT', body: JSON.stringify(menu) });
      setDirty(false); toast('Kaydedildi. Müşteri menüsü en geç 1 dakika içinde güncellenir.');
    } catch (e) { toast(e.message, true); btn.disabled = false; }
    btn.textContent = 'Kaydet & yayınla';
  });

  boot();
})();
