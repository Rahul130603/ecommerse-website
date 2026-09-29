/* ==========================================================================
   APEX SPORTS — product detail page
   ========================================================================== */
Apex.ready(function () {
  var D = Apex.data;
  var P = Apex.byId(Apex.param('id') || '') || Apex.bySlug(Apex.param('slug') || '');

  if (!P) {
    document.getElementById('pdp').innerHTML =
      '<div class="empty" style="grid-column:1/-1">' +
      '<div class="empty__icon">' + Apex.svg('box') + '</div>' +
      '<h3>We couldn\u2019t find that product</h3>' +
      '<p>It may have been renamed or removed from the catalogue. Browse everything we currently stock instead.</p>' +
      '<a class="btn" href="shop.html">Browse all products</a></div>';
    document.getElementById('pdpTabs').remove();
    return;
  }

  document.title = P.name + ' — Apex Sports';
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', P.description);

  /* A product created from the admin panel may not have every field the
     generated catalogue shipped with (reviews, rating breakdown, images).
     Fill the gaps once here so every template below can stay naive. */
  P.sizes = P.sizes || [];
  P.colors = P.colors || [];
  P.features = P.features || [];
  P.specs = P.specs || [];
  P.reviews = P.reviews || [];
  P.images = (P.images && P.images.length) ? P.images : ['assets/img/placeholder.svg'];
  P.ratingBreakdown = P.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  P.rating = Number(P.rating) || 0;
  P.reviewCount = Number(P.reviewCount) || 0;
  P.stock = Number(P.stock) || 0;
  P.description = P.description || '';
  P.categorySlug = P.categorySlug || '';

  /* ------------------------------------------------------------ state */
  var sel = { size: P.sizes[0] || '', color: P.colors[0] || '', qty: 1, img: 0 };

  /* --------------------------------------------------------- crumbs/JSON-LD */
  document.getElementById('pdpCrumbs').innerHTML =
    '<a href="index.html">Home</a>' + Apex.svg('chevD') +
    '<a href="shop.html">Shop</a>' + Apex.svg('chevD') +
    '<a href="shop.html?category=' + P.categorySlug + '">' + Apex.esc(P.category) + '</a>' + Apex.svg('chevD') +
    '<b>' + Apex.esc(P.name) + '</b>';

  var ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product',
    name: P.name, brand: { '@type': 'Brand', name: P.brand },
    sku: P.sku, description: P.description,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: P.rating, reviewCount: P.reviewCount },
    offers: {
      '@type': 'Offer', priceCurrency: 'INR', price: P.price,
      availability: P.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition'
    }
  });
  document.head.appendChild(ld);

  /* -------------------------------------------------------------- gallery */
  var thumbs = P.images.map(function (src, i) {
    return '<button type="button" class="gallery__thumb' + (i === 0 ? ' is-on' : '') + '" data-img="' + i + '" aria-label="View image ' + (i + 1) + '">' +
      '<img src="' + src + '" alt=""></button>';
  }).join('');

  /* -------------------------------------------------------------- options */
  function sizeHTML() {
    if (!P.sizes.length) return '';
    return '<div class="opt"><div class="opt__label">Size <a href="contact.html">Size guide</a></div>' +
      '<div class="opt__values" id="sizeOpts">' +
      P.sizes.map(function (s, i) {
        return '<button type="button" class="opt__value' + (i === 0 ? ' is-on' : '') + '" data-size="' + Apex.esc(s) + '">' + Apex.esc(s) + '</button>';
      }).join('') + '</div></div>';
  }
  var SWATCH = { Black: '#1b1b1f', White: '#f4f5f7', Navy: '#1e2a4a', Blue: '#2563eb', Red: '#d92d20', Grey: '#9aa3b2', Natural: '#d9c3a5' };

  function colorHTML() {
    if (!P.colors.length) return '';
    return '<div class="opt"><div class="opt__label">Colour <span id="colorName">' + Apex.esc(P.colors[0]) + '</span></div>' +
      '<div class="opt__values" id="colorOpts">' +
      P.colors.map(function (c, i) {
        return '<button type="button" class="opt__swatch opt__value' + (i === 0 ? ' is-on' : '') + '" data-color="' + Apex.esc(c) + '" ' +
          'style="background:' + (SWATCH[c] || '#ccc') + '" title="' + Apex.esc(c) + '" aria-label="' + Apex.esc(c) + '"></button>';
      }).join('') + '</div></div>';
  }

  var delivery = new Date(Date.now() + 3 * 864e5);
  var dl = delivery.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  /* ----------------------------------------------------------------- PDP */
  document.getElementById('pdp').innerHTML =
    '<div class="gallery">' +
      '<div class="gallery__thumbs">' + thumbs + '</div>' +
      '<div class="gallery__main">' +
        '<div class="gallery__badges">' + Apex.badgeFor(P) +
          (P.discount >= 20 ? '<span class="badge badge--sale">-' + P.discount + '%</span>' : '') + '</div>' +
        '<img id="mainImage" src="' + P.images[0] + '" alt="' + Apex.esc(P.name) + '">' +
        '<span class="gallery__zoom">' + Apex.svg('zoom') + 'Hover to zoom</span>' +
      '</div>' +
    '</div>' +

    '<div>' +
      '<span class="pdp__brand">' + Apex.esc(P.brand) + '</span>' +
      '<h1>' + Apex.esc(P.name) + '</h1>' +
      '<div class="pdp__meta">' +
        Apex.stars(P.rating, 'stars--lg') +
        '<span><b>' + P.rating.toFixed(1) + '</b> (' + P.reviewCount + ' reviews)</span>' +
        '<span class="dotsep"></span>' +
        '<span>SKU ' + Apex.esc(P.sku) + '</span>' +
        '<span class="dotsep"></span>' +
        '<span>' + Apex.esc(P.category) + '</span>' +
      '</div>' +

      '<div class="pdp__price">' +
        '<span class="price">' + Apex.money(P.price) + '</span>' +
        '<span class="price--strike">' + Apex.money(P.mrp) + '</span>' +
        '<span class="price--off">' + P.discount + '% off \u00B7 save ' + Apex.money(P.mrp - P.price) + '</span>' +
        '<small>Inclusive of all taxes \u00B7 Free shipping above ' + Apex.money(D.brand.freeShipOver) + '</small>' +
      '</div>' +

      '<p class="pdp__desc">' + Apex.esc(P.description) + '</p>' +

      (P.stock <= 6
        ? '<p class="pcard__stock pcard__stock--low mb-16"><i></i>Hurry \u2014 only ' + P.stock + ' left in stock</p>'
        : '<p class="pcard__stock pcard__stock--ok mb-16"><i></i>In stock \u00B7 ' + P.stock + ' units ready to ship</p>') +

      '<div class="live-row">' +
        '<span class="live"><i></i><b id="liveViewers">' + Apex.viewers() + '</b> people viewing right now</span>' +
        '<span class="live">' + Apex.svg('flame') + '<b>' + Apex.soldToday() + '</b> sold in the last 24 hours</span>' +
      '</div>' +

      sizeHTML() + colorHTML() +

      '<div class="buybox">' +
        '<div class="qty">' +
          '<button type="button" id="qtyMinus" aria-label="Decrease quantity">' + Apex.svg('minus') + '</button>' +
          '<input id="qtyInput" value="1" inputmode="numeric" aria-label="Quantity">' +
          '<button type="button" id="qtyPlus" aria-label="Increase quantity">' + Apex.svg('plus') + '</button>' +
        '</div>' +
        '<button class="btn btn--lg" id="addToCart">' + Apex.svg('cart') + 'Add to cart</button>' +
      '</div>' +
      '<div class="pdp__actions">' +
        '<button class="btn btn--dark" id="buyNow">' + Apex.svg('bolt') + 'Buy it now</button>' +
        '<button class="btn btn--outline" id="wishBtn">' + Apex.svg('heart') + '<span id="wishLabel">Save to wishlist</span></button>' +
      '</div>' +

      '<div class="pdp__assure">' +
        '<div class="assure-row">' + Apex.svg('truck') + '<span><b>Free express delivery by ' + dl + '</b>' +
          '<span>Dispatched same day if ordered before 4 PM</span></span></div>' +
        '<div class="assure-row">' + Apex.svg('refresh') + '<span><b>7-day easy exchange</b>' +
          '<span>Wrong size? We arrange a free pickup and swap</span></span></div>' +
        '<div class="assure-row">' + Apex.svg('shield') + '<span><b>Brand warranty &amp; genuine stock</b>' +
          '<span>Authorised ' + Apex.esc(P.brand) + ' retailer \u00B7 GST invoice included</span></span></div>' +
        '<div class="assure-row">' + Apex.svg('lock') + '<span><b>Secure payments</b>' +
          '<span>UPI, cards, net banking and cash on delivery</span></span></div>' +
      '</div>' +
    '</div>';

  /* ----------------------------------------------------------- interactions */
  var mainImg = document.getElementById('mainImage');
  document.querySelectorAll('[data-img]').forEach(function (t) {
    t.addEventListener('click', function () {
      document.querySelectorAll('[data-img]').forEach(function (x) { x.classList.remove('is-on'); });
      t.classList.add('is-on');
      mainImg.src = P.images[Number(t.getAttribute('data-img'))];
    });
  });

  var sizeOpts = document.getElementById('sizeOpts');
  if (sizeOpts) sizeOpts.addEventListener('click', function (e) {
    var b = e.target.closest('[data-size]'); if (!b) return;
    sizeOpts.querySelectorAll('.opt__value').forEach(function (x) { x.classList.remove('is-on'); });
    b.classList.add('is-on');
    sel.size = b.getAttribute('data-size');
  });

  var colorOpts = document.getElementById('colorOpts');
  if (colorOpts) colorOpts.addEventListener('click', function (e) {
    var b = e.target.closest('[data-color]'); if (!b) return;
    colorOpts.querySelectorAll('.opt__value').forEach(function (x) { x.classList.remove('is-on'); });
    b.classList.add('is-on');
    sel.color = b.getAttribute('data-color');
    document.getElementById('colorName').textContent = sel.color;
  });

  var qtyInput = document.getElementById('qtyInput');
  function setQty(n) {
    sel.qty = Math.max(1, Math.min(20, n || 1));
    qtyInput.value = sel.qty;
  }
  document.getElementById('qtyMinus').addEventListener('click', function () { setQty(sel.qty - 1); });
  document.getElementById('qtyPlus').addEventListener('click', function () { setQty(sel.qty + 1); });
  qtyInput.addEventListener('input', function () { qtyInput.value = qtyInput.value.replace(/\D/g, '').slice(0, 2); });
  qtyInput.addEventListener('blur', function () { setQty(parseInt(qtyInput.value, 10)); });

  document.getElementById('addToCart').addEventListener('click', function () {
    Apex.cart.add(P.id, sel.qty, sel.size, sel.color);
    Apex.openDrawer('#cartDrawer');
  });
  document.getElementById('buyNow').addEventListener('click', function () {
    Apex.cart.add(P.id, sel.qty, sel.size, sel.color);
    location.href = 'checkout.html';
  });

  function syncWishBtn() {
    var on = Apex.wishlist.has(P.id);
    var b = document.getElementById('wishBtn');
    b.classList.toggle('btn--ghost', on);
    b.classList.toggle('btn--outline', !on);
    document.getElementById('wishLabel').textContent = on ? 'Saved to wishlist' : 'Save to wishlist';
  }
  document.getElementById('wishBtn').addEventListener('click', function () {
    Apex.wishlist.toggle(P.id); syncWishBtn();
  });
  syncWishBtn();

  /* ---------------------------------------------------------------- tabs */
  var bd = P.ratingBreakdown;
  var totalR = P.reviewCount;
  function bar(star) {
    var n = bd[star] || 0;
    var pct = Math.round((n / totalR) * 100);
    return '<div class="rev-bar"><span>' + star + ' star</span>' +
      '<span class="rev-bar__track"><span class="rev-bar__fill" style="width:' + pct + '%"></span></span>' +
      '<span>' + pct + '%</span></div>';
  }

  var specsRows = P.specs.concat([
    ['Brand', P.brand],
    ['Category', P.category],
    ['SKU', P.sku],
    ['Warranty', 'Manufacturer warranty as per brand policy'],
    ['Country of origin', 'India / Imported']
  ]);

  document.getElementById('pdpTabs').innerHTML =
    '<div class="tabs__nav" id="tabNav">' +
      '<button class="tabs__btn is-on" data-tab="desc" type="button">Description</button>' +
      '<button class="tabs__btn" data-tab="spec" type="button">Specifications</button>' +
      '<button class="tabs__btn" data-tab="rev" type="button">Reviews (' + P.reviewCount + ')</button>' +
      '<button class="tabs__btn" data-tab="ship" type="button">Shipping &amp; returns</button>' +
    '</div>' +

    '<div class="tabs__panel is-on" data-panel="desc">' +
      '<h3>About the ' + Apex.esc(P.name) + '</h3>' +
      '<p class="lede">' + Apex.esc(P.description) + '</p>' +
      '<h4 class="mt-24">Key features</h4>' +
      '<ul class="feature-list">' +
        P.features.map(function (f) { return '<li>' + Apex.svg('checkC') + '<span>' + Apex.esc(f) + '</span></li>'; }).join('') +
      '</ul>' +
      '<h4 class="mt-32">Why buy from Apex Sports</h4>' +
      '<p>Every unit we ship is sourced directly from the brand or an authorised distributor. You get a GST invoice, a genuine warranty card where applicable, and a seven-day exchange window if the fit is not right. Our Chennai warehouse dispatches the same working day for orders placed before 4 PM.</p>' +
    '</div>' +

    '<div class="tabs__panel" data-panel="spec">' +
      '<h3>Technical specifications</h3>' +
      '<table class="spec-table"><tbody>' +
        specsRows.map(function (r) { return '<tr><th>' + Apex.esc(r[0]) + '</th><td>' + Apex.esc(r[1]) + '</td></tr>'; }).join('') +
      '</tbody></table>' +
      '<p class="small muted mt-16">Specifications are provided by the manufacturer and may be updated without notice. Contact us if a specific measurement is critical for your purchase.</p>' +
    '</div>' +

    '<div class="tabs__panel" data-panel="rev">' +
      '<div class="rev-summary">' +
        '<div class="rev-score">' +
          '<b>' + P.rating.toFixed(1) + '</b>' +
          Apex.stars(P.rating, 'stars--lg') +
          '<span>' + P.reviewCount + ' verified ratings</span>' +
        '</div>' +
        '<div class="rev-bars">' + [5, 4, 3, 2, 1].map(bar).join('') + '</div>' +
      '</div>' +
      '<div class="rev-list">' +
        P.reviews.map(function (r) {
          return '<article class="rev-item">' +
            '<div class="rev-item__head">' +
              '<span class="avatar">' + Apex.esc(r.initials) + '</span>' +
              '<span><b>' + Apex.esc(r.name) + '</b></span>' +
              Apex.stars(r.rating) +
              (r.verified ? '<span class="verified">' + Apex.svg('checkC') + 'Verified purchase</span>' : '') +
              '<time>' + Apex.esc(r.date) + '</time>' +
            '</div>' +
            '<h4>' + Apex.esc(r.title) + '</h4>' +
            '<p>' + Apex.esc(r.text) + '</p>' +
          '</article>';
        }).join('') +
      '</div>' +
      '<p class="small muted mt-24">Reviews shown are from customers with a delivered order for this product. Ratings above are an aggregate of all verified purchases.</p>' +
    '</div>' +

    '<div class="tabs__panel" data-panel="ship">' +
      '<div class="grid grid--2">' +
        '<div><h4>Shipping</h4>' +
          '<p>Orders placed before 4 PM on a working day are dispatched the same day from our Chennai warehouse. Standard delivery takes 2\u20134 working days for metro cities and 4\u20137 working days for the rest of India.</p>' +
          '<ul class="feature-list" style="grid-template-columns:1fr">' +
            '<li>' + Apex.svg('checkC') + '<span>Free express shipping on orders above ' + Apex.money(D.brand.freeShipOver) + '</span></li>' +
            '<li>' + Apex.svg('checkC') + '<span>Flat ' + Apex.money(D.brand.shipFlat) + ' standard shipping below that</span></li>' +
            '<li>' + Apex.svg('checkC') + '<span>Cash on delivery available up to ' + Apex.money(15000) + '</span></li>' +
          '</ul></div>' +
        '<div><h4>Returns &amp; exchange</h4>' +
          '<p>Changed your mind or got the wrong size? Raise an exchange within 7 days of delivery and we arrange a free reverse pickup in serviceable pin codes.</p>' +
          '<ul class="feature-list" style="grid-template-columns:1fr">' +
            '<li>' + Apex.svg('checkC') + '<span>7-day exchange window from delivery date</span></li>' +
            '<li>' + Apex.svg('checkC') + '<span>Item must be unused with original tags and packaging</span></li>' +
            '<li>' + Apex.svg('checkC') + '<span>Refunds processed within 5 working days of quality check</span></li>' +
          '</ul></div>' +
      '</div>' +
      '<p class="small muted mt-24">For bulk, club or team orders above 10 units, write to ' + D.brand.email + ' and our team will quote special pricing.</p>' +
    '</div>';

  var nav = document.getElementById('tabNav');
  nav.addEventListener('click', function (e) {
    var b = e.target.closest('[data-tab]'); if (!b) return;
    nav.querySelectorAll('.tabs__btn').forEach(function (x) { x.classList.remove('is-on'); });
    b.classList.add('is-on');
    var key = b.getAttribute('data-tab');
    document.querySelectorAll('[data-panel]').forEach(function (p) {
      p.classList.toggle('is-on', p.getAttribute('data-panel') === key);
    });
  });

  /* -------------------------------------------------------- related items */
  var rel = D.products
    .filter(function (x) { return x.id !== P.id && x.category === P.category; })
    .concat(D.products.filter(function (x) { return x.id !== P.id && x.category !== P.category && x.brand === P.brand; }));
  rel = rel.slice(0, 8);
  while (rel.length < 4) {
    var extra = D.products.filter(function (x) { return x.id !== P.id && rel.indexOf(x) === -1; })[0];
    if (!extra) break;
    rel.push(extra);
  }
  if (rel.length) {
    document.getElementById('relatedSection').hidden = false;
    document.getElementById('relatedGrid').innerHTML = rel.slice(0, 4)
      .map(function (p) { return Apex.productCard(p); }).join('');
    Apex.initReveal(document.getElementById('relatedGrid'));
  }

  /* ------------------------------------------------------ recently viewed */
  var rv = Apex.store.get('recent', []).filter(function (id) { return id !== P.id; });
  rv.unshift(P.id);
  Apex.store.set('recent', rv.slice(0, 12));

  /* ------------------------------------------------------ live activity */
  setInterval(function () {
    var el = document.getElementById('liveViewers');
    if (el) el.textContent = Apex.viewers();
  }, 9000);
});
