(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s || '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i');
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };

  const UI = {
    tr: {
      skip: 'Menüye geç', search: 'Ara', allergenFilter: 'Alerjen filtresi', searchPh: 'Menüde ara… (ör. tavuk, pesto)', close: 'Kapat',
      loading: 'Menü yükleniyor…', hoursTitle: 'Çalışma saatleri', directions: 'Yol tarifi', mealCards: 'Geçerli yemek kartları',
      delivery: 'Online sipariş', deliveryText: 'Bize bu platformlardan da sipariş verebilirsiniz:', priceNote: 'Fiyatlarımıza KDV dahildir.',
      credits: 'Fotoğraf kaynakları', alTitle: 'Alerjen filtresi', alHelp: 'Seçtiğiniz alerjenleri içeren ürünleri gizleriz. Yine de sipariş verirken lütfen personelimize bildirin.',
      clear: 'Temizle', done: 'Tamam', featured: 'Pastalia favorileri', soldOut: 'Tükendi', noResults: 'Aramanızla eşleşen ürün bulunamadı.',
      hiddenBy: (n) => `Alerjen filtresi nedeniyle ${n} ürün gizlendi.`, showAll: 'Tümünü göster', allergens: 'Alerjenler', noAllergen: 'Bildirilen alerjen yok.',
      kcal: 'kcal', photo: 'Fotoğraf', photoNote: 'Temsilidir', items: 'ürün', loadFail: 'Menü yüklenemedi. Lütfen sayfayı yenileyin.', menu: 'Menü',
    },
    en: {
      skip: 'Skip to menu', search: 'Search', allergenFilter: 'Allergen filter', searchPh: 'Search the menu… (e.g. chicken, pesto)', close: 'Close',
      loading: 'Loading menu…', hoursTitle: 'Opening hours', directions: 'Directions', mealCards: 'Meal cards accepted',
      delivery: 'Order online', deliveryText: 'You can also order from us on:', priceNote: 'All prices include VAT.',
      credits: 'Photo credits', alTitle: 'Allergen filter', alHelp: 'We hide dishes that contain the allergens you select. Please still tell our staff when you order.',
      clear: 'Clear', done: 'Done', featured: 'Pastalia favourites', soldOut: 'Sold out', noResults: 'No dishes match your search.',
      hiddenBy: (n) => `${n} dishes hidden by your allergen filter.`, showAll: 'Show all', allergens: 'Allergens', noAllergen: 'No declared allergens.',
      kcal: 'kcal', photo: 'Photo', photoNote: 'For illustration', items: 'items', loadFail: 'The menu could not be loaded. Please refresh the page.', menu: 'Menu',
    },
  };

  let menu = null;
  let credits = {};
  let query = '';
  const params = new URLSearchParams(location.search);
  let lang = params.get('lang') || store.get('pst_lang') || ((navigator.language || 'tr').toLowerCase().startsWith('tr') ? 'tr' : 'en');
  if (!UI[lang]) lang = 'tr';
  let excluded = new Set((store.get('pst_allergens') || '').split(',').filter(Boolean));
  const A = () => window.PASTALIA_ALLERGENS;
  const t = (k) => UI[lang][k];
  const L = (o) => (o && typeof o === 'object' ? (o[lang] || o.tr || o.en || '') : String(o || ''));
  const other = (o) => (o && typeof o === 'object' ? (lang === 'tr' ? o.en : o.tr) || '' : '');

  async function load() {
    let data = null;
    try {
      const r = await fetch('/api/menu', { cache: 'no-cache' });
      if (r.status === 200) data = await r.json();
    } catch {}
    if (!data) {
      try { data = await (await fetch('/data/menu.json', { cache: 'no-cache' })).json(); } catch {}
    }
    try { credits = await (await fetch('/data/image-credits.json')).json(); } catch {}
    if (!data) { $('#menu').innerHTML = `<p class="loading">${esc(t('loadFail'))}</p>`; return; }
    menu = data;
    render();
    if (location.hash.length > 1) { const el = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (el) el.scrollIntoView(); }
  }

  const fmt = () => new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { maximumFractionDigits: 2 });
  const priceText = (n) => (n == null ? '' : `${fmt().format(n)} ${menu.settings?.currency || '₺'}`);
  const alIcons = (ids, max = 6) => ids.filter((a) => A().byId[a]).slice(0, max).map((a) => `<span title="${esc(A().byId[a].name[lang])}">${A().byId[a].svg}</span>`).join('');
  const visibleCats = () => menu.categories.filter((c) => !c.hidden);
  const itemsOf = (cid) => menu.items.filter((i) => i.cat === cid && !i.hidden);
  const blocked = (it) => it.allergens?.some((a) => excluded.has(a));
  const matches = (it) => {
    if (!query) return true;
    const q = norm(query);
    return [it.name?.tr, it.name?.en, it.desc?.tr, it.desc?.en].some((s) => norm(s).includes(q));
  };
  function hl(text) {
    const s = String(text || '');
    if (!query) return esc(s);
    const n = norm(s), q = norm(query), i = n.indexOf(q);
    if (i < 0 || n.length !== s.length) return esc(s);
    return esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + q.length)) + '</mark>' + esc(s.slice(i + q.length));
  }
  const photo = (it, cls = '') => it.img
    ? `<div class="ph ${cls}"><img src="${esc(it.img)}" alt="${esc(L(it.name))}" loading="lazy" decoding="async" onerror="this.parentNode.classList.add('none');this.src='/assets/brand/logo.webp'"></div>`
    : `<div class="ph none ${cls}"><img src="/assets/brand/logo.webp" alt="" loading="lazy"></div>`;

  function card(it) {
    const out = it.available === false;
    const badge = L(it.badge);
    return `<button type="button" class="card${out ? ' soldout' : ''}" data-id="${esc(it.id)}">
      <div class="txt">
        <h3>${hl(L(it.name))}</h3>
        ${L(it.desc) ? `<p class="desc">${hl(L(it.desc))}</p>` : ''}
        <div class="meta">
          ${out ? `<span class="pill-out">${esc(t('soldOut'))}</span>` : ''}
          ${it.kcal ? `<span class="kcal">${it.kcal} ${t('kcal')}</span>` : ''}
          <span class="als">${alIcons(it.allergens || [])}</span>
          ${it.price != null ? `<span class="price">${priceText(it.price)}</span>` : ''}
        </div>
      </div>
      ${photo(it)}${badge ? `<span class="badge">${esc(badge)}</span>` : ''}
    </button>`;
  }
  function row(it) {
    const out = it.available === false;
    return `<button type="button" class="row${out ? ' soldout' : ''}" data-id="${esc(it.id)}">
      ${photo(it)}
      <span class="nm">${hl(L(it.name))} <span class="als">${alIcons(it.allergens || [])}</span>${out ? ` <span class="pill-out">${esc(t('soldOut'))}</span>` : ''}</span>
      ${it.price != null ? `<span class="price">${priceText(it.price)}</span>` : ''}
    </button>`;
  }

  function render() {
    applyTexts();
    const cats = visibleCats();
    let hiddenCount = 0, shown = 0;
    const sections = cats.map((c) => {
      const all = itemsOf(c.id).filter(matches);
      const list = all.filter((i) => !blocked(i));
      hiddenCount += all.length - list.length;
      shown += list.length;
      if (!list.length) return '';
      const body = c.layout === 'list'
        ? `<div class="list">${list.map(row).join('')}</div>`
        : `<div class="grid">${list.map(card).join('')}</div>`;
      return `<section class="section" id="${esc(c.id)}" aria-labelledby="h-${esc(c.id)}">
        <div class="section-head"><div><h2 id="h-${esc(c.id)}">${esc(L(c.name))}</h2>${L(c.note) ? `<p>${esc(L(c.note))}</p>` : ''}</div></div>
        ${body}
      </section>`;
    }).join('');

    const feats = !query && menu.items.filter((i) => i.featured && !i.hidden && i.available !== false && !blocked(i) && visibleCats().some((c) => c.id === i.cat));
    const featHtml = feats && feats.length ? `<section class="featured" aria-label="${esc(t('featured'))}"><h2>${esc(t('featured'))}</h2><div class="rail">${
      feats.map((it) => `<button type="button" class="feat" data-id="${esc(it.id)}">${photo(it)}<div class="t"><strong>${esc(L(it.name))}</strong>${it.price != null ? `<span class="p">${priceText(it.price)}</span>` : (it.kcal ? `<span class="p">${it.kcal} kcal</span>` : '')}</div></button>`).join('')
    }</div></section>` : '';
    const note = hiddenCount ? `<div class="filter-note"><span>${esc(t('hiddenBy')(hiddenCount))}</span><button type="button" id="clear-filter">${esc(t('showAll'))}</button></div>` : '';
    $('#menu').innerHTML = note + featHtml + (shown ? sections : `<p class="empty">${esc(t('noResults'))}</p>`);

    $('#chips').innerHTML = cats.filter((c) => document.getElementById(c.id)).map((c) => `<a href="#${esc(c.id)}" data-c="${esc(c.id)}">${esc(L(c.name))}</a>`).join('');
    renderFooter();
    spy();
  }

  function applyTexts() {
    document.documentElement.lang = lang;
    $$('[data-t]').forEach((el) => { const v = t(el.dataset.t); if (typeof v === 'string') el.textContent = v; });
    $$('[data-t-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.tAria)));
    $$('[data-t-ph]').forEach((el) => el.setAttribute('placeholder', t(el.dataset.tPh)));
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    const s = menu?.settings || {};
    $$('[data-s]').forEach((el) => { const v = L(s[el.dataset.s]); if (v) el.textContent = v; });
    document.title = `${s.name || 'Pastalia'} · ${L(s.subtitle) || 'Pizza & Makarna'} · ${t('menu')}`;
    $('#catbar').setAttribute('aria-label', lang === 'tr' ? 'Kategoriler' : 'Categories');
  }

  function renderFooter() {
    const s = menu.settings || {};
    $('#legend').innerHTML = A().order.map((id) => `<li>${A().byId[id].svg}<span>${esc(A().byId[id].name[lang])}</span></li>`).join('');
    const tags = (str) => String(str || '').split(',').map((x) => x.trim()).filter(Boolean).map((x) => `<li>${esc(x)}</li>`).join('');
    $('#meal').innerHTML = tags(s.mealCards); $('#card-meal').hidden = !s.mealCards;
    $('#delivery').innerHTML = tags(s.delivery); $('#card-delivery').hidden = !s.delivery;
    if (s.instagram) { $('#lnk-ig').href = `https://instagram.com/${encodeURIComponent(s.instagram)}`; $('#ig-handle').textContent = '@' + s.instagram; }
    $('#lnk-ig').hidden = !s.instagram;
    const addr = [s.address, s.city].filter(Boolean).join(', ');
    $('#addr').textContent = addr; $('#addr').hidden = !addr;
    const maps = s.mapsUrl || (s.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Pastalia ${addr}`)}` : '');
    $('#lnk-map').hidden = !maps; if (maps) $('#lnk-map').href = maps;
    const tel = String(s.phone || '').replace(/[^\d+]/g, '');
    $('#lnk-tel').hidden = !tel; if (tel) { $('#lnk-tel').href = `tel:${tel}`; $('#tel-text').textContent = s.phone; }
    $('#year').textContent = new Date().getFullYear();
  }

  // scroll-spy for the category chips
  let observer;
  function spy() {
    observer?.disconnect();
    const chips = new Map($$('#chips a').map((a) => [a.dataset.c, a]));
    let current = null;
    observer = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) current = e.target.id;
      chips.forEach((a, id) => a.classList.toggle('on', id === current));
      const on = chips.get(current);
      if (on) { const bar = $('#chips'); const x = on.offsetLeft - bar.clientWidth / 2 + on.clientWidth / 2; bar.scrollTo({ left: x, behavior: 'smooth' }); }
    }, { rootMargin: '-130px 0px -60% 0px' });
    $$('.section').forEach((s) => observer.observe(s));
  }

  // item detail sheet
  let lastFocus = null;
  function openSheet(id, html) {
    lastFocus = document.activeElement;
    const sh = $(id);
    if (html != null) $('#sheet-body').innerHTML = html;
    sh.hidden = false;
    document.body.classList.add('locked');
    $('.sheet-panel', sh).focus();
  }
  function closeSheets() {
    $$('.sheet').forEach((s) => { s.hidden = true; });
    document.body.classList.remove('locked');
    lastFocus?.focus?.();
  }
  function creditFor(it) {
    if (it.credit) return esc(it.credit);
    const m = String(it.img || '').match(/^\/assets\/menu\/([a-z0-9-]+)\.webp$/);
    const c = m && credits[m[1]];
    if (!c) return '';
    const who = [c.title, c.creator].filter(Boolean).join(' — ');
    return `${esc(t('photo'))} (${esc(t('photoNote'))}): ${c.link ? `<a href="${esc(c.link)}" target="_blank" rel="noopener">${esc(who || c.via)}</a>` : esc(who)}${c.license ? `, ${esc(c.license)}` : ''}`;
  }
  function showItem(id) {
    const it = menu.items.find((i) => i.id === id);
    if (!it) return;
    const als = (it.allergens || []).filter((a) => A().byId[a]);
    const alt = other(it.name);
    const html = `${photo(it, 'hero-ph')}
      <div class="sheet-pad">
        <h2 id="sheet-title">${esc(L(it.name))}</h2>
        ${alt && alt !== L(it.name) ? `<p class="alt-name">${esc(alt)}</p>` : ''}
        ${L(it.desc) ? `<p class="desc-full">${esc(L(it.desc))}</p>` : ''}
        <div class="row-meta">
          <span>${it.available === false ? `<span class="pill-out">${esc(t('soldOut'))}</span> ` : ''}${it.kcal ? `<span class="kcal">${it.kcal} ${t('kcal')}</span>` : ''}</span>
          ${it.price != null ? `<span class="price">${priceText(it.price)}</span>` : ''}
        </div>
        <strong>${esc(t('allergens'))}</strong>
        ${als.length ? `<ul class="al-list">${als.map((a) => `<li>${A().byId[a].svg}${esc(A().byId[a].name[lang])}</li>`).join('')}</ul>` : `<p class="muted">${esc(t('noAllergen'))}</p>`}
        <p class="muted" style="margin-top:12px">${esc(L(menu.settings?.allergenNote))}</p>
        ${creditFor(it) ? `<p class="credit">${creditFor(it)}</p>` : ''}
      </div>`;
    openSheet('#sheet', html);
  }

  function renderAllergenGrid() {
    $('#al-grid').innerHTML = A().order.map((id) => `<button type="button" class="al-toggle" data-al="${id}" aria-pressed="${excluded.has(id)}">${A().byId[id].svg}<span>${esc(A().byId[id].name[lang])}</span></button>`).join('');
    const n = excluded.size;
    $('#al-count').hidden = !n; $('#al-count').textContent = n;
    $('#btn-allergen').classList.toggle('on', n > 0);
  }
  function setExcluded(set) {
    excluded = set;
    store.set('pst_allergens', [...excluded].join(','));
    renderAllergenGrid();
    render();
  }

  // events
  document.addEventListener('click', (e) => {
    const item = e.target.closest('[data-id]');
    if (item && !e.target.closest('a')) return showItem(item.dataset.id);
    if (e.target.closest('[data-close]')) return closeSheets();
    const lb = e.target.closest('[data-lang]');
    if (lb) { lang = lb.dataset.lang; store.set('pst_lang', lang); renderAllergenGrid(); render(); return; }
    const al = e.target.closest('[data-al]');
    if (al) { const s = new Set(excluded); s.has(al.dataset.al) ? s.delete(al.dataset.al) : s.add(al.dataset.al); return setExcluded(s); }
    if (e.target.closest('#al-clear') || e.target.closest('#clear-filter')) return setExcluded(new Set());
    if (e.target.closest('#btn-allergen')) { renderAllergenGrid(); return openSheet('#alsheet'); }
    if (e.target.closest('#btn-search')) {
      const row = $('#searchrow'); row.hidden = !row.hidden;
      $('#btn-search').classList.toggle('on', !row.hidden);
      if (!row.hidden) $('#q').focus(); else if (query) { query = ''; $('#q').value = ''; render(); }
      return;
    }
    if (e.target.closest('#q-close')) { $('#searchrow').hidden = true; $('#btn-search').classList.remove('on'); if (query) { query = ''; $('#q').value = ''; render(); } }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && $$('.sheet').some((s) => !s.hidden)) closeSheets(); });
  let qt;
  $('#q').addEventListener('input', (e) => { clearTimeout(qt); qt = setTimeout(() => { query = e.target.value.trim(); render(); }, 120); });
  const top = $('#topbar');
  const onScroll = () => top.classList.toggle('solid', scrollY > 120);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  renderAllergenGrid();
  load();
})();
