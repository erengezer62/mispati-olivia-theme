/* Mispati — Kombini tamamla: çapraz ürün önerisi (bağımlılıksız) */
(function () {
  'use strict';
  if (window.__mpkInit) return;
  window.__mpkInit = true;

  var root = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';

  function group(n, th) { return n.replace(/\B(?=(\d{3})+(?!\d))/g, th); }
  function num(cents, prec, th, dec) {
    var parts = (cents / 100).toFixed(prec).split('.');
    return group(parts[0], th) + (parts[1] ? dec + parts[1] : '');
  }
  function money(cents, format) {
    format = format || '{{amount}}';
    var m = format.match(/\{\{\s*(\w+)\s*\}\}/);
    var key = m ? m[1] : 'amount';
    var v;
    switch (key) {
      case 'amount_no_decimals': v = num(cents, 0, ',', '.'); break;
      case 'amount_with_comma_separator': v = num(cents, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': v = num(cents, 0, '.', ','); break;
      case 'amount_with_space_separator': v = num(cents, 2, ' ', ','); break;
      case 'amount_no_decimals_with_space_separator': v = num(cents, 0, ' ', ','); break;
      case 'amount_with_apostrophe_separator': v = num(cents, 2, "'", '.'); break;
      case 'amount_with_period_and_space_separator': v = num(cents, 2, ' ', '.'); break;
      default: v = num(cents, 2, ',', '.');
    }
    return format.replace(/\{\{\s*\w+\s*\}\}/, v);
  }

  function pick(item) {
    var s = item.querySelector('[data-mpk-variant]');
    if (!s) return null;
    if (s.tagName === 'SELECT') {
      var o = s.options[s.selectedIndex];
      if (!o || !o.value) return { id: null, price: parseInt(s.getAttribute('data-price-default'), 10) || 0, el: s };
      return { id: parseInt(o.value, 10), price: parseInt(o.getAttribute('data-price'), 10) || 0, el: s };
    }
    return { id: parseInt(s.value, 10), price: parseInt(s.getAttribute('data-price'), 10) || 0, el: s };
  }
  function included(item) {
    var t = item.querySelector('[data-mpk-toggle]');
    return !t || t.checked;
  }
  function setLabel(btn, kind) {
    var l = btn.querySelector('[data-mpk-label]');
    var txt = btn.getAttribute('data-label-' + kind);
    if (l && txt) l.textContent = txt;
  }
  function showError(box, msg) {
    var e = box.querySelector('[data-mpk-error]');
    if (!e) return;
    e.textContent = msg || '';
    e.hidden = !msg;
  }
  function update(box) {
    if (!box) return;
    var f = box.getAttribute('data-money-format');
    var total = 0, count = 0;
    box.querySelectorAll('[data-mpk-item]').forEach(function (item) {
      var on = included(item);
      item.classList.toggle('is-off', !on);
      var v = pick(item);
      if (!v) return;
      var p = item.querySelector('[data-mpk-price]');
      if (p) p.innerHTML = money(v.price, f);
      if (v.id && v.el) v.el.classList.remove('is-invalid');
      if (on) { total += v.price; count++; }
    });
    var t = box.querySelector('[data-mpk-total]');
    if (t) t.innerHTML = money(total, f);
    var deal = box.querySelector('[data-mpk-deal]');
    if (deal) {
      var both = count > 1;
      deal.classList.toggle('is-active', both);
      deal.querySelectorAll('[data-on]').forEach(function (n) {
        var txt = n.getAttribute(both ? 'data-on' : 'data-off');
        if (txt) n.textContent = txt;
      });
    }
    var btn = box.querySelector('[data-mpk-add]');
    if (btn && !btn.classList.contains('is-done') && !btn.classList.contains('is-loading')) {
      btn.disabled = count === 0;
      setLabel(btn, count > 1 ? 'multi' : 'single');
    }
  }

  /* Ana ürün formunda seçilen varyantı kombin kartına yansıt */
  function syncMain() {
    var input = document.querySelector('product-form form input[name="id"], form[id^="product-form"] input[name="id"]');
    if (!input || !input.value) return;
    document.querySelectorAll('select[data-mpk-main]').forEach(function (s) {
      if (s.value === input.value) return;
      if (!s.querySelector('option[value="' + input.value + '"]')) return;
      s.value = input.value;
      update(s.closest('[data-mpk-box]'));
    });
  }

  document.addEventListener('change', function (e) {
    var box = e.target && e.target.closest ? e.target.closest('[data-mpk-box]') : null;
    if (box) { showError(box, ''); update(box); return; }
    setTimeout(syncMain, 250);
  });

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-mpk-add]') : null;
    if (!btn) return;
    e.preventDefault();
    var box = btn.closest('[data-mpk-box]');
    if (!box || btn.classList.contains('is-loading')) return;

    var items = [];
    var missing = null;
    box.querySelectorAll('[data-mpk-item]').forEach(function (item) {
      if (!included(item)) return;
      var v = pick(item);
      if (!v) return;
      if (!v.id) { if (!missing) missing = v; return; }
      items.push({ id: v.id, quantity: 1 });
    });
    if (missing) {
      missing.el.classList.add('is-invalid');
      try { missing.el.focus(); } catch (err) {}
      showError(box, 'Lütfen ' + (missing.el.getAttribute('data-name') || 'ürün') + ' için ' + (missing.el.getAttribute('data-prompt') || 'beden') + ' seçin.');
      return;
    }
    if (!items.length) return;

    showError(box, '');
    btn.classList.add('is-loading');
    btn.disabled = true;

    fetch(root + 'cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: items, sections: 'cart-drawer,cart-icon-bubble', sections_url: window.location.pathname })
    })
      .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw d; return d; }); })
      .then(function (d) {
        var drawer = document.querySelector('cart-drawer');
        if (drawer && typeof drawer.renderContents === 'function' && d.sections && d.sections['cart-drawer']) {
          drawer.classList.remove('is-empty');
          drawer.renderContents({ sections: d.sections, id: null });
        } else {
          window.location.href = root + 'cart';
          return;
        }
        document.dispatchEvent(new CustomEvent('cart:refresh'));
        btn.classList.add('is-done');
        setLabel(btn, 'done');
        setTimeout(function () { btn.classList.remove('is-done'); update(box); }, 2600);
      })
      .catch(function (d) {
        showError(box, (d && (d.description || d.message)) || 'Ürün sepete eklenemedi, lütfen tekrar deneyin.');
      })
      .then(function () {
        btn.classList.remove('is-loading');
        btn.disabled = false;
      });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncMain);
  } else {
    syncMain();
  }
})();