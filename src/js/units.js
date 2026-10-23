/* Odonto Anjos — seletor de unidades, mapa, unidade mais próxima e agendamento.
   Funciona no site e no cartão digital (usa só o que existir na página). */
(function () {
  'use strict';
  var SA = window.SA; if (!SA) return;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function scrollToEl(el) {
    if (!el) return;
    if (window.__siteLenis) window.__siteLenis.scrollTo(el, { offset: -20, duration: 1.2 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- Abas de unidade ---------- */
  var current = SA.units[0] && SA.units[0].id;
  var mapFrame = null;
  function onUnit(b) {
    current = b.getAttribute('data-unit-tab');
    var u = SA.unitById(current);
    var lbl = $('#map-label'), addr = $('#map-addr');
    if (lbl) lbl.textContent = u.name;
    if (addr) addr.textContent = u.street + ' · ' + u.district;
    if (mapFrame) { mapFrame.src = SA.mapsEmbed(u); mapFrame.title = 'Mapa: ' + u.name; }
    var radio = $('#book input[name="unit"][value="' + current + '"]'); if (radio) radio.checked = true;
  }
  var unitTabs = null;
  var list = $('.seg--units');
  if (list) { document.documentElement.classList.add('tabs-ok'); unitTabs = SA.tabs(list, function (b) { onUnit(b); }); }

  $$('[data-pick-unit]').forEach(function (a) {
    a.addEventListener('click', function () { if (unitTabs) unitTabs.select(a.getAttribute('data-pick-unit')); });
  });

  /* ---------- Mapa sob demanda (só carrega o Google Maps quando pedido) ---------- */
  var loadBtn = $('#map-load');
  var framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
  if (loadBtn && framed) {   // em visualizadores que bloqueiam iframes, abre o Google Maps em nova aba
    var link = document.createElement('a');
    link.className = loadBtn.className; link.target = '_blank'; link.rel = 'noopener';
    link.innerHTML = loadBtn.innerHTML.replace('Ver mapa interativo', 'Abrir no Google Maps');
    link.href = SA.mapsDir(SA.unitById(current));
    loadBtn.replaceWith(link); loadBtn = null;
    var note = $('.map__note'); if (note) note.textContent = 'O mapa abre no Google Maps, em nova aba.';
    var _on = onUnit; onUnit = function (b) { _on(b); link.href = SA.mapsDir(SA.unitById(current)); };
  }
  if (loadBtn) loadBtn.addEventListener('click', function () {
    var u = SA.unitById(current);
    mapFrame = document.createElement('iframe');
    mapFrame.className = 'map__frame';
    mapFrame.src = SA.mapsEmbed(u);
    mapFrame.title = 'Mapa: ' + u.name;
    mapFrame.loading = 'lazy';
    mapFrame.referrerPolicy = 'no-referrer-when-downgrade';
    mapFrame.setAttribute('allowfullscreen', '');
    $('#map').appendChild(mapFrame);
    $('#map').classList.add('is-live');
    mapFrame.focus();
  });

  /* ---------- Unidade mais próxima ----------
     Com coordenadas configuradas (units[].geo): pede permissão, calcula a
     distância em linha reta no próprio aparelho e seleciona a unidade.
     A localização não é enviada nem guardada. Sem coordenadas: ficam os
     links de rota do Google Maps, que calcula o trajeto real. */
  var near = $('#near');
  var allGeo = SA.units.length && SA.units.every(function (u) { return u.geo && isFinite(u.geo.lat) && isFinite(u.geo.lng); });
  if (near && allGeo && 'geolocation' in navigator) {
    var txt = $('#near-text'), status = $('#near-status'), btns = $('#near-btns');
    txt.textContent = 'Se você permitir, o navegador informa sua localização só para esta busca. Ela não é enviada nem guardada.';
    var go = document.createElement('button');
    go.type = 'button'; go.className = 'btn btn--ink btn--sm';
    go.innerHTML = '<svg class="lucide" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg> Usar minha localização';
    btns.insertBefore(go, btns.firstChild);
    go.addEventListener('click', function () {
      status.textContent = 'Aguardando a permissão do navegador…';
      navigator.geolocation.getCurrentPosition(function (pos) {
        var la = pos.coords.latitude, lo = pos.coords.longitude, best = null, bd = Infinity;
        SA.units.forEach(function (u) {
          var R = 6371, dLa = (u.geo.lat - la) * Math.PI / 180, dLo = (u.geo.lng - lo) * Math.PI / 180;
          var a = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(la * Math.PI / 180) * Math.cos(u.geo.lat * Math.PI / 180) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
          var d = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          if (d < bd) { bd = d; best = u; }
        });
        if (unitTabs) unitTabs.select(best.id);
        status.textContent = 'Em linha reta, a unidade mais próxima de você é ' + best.short + '. Confira o trajeto em “Como chegar”.';
      }, function () {
        status.textContent = 'Não foi possível usar sua localização. Escolha a unidade acima ou compare as rotas no Google Maps.';
      }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
    });
  }

  /* ---------- Tratamentos: categorias ---------- */
  var cats = $('.seg--cats');
  if (cats) SA.tabs(cats);

  /* ---------- Agendamento ---------- */
  var form = $('#book'), bookStatus = $('#book-status');
  function treatmentSel() { return $('#book-treatment'); }
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var u = form.querySelector('input[name="unit"]:checked');
    SA.book(u ? u.value : current, treatmentSel().value, bookStatus);
  });

  // Captura: roda antes do scroll suave dos links "#..."
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-book-unit]');
    if (a) {
      e.preventDefault(); e.stopPropagation();
      var id = a.getAttribute('data-book-unit');
      var radio = $('#book input[name="unit"][value="' + id + '"]'); if (radio) radio.checked = true;
      var ok = SA.book(id, '', null);
      if (!ok) {   // sem WhatsApp: leva ao agendamento e mostra a orientação
        if (form) { scrollToEl($('#contato')); SA.book(id, '', bookStatus); }
        else { var s = $('#near-status') || $('#vc-status'); if (s) s.textContent = ''; }
      }
      return;
    }
    var t = e.target.closest('[data-book-treatment]');
    if (t && form) {
      e.preventDefault(); e.stopPropagation();
      treatmentSel().value = t.getAttribute('data-book-treatment');
      if (bookStatus) { bookStatus.textContent = ''; bookStatus.classList.remove('is-shown'); }
      scrollToEl($('#contato'));
      setTimeout(function () { var r = form.querySelector('input[name="unit"]:checked'); if (r) r.focus({ preventScroll: true }); }, reduce ? 0 : 900);
    }
  }, true);
})();
