(function () {
  'use strict';

  // Nomor WhatsApp admin (format internasional tanpa +). GANTI dengan nomor tokomu. Ini bukan rahasia.
  var WA_NUMBER = '6281234567890';
  var KEY = 'kyuzzshop_cart_v1';

  var PRODUCTS = [
    { id: 'ml86', game: 'Mobile Legends', cat: 'MOBA', name: '86 Diamonds', price: 20500 },
    { id: 'ml172', game: 'Mobile Legends', cat: 'MOBA', name: '172 Diamonds', price: 41000 },
    { id: 'ml706', game: 'Mobile Legends', cat: 'MOBA', name: '706 Diamonds', price: 165000 },
    { id: 'ff70', game: 'Free Fire', cat: 'Battle Royale', name: '70 Diamonds', price: 10000 },
    { id: 'ff355', game: 'Free Fire', cat: 'Battle Royale', name: '355 Diamonds', price: 50000 },
    { id: 'pubg60', game: 'PUBG Mobile', cat: 'Battle Royale', name: '60 UC', price: 15000 },
    { id: 'pubg325', game: 'PUBG Mobile', cat: 'Battle Royale', name: '325 UC', price: 77000 },
    { id: 'gi60', game: 'Genshin Impact', cat: 'RPG', name: '60 Genesis Crystals', price: 16000 },
    { id: 'gi330', game: 'Genshin Impact', cat: 'RPG', name: '330 Genesis Crystals', price: 79000 },
    { id: 'val475', game: 'Valorant', cat: 'FPS', name: '475 VP', price: 49000 },
    { id: 'val1000', game: 'Valorant', cat: 'FPS', name: '1000 VP', price: 99000 },
    { id: 'cod80', game: 'Call of Duty Mobile', cat: 'FPS', name: '80 CP', price: 15000 }
  ];

  var GAMES = [
    { n: 'Mobile Legends', i: '⚔️', c: 'g1' }, { n: 'Free Fire', i: '🔥', c: 'g2' },
    { n: 'PUBG Mobile', i: '🪖', c: 'g3' }, { n: 'Genshin Impact', i: '✨', c: 'g4' },
    { n: 'Valorant', i: '🎯', c: 'g5' }, { n: 'Call of Duty Mobile', i: '💥', c: 'g6' }
  ];
  var DEAL_RATE = 0.2;
  var PROMO = { KYUZZ10: 0.1 };
  function gameInfo(n) {
    for (var i = 0; i < GAMES.length; i++) if (GAMES[i].n === n) return GAMES[i];
    return { n: n, i: '🎮', c: 'g6' };
  }
  function dealId() {
    var d = new Date();
    var k = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    return PRODUCTS[k % PRODUCTS.length].id;
  }
  function priceOf(p) { return p.id === dealId() ? Math.round(p.price * (1 - DEAL_RATE)) : p.price; }

  var $ = function (id) { return document.getElementById(id); };
  var state = { cat: 'Semua', game: 'Semua', q: '', promo: '', sort: 'def', cart: loadCart() };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function rupiah(n) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  }
  function find(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }

  function loadCart() {
    var out = {};
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (raw && typeof raw === 'object') {
        Object.keys(raw).forEach(function (k) {
          var q = Number(raw[k]);
          if (find(k) && Number.isInteger(q) && q > 0 && q <= 99) out[k] = q;
        });
      }
    } catch (e) { out = {}; }
    return out;
  }
  function saveCart() {
    try { localStorage.setItem(KEY, JSON.stringify(state.cart)); } catch (e) { /* penyimpanan tidak tersedia */ }
  }

  var toastTimer;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  function renderChips() {
    var cats = ['Semua'];
    PRODUCTS.forEach(function (p) { if (cats.indexOf(p.cat) < 0) cats.push(p.cat); });
    var box = $('chips');
    box.replaceChildren();
    cats.forEach(function (c) {
      var b = el('button', 'chip' + (c === state.cat ? ' on' : ''), c);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(c === state.cat));
      b.addEventListener('click', function () { state.cat = c; renderChips(); renderCatalog(); });
      box.appendChild(b);
    });
    if (state.game !== 'Semua') {
      var x = el('button', 'chip on', '✕ ' + state.game);
      x.type = 'button';
      x.addEventListener('click', function () { state.game = 'Semua'; renderChips(); renderCatalog(); });
      box.insertBefore(x, box.firstChild);
    }
  }

  function renderCatalog() {
    var q = state.q.trim().toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      return (state.cat === 'Semua' || p.cat === state.cat) && (state.game === 'Semua' || p.game === state.game) &&
        (!q || (p.game + ' ' + p.name).toLowerCase().indexOf(q) >= 0);
    });
    if (state.sort === 'asc') list.sort(function (a, b) { return priceOf(a) - priceOf(b); });
    else if (state.sort === 'desc') list.sort(function (a, b) { return priceOf(b) - priceOf(a); });
    var grid = $('grid');
    grid.replaceChildren();
    $('empty').hidden = list.length > 0;
    list.forEach(function (p) {
      var c = el('article', 'card prod');
      c.appendChild(el('span', 'tag', gameInfo(p.game).i + ' ' + p.game));
      c.appendChild(el('h3', '', p.name));
      c.appendChild(el('span', 'muted', p.cat));
      var pr = el('span', 'price', rupiah(priceOf(p)));
      if (priceOf(p) !== p.price) {
        pr.appendChild(document.createTextNode(' '));
        pr.appendChild(el('s', 'muted old', rupiah(p.price)));
        c.appendChild(el('span', 'tag hot', '🔥 Deal Hari Ini'));
      }
      c.appendChild(pr);
      var b = el('button', 'btn primary', 'Tambah ke Keranjang');
      b.type = 'button';
      b.addEventListener('click', function () { addItem(p.id); });
      c.appendChild(b);
      grid.appendChild(c);
    });
  }

  function addItem(id) {
    state.cart[id] = Math.min(99, (state.cart[id] || 0) + 1);
    saveCart(); renderCart();
    toast('Ditambahkan: ' + find(id).name);
  }
  function changeQty(id, d) {
    var n = (state.cart[id] || 0) + d;
    if (n <= 0) delete state.cart[id]; else state.cart[id] = Math.min(99, n);
    saveCart(); renderCart();
  }
  function totals() {
    var count = 0, sum = 0;
    Object.keys(state.cart).forEach(function (id) {
      var p = find(id); if (!p) return;
      count += state.cart[id]; sum += priceOf(p) * state.cart[id];
    });
    var disc = state.promo ? Math.round(sum * PROMO[state.promo]) : 0;
    return { count: count, sum: sum, disc: disc, net: sum - disc };
  }

  function renderCart() {
    var box = $('items');
    box.replaceChildren();
    var ids = Object.keys(state.cart);
    $('cartEmpty').hidden = ids.length > 0;
    ids.forEach(function (id) {
      var p = find(id); if (!p) return;
      var row = el('div', 'item');
      var info = el('div', 'info');
      info.appendChild(el('b', '', p.game + ' — ' + p.name));
      info.appendChild(el('span', 'muted', rupiah(priceOf(p))));
      var qty = el('div', 'qty');
      var minus = el('button', '', '−'); minus.type = 'button'; minus.setAttribute('aria-label', 'Kurangi');
      var plus = el('button', '', '+'); plus.type = 'button'; plus.setAttribute('aria-label', 'Tambah');
      minus.addEventListener('click', function () { changeQty(id, -1); });
      plus.addEventListener('click', function () { changeQty(id, 1); });
      qty.appendChild(minus); qty.appendChild(el('span', '', String(state.cart[id]))); qty.appendChild(plus);
      row.appendChild(info); row.appendChild(qty);
      box.appendChild(row);
    });
    var t = totals();
    $('badge').textContent = String(t.count);
    $('disc').textContent = '-' + rupiah(t.disc);
    $('total').textContent = rupiah(t.net);
  }

  function openCart(open) {
    $('drawer').classList.toggle('open', open);
    $('drawer').setAttribute('aria-hidden', String(!open));
    $('scrim').hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function checkout() {
    var err = $('err');
    var t = totals();
    var nama = $('nama').value.trim();
    var gid = $('gid').value.trim();
    err.textContent = '';
    if (t.count === 0) { err.textContent = 'Keranjang masih kosong.'; return; }
    if (!/^[\p{L}\p{N} .'-]{2,40}$/u.test(nama)) { err.textContent = 'Nama 2–40 karakter (huruf/angka).'; return; }
    if (!/^[A-Za-z0-9#_() -]{3,40}$/.test(gid)) { err.textContent = 'ID Game 3–40 karakter, tanpa simbol aneh.'; return; }
    var lines = ['Halo KyuzzShop, saya ingin top up:', ''];
    Object.keys(state.cart).forEach(function (id) {
      var p = find(id); if (!p) return;
      lines.push('• ' + p.game + ' ' + p.name + ' x' + state.cart[id] + ' = ' + rupiah(priceOf(p) * state.cart[id]));
    });
    if (state.promo) lines.push('', 'Kode promo: ' + state.promo + ' (-' + rupiah(t.disc) + ')');
    lines.push('', 'Total: ' + rupiah(t.net), 'Nama: ' + nama, 'ID Game: ' + gid);
    var a = document.createElement('a');
    a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('Membuka WhatsApp…');
  }

  function renderGames() {
    var box = $('games');
    box.replaceChildren();
    GAMES.forEach(function (g) {
      var n = PRODUCTS.filter(function (p) { return p.game === g.n; }).length;
      var b = el('button', 'tile');
      b.type = 'button';
      b.appendChild(el('span', 'gi ' + g.c, g.i));
      b.appendChild(el('b', '', g.n));
      b.appendChild(el('span', 'muted', n + ' paket'));
      b.addEventListener('click', function () {
        state.game = g.n; state.cat = 'Semua'; renderChips(); renderCatalog();
        $('katalog').scrollIntoView({ behavior: 'smooth' });
      });
      box.appendChild(b);
    });
  }

  var cdTimer;
  function renderDeal() {
    var p = find(dealId()), box = $('deal');
    box.replaceChildren();
    box.appendChild(el('span', 'pill', '⚡ Diskon Harian −' + Math.round(DEAL_RATE * 100) + '%'));
    box.appendChild(el('h3', '', p.game + ' — ' + p.name));
    var pr = el('p', 'price', rupiah(priceOf(p)));
    pr.appendChild(document.createTextNode(' '));
    pr.appendChild(el('s', 'muted old', rupiah(p.price)));
    box.appendChild(pr);
    box.appendChild(el('p', 'muted', 'Berakhir dalam'));
    var cd = el('div', 'cd');
    box.appendChild(cd);
    var b = el('button', 'btn primary', 'Ambil Deal Sekarang');
    b.type = 'button';
    b.addEventListener('click', function () { addItem(p.id); });
    box.appendChild(b);
    function tick() {
      var n = new Date(), e = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
      var s = Math.max(0, Math.floor((e - n) / 1000));
      var f = function (x) { return String(x).padStart(2, '0'); };
      cd.textContent = f(Math.floor(s / 3600)) + ' : ' + f(Math.floor(s % 3600 / 60)) + ' : ' + f(s % 60);
      if (s === 0) { renderDeal(); renderCatalog(); renderCart(); }
    }
    tick();
    clearInterval(cdTimer);
    cdTimer = setInterval(tick, 1000);
  }

  function applyPromo(raw) {
    var c = String(raw).trim().toUpperCase();
    if (!Object.prototype.hasOwnProperty.call(PROMO, c)) { $('err').textContent = 'Kode promo tidak valid.'; return false; }
    state.promo = c; $('err').textContent = '';
    renderCart(); toast('Kode ' + c + ' dipakai');
    return true;
  }

  function setup() {
    $('search').addEventListener('input', function (e) { state.q = e.target.value.slice(0, 40); renderCatalog(); });
    $('cartBtn').addEventListener('click', function () { openCart(true); });
    $('closeCart').addEventListener('click', function () { openCart(false); });
    $('scrim').addEventListener('click', function () { openCart(false); });
    $('checkout').addEventListener('click', checkout);
    $('clearBtn').addEventListener('click', function () {
      if (totals().count === 0) { toast('Keranjang sudah kosong'); return; }
      $('modal').hidden = false;
    });
    $('mNo').addEventListener('click', function () { $('modal').hidden = true; });
    $('mYes').addEventListener('click', function () {
      state.cart = {}; saveCart(); renderCart(); $('modal').hidden = true; toast('Keranjang dikosongkan');
    });
    var burger = $('burger'), menu = $('menu');
    burger.addEventListener('click', function () {
      var o = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(o));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { openCart(false); $('modal').hidden = true; }
    });
    $('applyKode').addEventListener('click', function () { applyPromo($('kode').value); });
    $('useKode').addEventListener('click', function () { if (applyPromo('KYUZZ10')) { $('kode').value = 'KYUZZ10'; openCart(true); } });
    $('copyKode').addEventListener('click', function () {
      var fail = function () { toast('Salin manual: KYUZZ10'); };
      try { navigator.clipboard.writeText('KYUZZ10').then(function () { toast('Kode disalin'); }, fail); } catch (e) { fail(); }
    });
    $('sort').addEventListener('change', function (e) {
      state.sort = (e.target.value === 'asc' || e.target.value === 'desc') ? e.target.value : 'def';
      renderCatalog();
    });
    $('waFab').href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Halo KyuzzShop, saya mau tanya soal top up.');
    renderGames(); renderDeal(); renderChips(); renderCatalog(); renderCart();
  }

  setup();
})();
