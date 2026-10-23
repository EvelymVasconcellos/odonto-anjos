/* Odonto Anjos — interface: menu, cabeçalho, entradas no scroll, revelação de fotos, parallax.
   Todo o conteúdo é visível sem JavaScript; este arquivo só melhora a experiência.
   Sem bibliotecas: IntersectionObserver + transform/opacity. */
(function () {
  'use strict';
  var C = window.SITE_CONFIG || {};
  var demo = !!(C.demo && C.demo.enabled);
  var doc = document.documentElement;
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- Ilustrações dos tratamentos ---------- */
  var ART = window.SITE_ART || {};
  $$('.svc').forEach(function (c) {
    var art = c.querySelector('.svc__art');
    if (art && !art.firstChild) art.innerHTML = ART[c.getAttribute('data-svc')] || ART._fallback || '';
  });
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- Aviso de demonstração ---------- */
  var pill = $('#demo-bar');
  if (!demo) $$('.js-demo-only').forEach(function (n) { n.remove(); });
  else if (pill) {
    try { if (sessionStorage.getItem('anjos-demo-closed') === '1') pill.hidden = true; } catch (e) {}
    var cl = $('#demo-close');
    if (cl) cl.addEventListener('click', function () { pill.hidden = true; try { sessionStorage.setItem('anjos-demo-closed', '1'); } catch (e) {} });
  }

  /* ---------- Rolagem até âncoras (respeita movimento reduzido) ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var t = document.querySelector(id); if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', id);
      if (id !== '#inicio' && t.focus) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
  });

  /* ---------- Menu do celular ---------- */
  var menu = $('#menu'), burger = $('#menu-btn');
  function setMenu(open) {
    if (!menu || !burger) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
      var first = menu.querySelector('a'); if (first) setTimeout(function () { first.focus(); }, 60);
    } else {
      menu.classList.remove('is-open');
      setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduce ? 0 : 300);
    }
  }
  if (burger) burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  if (menu) {
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (burger.getAttribute('aria-expanded') !== 'true') return;
      if (e.key === 'Escape') { setMenu(false); burger.focus(); }
      if (e.key === 'Tab') {
        var items = [burger].concat($$('a', menu));
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    addEventListener('resize', function () { if (innerWidth > 1080 && burger.getAttribute('aria-expanded') === 'true') setMenu(false); });
  }

  /* ---------- Cabeçalho: sombra ao rolar + item ativo ---------- */
  var hd = $('#hd'), tick = false;
  function onScroll() { tick = false; if (hd) hd.classList.toggle('is-scrolled', scrollY > 8); }
  addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if ('IntersectionObserver' in window) {
    var links = {};
    $$('.hd__nav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var navIo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting || !links[e.target.id]) return;
        $$('.hd__nav a').forEach(function (x) { x.classList.remove('is-active'); x.removeAttribute('aria-current'); });
        links[e.target.id].classList.add('is-active'); links[e.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { navIo.observe(s); });
  }

  /* ---------- Entradas: texto sobe e aparece; fotos revelam por máscara ----------
     O estado inicial só existe com .anim-ready (motion-ok + IO). Na primeira dobra,
     a entrada roda logo no carregamento. Garantia: nada fica invisível. */
  if (!reduce && 'IntersectionObserver' in window) {
    doc.classList.add('anim-ready');
    var items = $$('.reveal, .reveal-img');
    var io = new IntersectionObserver(function (es) {
      var batch = es.filter(function (e) { return e.isIntersecting; }).map(function (e) { return e.target; });
      batch.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i * 70, 350) + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
        setTimeout(function () { el.style.transitionDelay = ''; }, 1600);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      items.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('is-in'); });
    }, 2400);
  }

  /* ---------- Parallax sutil dentro das molduras (desktop) ---------- */
  var par = $$('[data-parallax] img');
  var wide = false; try { wide = matchMedia('(min-width: 861px)').matches; } catch (e) {}
  if (!reduce && wide && par.length) {
    var pt = false;
    var run = function () {
      pt = false;
      par.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1..1
        img.style.transform = 'translate3d(0,' + (p * -24).toFixed(1) + 'px,0) scale(1.06)';
      });
    };
    addEventListener('scroll', function () { if (!pt) { pt = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ---------- Cards de tratamento: inclinação discreta (desktop) ---------- */
  var fine = false; try { fine = matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) {}
  if (!reduce && fine) {
    $$('.svc').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(900px) rotateX(' + (-dy * 4).toFixed(2) + 'deg) rotateY(' + (dx * 5).toFixed(2) + 'deg) translateY(-3px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }
})();
