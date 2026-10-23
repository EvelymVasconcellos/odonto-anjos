/* Odonto Anjos — dados e ações compartilhados entre o site e o cartão digital.
   Lê tudo de window.SITE_CONFIG (site.config.js): nenhum telefone ou
   endereço fica repetido no código. */
(function () {
  'use strict';
  var C = window.SITE_CONFIG || {};
  var units = C.units || [];
  var treatments = C.treatments || [];
  var demo = !!(C.demo && C.demo.enabled);

  function unitById(id) { for (var i = 0; i < units.length; i++) if (units[i].id === id) return units[i]; return units[0]; }
  function treatmentById(id) { for (var i = 0; i < treatments.length; i++) if (treatments[i].id === id) return treatments[i]; return null; }
  function q(u) { return encodeURIComponent(u.street + ', ' + u.district + ', ' + u.city + ' - ' + u.state + (u.zipCode ? ', ' + u.zipCode : '')); }
  function mapsDir(u) { return 'https://www.google.com/maps/dir/?api=1&destination=' + q(u); }
  function mapsEmbed(u) { return 'https://www.google.com/maps?q=' + q(u) + '&z=16&output=embed'; }
  function message(u, t) {
    var c = C.contact || {};
    var tpl = t ? c.whatsappMessageTreatment : c.whatsappMessage;
    return String(tpl || '').replace('{unidade}', u.short).replace('{tratamento}', t ? t.name.toLowerCase() : '');
  }
  function formatNumber(n) {
    var d = String(n).replace(/\D/g, '');
    if (d.length === 13) return '+' + d.slice(0, 2) + ' (' + d.slice(2, 4) + ') ' + d.slice(4, 9) + '-' + d.slice(9);
    return '+' + d;
  }
  function waUrl(u, t) {
    var n = String(u.whatsapp || '').replace(/\D/g, '');
    return n ? 'https://wa.me/' + n + '?text=' + encodeURIComponent(message(u, t)) : '';
  }
  function missingText(u) {
    var b = (C.content && C.content.booking) || {};
    return String(b.missing || '').replace('{unidade}', u.short).replace('{instagram}', (C.contact.instagram || {}).handle || '');
  }

  /* Abre o fluxo de agendamento: modal de confirmação (com a mensagem) ou orientação. */
  var dlg = null, lastFocus = null;
  function setupDialog() {
    dlg = document.getElementById('wa-dialog');
    if (!dlg) return;
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('[data-close]')) close();
      else if (e.target.closest('[data-wa="link"]')) setTimeout(close, 50);
    });
    dlg.addEventListener('close', function () { if (window.__siteLenis) window.__siteLenis.start(); if (lastFocus && lastFocus.focus) lastFocus.focus(); });
  }
  function close() { if (!dlg) return; if (dlg.close) dlg.close(); else { dlg.removeAttribute('open'); dlg.dispatchEvent(new Event('close')); } }
  function book(unitId, treatmentId, statusEl) {
    var u = unitById(unitId), t = treatmentById(treatmentId);
    var url = waUrl(u, t);
    if (!url) {
      if (statusEl) { statusEl.textContent = missingText(u); statusEl.classList.add('is-shown'); }
      return false;
    }
    if (statusEl) { statusEl.textContent = ''; statusEl.classList.remove('is-shown'); }
    if (!demo || !dlg) { window.open(url, '_blank', 'noopener'); return true; }
    lastFocus = document.activeElement;
    dlg.querySelector('[data-wa="unit"]').textContent = u.short;
    dlg.querySelector('[data-wa="message"]').textContent = message(u, t);
    dlg.querySelector('[data-wa="number"]').textContent = u.name + ' · ' + formatNumber(u.whatsapp);
    dlg.querySelector('[data-wa="link"]').href = url;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    if (window.__siteLenis) window.__siteLenis.stop();
    var first = dlg.querySelector('[data-wa="link"]'); if (first) first.focus();
    return true;
  }

  /* Abas acessíveis (setas, Home/End), usadas nas unidades e nos tratamentos. */
  function tabs(list, onChange) {
    var btns = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    var ink = list.querySelector('[data-ink]');
    function inkTo(b) {
      if (!ink || !b) return;
      ink.style.width = b.offsetWidth + 'px';
      ink.style.transform = 'translateX(' + b.offsetLeft + 'px)';
    }
    function select(b, focus) {
      btns.forEach(function (x) {
        var on = x === b;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(x.getAttribute('aria-controls'));
        if (panel) { if (on) panel.removeAttribute('data-inactive'); else panel.setAttribute('data-inactive', ''); panel.classList.toggle('is-entering', on); }
      });
      if (focus) b.focus();
      inkTo(b);
      if (onChange) onChange(b);
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { select(b); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, j = -1;
        if (k === 'ArrowRight' || k === 'ArrowDown') j = (i + 1) % btns.length;
        if (k === 'ArrowLeft' || k === 'ArrowUp') j = (i - 1 + btns.length) % btns.length;
        if (k === 'Home') j = 0; if (k === 'End') j = btns.length - 1;
        if (j > -1) { e.preventDefault(); select(btns[j], true); }
      });
    });
    var cur = btns.filter(function (b) { return b.getAttribute('aria-selected') === 'true'; })[0] || btns[0];
    requestAnimationFrame(function () { inkTo(cur); });
    addEventListener('resize', function () { inkTo(btns.filter(function (b) { return b.getAttribute('aria-selected') === 'true'; })[0]); });
    return { select: function (id) { var b = btns.filter(function (x) { return x.getAttribute('data-unit-tab') === id || x.getAttribute('data-cat-tab') === id; })[0]; if (b) select(b); } };
  }

  window.SA = {
    config: C, units: units, demo: demo,
    unitById: unitById, treatmentById: treatmentById,
    mapsDir: mapsDir, mapsEmbed: mapsEmbed, waUrl: waUrl, message: message,
    book: book, tabs: tabs, setupDialog: setupDialog
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupDialog); else setupDialog();
})();
