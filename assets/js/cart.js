/* ==========================================================================
   APEX SPORTS — cart page
   ========================================================================== */
Apex.ready(function () {
  var D = Apex.data;

  function rowHTML(r) {
    var p = r.product, it = r.item;
    return '<div class="cart-row">' +
      '<a class="cart-row__media" href="product.html?id=' + p.id + '">' +
        '<img src="' + p.images[0] + '" alt="' + Apex.esc(p.name) + '" loading="lazy"></a>' +
      '<div>' +
        '<span class="cart-row__brand">' + Apex.esc(p.brand) + ' \u00B7 ' + Apex.esc(p.category) + '</span>' +
        '<a href="product.html?id=' + p.id + '"><h3 class="cart-row__name">' + Apex.esc(p.name) + '</h3></a>' +
        '<div class="cart-row__opts">' +
          (it.size ? '<span class="cart-row__opt">Size: ' + Apex.esc(it.size) + '</span>' : '') +
          (it.color ? '<span class="cart-row__opt">Colour: ' + Apex.esc(it.color) + '</span>' : '') +
          '<span class="cart-row__opt">' + (p.stock > 6 ? 'In stock' : 'Only ' + p.stock + ' left') + '</span>' +
        '</div>' +
        '<div class="cart-row__tools">' +
          '<div class="qty">' +
            '<button type="button" data-qty="' + r.key + '" data-step="-1" aria-label="Decrease quantity">' + Apex.svg('minus') + '</button>' +
            '<input value="' + it.qty + '" data-qtyinput="' + r.key + '" inputmode="numeric" aria-label="Quantity">' +
            '<button type="button" data-qty="' + r.key + '" data-step="1" aria-label="Increase quantity">' + Apex.svg('plus') + '</button>' +
          '</div>' +
          '<button type="button" class="cart-row__link" data-remove="' + r.key + '">' + Apex.svg('trash') + 'Remove</button>' +
          '<button type="button" class="cart-row__link" data-wish="' + p.id + '">' + Apex.svg('heart') + 'Save for later</button>' +
        '</div>' +
      '</div>' +
      '<div class="cart-row__right">' +
        '<span class="price">' + Apex.money(r.line) + '</span>' +
        '<span class="price--strike">' + Apex.money(p.mrp * it.qty) + '</span>' +
        '<span class="price--off">You save ' + Apex.money((p.mrp - p.price) * it.qty) + '</span>' +
      '</div>' +
    '</div>';
  }

  function couponHTML(t) {
    var active = Apex.coupon.active();
    if (active) {
      return '<div class="coupon-applied">' + Apex.svg('checkC') +
        '<span>Coupon <b>' + active.code + '</b> applied \u2014 ' + Apex.esc(active.label) + '</span>' +
        '<button type="button" id="removeCoupon" aria-label="Remove coupon">' + Apex.svg('close') + '</button></div>';
    }
    return '<div class="coupon">' +
        '<input class="input" id="couponInput" placeholder="Coupon code" aria-label="Coupon code">' +
        '<button class="btn btn--dark" id="applyCoupon" type="button">Apply</button>' +
      '</div>' +
      '<div class="coupon-list">' +
        D.coupons.map(function (c) {
          return '<button type="button" class="coupon-pill" data-coupon="' + c.code + '">' +
            '<b>' + c.code + '</b><span>' + Apex.esc(c.label) + '</span>' + Apex.svg('tag') + '</button>';
        }).join('') +
      '</div>';
  }

  function summaryHTML(t) {
    return '<div class="summary-row"><span>Subtotal (' + Apex.cart.count() + ' items)</span><b>' + Apex.money(t.subtotal) + '</b></div>' +
      (t.discount ? '<div class="summary-row summary-row--save"><span>Coupon discount</span><b>-' + Apex.money(t.discount) + '</b></div>' : '') +
      '<div class="summary-row"><span>Shipping</span><b>' + (t.shipping ? Apex.money(t.shipping) : 'FREE') + '</b></div>' +
      '<div class="summary-row"><span>GST (18% included)</span><b>' + Apex.money(t.tax) + '</b></div>' +
      '<div class="summary-row summary-row--total"><span>Total payable</span><b>' + Apex.money(t.total) + '</b></div>' +
      (t.savings > 0 ? '<div class="summary-row summary-row--save"><span>Total savings</span><b>' + Apex.money(t.savings) + '</b></div>' : '');
  }

  function render() {
    var rows = Apex.cart.detailed();
    var t = Apex.totals();
    var body = document.getElementById('cartBody');

    if (!rows.length) {
      body.innerHTML =
        '<div class="empty">' +
        '<div class="empty__icon">' + Apex.svg('cart') + '</div>' +
        '<h3>Your cart is empty</h3>' +
        '<p>Nothing here yet. Add a bat, a pair of boots or a racket and it will show up right here.</p>' +
        '<a class="btn btn--lg" href="shop.html">Start shopping</a></div>';
      document.getElementById('cartPanelTitle').textContent = 'Your items';
      document.getElementById('cartSub').textContent = 'Your cart is empty \u2014 browse the catalogue to get started.';
      document.getElementById('couponZone').innerHTML = '';
      document.getElementById('summaryRows').innerHTML =
        '<div class="summary-row"><span>Subtotal</span><b>' + Apex.money(0) + '</b></div>' +
        '<div class="summary-row summary-row--total"><span>Total payable</span><b>' + Apex.money(0) + '</b></div>';
      document.getElementById('toCheckout').classList.add('is-disabled');
      document.getElementById('emptyCart').style.display = 'none';
      document.getElementById('shipMsg').textContent = 'Add items to your cart to unlock free shipping';
      document.getElementById('shipBar').style.width = '0%';
    } else {
      body.innerHTML = rows.map(rowHTML).join('');
      document.getElementById('cartPanelTitle').textContent = 'Your items (' + Apex.cart.count() + ')';
      document.getElementById('cartSub').textContent = 'Review your gear before checkout \u2014 ' + rows.length +
        (rows.length === 1 ? ' product' : ' products') + ' in the cart. Prices include GST.';
      document.getElementById('couponZone').innerHTML = couponHTML(t);
      document.getElementById('summaryRows').innerHTML = summaryHTML(t);
      document.getElementById('toCheckout').classList.remove('is-disabled');
      document.getElementById('emptyCart').style.display = '';
      wireCoupon();

      var gap = t.freeShipGap;
      document.getElementById('shipMsg').innerHTML = gap > 0
        ? 'Add <b style="color:var(--brand)">' + Apex.money(gap) + '</b> more to unlock <b>free express shipping</b>'
        : '<b style="color:var(--green)">Free express shipping unlocked</b> \u2014 your order ships today';
      document.getElementById('shipBar').style.width =
        Math.min(100, Math.round((t.subtotal / D.brand.freeShipOver) * 100)) + '%';
    }
    Apex.emit('cart:rendered');
  }

  function wireCoupon() {
    var apply = document.getElementById('applyCoupon');
    var input = document.getElementById('couponInput');
    if (apply) {
      apply.addEventListener('click', function () {
        var res = Apex.coupon.apply(input.value);
        if (res.ok) Apex.toast('Coupon applied', res.coupon.code + ' \u2014 ' + res.coupon.label, 'cart');
        else Apex.toast('Coupon not applied', res.msg, 'error');
        render();
      });
    }
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); apply.click(); }
      });
    }
    document.querySelectorAll('[data-coupon]').forEach(function (b) {
      b.addEventListener('click', function () {
        var code = b.getAttribute('data-coupon');
        var res = Apex.coupon.apply(code);
        if (res.ok) Apex.toast('Coupon applied', code + ' \u2014 ' + res.coupon.label, 'cart');
        else Apex.toast('Coupon not applied', res.msg, 'error');
        render();
      });
    });
    var rm = document.getElementById('removeCoupon');
    if (rm) rm.addEventListener('click', function () {
      Apex.coupon.clear();
      Apex.toast('Coupon removed', 'Discount no longer applied', 'info');
      render();
    });
  }

  var ec = document.getElementById('emptyCart');
  if (ec) ec.addEventListener('click', function () {
    if (!Apex.cart.count()) return;
    if (confirm('Remove all items from your cart?')) {
      Apex.cart.clear();
      Apex.toast('Cart emptied', 'All items have been removed', 'info');
    }
  });

  Apex.on('cart', render);
  render();

  /* ------------------------------------------------------ recommendations */
  function renderAlso() {
    var inCart = Apex.cart.items.map(function (i) { return i.id; });
    var cats = {};
    Apex.cart.detailed().forEach(function (r) { cats[r.product.category] = 1; });
    var pool = D.products.filter(function (p) {
      return inCart.indexOf(p.id) === -1 && (cats[p.category] || p.rating >= 4.5);
    });
    pool.sort(function (a, b) { return b.rating - a.rating || b.reviewCount - a.reviewCount; });
    var picks = pool.slice(0, 4);
    if (!picks.length) return;
    document.getElementById('alsoSection').hidden = false;
    document.getElementById('alsoGrid').innerHTML = picks.map(function (p) { return Apex.productCard(p); }).join('');
    Apex.initReveal(document.getElementById('alsoGrid'));
  }
  renderAlso();
  Apex.on('cart:rendered', renderAlso);
});
