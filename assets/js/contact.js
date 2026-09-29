/* ==========================================================================
   APEX SPORTS — contact page
   ========================================================================== */
Apex.ready(function () {
  /* --------------------------------------------------------------- FAQ */
  var faqs = [
    ['How long does delivery take?',
      'Orders placed before 4 PM on a working day are dispatched the same day from Chennai. Metro cities receive in 2\u20134 working days, the rest of India in 4\u20137 working days. You get a tracking link by SMS and email the moment the parcel leaves our warehouse.'],
    ['Do you sell genuine, brand-authorised products?',
      'Yes. Every product is sourced directly from the brand or an authorised Indian distributor. You receive a GST invoice with your order, and manufacturer warranty applies wherever the brand offers one.'],
    ['What if the size does not fit?',
      'Raise an exchange within 7 days of delivery from the order confirmation email. We arrange a free reverse pickup in serviceable pin codes and ship the replacement size once the original passes a quick quality check.'],
    ['Which payment methods do you accept?',
      'UPI, all major credit and debit cards, net banking from 50+ banks, and cash on delivery up to \u20B915,000. EMI is available on select cards for orders above \u20B95,000.'],
    ['Do you offer team, club or academy pricing?',
      'We do. Orders of 10 units or more qualify for club pricing and consolidated GST invoicing. Email support@apexsports.in with your requirement list and we will send a quote within a working day.'],
    ['Can I visit the store before buying online?',
      'Absolutely. Our flagship store at Anna Salai, Chennai carries the full cricket, football and fitness range. Mention your online cart at the counter and we will match the online price.']
  ];

  document.getElementById('faq').innerHTML = faqs.map(function (f, i) {
    return '<div class="filter-group" style="padding:0;border-bottom:1px solid var(--line-soft)">' +
      '<h4 data-collapse style="padding:18px 22px;margin:0;font-size:.95rem;letter-spacing:0;text-transform:none;color:var(--ink);font-weight:700">' +
        Apex.esc(f[0]) +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>' +
      '</h4>' +
      '<div class="filter-group__body" style="padding:0 22px 20px"><p style="margin:0">' + Apex.esc(f[1]) + '</p></div>' +
    '</div>';
  }).join('');
  if (faqs.length) document.querySelector('#faq .filter-group').classList.remove('is-collapsed');

  /* ------------------------------------------------------- contact form */
  var form = document.getElementById('contactForm');
  var phone = document.getElementById('c-phone');
  phone.addEventListener('input', function () { phone.value = phone.value.replace(/\D/g, '').slice(0, 10); });

  function fail(el, bad) {
    var f = el.closest('.field');
    if (f) f.classList.toggle('has-error', !!bad);
    return !bad;
  }

  form.addEventListener('input', function (e) {
    var f = e.target.closest('.field');
    if (f) f.classList.remove('has-error');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('c-name');
    var email = document.getElementById('c-email');
    var topic = document.getElementById('c-topic');
    var msg = document.getElementById('c-message');

    var ok = true;
    ok = fail(name, name.value.trim().length < 2) && ok;
    ok = fail(email, !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email.value.trim())) && ok;
    ok = fail(topic, !topic.value) && ok;
    ok = fail(msg, msg.value.trim().length < 15) && ok;

    if (!ok) {
      Apex.toast('Almost there', 'Please fix the highlighted fields', 'error');
      var bad = form.querySelector('.field.has-error .input, .field.has-error .select, .field.has-error .textarea');
      if (bad) { bad.scrollIntoView({ behavior: 'smooth', block: 'center' }); bad.focus({ preventScroll: true }); }
      return;
    }

    var ticket = 'APX-SR-' + String(Math.floor(Math.random() * 90000) + 10000);
    form.innerHTML =
      '<div class="success" style="max-width:none">' +
        '<div class="success__icon">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' +
        '</div>' +
        '<h3>Message received, ' + Apex.esc(name.value.trim().split(' ')[0]) + '</h3>' +
        '<p class="lede" style="margin-inline:auto">Our team will reply to <b>' + Apex.esc(email.value.trim()) +
          '</b> within one working day. Keep this reference handy.</p>' +
        '<div class="success__meta" style="grid-template-columns:1fr">' +
          '<div><span>Ticket reference</span><b>' + ticket + '</b></div>' +
        '</div>' +
        '<a class="btn" href="shop.html">Continue shopping</a>' +
      '</div>';
    Apex.toast('Message sent', 'Ticket ' + ticket + ' created', 'default');
  });
});
