/* ==========================================================================
   APEX SPORTS — wishlist page
   ========================================================================== */
Apex.ready(function () {
  function render() {
    var items = Apex.wishlist.items();
    var grid = document.getElementById('wishGrid');
    var actions = document.getElementById('wishActions');
    var empty = document.getElementById('wishEmpty');

    if (!items.length) {
      grid.innerHTML = '';
      actions.hidden = true;
      empty.innerHTML =
        '<div class="empty">' +
        '<div class="empty__icon">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.7-9.3-9A5.3 5.3 0 0 1 12 6.4a5.3 5.3 0 0 1 9.3 5.1c-1.8 4.3-9.3 9-9.3 9z"/></svg>' +
        '</div>' +
        '<h3>Your wishlist is empty</h3>' +
        '<p>Tap the heart icon on any product to save it here for later.</p>' +
        '<a class="btn btn--lg" href="shop.html">Find something you love</a></div>';
      document.getElementById('wishSub').textContent = 'Nothing saved yet \u2014 your shortlist will appear here.';
      return;
    }

    empty.innerHTML = '';
    actions.hidden = false;
    document.getElementById('wishCountText').innerHTML = '<b>' + items.length + '</b> saved ' + (items.length === 1 ? 'product' : 'products');
    document.getElementById('wishSub').textContent = 'Saved items stay on this device until you remove them.';
    grid.innerHTML = items.map(function (p) { return Apex.productCard(p); }).join('');
    Apex.initReveal(grid);
  }

  document.getElementById('moveAll').addEventListener('click', function () {
    var items = Apex.wishlist.items();
    if (!items.length) return;
    items.forEach(function (p) { Apex.cart.add(p.id, 1); });
    Apex.toast('Moved to cart', items.length + ' items added to your cart', 'cart');
    Apex.openDrawer('#cartDrawer');
  });

  document.getElementById('clearWish').addEventListener('click', function () {
    if (!Apex.wishlist.ids.length) return;
    if (!confirm('Remove every item from your wishlist?')) return;
    Apex.wishlist.ids = [];
    Apex.wishlist.save();
    Apex.toast('Wishlist cleared', '', 'info');
    render();
  });

  Apex.on('wish', render);
  render();
});
