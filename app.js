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

  var $ = function (id) { return document.getElementById(id); };
  var state = { cat: 'Semua', q: '', cart: loadCart() };

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
  }

  function renderCatalog() {
    var q = state.q.trim().toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      return (state.cat === 'Semua' || p.cat === state.cat) &&
        (!q || (p.game + ' ' + p.name).toLowerCase().indexOf(q) >= 0);
    });
    var grid = $('grid');
    grid.replaceChildren();
    $('empty').hidden = list.length > 0;
    list.forEach(function (p) {
      var c = el('article', 'card prod');
      c.appendChild(el('span', 'tag', p.game));
      c.appendChild(el('h3', '', p.name));
      c.appendChild(el('span', 'muted', p.cat));
      c.appendChild(el('span', 'price', rupiah(p.price)));
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
      count += state.cart[id]; sum += p.price * state.cart[id];
    });
    return { count: count, sum: sum };
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
      info.appendChild(el('span', 'muted', rupiah(p.price)));
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
    $('total').textContent = rupiah(t.sum);
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
      lines.push('• ' + p.game + ' ' + p.name + ' x' + state.cart[id] + ' = ' + rupiah(p.price * state.cart[id]));
    });
    lines.push('', 'Total: ' + rupiah(t.sum), 'Nama: ' + nama, 'ID Game: ' + gid);
    var a = document.createElement('a');
    a.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast('Membuka WhatsApp…');
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
    renderChips(); renderCatalog(); renderCart();
  }

  setup();
})();
