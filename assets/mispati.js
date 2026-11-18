/* Mispati x Olivia — küçük etkileşimler (bağımlılıksız) */
(function () {
  'use strict';

  var MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  function addBusinessDays(date, days) {
    var d = new Date(date.getTime());
    var added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) added++; // Pazar teslimat yok
    }
    return d;
  }

  function initEta(root) {
    root.querySelectorAll('[data-mp-eta]:not([data-ready])').forEach(function (el) {
      el.setAttribute('data-ready', '');
      var min = parseInt(el.dataset.min, 10) || 2;
      var max = parseInt(el.dataset.max, 10) || 4;
      var now = new Date();
      var a = addBusinessDays(now, min);
      var b = addBusinessDays(now, max);
      var txt = a.getMonth() === b.getMonth()
        ? a.getDate() + ' - ' + b.getDate() + ' ' + MONTHS[b.getMonth()]
        : a.getDate() + ' ' + MONTHS[a.getMonth()] + ' - ' + b.getDate() + ' ' + MONTHS[b.getMonth()];
      var out = el.querySelector('[data-mp-eta-range]');
      if (out) {
        out.textContent = txt;
        out.closest('.mp-ship__eta').hidden = false;
      }
    });
  }

  function initMini(root) {
    root.querySelectorAll('[data-mp-mini]:not([data-ready])').forEach(function (el) {
      el.setAttribute('data-ready', '');
      var slides = el.querySelectorAll('.mp-mini__slide');
      var dots = el.querySelectorAll('.mp-mini__dot');
      if (slides.length < 2) return;
      var i = 0;
      var timer;
      function go(n) {
        slides[i].classList.remove('is-active');
        if (dots[i]) dots[i].classList.remove('is-active');
        i = (n + slides.length) % slides.length;
        slides[i].classList.add('is-active');
        if (dots[i]) dots[i].classList.add('is-active');
      }
      function start() { timer = setInterval(function () { go(i + 1); }, 4500); }
      dots.forEach(function (d, n) {
        d.addEventListener('click', function () { clearInterval(timer); go(n); start(); });
      });
      el.addEventListener('mouseenter', function () { clearInterval(timer); });
      el.addEventListener('mouseleave', function () { clearInterval(timer); start(); });
      start();
    });
  }

  function initCarousels(root) {
    root.querySelectorAll('[data-mp-carousel]:not([data-ready])').forEach(function (el) {
      el.setAttribute('data-ready', '');
      var track = el.querySelector('[data-mp-track]');
      if (!track) return;
      function step() {
        var card = track.firstElementChild;
        return card ? card.getBoundingClientRect().width + 20 : track.clientWidth;
      }
      var prev = el.querySelector('[data-mp-prev]');
      var next = el.querySelector('[data-mp-next]');
      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    });
  }

  function initCompare(root) {
    root.querySelectorAll('[data-mp-compare]:not([data-ready])').forEach(function (el) {
      el.setAttribute('data-ready', '');
      var range = el.querySelector('input[type="range"]');
      if (!range) return;
      var set = function () { el.style.setProperty('--pos', range.value + '%'); };
      range.addEventListener('input', set);
      set();
    });
  }

  /* ---------- Sepet çekmecesi: ek ürün anahtarları ---------- */
  function refreshCart() {
    var drawer = document.querySelector('cart-drawer');
    var root = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
    return fetch(root + '?sections=cart-drawer,cart-icon-bubble')
      .then(function (r) { return r.json(); })
      .then(function (sections) {
        if (drawer && typeof drawer.renderContents === 'function') {
          drawer.renderContents({ sections: sections, id: null });
        } else {
          window.location.reload();
        }
        document.dispatchEvent(new CustomEvent('cart:refresh'));
      });
  }

  document.addEventListener('change', function (e) {
    var input = e.target.closest('[data-mp-addon]');
    if (!input) return;
    e.stopPropagation(); // Olivia sepet formunun adet doğrulamasını tetiklemesin
    var row = input.closest('.mp-addon');
    var variantId = parseInt(input.dataset.variant, 10);
    var root = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
    if (row) row.classList.add('is-busy');
    var req = input.checked
      ? fetch(root + 'cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
        })
      : fetch(root + 'cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ id: input.dataset.key || String(variantId), quantity: 0 })
        });
    req
      .then(function (r) { if (!r.ok) throw new Error('cart'); return refreshCart(); })
      .catch(function () {
        input.checked = !input.checked;
        if (row) row.classList.remove('is-busy');
      });
  }, true);


  /* ---------- Teslimat zaman çizelgesi ---------- */
  var DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  function fmt(d) { return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3); }
  function initTimeline(root) {
    root.querySelectorAll('[data-mp-tl]:not([data-ready])').forEach(function (el) {
      el.setAttribute('data-ready', '');
      var min = parseInt(el.dataset.min, 10) || 0;
      var max = parseInt(el.dataset.max, 10) || 0;
      var now = new Date();
      var a = min ? addBusinessDays(now, min) : now;
      var b = max ? addBusinessDays(now, max) : now;
      var out = el.querySelector('[data-mp-tl-date]');
      if (out) out.textContent = (min === max) ? (min === 0 ? 'Bugün' : fmt(a)) : (a.getDate() + ' - ' + fmt(b));
    });
  }

  /* ---------- Kişiselleştirme alanlarını ürün formuna bağla ---------- */
  function initProps(root) {
    root.querySelectorAll('[data-mp-prop]:not([data-ready])').forEach(function (input) {
      var scope = input.closest('.shopify-section') || document;
      var form = scope.querySelector('product-form form[action*="/cart/add"]') || scope.querySelector('form[action*="/cart/add"]:not([id*="installment"])');
      var formId = form && form.getAttribute('id');
      if (!formId) return;
      input.setAttribute('data-ready', '');
      input.setAttribute('form', formId);
    });
  }

  function initAll(root) {
    root = root || document;
    initEta(root);
    initMini(root);
    initCarousels(root);
    initCompare(root);
    initTimeline(root);
    initProps(root);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initAll(document); });
  } else {
    initAll(document);
  }
  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
  // Varyant değişince bölüm yeniden çizilirse yakala
  var pending = false;
  new MutationObserver(function () {
    if (pending) return;
    pending = true;
    setTimeout(function () { pending = false; initAll(document); }, 250);
  }).observe(document.body || document.documentElement, { childList: true, subtree: true });
})();
