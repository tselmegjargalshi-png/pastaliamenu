// The 14 EU allergens, drawn to match the colours of the printed Pastalia allergen legend.
// Shared by the public menu and the admin panel: window.PASTALIA_ALLERGENS.
(() => {
  const W = 'fill="#fff"';
  const S = 'fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  const list = [
    ['peanut', '#f2b84b', 'Yerfıstığı', 'Peanuts',
      `<path ${W} d="M9.6 3.5c2.6-.6 4.6 1.3 4.4 3.6-.1 1.2-.7 1.9-.5 2.8.2.8 1.2 1.3 1.9 2.2 1.8 2.3.9 5.9-2 7.1-2.9 1.2-6-.5-6.4-3.4-.2-1.3.3-2.3.1-3.2-.2-1-1.1-1.6-1.4-2.8-.6-2.4 1.1-5.7 3.9-6.3z"/><path fill="none" stroke="#f2b84b" stroke-width="1.1" stroke-linecap="round" d="M8.4 6.6h.01M10.6 5.8h.01M10 15.4h.01M12.6 16.4h.01M11.4 13.6h.01"/>`],
    ['nuts', '#ee9a45', 'Sert Kabuklu Meyveler', 'Tree nuts',
      `<path ${W} d="M5.2 8.6c0-2.6 3-4.4 6.8-4.4s6.8 1.8 6.8 4.4c0 .7-.6 1.2-1.3 1.2H6.5c-.7 0-1.3-.5-1.3-1.2z"/><path ${W} d="M6.9 11.2h10.2c0 4.6-2.4 8.2-5.1 9-2.7-.8-5.1-4.4-5.1-9z"/><path ${S} d="M12 4.2V2.6"/>`],
    ['crustaceans', '#2f80c7', 'Kabuklular', 'Crustaceans',
      `<ellipse ${W} cx="12" cy="14" rx="5.2" ry="3.6"/><path ${S} d="M7.3 12.3 4.4 9.6M16.7 12.3l2.9-2.7M7.2 15.2l-3 1.2M7.9 16.8l-2.3 2.1M16.8 15.2l3 1.2M16.1 16.8l2.3 2.1"/><path ${W} d="M3 4.6c1.6-.9 3.3-.3 3.8 1.2l-1.6.6.9 1.6c-1.5.7-3.2.1-3.8-1.3-.2-.8.1-1.6.7-2.1zM21 4.6c-1.6-.9-3.3-.3-3.8 1.2l1.6.6-.9 1.6c1.5.7 3.2.1 3.8-1.3.2-.8-.1-1.6-.7-2.1z"/>`],
    ['molluscs', '#3fb6ac', 'Yumuşakçalar', 'Molluscs',
      `<path ${W} d="M12 19.5 4.2 10.8C4 6.6 7.6 3.8 12 3.8s8 2.8 7.8 7z"/><path fill="none" stroke="#3fb6ac" stroke-width="1.2" stroke-linecap="round" d="M12 19V4.6M12 19 8 5.2M12 19l4-13.8M12 19 5.3 8M12 19l6.7-11"/><path ${W} d="M10 19.4h4l-.6 1.6h-2.8z"/>`],
    ['fish', '#1fa2dc', 'Balık', 'Fish',
      `<path ${W} d="M2.8 12c2.6-4 6.4-5.6 10-5.2 3 .3 5 2.2 6.4 4.1l2.4-2.3v6.8l-2.4-2.3c-1.4 1.9-3.4 3.8-6.4 4.1-3.6.4-7.4-1.2-10-5.2z"/><circle fill="#1fa2dc" cx="7.4" cy="11.2" r="1"/><path fill="none" stroke="#1fa2dc" stroke-width="1.1" stroke-linecap="round" d="M10.2 9.4c.8 1.6.8 3.6 0 5.2"/>`],
    ['egg', '#e8cf00', 'Yumurta', 'Eggs',
      `<path ${W} d="M12 3.4c3.3 0 4.3 2.6 6.4 3.6 2.4 1.2 2.7 4.6 1.2 6.6-1.3 1.8-.6 4.4-3.4 5.8-2.5 1.2-4.3-.4-6.8.2-2.6.6-5.2-1-5.5-3.8-.2-2 1.2-2.8.8-4.9C4.3 8.2 6.4 3.4 12 3.4z"/><circle fill="#f6c700" cx="11.8" cy="11.8" r="3.4"/>`],
    ['milk', '#d9a6cc', 'Süt', 'Milk',
      `<path ${W} d="M5.4 2.8h4.4v2.1l1.6 2.6v12.4c0 .6-.5 1.1-1.1 1.1H4.9c-.6 0-1.1-.5-1.1-1.1V7.5l1.6-2.6z"/><path fill="#d9a6cc" d="M3.8 11h7.6v2H3.8z"/><path ${S} d="M13.2 10.4h6.6l-.8 10.2h-5z"/><path ${W} d="M13.6 14.6h5.8l-.5 6h-4.8z"/>`],
    ['gluten', '#a5582f', 'Gluten', 'Gluten',
      `<path ${S} d="M7.4 21.2c2.4-4.6 5.6-9.2 10.6-13.4"/><path ${W} d="M16.4 3.2c1.6.6 2 2.6.8 4.3-1.6-.6-2-2.6-.8-4.3zM12.6 6.4c1.7.3 2.4 2.2 1.5 4-1.7-.3-2.4-2.2-1.5-4zM17.6 9.8c.1 1.7-1.6 2.9-3.6 2.6.1-1.7 1.6-2.9 3.6-2.6zM9.7 10.2c1.7.2 2.6 2 1.8 3.9-1.7-.2-2.6-2-1.8-3.9zM14.6 13.6c0 1.7-1.8 2.8-3.7 2.4.1-1.7 1.8-2.8 3.7-2.4zM7.2 14.2c1.7.1 2.7 1.8 2 3.7-1.7-.1-2.7-1.8-2-3.7zM11.6 17.6c-.2 1.7-2.1 2.6-3.9 2 .2-1.7 2.1-2.6 3.9-2z"/>`],
    ['soy', '#35a64a', 'Soya', 'Soy',
      `<path ${W} d="M18.6 3.6c1.6 1.4 1.4 3.8-.2 5.2-.8.7-1.9.9-2.5 1.6-.7.8-.5 2-1.3 2.9-.8.9-2.1.9-2.9 1.7-.8.8-.7 2.1-1.6 2.9-1.7 1.6-4.4 2.1-6.4 1.1-.4-.2-.4-.8 0-1 2-.9 3.1-2.6 3.8-4.6.6-1.8 1.4-3.9 3.1-5.4 2.4-2.1 5.2-3.1 8-4.4z"/><circle fill="#35a64a" cx="15.4" cy="7.4" r="1.2"/><circle fill="#35a64a" cx="12.2" cy="10.6" r="1.2"/><circle fill="#35a64a" cx="8.8" cy="14.2" r="1.2"/>`],
    ['sesame', '#ef8a2c', 'Susam', 'Sesame',
      `<g ${W}><ellipse cx="7.4" cy="7.6" rx="1.7" ry="2.7" transform="rotate(-30 7.4 7.6)"/><ellipse cx="13.2" cy="6.2" rx="1.7" ry="2.7" transform="rotate(20 13.2 6.2)"/><ellipse cx="17.6" cy="10.4" rx="1.7" ry="2.7" transform="rotate(60 17.6 10.4)"/><ellipse cx="10.4" cy="12.4" rx="1.7" ry="2.7" transform="rotate(-70 10.4 12.4)"/><ellipse cx="6.4" cy="16.4" rx="1.7" ry="2.7" transform="rotate(15 6.4 16.4)"/><ellipse cx="14.4" cy="16.8" rx="1.7" ry="2.7" transform="rotate(-20 14.4 16.8)"/></g>`],
    ['celery', '#93c97a', 'Kereviz', 'Celery',
      `<path ${S} stroke-width="2.2" d="M5 20.4 15.6 5.6M8.6 20.6l9.6-13.4M12.4 20.8l8-11"/><path ${W} d="M14.2 3.2c1.2-.8 2.7-.4 3.4.7.6-.8 1.9-.9 2.7-.2.8.7.8 2 0 2.8.9.6 1 1.9.3 2.7-1.6-.7-3.5-2-6.4-6z"/>`],
    ['mustard', '#cf9d45', 'Hardal', 'Mustard',
      `<path ${W} d="M10.4 2.4h3.2v2.4l1.4 1.4v1.4H9V6.2l1.4-1.4z"/><path ${W} d="M7.6 8.4h8.8l-.9 10.4c-.1 1-.9 1.8-1.9 1.8h-3.2c-1 0-1.8-.8-1.9-1.8z"/><path fill="#cf9d45" d="M9.4 12h5.2v3.2H9.4z"/><path ${W} d="M19.4 14.8c.9 1.3 1.4 2.1 1.4 2.8a1.4 1.4 0 0 1-2.8 0c0-.7.5-1.5 1.4-2.8z"/>`],
    ['lupin', '#9b85c4', 'Acı Bakla', 'Lupin',
      `<path ${S} d="M12 21.4V9"/><g ${W}><ellipse cx="12" cy="3.6" rx="1.3" ry="1.2"/><ellipse cx="10.4" cy="6.2" rx="1.6" ry="1.2"/><ellipse cx="13.6" cy="6.2" rx="1.6" ry="1.2"/><ellipse cx="9.6" cy="9" rx="1.9" ry="1.3"/><ellipse cx="14.4" cy="9" rx="1.9" ry="1.3"/><ellipse cx="9.2" cy="11.9" rx="2.1" ry="1.4"/><ellipse cx="14.8" cy="11.9" rx="2.1" ry="1.4"/></g><path ${W} d="M12 17.6c-2.4-.2-4.6-1.2-5.8-3 2.3-.3 4.6.6 5.8 3zM12 18.4c2.4-.2 4.6-1.2 5.8-3-2.3-.3-4.6.6-5.8 3z"/>`],
    ['sulphites', '#8c1d24', 'Sülfitler', 'Sulphites',
      `<path ${W} d="M7 3h10c.4 3.6.2 6.6-1.4 8.4-.9 1-2 1.5-2.7 1.7v5.4h3.1v1.9H8v-1.9h3.1v-5.4c-.7-.2-1.8-.7-2.7-1.7C6.8 9.6 6.6 6.6 7 3z"/><path fill="#8c1d24" d="M8.3 4.4h7.4c.1.9.1 1.8 0 2.6H8.3c-.1-.8-.1-1.7 0-2.6z"/>`],
  ];
  const byId = {};
  for (const [id, color, tr, en, glyph] of list) {
    byId[id] = { id, color, name: { tr, en }, svg: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect width="24" height="24" rx="6" fill="${color}"/><g transform="translate(2.4 2.4) scale(.8)">${glyph}</g></svg>` };
  }
  window.PASTALIA_ALLERGENS = { order: list.map((a) => a[0]), byId };
})();
