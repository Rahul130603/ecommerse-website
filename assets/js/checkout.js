/* ==========================================================================
   APEX SPORTS — checkout page
   ========================================================================== */
Apex.ready(function () {
  var D = Apex.data;
  var main = document.getElementById('checkoutMain');
  var form = document.getElementById('checkoutForm');

  /* ------------------------------------------------------------ guardrails */
  if (!Apex.cart.count()) {
    main.innerHTML =
      '<div class="empty">' +
      '<div class="empty__icon">' + Apex.svg('cart') + '</div>' +
      '<h3>There is nothing to check out</h3>' +
      '<p>Your cart is empty. Add a few items and come back \u2014 your details will be waiting.</p>' +
      '<a class="btn btn--lg" href="shop.html">Browse products</a></div>';
    return;
  }

  /* --------------------------------------------------------------- summary */
  function renderSummary() {
    var rows = Apex.cart.detailed();
    var t = Apex.totals(document.querySelector('input[name="payment"]:checked').value === 'cod');
    if (t.coupon && t.coupon.type === 'shipping') t.shipping = 0;

    document.getElementById('coItems').innerHTML = rows.map(function (r) {
      return '<div class="mini-row">' +
        '<a class="mini-row__media" href="product.html?id=' + r.product.id + '"><img src="' + r.product.images[0] + '" alt=""></a>' +
        '<div><div class="mini-row__name">' + Apex.esc(r.product.name) + '</div>' +
        '<div class="mini-row__opt">' + [r.item.size, r.item.color, 'Qty ' + r.item.qty].filter(Boolean).join(' \u00B7 ') + '</div></div>' +
        '<div class="mini-row__right"><div class="mini-row__price">' + Apex.money(r.line) + '</div></div>' +
      '</div>';
    }).join('');

    var codFee = document.querySelector('input[name="payment"]:checked').value === 'cod' ? 49 : 0;
    var total = t.total + codFee;

    document.getElementById('coTotals').innerHTML =
      '<div class="summary-row"><span>Subtotal (' + Apex.cart.count() + ' items)</span><b>' + Apex.money(t.subtotal) + '</b></div>' +
      (t.discount ? '<div class="summary-row summary-row--save"><span>Coupon ' + t.coupon.code + '</span><b>-' + Apex.money(t.discount) + '</b></div>' : '') +
      '<div class="summary-row"><span>Shipping</span><b>' + (t.shipping ? Apex.money(t.shipping) : 'FREE') + '</b></div>' +
      (codFee ? '<div class="summary-row"><span>Cash on delivery fee</span><b>' + Apex.money(codFee) + '</b></div>' : '') +
      '<div class="summary-row"><span>GST (18% included)</span><b>' + Apex.money(t.tax) + '</b></div>' +
      '<div class="summary-row summary-row--total"><span>Total payable</span><b>' + Apex.money(total) + '</b></div>' +
      (t.savings ? '<div class="summary-row summary-row--save"><span>You save</span><b>' + Apex.money(t.savings) + '</b></div>' : '') +
      '<p class="small muted mt-8">Free express shipping on orders above ' + Apex.money(D.brand.freeShipOver) + '.</p>';
    return total;
  }
  renderSummary();

  /* ----------------------------------------------------------- pay methods */
  document.querySelectorAll('.pay-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
      document.querySelectorAll('.pay-option').forEach(function (o) { o.classList.remove('is-on'); });
      opt.classList.add('is-on');
      var v = opt.getAttribute('data-pay');
      opt.querySelector('input').checked = true;
      document.querySelectorAll('.pay-fields').forEach(function (f) {
        f.classList.toggle('hidden', f.getAttribute('data-for') !== v);
      });
      renderSummary();
    });
  });

  /* -------------------------------------------------------- input niceties */
  var phone = document.getElementById('f-phone');
  var pin = document.getElementById('f-pincode');
  var card = document.getElementById('f-card');
  var exp = document.getElementById('f-exp');

  phone.addEventListener('input', function () { phone.value = phone.value.replace(/\D/g, '').slice(0, 10); });
  pin.addEventListener('input', function () { pin.value = pin.value.replace(/\D/g, '').slice(0, 6); });
  card.addEventListener('input', function () {
    var v = card.value.replace(/\D/g, '').slice(0, 16);
    card.value = v.replace(/(.{4})/g, '$1 ').trim();
  });
  exp.addEventListener('input', function () {
    var v = exp.value.replace(/\D/g, '').slice(0, 4);
    exp.value = v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v;
  });

  /* ---------------------------------------------------------- validation */
  function fail(input, bad) {
    var field = input.closest('.field');
    if (field) field.classList.toggle('has-error', !!bad);
    return !bad;
  }

  function validate() {
    var ok = true;
    var name = document.getElementById('f-name');
    var email = document.getElementById('f-email');
    var address = document.getElementById('f-address');
    var city = document.getElementById('f-city');
    var state = document.getElementById('f-state');
    var terms = document.getElementById('f-terms');
    var method = document.querySelector('input[name="payment"]:checked').value;

    ok = fail(name, name.value.trim().length < 3) && ok;
    ok = fail(phone, !/^[6-9]\d{9}$/.test(phone.value.trim())) && ok;
    ok = fail(email, !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.value.trim())) && ok;
    ok = fail(address, address.value.trim().length < 6) && ok;
    ok = fail(city, city.value.trim().length < 2) && ok;
    ok = fail(state, !state.value) && ok;
    ok = fail(pin, !/^\d{6}$/.test(pin.value.trim())) && ok;

    if (method === 'upi') {
      var upi = document.getElementById('f-upi');
      ok = fail(upi, !/^[\w.\-]{2,}@[a-z]{2,}$/i.test(upi.value.trim())) && ok;
    } else if (method === 'card') {
      var cvv = document.getElementById('f-cvv');
      ok = fail(card, card.value.replace(/\s/g, '').length !== 16) && ok;
      ok = fail(exp, !/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp.value.trim())) && ok;
      ok = fail(cvv, !/^\d{3,4}$/.test(cvv.value.trim())) && ok;
    } else if (method === 'netbanking') {
      var bank = document.getElementById('f-bank');
      ok = fail(bank, !bank.value) && ok;
    }

    var te = document.getElementById('termsError');
    te.style.display = terms.checked ? 'none' : 'block';
    if (!terms.checked) ok = false;

    if (!ok) {
      var firstBad = document.querySelector('.field.has-error .input, .field.has-error .select');
      if (firstBad) {
        firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstBad.focus({ preventScroll: true });
      }
      Apex.toast('Check the highlighted fields', 'A few details are missing or invalid', 'error');
    }
    return ok;
  }

  form.addEventListener('input', function (e) {
    var f = e.target.closest('.field');
    if (f && f.classList.contains('has-error')) f.classList.remove('has-error');
  });

  /* ----------------------------------------------------------- place order */
  var placing = false;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (placing) return;
    if (!validate()) return;

    placing = true;
    var btn = document.getElementById('placeOrder');
    var label = btn.innerHTML;
    btn.classList.add('is-disabled');
    btn.innerHTML = 'Processing payment\u2026';

    var method = document.querySelector('input[name="payment"]:checked').value;
    var total = renderSummary();
    var couponCode = Apex.coupon.code || null;
    var order = {
      id: 'APX' + String(Date.now()).slice(-8),
      placedAt: new Date().toISOString(),
      method: method,
      total: total,
      items: Apex.cart.detailed().map(function (r) {
        return { id: r.product.id, name: r.product.name, qty: r.item.qty, size: r.item.size, color: r.item.color, price: r.product.price };
      }),
      customer: {
        name: document.getElementById('f-name').value.trim(),
        email: document.getElementById('f-email').value.trim(),
        phone: phone.value.trim(),
        address: document.getElementById('f-address').value.trim(),
        area: document.getElementById('f-area').value.trim(),
        city: document.getElementById('f-city').value.trim(),
        state: document.getElementById('f-state').value,
        pincode: pin.value.trim()
      }
    };

    setTimeout(function () {
      // When the API server is running the order is stored in the shared
      // database so the admin panel sees it. With no server we keep the
      // browser-local copy, so checkout still works offline.
      var post = fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: order.items.map(function (it) {
            return { productId: it.id, qty: it.qty, size: it.size, color: it.color, price: it.price };
          }),
          customer: order.customer,
          paymentMethod: order.method,
          coupon: couponCode
        })
      }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });

      Promise.resolve(post).then(function (res) {
        if (res && res.orderId) { order.id = res.orderId; order.total = res.total; }
        var orders = Apex.store.get('orders', []);
        orders.unshift(order);
        Apex.store.set('orders', orders.slice(0, 20));
        Apex.coupon.clear();
        Apex.cart.clear();
        showSuccess(order, label);
      });
    }, 1200);
  });

  function showSuccess(order, label) {
    var eta = new Date(Date.now() + 4 * 864e5).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    var methodLabel = { upi: 'UPI', card: 'Card', netbanking: 'Net banking', cod: 'Cash on delivery' }[order.method] || order.method;

    main.innerHTML =
      '<section class="section" style="padding-top:20px"><div class="success">' +
        '<div class="success__icon">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' +
        '</div>' +
        '<span class="eyebrow eyebrow--center">Order confirmed</span>' +
        '<h1>Thank you, ' + Apex.esc(order.customer.name.split(' ')[0]) + '!</h1>' +
        '<p class="lede" style="margin-inline:auto">Your order is confirmed and our Chennai warehouse is packing it now. ' +
          'A confirmation email is on its way to <b>' + Apex.esc(order.customer.email) + '</b>.</p>' +

        '<div class="success__meta">' +
          '<div><span>Order number</span><b>' + order.id + '</b></div>' +
          '<div><span>Payment method</span><b>' + methodLabel + ' \u00B7 ' + Apex.money(order.total) + '</b></div>' +
          '<div><span>Delivering to</span><b>' + Apex.esc(order.customer.city) + ', ' + Apex.esc(order.customer.state) + ' \u2014 ' + Apex.esc(order.customer.pincode) + '</b></div>' +
          '<div><span>Estimated delivery</span><b>' + eta + '</b></div>' +
        '</div>' +

        '<div class="panel mb-24" style="text-align:left">' +
          '<div class="panel__head"><h3>Order items (' + order.items.length + ')</h3></div>' +
          '<div class="panel__body">' +
            order.items.map(function (it) {
              var p = Apex.byId(it.id) || {};
              return '<div class="mini-row">' +
                '<span class="mini-row__media">' + (p.images ? '<img src="' + p.images[0] + '" alt="">' : '') + '</span>' +
                '<div><div class="mini-row__name">' + Apex.esc(it.name) + '</div>' +
                '<div class="mini-row__opt">' + [it.size, it.color, 'Qty ' + it.qty].filter(Boolean).join(' \u00B7 ') + '</div></div>' +
                '<div class="mini-row__right"><div class="mini-row__price">' + Apex.money(it.price * it.qty) + '</div></div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>' +

        '<div class="flex gap-12 wrap" style="justify-content:center">' +
          '<a class="btn btn--lg" href="shop.html">Continue shopping</a>' +
          '<a class="btn btn--outline btn--lg" href="contact.html">Contact support</a>' +
        '</div>' +

        '<p class="small muted mt-32">Need to change something? Call ' + D.brand.phone +
          ' or email ' + D.brand.email + ' within 2 hours of ordering and we will update it before dispatch.</p>' +
      '</div></section>';

    window.scrollTo({ top: 0, behavior: 'smooth' });
    Apex.toast('Order placed', 'Order ' + order.id + ' confirmed \u2014 thank you!', 'default');
  }
});
