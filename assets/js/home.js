/* ==========================================================================
   APEX SPORTS — home page
   ========================================================================== */
Apex.ready(function () {
  var D = Apex.data;

  /* ------------------------------------------------------------- helpers */
  function fill(sel, html) { var el = document.querySelector(sel); if (el) el.innerHTML = html; }
  function bySales(a, b) { return b.reviewCount - a.reviewCount; }
  function byRating(a, b) { return b.rating - a.rating || b.reviewCount - a.reviewCount; }
  function byDiscount(a, b) { return b.discount - a.discount; }
  function byNew(a, b) { return (b.badge === 'New') - (a.badge === 'New') || b.price - a.price; }

  /* ---------------------------------------------------------------- hero */
  var slideHTML = D.slides.map(function (s, i) {
    return '<article class="hero__slide' + (i === 0 ? ' is-active' : '') + '" data-slide="' + i + '">' +
      '<img class="hero__bg" src="' + s.image + '" alt="" aria-hidden="true">' +
      '<div class="container hero__grid">' +
        '<div class="hero__copy">' +
          '<span class="eyebrow eyebrow--light">' + Apex.esc(s.eyebrow) + '</span>' +
          '<h1>' + Apex.esc(s.title) + '</h1>' +
          '<p>' + Apex.esc(s.text) + '</p>' +
          '<div class="hero__actions">' +
            '<a class="btn btn--lg" href="' + s.href + '">' + Apex.svg('cart') + Apex.esc(s.cta) + '</a>' +
            '<a class="btn btn--glass btn--lg" href="shop.html">Browse catalogue</a>' +
          '</div>' +
          '<div class="hero__stats">' +
            '<div class="hero__stat"><b>50+</b><span>Product lines</span></div>' +
            '<div class="hero__stat"><b>4.7/5</b><span>Buyer rating</span></div>' +
            '<div class="hero__stat"><b>24h</b><span>Dispatch</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="hero__art">' +
          '<div class="hero__art-frame"><img src="' + s.image + '" alt="' + Apex.esc(s.title) + '"></div>' +
          '<div class="hero__float hero__float--a"><span class="dot">' + Apex.svg('truck') + '</span>' +
            '<span><b>Free express delivery</b><span>Orders above ' + Apex.money(D.brand.freeShipOver) + '</span></span></div>' +
          '<div class="hero__float hero__float--b"><span class="dot">' + Apex.svg('shield') + '</span>' +
            '<span><b>100% genuine</b><span>Brand authorised</span></span></div>' +
        '</div>' +
      '</div>' +
    '</article>';
  }).join('');

  fill('#heroTrack', slideHTML);
  fill('#heroDots', D.slides.map(function (s, i) {
    return '<button class="hero__dot' + (i === 0 ? ' is-active' : '') + '" data-goto="' + i + '" role="tab" aria-label="Slide ' + (i + 1) + '"></button>';
  }).join(''));

  var idx = 0, timer = null, total = D.slides.length;
  var slides = document.querySelectorAll('.hero__slide');
  var dots = document.querySelectorAll('.hero__dot');

  function go(n) {
    idx = (n + total) % total;
    slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
  }
  function play() { clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 6500); }

  document.getElementById('heroNext').addEventListener('click', function () { go(idx + 1); play(); });
  document.getElementById('heroPrev').addEventListener('click', function () { go(idx - 1); play(); });
  dots.forEach(function (d) {
    d.addEventListener('click', function () { go(parseInt(d.getAttribute('data-goto'), 10)); play(); });
  });
  var hero = document.querySelector('.hero');
  hero.addEventListener('mouseenter', function () { clearInterval(timer); });
  hero.addEventListener('mouseleave', play);
  play();

  /* -------------------------------------------------------------- marquee */
  var words = ['Free shipping over ' + Apex.money(D.brand.freeShipOver), '7-day easy exchange',
    'Authorised retailer', 'Same-day dispatch before 4 PM', 'GST invoice on every order',
    '18,400+ happy athletes', 'Cash on delivery available'];
  var line = words.map(function (w) { return '<span>' + w + '</span>'; }).join('');
  fill('#marquee', line + line);

  /* ----------------------------------------------------------------- usps */
  fill('#uspStrip', D.usps.map(function (u) {
    return '<div class="usp"><div class="usp__icon">' + Apex.svg(u.icon) + '</div>' +
      '<div><b>' + Apex.esc(u.title) + '</b><span>' + Apex.esc(u.text) + '</span></div></div>';
  }).join(''));

  /* ----------------------------------------------------------- categories */
  fill('#catGrid', D.categories.map(function (c) {
    return '<a class="cat-card reveal" href="shop.html?category=' + c.slug + '">' +
      '<span class="cat-card__img"><img src="' + c.image + '" alt="' + Apex.esc(c.name) + '" loading="lazy"></span>' +
      '<b>' + Apex.esc(c.name) + '</b>' +
      '<span>' + c.count + ' products</span>' +
      '<span class="cat-card__go"></span></a>';
  }).join(''));

  Apex.initReveal(document.getElementById('catGrid'));

  /* ------------------------------------------------------- featured tabs */
  var tabs = [
    { key: 'new', label: 'New arrivals', fn: byNew },
    { key: 'best', label: 'Bestsellers', fn: bySales },
    { key: 'rating', label: 'Top rated', fn: byRating },
    { key: 'deals', label: 'Biggest savings', fn: byDiscount }
  ];
  var pool = D.products.slice();

  fill('#featuredTabs', tabs.map(function (t, i) {
    return '<button class="tabs__btn' + (i === 0 ? ' is-on' : '') + '" data-tab="' + t.key + '">' + t.label + '</button>';
  }).join(''));

  function renderFeatured(key) {
    var t = tabs.filter(function (x) { return x.key === key; })[0] || tabs[0];
    var list = pool.slice().sort(t.fn).slice(0, 8);
    fill('#featuredGrid', list.map(function (p) { return Apex.productCard(p); }).join(''));
    Apex.initReveal(document.getElementById('featuredGrid'));
  }
  renderFeatured('new');

  document.getElementById('featuredTabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-tab]');
    if (!b) return;
    document.querySelectorAll('#featuredTabs .tabs__btn').forEach(function (x) { x.classList.remove('is-on'); });
    b.classList.add('is-on');
    renderFeatured(b.getAttribute('data-tab'));
  });

  /* ----------------------------------------------------------------- deal */
  var dealP = pool.slice().sort(byDiscount)[0];
  var saved = dealP.mrp - dealP.price;

  fill('#dealBlock',
    '<div class="deal__copy">' +
      '<span class="eyebrow eyebrow--light">Deal of the day</span>' +
      '<h2>' + Apex.esc(dealP.name) + '</h2>' +
      '<p>' + Apex.esc(dealP.description) + ' Save ' + Apex.money(saved) + ' today only.</p>' +
      '<div class="deal__timer" id="dealTimer">' +
        '<div class="timer-box"><b data-t="h">00</b><span>Hours</span></div>' +
        '<div class="timer-box"><b data-t="m">00</b><span>Minutes</span></div>' +
        '<div class="timer-box"><b data-t="s">00</b><span>Seconds</span></div>' +
        '<div class="timer-box"><b>' + dealP.discount + '%</b><span>Off</span></div>' +
      '</div>' +
      '<div class="flex gap-12 wrap">' +
        '<a class="btn btn--light btn--lg" href="product.html?id=' + dealP.id + '">' + Apex.svg('bolt') + 'Grab this deal</a>' +
        '<a class="btn btn--glass btn--lg" href="shop.html?sort=discount">See all offers</a>' +
      '</div>' +
    '</div>' +
    '<div class="deal__art">' +
      '<img src="' + dealP.images[0] + '" alt="' + Apex.esc(dealP.name) + '">' +
      '<div class="deal__price"><b>' + Apex.money(dealP.price) + '</b>' +
        '<span>MRP ' + Apex.money(dealP.mrp) + ' \u00B7 save ' + dealP.discount + '%</span></div>' +
    '</div>');

  /* countdown to next midnight */
  function tick() {
    var now = new Date();
    var end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    var diff = Math.max(0, end - now);
    var h = Math.floor(diff / 3.6e6), m = Math.floor((diff % 3.6e6) / 6e4), s = Math.floor((diff % 6e4) / 1000);
    var box = document.getElementById('dealTimer');
    if (!box) return;
    var pad = function (n) { return String(n).padStart(2, '0'); };
    box.querySelector('[data-t="h"]').textContent = pad(h);
    box.querySelector('[data-t="m"]').textContent = pad(m);
    box.querySelector('[data-t="s"]').textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------------------------------------------------------- best rated */
  fill('#bestGrid', pool.slice().sort(byRating).slice(0, 4)
    .map(function (p) { return Apex.productCard(p); }).join(''));

  /* --------------------------------------------------------------- brands */
  var brands = D.brands.slice(0, 16);
  fill('#brandStrip', brands.map(function (b) {
    return '<a class="brand-tile" href="shop.html?brand=' + encodeURIComponent(b.name) + '">' + Apex.esc(b.name) + '</a>';
  }).join(''));

  /* --------------------------------------------------------------- reviews */
  var initials = ['KR', 'DM', 'AN', 'FS', 'RV', 'MK'];
  fill('#reviewGrid', D.testimonials.map(function (t, i) {
    return '<article class="review-card reveal">' +
      Apex.stars(t.rating, 'stars--lg') +
      '<p class="review-card__quote">\u201C' + Apex.esc(t.text) + '\u201D</p>' +
      '<div class="review-card__who">' +
        '<span class="avatar">' + (t.initials || initials[i % initials.length]) + '</span>' +
        '<span><b>' + Apex.esc(t.name) + '</b><span>' + Apex.esc(t.role) + '</span></span>' +
      '</div>' +
    '</article>';
  }).join(''));

  /* ------------------------------------------------------------ newsletter */
  var form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('nlEmail');
      var note = document.getElementById('nlNote');
      var v = (input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) {
        note.textContent = 'Please enter a valid email address.';
        note.style.color = '#fff3c4';
        input.focus();
        return;
      }
      note.textContent = 'You\u2019re in! Coupon APEX10 has been sent to ' + v + '.';
      note.style.color = '#ffffff';
      form.reset();
      Apex.toast('Subscribed', 'Welcome to the Apex club \u2014 coupon APEX10 is on its way', 'info');
    });
  }

  /* ------------------------------------------------------------ reveal all */
  Apex.initReveal();

  /* -------------------------------------------------------- recently viewed */
  Apex.recentRail('#recentMount');
});
