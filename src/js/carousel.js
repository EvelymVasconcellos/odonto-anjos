/* =====================================================================
   Carrossel de fotos — Sobre e Estrutura

   • Uma foto por vez, todas com a mesma moldura (sem mudança de altura).
   • Troca automática a cada 5 s, só enquanto o carrossel está na tela.
   • Pausa com o mouse em cima, com foco de teclado dentro e por 8 s depois
     de qualquer interação manual. O botão de pausa para de vez
     (WCAG 2.2.2). Com prefers-reduced-motion começa pausado.
   • Navegação: setas, pontos, teclado (← →) e arrastar no celular.
   • Transição: fade cruzado de opacidade (sem deslocamento, sem fantasma
     de layout).
   ===================================================================== */
(function () {
  'use strict';
  var DELAY = 5000, HOLD = 8000;
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  Array.prototype.forEach.call(document.querySelectorAll('[data-carousel]'), function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.gal__slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.gal__dot'));
    var view = root.querySelector('.gal__view');
    var toggle = root.querySelector('[data-gal="toggle"]');
    var status = root.querySelector('[data-gal="status"]');
    if (slides.length < 2) { root.classList.add('is-single'); return; }
    root.classList.add('is-ready');
    view.setAttribute('tabindex', '0');
    view.setAttribute('aria-label', 'Use as setas do teclado para trocar a foto');

    var cur = 0, timer = 0, visible = false, hover = false, focusIn = false, userPaused = reduce, holdUntil = 0;

    function go(i, announce) {
      i = (i + slides.length) % slides.length;
      if (i === cur) return;
      slides[cur].classList.remove('is-on'); slides[cur].setAttribute('aria-hidden', 'true');
      slides[i].classList.add('is-on'); slides[i].removeAttribute('aria-hidden');
      dots.forEach(function (d, k) { if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      cur = i;
      if (announce && status) status.textContent = 'Foto ' + (i + 1) + ' de ' + slides.length;
      // carrega a próxima antes da vez dela
      var nx = slides[(i + 1) % slides.length].querySelector('img'); if (nx && nx.loading === 'lazy') nx.loading = 'eager';
    }
    function canPlay() { return visible && !hover && !focusIn && !userPaused && Date.now() >= holdUntil && !document.hidden; }
    function schedule() {
      clearTimeout(timer);
      if (!canPlay()) { if (holdUntil > Date.now()) timer = setTimeout(schedule, holdUntil - Date.now() + 20); return; }
      timer = setTimeout(function () { if (canPlay()) go(cur + 1, false); schedule(); }, DELAY);
    }
    function interact() { holdUntil = Date.now() + HOLD; schedule(); }
    function setPaused(p) {
      userPaused = p;
      if (toggle) {
        toggle.classList.toggle('is-paused', p);
        toggle.setAttribute('aria-label', p ? 'Retomar troca automática' : 'Pausar troca automática');
      }
      schedule();
    }

    root.querySelector('[data-gal="prev"]').addEventListener('click', function () { go(cur - 1, true); interact(); });
    root.querySelector('[data-gal="next"]').addEventListener('click', function () { go(cur + 1, true); interact(); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k, true); interact(); }); });
    if (toggle) toggle.addEventListener('click', function () { setPaused(!userPaused); });
    view.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1, true); interact(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1, true); interact(); }
    });
    root.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hover = true; schedule(); } });
    root.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hover = false; schedule(); } });
    root.addEventListener('focusin', function (e) { var kb = true; try { kb = e.target.matches(':focus-visible'); } catch (err) {} if (kb) { focusIn = true; schedule(); } });
    root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) { focusIn = false; schedule(); } });
    document.addEventListener('visibilitychange', schedule);

    // arrastar (toque): troca com deslize horizontal de 40 px
    var sx = 0, sy = 0, down = false;
    view.addEventListener('pointerdown', function (e) { down = true; sx = e.clientX; sy = e.clientY; });
    view.addEventListener('pointerup', function (e) {
      if (!down) return; down = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { go(cur + (dx < 0 ? 1 : -1), true); interact(); }
    });
    view.addEventListener('pointercancel', function () { down = false; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; schedule(); }, { threshold: 0.35 }).observe(root);
    } else { visible = true; }
    setPaused(userPaused);
  });
})();
