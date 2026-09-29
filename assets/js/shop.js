/* ==========================================================================
   APEX SPORTS — shop / catalogue page
   Filters, sorting, pagination and deep links (?category=…&brand=…&q=…)
   ========================================================================== */
Apex.ready(function () {
  var D = Apex.data;
  var PER_PAGE = 12;

  var list = D.products.slice();
  var priceMin = D.priceRange.min;
  var priceMax = D.priceRange.max;

  /* ------------------------------------------------------------- state */
  var S = {
    category: [],
    brand: [],
    q: '',
    sort: 'featured',
    min: priceMin,
    max: priceMax,
    rating: 0,
    avail: false,
    off: false,
    page: 1,
    view: 'grid'
  };

  (function readURL() {
    var p = Apex.param;
    S.category = (p('category') || '').split(',').filter(Boolean);
    S.brand = (p('brand') || '').split(',').filter(Boolean).map(decodeURIComponent);
    S.q = p('q') || '';
    S.sort = p('sort') || 'featured';
    S.min = Number(p('min')) || priceMin;
    S.max = Number(p('max')) || priceMax;
    S.rating = Number(p('rating')) || 0;
    S.avail = p('avail') === '1';
    S.off = p('off') === '1';
    S.page = Number(p('page')) || 1;
  })();

  function writeURL() {
    var q = [];
    if (S.category.length) q.push('category=' + S.category.join(','));
    if (S.brand.length) q.push('brand=' + S.brand.map(encodeURIComponent).join(','));
    if (S.q) q.push('q=' + encodeURIComponent(S.q));
    if (S.sort !== 'featured') q.push('sort=' + S.sort);
    if (S.min > priceMin) q.push('min=' + S.min);
    if (S.max < priceMax) q.push('max=' + S.max);
    if (S.rating) q.push('rating=' + S.rating);
    if (S.avail) q.push('avail=1');
    if (S.off) q.push('off=1');
    if (S.page > 1) q.push('page=' + S.page);
    try { history.replaceState(null, '', location.pathname + (q.length ? '?' + q.join('&') : '')); } catch (e) {}
  }

  /* ------------------------------------------------------------ matching */
  function score(p) {
    var s = p.rating * 4 + Math.min(p.reviewCount, 400) / 100;
    if (p.badge === 'Bestseller') s += 4;
    if (p.badge === 'New') s += 2;
    return s;
  }

  function filtered() {
    var q = S.q.trim().toLowerCase();
    var out = list.filter(function (p) {
      if (S.category.length && S.category.indexOf(p.categorySlug) === -1) return false;
      if (S.brand.length && S.brand.indexOf(p.brand) === -1) return false;
      if (p.price < S.min || p.price > S.max) return false;
      if (S.rating && p.rating < S.rating) return false;
      if (S.avail && p.stock <= 0) return false;
      if (S.off && p.discount < 25) return false;
      if (q) {
        var hay = (p.name + ' ' + p.brand + ' ' + p.category + ' ' + p.description).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    var sorters = {
      'price-asc': function (a, b) { return a.price - b.price; },
      'price-desc': function (a, b) { return b.price - a.price; },
      'rating': function (a, b) { return b.rating - a.rating || b.reviewCount - a.reviewCount; },
      'discount': function (a, b) { return b.discount - a.discount; },
      'name': function (a, b) { return a.name.localeCompare(b.name); },
      'featured': function (a, b) { return score(b) - score(a); }
    };
    return out.sort(sorters[S.sort] || sorters.featured);
  }

  /* -------------------------------------------------------------- filters */
  function catCount(slug) { return list.filter(function (p) { return p.categorySlug === slug; }).length; }
  function brandCount(name) { return list.filter(function (p) { return p.brand === name; }).length; }

  function renderFilters() {
    var html = '';

    html += '<div class="filter-group"><h4 data-collapse>Category' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></h4>' +
      '<div class="filter-group__body">' +
      D.categories.map(function (c) {
        return '<label class="check"><input type="checkbox" data-f="category" value="' + c.slug + '"' +
          (S.category.indexOf(c.slug) > -1 ? ' checked' : '') + '>' +
          '<span class="check__text">' + Apex.esc(c.name) + ' <span class="check__count">(' + catCount(c.slug) + ')</span></span></label>';
      }).join('') + '</div></div>';

    var brands = D.brands.slice(0, 18);
    html += '<div class="filter-group"><h4 data-collapse>Brand' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg></h4>' +
      '<div class="filter-group__body" style="max-height:230px;overflow-y:auto;padding-right:4px">' +
      brands.map(function (b) {
        return '<label class="check"><input type="checkbox" data-f="brand" value="' + Apex.esc(b.name) + '"' +
          (S.brand.indexOf(b.name) > -1 ? ' checked' : '') + '>' +
          '<span class="check__text">' + Apex.esc(b.name) + ' <span class="check__count">(' + b.count + ')</span></span></label>';
      }).join('') + '</div></div>';

    html += '<div class="filter-group"><h4>Price range</h4><div class="filter-group__body">' +
      '<div class="range">' +
        '<div class="range__track"><div class="range__fill" id="rangeFill"></div>' +
          '<input type="range" id="rangeMin" min="' + priceMin + '" max="' + priceMax + '" step="100" value="' + S.min + '" aria-label="Minimum price">' +
          '<input type="range" id="rangeMax" min="' + priceMin + '" max="' + priceMax + '" step="100" value="' + S.max + '" aria-label="Maximum price">' +
        '</div>' +
        '<div class="range__values"><span id="rangeMinLabel">' + Apex.money(S.min) + '</span>' +
          '<span id="rangeMaxLabel">' + Apex.money(S.max) + '</span></div>' +
      '</div></div></div>';

    html += '<div class="filter-group"><h4>Customer rating</h4><div class="filter-group__body">' +
      [[0, 'All ratings'], [4, '4\u2605 &amp; above'], [3, '3\u2605 &amp; above']].map(function (r) {
        return '<label class="check"><input type="radio" name="rating" data-f="rating" value="' + r[0] + '"' +
          (S.rating === r[0] ? ' checked' : '') + '><span class="check__text">' + r[1] + '</span></label>';
      }).join('') + '</div></div>';

    html += '<div class="filter-group"><h4>More filters</h4><div class="filter-group__body">' +
      '<label class="check"><input type="checkbox" data-f="avail"' + (S.avail ? ' checked' : '') +
        '><span class="check__text">In stock only</span></label>' +
      '<label class="check"><input type="checkbox" data-f="off"' + (S.off ? ' checked' : '') +
        '><span class="check__text">25% off or more</span></label>' +
      '</div></div>';

    document.getElementById('filtersBody').innerHTML = html;
    paintRange();
    wireFilters();
  }

  function paintRange() {
    var fill = document.getElementById('rangeFill');
    if (!fill) return;
    var span = priceMax - priceMin || 1;
    var a = ((S.min - priceMin) / span) * 100;
    var b = ((S.max - priceMin) / span) * 100;
    fill.style.left = a + '%';
    fill.style.width = Math.max(0, b - a) + '%';
    document.getElementById('rangeMinLabel').textContent = Apex.money(S.min);
    document.getElementById('rangeMaxLabel').textContent = Apex.money(S.max);
  }

  function wireFilters() {
    var body = document.getElementById('filtersBody');
    body.addEventListener('change', function (e) {
      var f = e.target.getAttribute && e.target.getAttribute('data-f');
      if (!f) return;
      var v = e.target.value;
      if (f === 'category' || f === 'brand') {
        var arr = f === 'category' ? S.category : S.brand;
        var i = arr.indexOf(v);
        if (e.target.checked && i === -1) arr.push(v);
        if (!e.target.checked && i > -1) arr.splice(i, 1);
      } else if (f === 'rating') {
        S.rating = Number(v);
      } else if (f === 'avail') {
        S.avail = e.target.checked;
      } else if (f === 'off') {
        S.off = e.target.checked;
      }
      S.page = 1;
      apply();
    });

    var rMin = document.getElementById('rangeMin');
    var rMax = document.getElementById('rangeMax');
    function onRange() {
      var a = Number(rMin.value), b = Number(rMax.value);
      if (a > b) { var t = a; a = b; b = t; rMin.value = a; rMax.value = b; }
      S.min = a; S.max = b; S.page = 1;
      paintRange();
      clearTimeout(onRange.t);
      onRange.t = setTimeout(apply, 220);
    }
    rMin.addEventListener('input', onRange);
    rMax.addEventListener('input', onRange);
  }

  /* ---------------------------------------------------------------- chips */
  function renderChips() {
    var out = [];
    if (S.q) out.push(['q', 'Search: \u201C' + S.q + '\u201D']);
    S.category.forEach(function (c) {
      var cat = D.categories.filter(function (x) { return x.slug === c; })[0];
      out.push(['category:' + c, cat ? cat.name : c]);
    });
    S.brand.forEach(function (b) { out.push(['brand:' + b, b]); });
    if (S.min > priceMin || S.max < priceMax) out.push(['price', Apex.money(S.min) + ' \u2013 ' + Apex.money(S.max)]);
    if (S.rating) out.push(['rating', S.rating + '\u2605 & up']);
    if (S.avail) out.push(['avail', 'In stock']);
    if (S.off) out.push(['off', '25%+ off']);

    var box = document.getElementById('activeChips');
    if (!out.length) { box.innerHTML = ''; return; }
    box.innerHTML = out.map(function (c) {
      return '<span class="chip">' + c[1] + '<button type="button" data-chip="' + c[0] + '" aria-label="Remove filter">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button></span>';
    }).join('') + '<button type="button" class="chip chip--clear" data-chip="all">Clear all</button>';

    box.querySelectorAll('[data-chip]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-chip');
        if (k === 'all') { reset(); }
        else if (k === 'q') { S.q = ''; }
        else if (k === 'price') { S.min = priceMin; S.max = priceMax; }
        else if (k === 'rating') { S.rating = 0; }
        else if (k === 'avail') { S.avail = false; }
        else if (k === 'off') { S.off = false; }
        else if (k.indexOf('category:') === 0) { S.category = S.category.filter(function (x) { return x !== k.split(':')[1]; }); }
        else if (k.indexOf('brand:') === 0) { S.brand = S.brand.filter(function (x) { return x !== k.split(':')[1]; }); }
        S.page = 1;
        renderFilters();
        apply();
      });
    });
  }

  function reset() {
    S.category = []; S.brand = []; S.q = ''; S.min = priceMin; S.max = priceMax;
    S.rating = 0; S.avail = false; S.off = false; S.page = 1;
    var si = document.getElementById('searchInput'); if (si) si.value = '';
    renderFilters();
    apply();
  }

  /* ------------------------------------------------------------ rendering */
  function heading() {
    var t = 'Shop all products', sub = '50+ hand-picked products from 30 brands. Authentic stock, GST invoice, free express shipping above ' + Apex.money(D.brand.freeShipOver) + '.';
    if (S.category.length === 1) {
      var c = D.categories.filter(function (x) { return x.slug === S.category[0]; })[0];
      if (c) { t = c.name + ' Gear'; sub = c.tagline + ' \u2014 ' + c.count + ' products, all authentic and ready to dispatch.'; }
    } else if (S.q) {
      t = 'Results for \u201C' + S.q + '\u201D';
      sub = 'Showing products matching your search across every category.';
    } else if (S.brand.length === 1) {
      t = S.brand[0] + ' Collection';
      sub = 'Every ' + S.brand[0] + ' product we stock, in one place.';
    }
    document.getElementById('pageTitle').textContent = t;
    document.getElementById('crumbNow').textContent = t;
    document.getElementById('pageSub').textContent = sub;
    document.title = t + ' \u2014 Apex Sports';
  }

  function renderGrid(rows) {
    var grid = document.getElementById('shopGrid');
    grid.className = 'product-grid' + (S.view === 'list' ? ' is-list' : '');
    grid.innerHTML = rows.map(function (p) { return Apex.productCard(p); }).join('');
    Apex.initReveal(grid);
  }

  function renderEmpty() {
    document.getElementById('shopEmpty').innerHTML =
      '<div class="empty"><div class="empty__icon">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></div>' +
      '<h3>No products match those filters</h3>' +
      '<p>Try widening the price range, clearing a brand, or searching for something broader like \u201Cracket\u201D.</p>' +
      '<button class="btn" id="emptyReset" type="button">Clear all filters</button></div>';
    var b = document.getElementById('emptyReset');
    if (b) b.addEventListener('click', reset);
  }

  function renderPager(total, pages) {
    var el = document.getElementById('pagination');
    if (pages <= 1) { el.innerHTML = ''; return; }
    var html = '<button type="button" data-page="' + (S.page - 1) + '"' + (S.page === 1 ? ' disabled' : '') + ' aria-label="Previous page">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>';

    var nums = [];
    for (var i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= S.page - 1 && i <= S.page + 1)) nums.push(i);
      else if (nums[nums.length - 1] !== '...') nums.push('...');
    }
    nums.forEach(function (n) {
      if (n === '...') { html += '<span class="is-dots">\u2026</span>'; return; }
      html += '<button type="button" data-page="' + n + '" class="' + (n === S.page ? 'is-on' : '') + '">' + n + '</button>';
    });

    html += '<button type="button" data-page="' + (S.page + 1) + '"' + (S.page === pages ? ' disabled' : '') + ' aria-label="Next page">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button>';
    el.innerHTML = html;

    el.querySelectorAll('[data-page]').forEach(function (b) {
      b.addEventListener('click', function () {
        var n = Number(b.getAttribute('data-page'));
        if (n < 1 || n > pages) return;
        S.page = n;
        apply();
        window.scrollTo({ top: document.querySelector('.toolbar').getBoundingClientRect().top + window.scrollY - 180, behavior: 'smooth' });
      });
    });
  }

  /* ---------------------------------------------------------------- apply */
  function apply() {
    var rows = filtered();
    var pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
    if (S.page > pages) S.page = pages;
    var start = (S.page - 1) * PER_PAGE;
    var slice = rows.slice(start, start + PER_PAGE);

    document.getElementById('resultCount').innerHTML =
      rows.length
        ? 'Showing <b>' + (start + 1) + '\u2013' + (start + slice.length) + '</b> of <b>' + rows.length + '</b> products'
        : 'No products found';

    if (slice.length) {
      renderGrid(slice);
      document.getElementById('shopEmpty').innerHTML = '';
    } else {
      renderGrid([]);
      renderEmpty();
    }
    renderPager(rows.length, pages);
    renderChips();
    heading();
    writeURL();
  }

  /* --------------------------------------------------------------- events */
  document.getElementById('sortBy').value = S.sort;
  document.getElementById('sortBy').addEventListener('change', function () {
    S.sort = this.value; S.page = 1; apply();
  });

  document.getElementById('clearFilters').addEventListener('click', reset);

  document.getElementById('filterToggle').addEventListener('click', function () {
    document.getElementById('filters').classList.toggle('is-open');
    document.getElementById('scrim').classList.toggle('is-open');
    document.body.classList.toggle('no-scroll');
  });

  document.querySelectorAll('[data-view]').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('[data-view]').forEach(function (x) { x.classList.remove('is-on'); });
      b.classList.add('is-on');
      S.view = b.getAttribute('data-view');
      apply();
    });
  });

  // keep grid in sync when the header search box is used on this page
  Apex.on('cart', function () {});

  renderFilters();
  apply();
  Apex.recentRail('#recentMount');
});
