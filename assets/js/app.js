/* ==========================================================================
   APEX SPORTS — core application
   Renders shared chrome (header, footer, drawers, modals, toasts) and owns
   cart / wishlist / search state. Every page includes this before its own
   page script and boots through Apex.ready(fn).
   ========================================================================== */
(function () {
  'use strict';

  var D = window.APEX_DATA;
  if (!D) { console.error('[Apex] data.js must be loaded before app.js'); return; }

  /* ------------------------------------------------------------- helpers */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return '\u20B9' + Math.round(Number(n) || 0).toLocaleString('en-IN'); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var clamp = function (n, a, b) { return Math.min(b, Math.max(a, n)); };
  var qs = function (name) { return new URLSearchParams(location.search).get(name); };

  var store = {
    get: function (k, fb) {
      try { var v = localStorage.getItem('apex.' + k); return v ? JSON.parse(v) : fb; }
      catch (e) { return fb; }
    },
    set: function (k, v) {
      try { localStorage.setItem('apex.' + k, JSON.stringify(v)); } catch (e) {}
    }
  };

  /* --------------------------------------------------------------- icons */
  var I = {
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    cart: '<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.55L22 7H6"/>',
    heart: '<path d="M12 20.5s-7.5-4.7-9.3-9A5.3 5.3 0 0 1 12 6.4a5.3 5.3 0 0 1 9.3 5.1c-1.8 4.3-9.3 9-9.3 9z"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    phone: '<path d="M21 16.9v2.6a1.7 1.7 0 0 1-1.9 1.7A17 17 0 0 1 3.2 5.3 1.7 1.7 0 0 1 4.9 3.4h2.6a1.7 1.7 0 0 1 1.7 1.5c.1.9.3 1.7.6 2.5a1.7 1.7 0 0 1-.4 1.8l-1.1 1.1a13.6 13.6 0 0 0 5.1 5.1l1.1-1.1a1.7 1.7 0 0 1 1.8-.4c.8.3 1.6.5 2.5.6a1.7 1.7 0 0 1 1.5 1.7z"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="M3 7l9 6 9-6"/>',
    pin: '<path d="M20 10.5c0 6-8 11.5-8 11.5S4 16.5 4 10.5a8 8 0 0 1 16 0z"/><circle cx="12" cy="10.3" r="2.8"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.6 2.1"/>',
    truck: '<path d="M2 6.5h11v10H2z"/><path d="M13 10h4l4 3.6v2.9h-8z"/><circle cx="6" cy="18.5" r="1.8"/><circle cx="17" cy="18.5" r="1.8"/>',
    shield: '<path d="M12 2.5l7.5 3v6c0 5-3.2 8.4-7.5 10-4.3-1.6-7.5-5-7.5-10v-6z"/><path d="M8.8 12l2.3 2.4 4.3-4.8"/>',
    refresh: '<path d="M20.5 11.5a8.5 8.5 0 1 0-2 6.4"/><path d="M20.8 5.5v6h-6"/>',
    headset: '<path d="M4 13v-1.5a8 8 0 0 1 16 0V13"/><rect x="2.4" y="12.6" width="4.4" height="7" rx="2"/><rect x="17.2" y="12.6" width="4.4" height="7" rx="2"/><path d="M19.4 19.6c0 1.6-1.6 2.4-3.6 2.4"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    chevUp: '<path d="M6 15l6-6 6 6"/>',
    flame: '<path d="M12 2.7c3.4 3.3 6.4 6.5 6.4 10.5a6.4 6.4 0 0 1-12.8 0c0-2.2 1-4.1 2.5-5.7.4 1.4 1.1 2.3 2.2 2.7-.4-2.9.2-5.5 1.7-7.5z"/>',
    chevD: '<path d="M9 6l6 6-6 6"/>',
    arrowR: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
    arrowL: '<path d="M19 12H5"/><path d="M11 18l-6-6 6-6"/>',
    star: '<path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5-5.8-3.05L6.2 20.5l1.1-6.5L2.6 9.45l6.5-.95z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M3.5 6.5h17"/><path d="M8.5 6.5V4.2a1.7 1.7 0 0 1 1.7-1.7h3.6a1.7 1.7 0 0 1 1.7 1.7v2.3"/><path d="M6 6.5l1 13a1.7 1.7 0 0 0 1.7 1.6h6.6A1.7 1.7 0 0 0 17 19.5l1-13"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    checkC: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.2l2.5 2.5 4.5-5"/>',
    filter: '<path d="M3 5.5h18M6.5 12h11M10 18.5h4"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
    list: '<path d="M4 6.5h16M4 12h16M4 17.5h16"/>',
    eye: '<path d="M2.2 12S5.8 5.8 12 5.8 21.8 12 21.8 12 18.2 18.2 12 18.2 2.2 12 2.2 12z"/><circle cx="12" cy="12" r="3"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8.5v5M8.5 11h5"/>',
    tag: '<path d="M20.5 13.4l-7 7a2 2 0 0 1-2.8 0l-7.2-7.2V4.5a2 2 0 0 1 2-2h8.7l6.3 6.3a2 2 0 0 1 0 2.6z"/><circle cx="8.4" cy="8.4" r="1.3"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.4"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/>',
    bolt: '<path d="M13.5 2.5L4.5 13.5h6l-1 8 9-11h-6z"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
    box: '<path d="M21 8.2l-9-4.7-9 4.7v7.6l9 4.7 9-4.7z"/><path d="M3 8.2l9 4.8 9-4.8M12 13v8"/>',
    wallet: '<path d="M3 7.5h15a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5.5A2.5 2.5 0 0 1 3 17z"/><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H17v2.5"/><circle cx="17" cy="13.5" r="1.1"/>',
    home: '<path d="M3.5 10.5L12 3.5l8.5 7v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M9.5 21v-6h5v6"/>',
    ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>',
    fb: '<path d="M14.5 8.5H17V5h-2.5A4.5 4.5 0 0 0 10 9.5V12H7.5v3.5H10V22h3.5v-6.5H16l.7-3.5H13.5V9.6c0-.6.4-1.1 1-1.1z"/>',
    x: '<path d="M4 4l7.5 9.5L4.5 20h2.2l6-6.9L17.5 20H20l-8-10.2L19.4 4h-2.2l-5.6 6.4L7.5 4z"/>',
    yt: '<rect x="2.5" y="6" width="19" height="12" rx="4"/><path d="M11 9.6l4.2 2.4L11 14.4z"/>',
    wa: '<path d="M3.5 20.5l1.3-4.4A8.4 8.4 0 1 1 8 19.3z"/><path d="M8.8 8.8c.4 2.4 2 4 4.4 4.4"/>'
  };
  var svg = function (name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[name] || '') + '</svg>';
  };
  var svgFill = function (name, cls) {
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + (I[name] || '') + '</svg>';
  };

  /* ----------------------------------------------------------- dom hooks */
  var byId = {};
  var bySlug = {};
  D.products.forEach(function (p) { byId[p.id] = p; bySlug[p.slug] = p; });

  function stars(rating, cls) {
    var out = '<span class="stars ' + (cls || '') + '" aria-label="' + rating + ' out of 5">';
    for (var i = 1; i <= 5; i++) {
      out += '<svg viewBox="0 0 24 24" fill="currentColor" class="' + (i <= Math.round(rating) ? '' : 'is-off') + '">' + I.star + '</svg>';
    }
    return out + '</span>';
  }

  /* -------------------------------------------------------------- events */
  var bus = {};
  function on(evt, fn) { (bus[evt] = bus[evt] || []).push(fn); }
  function emit(evt, data) { (bus[evt] || []).forEach(function (f) { f(data); }); }

  /* ---------------------------------------------------------------- cart */
  var cart = {
    items: store.get('cart', []),

    save: function () { store.set('cart', this.items); emit('cart'); },

    key: function (it) { return it.id + '|' + (it.size || '') + '|' + (it.color || ''); },

    add: function (id, qty, size, color) {
      var p = byId[id];
      if (!p) return;
      qty = Math.max(1, parseInt(qty, 10) || 1);
      size = size || (p.sizes[0] || '');
      color = color || (p.colors[0] || '');
      var k = this.key({ id: id, size: size, color: color });
      var found = null;
      for (var i = 0; i < this.items.length; i++) if (this.key(this.items[i]) === k) found = this.items[i];
      if (found) { found.qty = clamp(found.qty + qty, 1, 20); }
      else { this.items.push({ id: id, qty: clamp(qty, 1, 20), size: size, color: color }); }
      this.save();
      Apex.toast('Added to cart', p.name.length > 44 ? p.name.slice(0, 44) + '\u2026' : p.name, 'cart');
      return true;
    },

    setQty: function (key, qty) {
      for (var i = 0; i < this.items.length; i++) {
        if (this.key(this.items[i]) === key) {
          if (qty <= 0) this.items.splice(i, 1); else this.items[i].qty = clamp(qty, 1, 20);
          break;
        }
      }
      this.save();
    },

    remove: function (key) {
      this.items = this.items.filter(function (it) { return (it.id + '|' + (it.size || '') + '|' + (it.color || '')) !== key; });
      this.save();
    },

    clear: function () { this.items = []; this.save(); },

    detailed: function () {
      return this.items.map(function (it) {
        var p = byId[it.id];
        return p ? { key: it.id + '|' + (it.size || '') + '|' + (it.color || ''), item: it, product: p, line: p.price * it.qty } : null;
      }).filter(Boolean);
    },

    count: function () { return this.items.reduce(function (n, it) { return n + it.qty; }, 0); },
    subtotal: function () { return this.detailed().reduce(function (n, r) { return n + r.line; }, 0); },
    mrpTotal: function () { return this.detailed().reduce(function (n, r) { return n + r.product.mrp * r.item.qty; }, 0); }
  };

  /* ------------------------------------------------------------ wishlist */
  var wish = {
    ids: store.get('wishlist', []),
    save: function () { store.set('wishlist', this.ids); emit('wish'); },
    has: function (id) { return this.ids.indexOf(id) > -1; },
    toggle: function (id) {
      var i = this.ids.indexOf(id);
      var added = i === -1;
      if (added) this.ids.push(id); else this.ids.splice(i, 1);
      this.save();
      var p = byId[id];
      Apex.toast(added ? 'Saved to wishlist' : 'Removed from wishlist', p ? p.name.slice(0, 44) : '', added ? 'info' : 'default');
      return added;
    },
    items: function () { return this.ids.map(function (id) { return byId[id]; }).filter(Boolean); }
  };

  /* -------------------------------------------------------------- coupon */
  var coupon = {
    code: store.get('coupon', null),
    find: function (code) {
      code = String(code || '').trim().toUpperCase();
      return D.coupons.filter(function (c) { return c.code === code; })[0] || null;
    },
    apply: function (code) {
      var c = this.find(code);
      if (!c) return { ok: false, msg: 'That coupon code is not valid.' };
      var sub = cart.subtotal();
      if (sub < c.minOrder) return { ok: false, msg: 'Add ' + money(c.minOrder - sub) + ' more to use ' + c.code + '.' };
      this.code = c.code; store.set('coupon', c.code); emit('cart');
      return { ok: true, coupon: c };
    },
    clear: function () { this.code = null; store.set('coupon', null); emit('cart'); },
    active: function () {
      var c = this.code ? this.find(this.code) : null;
      if (!c) return null;
      if (cart.subtotal() < c.minOrder) return null;
      return c;
    }
  };

  /* ------------------------------------------------------------ money math */
  function totals(express) {
    var sub = cart.subtotal();
    var c = coupon.active();
    var discount = 0;
    var ship = sub === 0 ? 0 : (sub >= D.brand.freeShipOver ? 0 : (express ? D.brand.expressFlat : D.brand.shipFlat));
    if (c) {
      if (c.type === 'percent') discount = Math.min(Math.round(sub * c.value / 100), c.maxDiscount);
      else if (c.type === 'flat') discount = Math.min(c.value, sub);
      else if (c.type === 'shipping') { ship = 0; }
    }
    var taxable = Math.max(0, sub - discount);
    return {
      subtotal: sub,
      discount: discount,
      shipping: ship,
      tax: Math.round(taxable - taxable / (1 + D.brand.taxRate)), // GST already inside price
      total: Math.max(0, sub - discount + ship),
      savings: cart.mrpTotal() - sub + discount,
      coupon: c,
      freeShipGap: Math.max(0, D.brand.freeShipOver - sub)
    };
  }

  /* -------------------------------------------------------- product cards */
  function badgeFor(p) {
    if (!p.badge) return '';
    var map = { Bestseller: 'best', New: 'new', Deal: 'sale', Limited: 'limited' };
    return '<span class="badge badge--' + (map[p.badge] || 'sale') + '">' + esc(p.badge) + '</span>';
  }

  function productCard(p, opts) {
    opts = opts || {};
    var on = wish.has(p.id);
    return '<article class="pcard reveal" data-id="' + p.id + '">' +
      '<div class="pcard__media">' +
        '<a href="product.html?id=' + p.id + '" aria-label="' + esc(p.name) + '">' +
          '<img src="' + p.images[0] + '" alt="' + esc(p.name) + '" loading="lazy" width="600" height="600">' +
        '</a>' +
        '<div class="pcard__badges">' + badgeFor(p) +
          (p.discount >= 20 ? '<span class="badge badge--sale">-' + p.discount + '%</span>' : '') +
        '</div>' +
        '<button class="pcard__wish' + (on ? ' is-on' : '') + '" data-wish="' + p.id + '" ' +
          'aria-label="' + (on ? 'Remove from' : 'Add to') + ' wishlist" aria-pressed="' + on + '">' + svg('heart') + '</button>' +
        '<div class="pcard__quick">' +
          '<button class="btn btn--sm" data-quick="' + p.id + '">' + svg('eye') + 'Quick view</button>' +
        '</div>' +
      '</div>' +
      '<div class="pcard__body">' +
        '<span class="pcard__brand">' + esc(p.brand) + '</span>' +
        '<a href="product.html?id=' + p.id + '"><h3 class="pcard__name">' + esc(p.name) + '</h3></a>' +
        '<p class="pcard__desc">' + esc(p.description) + '</p>' +
        '<div class="pcard__rating">' + stars(p.rating) +
          '<span>' + p.rating.toFixed(1) + ' (' + p.reviewCount + ')</span></div>' +
        '<div class="pcard__price">' +
          '<span class="price">' + money(p.price) + '</span>' +
          '<span class="price--strike">' + money(p.mrp) + '</span>' +
          '<span class="price--off">' + p.discount + '% off</span>' +
        '</div>' +
        (p.stock <= 6
          ? '<span class="pcard__stock pcard__stock--low"><i></i>Only ' + p.stock + ' left in stock</span>'
          : '<span class="pcard__stock pcard__stock--ok"><i></i>In stock</span>') +
        '<div class="pcard__foot">' +
          '<button class="btn btn--sm" data-add="' + p.id + '">' + svg('cart') + 'Add to cart</button>' +
          '<a class="btn btn--outline btn--sm" href="product.html?id=' + p.id + '">Details</a>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function miniRow(r) {
    var p = r.product, it = r.item;
    return '<div class="mini-row">' +
      '<a class="mini-row__media" href="product.html?id=' + p.id + '"><img src="' + p.images[0] + '" alt="' + esc(p.name) + '" loading="lazy"></a>' +
      '<div>' +
        '<a href="product.html?id=' + p.id + '"><div class="mini-row__name">' + esc(p.name) + '</div></a>' +
        '<div class="mini-row__opt">' + [it.size, it.color].filter(Boolean).join(' \u00B7 ') + '</div>' +
        '<div class="qty">' +
          '<button data-qty="' + r.key + '" data-step="-1" aria-label="Decrease">' + svg('minus') + '</button>' +
          '<input value="' + it.qty + '" data-qtyinput="' + r.key + '" inputmode="numeric" aria-label="Quantity">' +
          '<button data-qty="' + r.key + '" data-step="1" aria-label="Increase">' + svg('plus') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="mini-row__right">' +
        '<button class="mini-row__del" data-remove="' + r.key + '" aria-label="Remove">' + svg('trash') + '</button>' +
        '<div class="mini-row__price">' + money(r.line) + '</div>' +
      '</div>' +
    '</div>';
  }

  function cartDrawerBody() {
    var rows = cart.detailed();
    if (!rows.length) {
      return '<div class="empty" style="padding:44px 8px">' +
        '<div class="empty__icon">' + svg('cart') + '</div>' +
        '<h3>Your cart is empty</h3><p>Browse the catalogue and add your match-day gear.</p>' +
        '<a class="btn" href="shop.html">Start shopping</a></div>';
    }
    var gap = Math.max(0, D.brand.freeShipOver - cart.subtotal());
    var pct = Math.min(100, Math.round((cart.subtotal() / D.brand.freeShipOver) * 100));
    return '<div class="freeship">' +
        '<p class="freeship__text">' + (gap > 0
          ? 'Add <b>' + money(gap) + '</b> more for <b>free express shipping</b>'
          : '<b>Free express shipping unlocked</b> \u2014 nice.') + '</p>' +
        '<div class="freeship__track"><div class="freeship__fill" style="width:' + pct + '%"></div></div>' +
      '</div>' + rows.map(miniRow).join('');
  }

  function syncBadges() {
    var c = cart.count(), w = wish.ids.length;
    var cc = $('#cartCount'), wc = $('#wishCount');
    if (cc) { cc.textContent = c; cc.classList.toggle('is-zero', c === 0); }
    if (wc) { wc.textContent = w; wc.classList.toggle('is-zero', w === 0); }
    var mc = $('#cartCountMobile');
    if (mc) { mc.textContent = c; mc.classList.toggle('is-zero', c === 0); }
  }

  function syncCartDrawer() {
    var body = $('#cartDrawerBody');
    if (body) body.innerHTML = cartDrawerBody();
    var t = totals();
    var foot = $('#cartDrawerFoot');
    if (foot) {
      foot.innerHTML = cart.count() ? (
        '<div class="summary-row"><span>Subtotal</span><b>' + money(t.subtotal) + '</b></div>' +
        (t.discount ? '<div class="summary-row summary-row--save"><span>Coupon ' + t.coupon.code + '</span><b>-' + money(t.discount) + '</b></div>' : '') +
        '<div class="summary-row"><span>Shipping</span><b>' + (t.shipping ? money(t.shipping) : 'FREE') + '</b></div>' +
        '<div class="summary-row summary-row--total"><span>Total</span><b>' + money(t.total) + '</b></div>' +
        '<a class="btn btn--block mt-16" href="checkout.html">' + svg('lock') + 'Secure checkout</a>' +
        '<a class="btn btn--outline btn--block mt-8" href="cart.html">View full cart</a>'
      ) : '<a class="btn btn--block" href="shop.html">Browse products</a>';
    }
    var title = $('#cartDrawerCount');
    if (title) title.textContent = cart.count() + (cart.count() === 1 ? ' item' : ' items');
  }

  function syncWishButtons() {
    $$('[data-wish]').forEach(function (b) {
      var on = wish.has(b.getAttribute('data-wish'));
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }

  /* ------------------------------------------------------------ chrome UI */
  function currentPage() {
    var f = location.pathname.split('/').pop() || 'index.html';
    return f.replace('.html', '') || 'index';
  }

  function headerHTML() {
    var page = currentPage();
    var nav = [
      { href: 'index.html', label: 'Home', key: 'index' },
      { href: 'shop.html', label: 'Shop All', key: 'shop' },
      { href: 'shop.html?sort=rating', label: 'Top Rated', key: 'top' },
      { href: 'about.html', label: 'About Us', key: 'about' },
      { href: 'contact.html', label: 'Contact', key: 'contact' }
    ];
    var col1 = D.categories.slice(0, 6), col2 = D.categories.slice(6);

    var navHTML = nav.map(function (n) {
      return '<li class="' + (page === n.key ? 'is-active' : '') + '"><a href="' + n.href + '">' + n.label + '</a></li>';
    });

    return '' +
    '<div class="topbar"><div class="container topbar__inner">' +
      '<p class="topbar__msg">' + svg('truck') + 'Free express shipping on orders above ' + money(D.brand.freeShipOver) + '</p>' +
      '<div class="topbar__links">' +
        '<a href="tel:' + D.brand.phone.replace(/\s/g, '') + '">' + svg('phone') + D.brand.phone + '</a>' +
        '<span class="topbar__sep"></span>' +
        '<a href="contact.html">' + svg('pin') + 'Store locator</a>' +
        '<span class="topbar__sep"></span>' +
        '<a href="contact.html">' + svg('headset') + 'Help centre</a>' +
      '</div>' +
    '</div></div>' +

    '<div class="header-main"><div class="container header-main__inner">' +
      '<button class="icon-btn nav-toggle" id="navToggle" aria-label="Open menu">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>' +
      '</button>' +
      '<a class="brand" href="index.html"><img src="assets/img/logo.svg" alt="Apex Sports" width="210" height="44"></a>' +
      '<form class="search" id="searchForm" role="search" autocomplete="off">' +
        '<div class="search__box">' + svg('search', 'search__icon') +
          '<input class="search__input" id="searchInput" type="search" placeholder="Search bats, boots, racquets, dumbbells\u2026" aria-label="Search products">' +
          '<button class="search__submit" type="submit">Search</button>' +
        '</div>' +
        '<div class="suggest" id="searchSuggest" role="listbox"></div>' +
      '</form>' +
      '<div class="header-actions">' +
        '<a class="head-action" href="wishlist.html">' +
          '<span class="head-action__icon">' + svg('heart') + '<span class="count is-zero" id="wishCount">0</span></span>' +
          '<span class="head-action__text"><small>Saved</small><b>Wishlist</b></span>' +
        '</a>' +
        '<button class="head-action" id="cartToggle" aria-label="Open cart">' +
          '<span class="head-action__icon">' + svg('cart') + '<span class="count is-zero" id="cartCount">0</span></span>' +
          '<span class="head-action__text"><small>Your</small><b>Cart</b></span>' +
        '</button>' +
      '</div>' +
    '</div></div>' +

    '<nav class="mainnav"><div class="container mainnav__inner">' +
      '<ul class="mainnav__list">' +
        navHTML.slice(0, 2).join('') +
        '<li class="has-mega"><a href="shop.html">Categories ' + svg('chevron') + '</a>' +
          '<div class="mega">' +
            '<div class="mega__col"><h5>Team sports</h5>' +
              col1.map(function (c) { return '<a href="shop.html?category=' + c.slug + '">' + c.name + ' <span class="muted small">(' + c.count + ')</span></a>'; }).join('') +
            '</div>' +
            '<div class="mega__col"><h5>Training &amp; outdoors</h5>' +
              col2.map(function (c) { return '<a href="shop.html?category=' + c.slug + '">' + c.name + ' <span class="muted small">(' + c.count + ')</span></a>'; }).join('') +
            '</div>' +
            '<div class="mega__promo">' +
              '<b>Season clearance</b><span>Up to 45% off select training gear.</span>' +
              '<a class="btn btn--sm" href="shop.html?sort=discount">Shop deals</a>' +
            '</div>' +
          '</div>' +
        '</li>' +
        navHTML.slice(2).join('') +
      '</ul>' +
      '<p class="mainnav__note">' + svg('bolt') + 'Same-day dispatch before <b>4 PM</b></p>' +
    '</div></nav>';
  }

  function footerHTML() {
    var cats = D.categories.slice(0, 6);
    return '<div class="container">' +
      '<div class="footer-grid">' +
        '<div class="footer-about">' +
          '<img src="assets/img/logo-light.svg" alt="Apex Sports" width="210" height="44">' +
          '<p>India\u2019s specialist sports retailer since 2014. Authentic gear, expert fitting advice and fast dispatch from our Chennai warehouse.</p>' +
          '<div class="socials">' +
            '<a href="#" aria-label="Instagram">' + svg('ig') + '</a>' +
            '<a href="#" aria-label="Facebook">' + svg('fb') + '</a>' +
            '<a href="#" aria-label="X">' + svg('x') + '</a>' +
            '<a href="#" aria-label="YouTube">' + svg('yt') + '</a>' +
            '<a href="#" aria-label="WhatsApp">' + svg('wa') + '</a>' +
          '</div>' +
        '</div>' +
        '<div class="footer-links"><h5>Shop</h5>' +
          cats.map(function (c) { return '<a href="shop.html?category=' + c.slug + '">' + c.name + '</a>'; }).join('') +
          '<a href="shop.html">All products</a></div>' +
        '<div class="footer-links"><h5>Service</h5>' +
          '<a href="contact.html">Contact us</a><a href="contact.html">Shipping &amp; delivery</a>' +
          '<a href="contact.html">Returns &amp; exchange</a><a href="contact.html">Size guide</a>' +
          '<a href="contact.html">Track order</a><a href="contact.html">FAQs</a></div>' +
        '<div class="footer-links"><h5>Company</h5>' +
          '<a href="about.html">About Apex</a><a href="about.html">Our stores</a>' +
          '<a href="about.html">Careers</a><a href="about.html">Bulk &amp; team orders</a>' +
          '<a href="about.html">Privacy policy</a><a href="about.html">Terms of service</a></div>' +
        '<div><h5>Reach us</h5>' +
          '<ul class="footer-contact">' +
            '<li>' + svg('pin') + '<span>' + esc(D.brand.address) + '</span></li>' +
            '<li>' + svg('phone') + '<a href="tel:' + D.brand.phone.replace(/\s/g, '') + '">' + D.brand.phone + '</a></li>' +
            '<li>' + svg('mail') + '<a href="mailto:' + D.brand.email + '">' + D.brand.email + '</a></li>' +
            '<li>' + svg('clock') + '<span>' + esc(D.brand.hours) + '</span></li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<span>\u00A9 ' + new Date().getFullYear() + ' ' + esc(D.brand.legal) + ' \u00B7 GSTIN ' + D.brand.gst + '</span>' +
        '<div class="pay"><span>VISA</span><span>MASTERCARD</span><span>UPI</span><span>RUPAY</span><span>NETBANKING</span><span>COD</span></div>' +
        '<div class="footer-bottom__links"><a href="about.html">Privacy</a><a href="about.html">Terms</a><a href="contact.html">Support</a></div>' +
      '</div>' +
    '</div>';
  }

  function drawerHTML() {
    var cats = D.categories;
    return '' +
    '<div class="scrim" id="scrim"></div>' +

    '<aside class="drawer drawer--wide" id="cartDrawer" aria-hidden="true" aria-label="Shopping cart">' +
      '<div class="drawer__head">' +
        '<h2 class="drawer__title">Your cart <span id="cartDrawerCount">0 items</span></h2>' +
        '<button class="icon-btn drawer__close" data-close-drawer aria-label="Close cart">' + svg('close') + '</button>' +
      '</div>' +
      '<div class="drawer__body" id="cartDrawerBody"></div>' +
      '<div class="drawer__foot" id="cartDrawerFoot"></div>' +
    '</aside>' +

    '<aside class="drawer drawer--left" id="navDrawer" aria-hidden="true" aria-label="Menu">' +
      '<div class="drawer__head">' +
        '<h2 class="drawer__title">Menu</h2>' +
        '<button class="icon-btn drawer__close" data-close-drawer aria-label="Close menu">' + svg('close') + '</button>' +
      '</div>' +
      '<div class="drawer__body">' +
        '<a class="drawer-nav__link" href="index.html">Home ' + svg('chevD') + '</a>' +
        '<a class="drawer-nav__link" href="shop.html">Shop all products ' + svg('chevD') + '</a>' +
        '<a class="drawer-nav__link" href="wishlist.html">My wishlist ' + svg('chevD') + '</a>' +
        '<a class="drawer-nav__link" href="cart.html">Cart ' + svg('chevD') + '</a>' +
        '<div class="drawer-nav__group"><h5>Categories</h5>' +
          cats.map(function (c) {
            return '<a class="drawer-nav__link" href="shop.html?category=' + c.slug + '">' + c.name +
              ' <span class="chip chip--clear">' + c.count + '</span></a>';
          }).join('') +
        '</div>' +
        '<div class="drawer-nav__group"><h5>Company</h5>' +
          '<a class="drawer-nav__link" href="about.html">About us ' + svg('chevD') + '</a>' +
          '<a class="drawer-nav__link" href="contact.html">Contact ' + svg('chevD') + '</a>' +
        '</div>' +
        '<a class="btn btn--block mt-24" href="shop.html">' + svg('bolt') + 'Shop the clearance sale</a>' +
      '</div>' +
    '</aside>' +

    '<div class="modal" id="quickView" aria-hidden="true" role="dialog" aria-modal="true">' +
      '<div class="modal__box" id="quickViewBox"></div>' +
    '</div>' +

    '<div class="modal" id="offerModal" aria-hidden="true" role="dialog" aria-modal="true">' +
      '<div class="modal__box offer__box" id="offerBox"></div>' +
    '</div>' +

    '<div class="progress-bar" id="progressBar"></div>' +
    '<button class="to-top" id="toTop" aria-label="Back to top">' + svg('chevUp') + '</button>' +
    '<div class="sp-stack" id="socialProof" aria-live="polite"></div>' +

    '<div class="toast-stack" id="toastStack" aria-live="polite"></div>';
  }

  /* --------------------------------------------------------- quick view */
  function openQuickView(id) {
    var p = byId[id];
    if (!p) return;
    var box = $('#quickViewBox');
    box.innerHTML =
      '<button class="icon-btn modal__close" data-close-modal aria-label="Close">' + svg('close') + '</button>' +
      '<div class="qv">' +
        '<div class="qv__media"><img src="' + p.images[0] + '" alt="' + esc(p.name) + '"></div>' +
        '<div class="qv__body">' +
          '<span class="pdp__brand">' + esc(p.brand) + ' \u00B7 ' + esc(p.category) + '</span>' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<div class="pcard__rating">' + stars(p.rating) + '<span>' + p.rating.toFixed(1) + ' \u00B7 ' + p.reviewCount + ' reviews</span></div>' +
          '<div class="pcard__price mb-16"><span class="price">' + money(p.price) + '</span>' +
            '<span class="price--strike">' + money(p.mrp) + '</span>' +
            '<span class="price--off">' + p.discount + '% off</span></div>' +
          '<p class="small">' + esc(p.description) + '</p>' +
          '<ul class="feature-list mb-24" style="grid-template-columns:1fr">' +
            p.features.slice(0, 3).map(function (f) { return '<li>' + svg('checkC') + '<span>' + esc(f) + '</span></li>'; }).join('') +
          '</ul>' +
          '<div class="buybox">' +
            '<div class="qty">' +
              '<button data-qv-step="-1" aria-label="Decrease">' + svg('minus') + '</button>' +
              '<input id="qvQty" value="1" inputmode="numeric" aria-label="Quantity">' +
              '<button data-qv-step="1" aria-label="Increase">' + svg('plus') + '</button>' +
            '</div>' +
            '<button class="btn" data-qv-add="' + p.id + '">' + svg('cart') + 'Add to cart</button>' +
          '</div>' +
          '<a class="btn btn--outline btn--block" href="product.html?id=' + p.id + '">View full details</a>' +
        '</div>' +
      '</div>';
    openModal('#quickView');
  }

  function openModal(sel) {
    var m = $(sel);
    if (!m) return;
    m.classList.add('is-open');
    m.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }
  function closeModal(sel) {
    var m = $(sel);
    if (!m) return;
    m.classList.remove('is-open');
    m.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function openDrawer(sel) {
    var d = $(sel);
    if (!d) return;
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
    $('#scrim').classList.add('is-open');
    document.body.classList.add('no-scroll');
  }
  function closeDrawers() {
    $$('.drawer').forEach(function (d) { d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true'); });
    var f = $('.filters');
    if (f) f.classList.remove('is-open');
    var s = $('#scrim');
    if (s) s.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }

  /* -------------------------------------------------------------- toasts */
  function toast(title, text, type) {
    var stack = $('#toastStack');
    if (!stack) return;
    var icons = { cart: 'checkC', info: 'heart', error: 'close', default: 'checkC' };
    var el = document.createElement('div');
    el.className = 'toast' + (type && type !== 'default' ? ' toast--' + type : '');
    el.innerHTML = '<div class="toast__icon">' + svg(icons[type] || 'checkC') + '</div>' +
      '<div><b>' + esc(title) + '</b>' + (text ? '<span>' + esc(text) + '</span>' : '') + '</div>';
    stack.appendChild(el);
    setTimeout(function () {
      el.classList.add('is-out');
      setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }

  /* -------------------------------------------------------------- search */
  function suggestions(q) {
    q = q.trim().toLowerCase();
    if (q.length < 2) return [];
    var scored = D.products.map(function (p) {
      var name = p.name.toLowerCase(), brand = p.brand.toLowerCase(), cat = p.category.toLowerCase();
      var score = 0;
      if (name.indexOf(q) > -1) score += name.indexOf(q) === 0 ? 6 : 4;
      if (brand.indexOf(q) === 0) score += 3;
      if (cat.indexOf(q) > -1) score += 2;
      p.tags = p.tags || [];
      return { p: p, score: score };
    }).filter(function (s) { return s.score > 0; })
      .sort(function (a, b) { return b.score - a.score || b.p.rating - a.p.rating; });
    return scored.slice(0, 6).map(function (s) { return s.p; });
  }

  function renderSuggest(q) {
    var box = $('#searchSuggest');
    if (!box) return;
    var list = suggestions(q);
    if (!list.length) { box.classList.remove('is-open'); box.innerHTML = ''; return; }
    box.innerHTML = '<div class="suggest__label">Products</div>' + list.map(function (p) {
      return '<a class="suggest__item" href="product.html?id=' + p.id + '">' +
        '<img class="suggest__thumb" src="' + p.images[0] + '" alt="">' +
        '<div><div class="suggest__name">' + esc(p.name) + '</div>' +
        '<div class="suggest__meta">' + esc(p.brand) + ' \u00B7 ' + esc(p.category) + '</div></div>' +
        '<div class="suggest__price">' + money(p.price) + '</div></a>';
    }).join('') +
    '<a class="suggest__item" href="shop.html?q=' + encodeURIComponent(q) + '"><div>' +
      '<div class="suggest__name">See all results for \u201C' + esc(q) + '\u201D</div></div>' + svg('arrowR') + '</a>';
    box.classList.add('is-open');
  }

  /* --------------------------------------------------------------- wiring */
  function wireChrome() {
    // header height -> css var
    function measure() {
      var h = $('.site-header');
      if (h) document.documentElement.style.setProperty('--header-h', Math.round(h.offsetHeight) + 'px');
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);

    // sticky shadow
    window.addEventListener('scroll', function () {
      var h = $('.site-header');
      if (h) h.classList.toggle('is-stuck', window.scrollY > 6);
    }, { passive: true });

    // global delegated clicks
    document.addEventListener('click', function (e) {
      var t = e.target;

      var add = t.closest('[data-add]');
      if (add) { e.preventDefault(); cart.add(add.getAttribute('data-add'), 1); bump(add); return; }

      var w = t.closest('[data-wish]');
      if (w) { e.preventDefault(); wish.toggle(w.getAttribute('data-wish')); syncWishButtons(); return; }

      var q = t.closest('[data-quick]');
      if (q) { e.preventDefault(); openQuickView(q.getAttribute('data-quick')); return; }

      var step = t.closest('[data-qty]');
      if (step) {
        var key = step.getAttribute('data-qty');
        var delta = parseInt(step.getAttribute('data-step'), 10);
        var cur = cart.items.filter(function (it) { return cart.key(it) === key; })[0];
        if (cur) cart.setQty(key, cur.qty + delta);
        return;
      }

      var rm = t.closest('[data-remove]');
      if (rm) { cart.remove(rm.getAttribute('data-remove')); toast('Item removed', 'Your cart has been updated', 'info'); return; }

      var qs1 = t.closest('[data-qv-step]');
      if (qs1) {
        var inp = $('#qvQty');
        if (inp) inp.value = clamp((parseInt(inp.value, 10) || 1) + parseInt(qs1.getAttribute('data-qv-step'), 10), 1, 20);
        return;
      }
      var qa = t.closest('[data-qv-add]');
      if (qa) {
        var inp2 = $('#qvQty');
        cart.add(qa.getAttribute('data-qv-add'), inp2 ? inp2.value : 1);
        closeModal('#quickView');
        openDrawer('#cartDrawer');
        return;
      }
      if (t.closest('[data-close-modal]')) { closeModal('#quickView'); return; }
      if (t.closest('[data-close-drawer]')) { closeDrawers(); return; }

      var tog = t.closest('[data-collapse]');
      if (tog) { tog.parentElement.classList.toggle('is-collapsed'); return; }
    });

    document.addEventListener('change', function (e) {
      var qi = e.target.closest('[data-qtyinput]');
      if (qi) { cart.setQty(qi.getAttribute('data-qtyinput'), parseInt(qi.value, 10) || 1); }
    });

    // cart / nav toggles
    var ct = $('#cartToggle');
    if (ct) ct.addEventListener('click', function () { openDrawer('#cartDrawer'); });
    var nt = $('#navToggle');
    if (nt) nt.addEventListener('click', function () { openDrawer('#navDrawer'); });
    var sc = $('#scrim');
    if (sc) sc.addEventListener('click', closeDrawers);

    // quick view qty typing guard
    document.addEventListener('input', function (e) {
      if (e.target.id === 'qvQty') e.target.value = String(e.target.value).replace(/\D/g, '').slice(0, 2);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeDrawers(); closeModal('#quickView'); var s = $('#searchSuggest'); if (s) s.classList.remove('is-open'); }
    });

    // search
    var form = $('#searchForm'), input = $('#searchInput'), box = $('#searchSuggest');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = input.value.trim();
        location.href = 'shop.html' + (v ? '?q=' + encodeURIComponent(v) : '');
      });
    }
    if (input) {
      var tmr;
      input.addEventListener('input', function () {
        clearTimeout(tmr);
        tmr = setTimeout(function () { renderSuggest(input.value); }, 130);
      });
      input.addEventListener('focus', function () { if (input.value.length > 1) renderSuggest(input.value); });
    }
    document.addEventListener('click', function (e) {
      if (box && !e.target.closest('#searchForm')) box.classList.remove('is-open');
    });

    on('cart', function () { syncBadges(); syncCartDrawer(); });
    on('wish', function () { syncBadges(); });
    syncBadges();
    syncCartDrawer();
  }

  function bump(el) {
    var c = $('#cartCount');
    if (!c) return;
    c.classList.remove('is-bump');
    void c.offsetWidth;
    c.classList.add('is-bump');
  }

  /* ----------------------------------------------------------- reveal fx */
  function initReveal(root) {
    var els = $$('.reveal', root || document).filter(function (el) { return !el.classList.contains('is-in'); });
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ====================================================================
     ENGAGEMENT — live social proof, welcome offer, recently viewed,
     live viewer counts, back-to-top and reading progress
     ==================================================================== */
  var SP_PEOPLE = [
    ['Arjun', 'Chennai'], ['Divya', 'Bengaluru'], ['Karthik', 'Coimbatore'],
    ['Fathima', 'Hyderabad'], ['Rohit', 'Pune'], ['Meera', 'Kochi'],
    ['Vignesh', 'Madurai'], ['Sneha', 'Mumbai'], ['Imran', 'New Delhi'],
    ['Priya', 'Tiruchirappalli'], ['Naveen', 'Salem'], ['Anitha', 'Mysuru'],
    ['Hari', 'Vijayawada'], ['Swetha', 'Chennai'], ['Gopal', 'Erode'],
    ['Deepak', 'Bengaluru'], ['Nithya', 'Thanjavur'], ['Suresh', 'Vellore'],
  ];
  var SP_TIMES = ['just now', '2 minutes ago', '6 minutes ago', '11 minutes ago',
    '18 minutes ago', '26 minutes ago', 'about an hour ago'];
  var pickOne = function (a) { return a[Math.floor(Math.random() * a.length)]; };

  var engage = {
    /* ---------------------------------------------------- social proof */
    spCount: 0,
    spPaused: false,

    socialProof: function () {
      var stack = $('#socialProof');
      if (!stack || currentPage() === 'checkout') return;
      var self = this;

      function show() {
        if (self.spPaused || self.spCount >= 5) return;
        self.spCount++;
        var p = pickOne(D.products);
        var who = pickOne(SP_PEOPLE);
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'sp';
        el.innerHTML =
          '<span class="sp__media"><img src="' + p.images[0] + '" alt=""></span>' +
          '<span class="sp__body">' +
            '<span class="sp__who"><b>' + esc(who[0]) + '</b> from ' + esc(who[1]) + '</span>' +
            '<span class="sp__name">' + esc(p.name) + '</span>' +
            '<span class="sp__meta">' + svg('checkC') + '<span class="sp__price">' + money(p.price) + '</span>' +
              '\u00B7 ' + pickOne(SP_TIMES) + '</span>' +
          '</span>' +
          '<span class="sp__close" data-sp-close aria-label="Dismiss">' + svg('close') + '</span>';
        el.addEventListener('click', function (e) {
          if (e.target.closest('[data-sp-close]')) {
            e.preventDefault();
            el.classList.add('is-out');
            setTimeout(function () { el.remove(); }, 400);
            return;
          }
          location.href = 'product.html?id=' + p.id;
        });
        stack.appendChild(el);
        requestAnimationFrame(function () { el.classList.add('is-in'); });
        setTimeout(function () {
          if (!el.isConnected) return;
          el.classList.add('is-out');
          setTimeout(function () { el.remove(); }, 400);
        }, 7000);
        while (stack.children.length > 3) stack.removeChild(stack.firstChild);
      }

      stack.addEventListener('mouseenter', function () { self.spPaused = true; });
      stack.addEventListener('mouseleave', function () { self.spPaused = false; });
      setTimeout(function () { show(); setInterval(show, 19000); }, 8000);
    },

    /* -------------------------------------------------- welcome offer */
    offerOpen: false,

    offer: function () {
      var box = $('#offerBox');
      if (!box) return;
      if (currentPage() === 'checkout') return;
      if (store.get('offerSeen', false)) return;      // once per visitor
      var self = this;
      var coupon = D.coupons.filter(function (c) { return c.code === 'WELCOME300'; })[0] || D.coupons[0];
      var hero = D.products.slice().sort(function (a, b) { return b.price - a.price; })[0];

      function open() {
        if (self.offerOpen) return;
        self.offerOpen = true;
        store.set('offerSeen', true);
        box.innerHTML =
          '<button class="icon-btn modal__close" data-close-modal aria-label="Close">' + svg('close') + '</button>' +
          '<div class="offer__art">' +
            '<span class="offer__tag">Members only</span>' +
            '<img src="' + hero.images[0] + '" alt="">' +
          '</div>' +
          '<div class="offer__body">' +
            '<span class="eyebrow">Welcome to Apex</span>' +
            '<h3>Unlock ' + money(coupon.value) + ' off your first order</h3>' +
            '<p class="small">Join 18,400+ athletes who get restock alerts, drop dates and member pricing before anyone else.</p>' +
            '<div class="offer__code is-hidden" id="offerCode">' +
              '<span>' + coupon.code + '</span>' +
              '<button type="button" data-reveal>' + svg('spark') + 'Tap to reveal your code</button>' +
            '</div>' +
            '<ul class="offer__list">' +
              '<li>' + svg('checkC') + '<span>' + esc(coupon.label) + '</span></li>' +
              '<li>' + svg('checkC') + '<span>No minimum order, works with every product</span></li>' +
              '<li>' + svg('checkC') + '<span>Stacks with free express shipping</span></li>' +
            '</ul>' +
            '<button class="btn btn--block btn--lg" data-offer-apply>' + svg('tag') + 'Apply to my cart</button>' +
            '<button class="offer__skip" type="button" data-close-modal>No thanks, I will pay full price</button>' +
          '</div>';
        openModal('#offerModal');
      }

      setTimeout(open, 15000);
      document.addEventListener('mouseout', function (e) {
        if (!e.relatedTarget && e.clientY <= 6) open();     // exit intent
      });

      document.addEventListener('click', function (e) {
        if (e.target.closest('[data-reveal]')) {
          var c = $('#offerCode');
          if (c) c.classList.remove('is-hidden');
          return;
        }
        if (e.target.closest('[data-offer-apply]')) {
          var res = coupon.apply
            ? Apex.coupon.apply(coupon.code)
            : { ok: false };
          closeModal('#offerModal');
          if (res.ok) {
            Apex.toast('Coupon unlocked', coupon.code + ' \u2014 ' + coupon.label, 'cart');
            if (cart.count()) openDrawer('#cartDrawer');
          } else {
            Apex.toast('Saved for later', 'Add ' + money(Math.max(0, coupon.minOrder - cart.subtotal())) +
              ' more, then use ' + coupon.code, 'info');
          }
        }
      });
    },

    /* ------------------------------------------------- recently viewed */
    recentRail: function (mountSel) {
      var mount = $(mountSel);
      if (!mount) return;
      var ids = store.get('recent', []);
      var items = [];
      for (var i = 0; i < ids.length && items.length < 10; i++) {
        var p = byId[ids[i]];
        if (p && items.indexOf(p) === -1) items.push(p);
      }
      if (items.length < 2) { mount.remove(); return; }

      mount.innerHTML =
        '<div class="container">' +
          '<div class="section-head">' +
            '<div><span class="eyebrow">Pick up where you left off</span><h2>Recently viewed</h2></div>' +
            '<div class="rail-nav">' +
              '<button type="button" data-rail="-1" aria-label="Scroll left">' + svg('arrowL') + '</button>' +
              '<button type="button" data-rail="1" aria-label="Scroll right">' + svg('arrowR') + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="rail" id="recentRail">' + items.map(function (p) { return productCard(p); }).join('') + '</div>' +
        '</div>';
      mount.hidden = false;

      mount.querySelectorAll('[data-rail]').forEach(function (b) {
        b.addEventListener('click', function () {
          var rail = $('#recentRail');
          if (rail) rail.scrollBy({ left: Number(b.getAttribute('data-rail')) * 520, behavior: 'smooth' });
        });
      });
      initReveal(mount);
    },

    /* ------------------------------------------------------- live stats */
    viewers: function () { return 17 + Math.floor(Math.random() * 46); },
    soldToday: function () { return 22 + Math.floor(Math.random() * 58); },

    /* ------------------------------------------- scroll UI + progress */
    scrollUI: function () {
      var btn = $('#toTop');
      var bar = $('#progressBar');
      function upd() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        if (bar) bar.style.width = pct.toFixed(1) + '%';
        if (btn) btn.classList.toggle('is-on', window.scrollY > 700);
      }
      window.addEventListener('scroll', upd, { passive: true });
      window.addEventListener('resize', upd);
      if (btn) btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      upd();
    }
  };

  /* --------------------------------------------------------------- public */
  var Apex = {
    data: D,
    products: D.products,
    categories: D.categories,
    brands: D.brands,
    money: money,
    esc: esc,
    svg: svg,
    svgFill: svgFill,
    stars: stars,
    productCard: productCard,
    byId: function (id) { return byId[id]; },
    bySlug: function (s) { return bySlug[s]; },
    cart: cart,
    wishlist: wish,
    coupon: coupon,
    totals: totals,
    toast: toast,
    on: on,
    emit: emit,
    param: qs,
    openDrawer: openDrawer,
    closeDrawers: closeDrawers,
    openModal: openModal,
    closeModal: closeModal,
    openQuickView: openQuickView,
    recentRail: function (sel) { engage.recentRail(sel); },
    viewers: function () { return engage.viewers(); },
    soldToday: function () { return engage.soldToday(); },
    initReveal: initReveal,
    store: store,
    badgeFor: badgeFor,
    ready: function (fn) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
      else fn();
    }
  };
  window.Apex = Apex;

  /* ---------------------------------------------------------------- boot */
  var hm = document.getElementById('headerMount');
  if (hm) {
    hm.className = 'site-header';
    hm.id = 'siteHeader';
    hm.innerHTML = headerHTML();
  }
  var fm = document.getElementById('footerMount');
  if (fm) { fm.className = 'site-footer'; fm.innerHTML = footerHTML(); }

  var dm = document.getElementById('drawerMount');
  if (dm) dm.innerHTML = drawerHTML();

  wireChrome();
  initReveal();
  engage.socialProof();
  engage.offer();
  engage.scrollUI();

  Apex.ready(function () {
    initReveal();
    syncBadges();
    syncCartDrawer();
    syncWishButtons();
  });
})();
