/* ════════════════════════════════════════════════════════════════
   TapFirst — landing page behaviour
   Split out of index.html so the page can ship a Content-Security-
   Policy with `script-src 'self'` and no inline scripts at all: an
   attacker who manages to write a <script> tag into the markup gets
   nothing, because the browser refuses to run anything that did not
   come from this origin as its own file.

   Loaded with `defer`, so the DOM is parsed before this runs — the
   getElementById calls below need no DOMContentLoaded wrapper.

   Two changes from the original inline version, both about closing
   injection surface rather than changing behaviour:
     • the cart drawer is built from <template> elements and cloned,
       instead of assembling an HTML string and assigning innerHTML.
       There is now no HTML-string sink anywhere on the page, which
       is what lets the CSP add `require-trusted-types-for 'script'`.
     • the cart read out of localStorage is shape-checked before it
       is trusted, so a hand-edited or third-party-written value can
       only ever produce a sane 1–99 quantity or nothing at all.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Empty a node without touching innerHTML. */
  function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  /* ── SCROLL REVEAL ────────────────────────────── */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var siblings = [].slice.call(e.target.parentElement.querySelectorAll('.sr:not(.in)'));
      var idx = siblings.indexOf(e.target);
      setTimeout(function () { e.target.classList.add('in'); }, idx * 85);
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.sr').forEach(function (el) { io.observe(el); });

  /* ── NAV: condensed state + active link ───────── */
  var nav = document.getElementById('siteNav');
  var navLinks = [].slice.call(document.querySelectorAll('.nav-links a'));
  function onScrollNav() { nav.classList.toggle('scrolled', window.scrollY > 24); }
  onScrollNav();

  /* "The tag" and "What it stores" land on different parts of the product
     section, so the spy watches #stores ahead of its parent section. */
  var sectionIds = ['how', 'product', 'stores', 'promise'];
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      navLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sectionIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spy.observe(el);
  });

  /* ── MOBILE MENU ──────────────────────────────── */
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');
  function closeMenu() {
    mobileMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
    });
    document.addEventListener('click', function (e) {
      if (!mobileMenu.classList.contains('open')) return;
      if (mobileMenu.contains(e.target) || menuToggle.contains(e.target)) return;
      closeMenu();
    });
  }

  /* ── CART ─────────────────────────────────────────────────────
     One product, so the cart is just a quantity plus the price it
     was added at. It lives in localStorage under afiye.cart, which
     is the same key the checkout page reads — storing the price
     there means the two pages can never disagree about it.

     localStorage is readable and writable by anything running on
     this origin, so nothing that comes back out of it is trusted:
     readCart() re-derives the quantity as a bounded integer and
     writeCart() always re-stamps the price from the page, never
     from whatever was stored before.
  ────────────────────────────────────────────────────────────── */
  var CART_KEY = 'afiye.cart';

  /* The price comes from the page itself, so there is one number to
     edit and the cart follows it. */
  var PRICE = (function () {
    var el = document.getElementById('unitPrice');
    var n = el ? parseFloat((el.textContent || '').replace(/[^0-9.]/g, '')) : NaN;
    return isNaN(n) ? 0 : n;
  })();

  function money(n) { return '$' + n.toFixed(2); }

  function readCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      if (!raw) return 0;
      var parsed = JSON.parse(raw);
      /* Anything that is not a plain object with a numeric-looking
         qty is treated as an empty cart rather than half-trusted. */
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return 0;
      var n = parseInt(parsed.qty, 10);
      return n > 0 ? Math.min(n, 99) : 0;
    } catch (e) { return 0; }
  }
  function writeCart(qty) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify({ qty: qty, price: PRICE }));
    } catch (e) {}
    paintCount(qty);
  }
  function paintCount(qty) {
    var badge = document.getElementById('cartCount');
    if (!badge) return;
    badge.textContent = qty;
    badge.hidden = qty <= 0;
  }

  /* Shared by both quantity controls: keep the value sane and grey
     out the button that can't go any further. */
  function clampQty(input) {
    var n = parseInt(input.value, 10);
    if (isNaN(n) || n < 1) n = 1;
    if (n > 99) n = 99;
    input.value = n;
    var group = input.parentNode;
    var minus = group.querySelector('.qty-btn[data-step="-1"]');
    var plus  = group.querySelector('.qty-btn[data-step="1"]');
    if (minus) minus.disabled = n <= 1;
    if (plus)  plus.disabled  = n >= 99;
    return n;
  }

  /* ── DRAWER ─────────────────────────────────────────────────── */
  var drawer   = document.getElementById('cartDrawer');
  var scrim    = document.getElementById('cartScrim');
  var cartBody = document.getElementById('cartBody');
  var cartLink = document.getElementById('cartLink');
  var tplEmpty = document.getElementById('tplCartEmpty');
  var tplLine  = document.getElementById('tplCartLine');
  var lastFocus = null;

  /* The drawer's markup lives in the two <template> blocks in
     index.html. Cloning them keeps the DOM identical to the old
     innerHTML version while the only values this code injects —
     a quantity and two prices — go in through .value and
     .textContent, which cannot become markup. */
  function renderCart() {
    var qty = readCart();
    clearNode(cartBody);

    if (qty <= 0) {
      cartBody.appendChild(tplEmpty.content.cloneNode(true));
      return;
    }

    /* Grab the three nodes to fill in before appending — the fragment
       empties itself into cartBody, but these references follow the
       nodes into the document and stay valid. */
    var frag      = tplLine.content.cloneNode(true);
    var cartQty   = frag.querySelector('.qty-input');
    var lineCost  = frag.querySelector('.cart-cost');
    var totalCost = frag.querySelector('.cart-total span:last-child');
    cartBody.appendChild(frag);

    cartQty.value = qty;
    lineCost.textContent = money(PRICE * qty);
    totalCost.textContent = money(PRICE * qty);
    clampQty(cartQty);

    cartBody.querySelectorAll('.qty-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        cartQty.value = (parseInt(cartQty.value, 10) || 1) + parseInt(btn.getAttribute('data-step'), 10);
        writeCart(clampQty(cartQty));
        renderCart();
      });
    });
    cartQty.addEventListener('change', function () {
      writeCart(clampQty(cartQty));
      renderCart();
    });
  }

  function openCart() {
    lastFocus = document.activeElement;
    renderCart();
    scrim.hidden = false;
    void scrim.offsetWidth;                 /* let the transition catch */
    scrim.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    cartLink.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
    document.getElementById('cartClose').focus();
  }

  function closeCart() {
    scrim.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    cartLink.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
    setTimeout(function () { scrim.hidden = true; }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  cartLink.addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  scrim.addEventListener('click', closeCart);
  cartBody.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) closeCart();
    if (e.target.closest('[data-remove]')) { writeCart(0); renderCart(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeCart();
  });

  /* ── ADD TO CART ────────────────────────────────────────────── */
  (function () {
    var qtyInput = document.getElementById('qty');
    var addBtn   = document.getElementById('addToCart');
    var note     = document.getElementById('buyNote');
    if (!qtyInput || !addBtn) return;

    clampQty(qtyInput);

    qtyInput.parentNode.querySelectorAll('.qty-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + parseInt(btn.getAttribute('data-step'), 10);
        clampQty(qtyInput);
      });
    });
    qtyInput.addEventListener('change', function () { clampQty(qtyInput); });
    qtyInput.addEventListener('blur',   function () { clampQty(qtyInput); });

    addBtn.addEventListener('click', function () {
      var add = clampQty(qtyInput);
      var total = Math.min(99, readCart() + add);
      writeCart(total);
      note.textContent = total + (total === 1 ? ' tag' : ' tags') + ' in your cart.';
      note.classList.remove('show');
      void note.offsetWidth;          /* restart the entrance animation */
      note.classList.add('show');
      openCart();
    });
  })();

  paintCount(readCart());

  /* ── LOGO STRIPE ──────────────────────────────────────────────
     You write one row of <img> tags. This builds the marquee from it:

       1. waits for every logo to load, and drops the ones that fail
          (naming them in the console so a wrong path is findable)
       2. measures the real width of that row once the images are in
       3. repeats the row until it is at least twice the screen width,
          so there is never a gap at the end of the loop
       4. scrolls by exactly one row width, over a duration derived
          from that width — so the speed is identical whether there
          is one logo or twenty

     It re-measures on resize. If no logo loads, the section hides.

     Note: a logo hosted on someone else's domain also has to be
     allowed by the img-src line of the CSP in index.html. Logos you
     drop into site/assets/ are covered by 'self' and need nothing.
  ────────────────────────────────────────────────────────────── */
  (function () {
    var section = document.getElementById('stripe');
    var track = document.getElementById('stripeTrack');
    if (!section || !track) return;

    var SPEED = 55;   // pixels per second — lower is slower

    var originals = [].slice.call(track.querySelectorAll('img'));

    /* A path copied out of Windows Explorer arrives with backslashes,
       which the browser reads as part of the filename. Fix it rather
       than fail on it. */
    originals.forEach(function (img) {
      var src = img.getAttribute('src') || '';
      if (src.indexOf('\\') !== -1) img.setAttribute('src', src.replace(/\\/g, '/'));
    });

    function settled(img) {
      return new Promise(function (resolve) {
        if (img.complete) { resolve(img.naturalWidth > 0); return; }
        img.addEventListener('load', function () { resolve(true); });
        img.addEventListener('error', function () { resolve(false); });
      });
    }

    Promise.all(originals.map(settled)).then(function (results) {
      var usable = originals.filter(function (img, i) {
        if (results[i]) return true;
        console.warn('[logo stripe] could not load "' + img.getAttribute('src') +
          '" — check the path is relative to index.html, e.g. assets/your-logo.png');
        img.remove();
        return false;
      });

      if (usable.length === 0) {
        section.hidden = true;
        return;
      }

      var clones = [];
      var resizeTimer;

      function build() {
        clones.forEach(function (el) { el.remove(); });
        clones = [];

        /* Width of one row, including the trailing gap — that gap is a
           margin on each logo rather than a flex gap precisely so the
           last one carries it and the wrap-around stays even. */
        var setWidth = 0;
        usable.forEach(function (img) {
          var style = window.getComputedStyle(img);
          setWidth += img.offsetWidth + parseFloat(style.marginRight || 0);
        });
        if (!setWidth) return;

        var needed = Math.max(2, Math.ceil((section.offsetWidth * 2) / setWidth));
        for (var c = 1; c < needed; c++) {
          usable.forEach(function (img) {
            var copy = img.cloneNode(true);
            copy.setAttribute('aria-hidden', 'true');
            copy.alt = '';
            track.appendChild(copy);
            clones.push(copy);
          });
        }

        track.style.setProperty('--stripe-shift', setWidth + 'px');
        track.style.setProperty('--stripe-dur', (setWidth / SPEED) + 's');
      }

      build();

      if (window.ResizeObserver) {
        new ResizeObserver(function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(build, 150);
        }).observe(section);
      } else {
        window.addEventListener('resize', function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(build, 150);
        });
      }
    });
  })();

  /* ── HERO PARALLAX ────────────────────────────── */
  var heroBg = document.querySelector('.hero-bg');
  var heroVisual = document.getElementById('heroVisual');
  var heroEl = document.querySelector('.hero');
  var parallaxQueued = false;
  function applyParallax() {
    parallaxQueued = false;
    var y = window.scrollY;
    if (y > heroEl.offsetHeight) return;
    if (heroBg) heroBg.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(2) + 'px,0)';
    if (heroVisual) heroVisual.style.transform = 'translate3d(0,' + (y * -0.05).toFixed(2) + 'px,0)';
  }
  window.addEventListener('scroll', function () {
    onScrollNav();
    if (reduced || parallaxQueued) return;
    parallaxQueued = true;
    requestAnimationFrame(applyParallax);
  }, { passive: true });

  /* ── 3D NFC TOKEN ─────────────────────────────────────────────
     The disc is a real CSS 3D object: two circular faces separated
     along Z, plus a ring of thin flat staves that fake the curved
     rim. Each stave sits on the circle and is stood up along Z with
     `rotateZ(a) translateY(-R) rotateX(90deg)`, so the rim always
     lines up with the faces at any size. No filter is applied to
     the disc itself — a filter would flatten the 3D context and
     collapse the whole token.

     The staves set .style.width / .style.transform through the
     CSSOM rather than a style="" attribute, which the CSP allows —
     it is the parsed attribute, not the property, that a style
     injection would use.
  ────────────────────────────────────────────────────────────── */
  (function () {
    var stage = document.getElementById('tagStage');
    var tag = document.getElementById('tag3d');
    var ground = document.getElementById('tagGround');
    if (!stage || !tag) return;

    var SEGMENTS = 72;    // enough staves that the rim reads as a smooth curve
    var THICKNESS = 17;   // 1px taller than the 16px face gap, hides the seam
    var segs = [];

    /* Pre-baked rim shades: deep navy edge → lit steel-blue. */
    var SHADES = 40;
    var palette = new Array(SHADES);
    for (var s = 0; s < SHADES; s++) {
      var t = s / (SHADES - 1);
      palette[s] = 'rgb(' +
        Math.round(6 + t * 136) + ',' +
        Math.round(32 + t * 166) + ',' +
        Math.round(78 + t * 174) + ')';
    }
    /* Light direction: upper-left, slightly toward the viewer. */
    var LX = -0.42, LY = -0.66, LZ = 0.62;

    function buildRim() {
      segs.forEach(function (s) { s.el.remove(); });
      segs = [];
      var R = tag.offsetWidth / 2;      // layout width — unaffected by the rotation
      if (!R) return;
      var w = 2 * R * Math.tan(Math.PI / SEGMENTS) + 1;   // +1px overlap, no hairline gaps
      var frag = document.createDocumentFragment();
      for (var i = 0; i < SEGMENTS; i++) {
        var deg = (360 / SEGMENTS) * i;
        var rad = deg * Math.PI / 180;
        var el = document.createElement('i');
        el.className = 'rim-seg';
        el.style.width = w + 'px';
        el.style.height = THICKNESS + 'px';
        el.style.marginLeft = (-w / 2) + 'px';
        el.style.marginTop = (-THICKNESS / 2) + 'px';
        el.style.transform = 'rotateZ(' + deg + 'deg) translateY(' + (-R) + 'px) rotateX(90deg)';
        frag.appendChild(el);
        segs.push({ el: el, nx: Math.sin(rad), ny: -Math.cos(rad), shade: -1 });
      }
      tag.appendChild(frag);
      shadeRim(yaw);
    }

    function shadeRim(yawDeg) {
      var r = yawDeg * Math.PI / 180;
      var cy = Math.cos(r), sy = Math.sin(r);
      for (var i = 0; i < segs.length; i++) {
        var s = segs[i];
        /* normal rotated around Y: (nx·cos, ny, −nx·sin) */
        var d = (s.nx * cy) * LX + s.ny * LY + (-s.nx * sy) * LZ;
        if (d < 0) d = 0;
        var lit = 0.14 + 0.78 * d + 0.34 * Math.pow(d, 16);
        var idx = Math.round(lit * (SHADES - 1));
        if (idx < 0) idx = 0; else if (idx > SHADES - 1) idx = SHADES - 1;
        if (idx !== s.shade) {
          s.shade = idx;
          s.el.style.backgroundColor = palette[idx];
        }
      }
    }

    var yaw = -26, pitch = 6;

    buildRim();
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { buildRim(); });
      ro.observe(stage);
    } else {
      var rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(buildRim, 150);
      });
    }

    if (reduced) {
      tag.style.transform = 'rotateX(6deg) rotateY(-26deg)';
      shadeRim(yaw);
      return;
    }

    var IDLE = 0.22;            // degrees per frame
    var vel = IDLE;
    var yawOffset = 0, targetYawOffset = 0;
    var targetPitch = 6;
    var hovering = false, dragging = false;
    var lastX = 0, pointerId = null;

    stage.addEventListener('pointerenter', function () { hovering = true; });
    stage.addEventListener('pointerleave', function () {
      hovering = false;
      targetYawOffset = 0;
      targetPitch = 6;
    });
    stage.addEventListener('pointermove', function (e) {
      var rect = stage.getBoundingClientRect();
      if (dragging) {
        var dx = e.clientX - lastX;
        lastX = e.clientX;
        yaw += dx * 0.45;
        vel = vel * 0.55 + (dx * 0.45) * 0.45;
        return;
      }
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      targetYawOffset = relX * 34;
      targetPitch = 6 + relY * -16;
    });
    stage.addEventListener('pointerdown', function (e) {
      dragging = true;
      lastX = e.clientX;
      pointerId = e.pointerId;
      stage.classList.add('dragging');
      e.preventDefault();
      if (stage.setPointerCapture) { try { stage.setPointerCapture(pointerId); } catch (err) {} }
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('dragging');
      if (pointerId !== null && stage.releasePointerCapture) {
        try { stage.releasePointerCapture(pointerId); } catch (err) {}
      }
      pointerId = null;
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);

    /* Pause the loop when the hero is off screen. */
    var visible = true;
    var running = false;
    function start() {
      if (running) return;
      running = true;
      requestAnimationFrame(frame);
    }
    if (heroEl) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
      }, { threshold: 0 }).observe(heroEl);
    }

    function frame() {
      if (!visible) { running = false; return; }

      if (!dragging) {
        var target = hovering ? IDLE * 0.18 : IDLE;
        vel += (target - vel) * 0.045;
        yaw += vel;
      }
      if (yaw > 360 || yaw < -360) yaw = yaw % 360;

      yawOffset += (targetYawOffset - yawOffset) * 0.08;
      pitch += (targetPitch - pitch) * 0.08;

      var totalYaw = yaw + yawOffset;
      tag.style.transform = 'rotateX(' + pitch.toFixed(2) + 'deg) rotateY(' + totalYaw.toFixed(2) + 'deg)';
      shadeRim(totalYaw);

      if (ground) {
        var c = Math.abs(Math.cos(totalYaw * Math.PI / 180));
        ground.style.transform = 'scaleX(' + (0.2 + 0.8 * c).toFixed(3) + ')';
      }
      requestAnimationFrame(frame);
    }
    start();
  })();
})();
