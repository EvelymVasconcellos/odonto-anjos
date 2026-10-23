/* Odonto Anjos — cartão digital: mascote animado, compartilhar e QR Code.
   Unidades e WhatsApp vêm de core.js/units.js (mesma fonte de dados do site). */
(function () {
  'use strict';
  var reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* Mascote: o estático é o primeiro quadro do loop, então a troca não salta. */
  Array.prototype.forEach.call(document.querySelectorAll('.mascot-inline img[data-anim]'), function (img) {
    if (reduce) return;
    var a = new Image();
    a.onload = function () { img.src = a.src; };
    a.src = img.getAttribute('data-anim');
  });

  var share = document.getElementById('vc-share');
  if (share && navigator.share) {
    share.hidden = false;
    share.addEventListener('click', function () {
      navigator.share({ title: document.title, text: 'Odonto Anjos', url: location.href }).catch(function () {});
    });
  }
  var box = document.getElementById('vc-qr-box');
  var url = box && box.getAttribute('data-url');
  if (!url) return;
  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
  s.onload = function () {
    try {
      var qr = window.qrcode(0, 'M'); qr.addData(url); qr.make();
      box.innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true }) + '<p>Aponte a câmera para abrir este cartão.</p>';
      var svg = box.querySelector('svg'); if (svg) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'QR Code para ' + url); }
    } catch (e) {}
  };
  document.head.appendChild(s);
})();
