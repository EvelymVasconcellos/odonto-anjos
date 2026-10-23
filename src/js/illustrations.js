/* Mini ilustrações dos tratamentos — vetoriais, leves e na paleta da marca.
   Servem para identificar o tratamento de relance (não representam resultados).
   Classes: a-w (claro), a-s (dourado), a-l (traço claro), a-ls (traço dourado).
   A chave é o `id` do tratamento em site.config.js. */
window.SITE_ART = (function () {
  var T = function (x, y, w, cls) { return '<use href="#i-tooth" x="' + x + '" y="' + y + '" width="' + w + '" height="' + w + '" class="' + (cls || 'a-w') + '"/>'; };
  var svg = function (body, label) { return '<svg viewBox="0 0 160 100" aria-hidden="true" data-label="' + label + '">' + body + '</svg>'; };
  var face = '<path d="M80 12c-22 0-36 16-36 38 0 24 16 40 36 40s36-16 36-40c0-22-14-38-36-38z" class="a-l" stroke-width="4.2"/>';
  return {
    ortodontia: svg(T(26, 18, 56) + T(78, 18, 56) + '<path d="M22 48h116" class="a-ls" stroke-width="4.2"/><rect x="46" y="41" width="15" height="14" rx="3" class="a-s"/><rect x="98" y="41" width="15" height="14" rx="3" class="a-s"/>', 'Dentes com aparelho'),
    limpeza: svg('<g transform="rotate(-28 80 54)"><rect x="24" y="52" width="92" height="10" rx="5" class="a-s"/><rect x="98" y="38" width="30" height="15" rx="4" class="a-w"/><path d="M103 38v-7M109 38v-7M115 38v-7M121 38v-7" class="a-l" stroke-width="3.6"/></g><circle cx="40" cy="28" r="7" class="a-l" stroke-width="3"/><circle cx="56" cy="16" r="4.5" class="a-l" stroke-width="3"/><circle cx="28" cy="46" r="3.5" class="a-l" stroke-width="3"/>', 'Escova e bolhas'),
    'raio-x': svg('<rect x="38" y="8" width="84" height="84" rx="10" class="a-ls" stroke-width="4.2"/>' + T(54, 20, 52) + '<path d="M44 76h72" class="a-ls" stroke-width="3" opacity=".6"/>', 'Radiografia de um dente'),
    canal: svg(T(46, 10, 70) + '<path d="M72 48c-1 14-4 24-6 32M88 48c1 14 4 24 6 32" class="a-ls" stroke-width="4.8"/>', 'Dente com raízes'),
    extracoes: svg(T(50, 24, 60) + '<path d="M80 22V4M70 12l10-10 10 10" class="a-ls" stroke-width="4.8"/>', 'Dente sendo removido'),
    proteses: svg('<path d="M22 34c0 34 26 54 58 54s58-20 58-54c-8 16-30 28-58 28S30 50 22 34z" class="a-s"/><g class="a-w"><rect x="32" y="38" width="13" height="16" rx="5"/><rect x="47" y="44" width="14" height="18" rx="5"/><rect x="63" y="47" width="16" height="19" rx="5"/><rect x="81" y="47" width="16" height="19" rx="5"/><rect x="99" y="44" width="14" height="18" rx="5"/><rect x="115" y="38" width="13" height="16" rx="5"/></g>', 'Prótese dentária'),
    implantes: svg('<path d="M56 18c6-6 14-6 24-2 10-4 18-4 24 2 6 6 4 16 0 26H56c-4-10-6-20 0-26z" class="a-w"/><rect x="64" y="46" width="32" height="6" rx="3" class="a-s"/><path d="M70 56h20l-2 8H72zM72 66h16l-2 8H74zM74 76h12l-2 8h-8z" class="a-s"/>', 'Coroa sobre implante'),
    obturacoes: svg(T(46, 14, 70) + '<path d="M70 30c4-4 16-4 20 0 2 4-2 10-10 10s-12-6-10-10z" class="a-s"/>', 'Dente restaurado'),
    clareamento: svg(T(46, 16, 68) + '<path d="M80 4v9M54 10l5 7M106 10l-5 7M40 30l8 3M120 30l-8 3" class="a-ls" stroke-width="4.8"/><path d="M128 58c1.4 6 3 7.6 9 9-6 1.4-7.6 3-9 9-1.4-6-3-7.6-9-9 6-1.4 7.6-3 9-9z" class="a-s"/>', 'Dente com brilho'),
    laser: svg('<rect x="20" y="40" width="54" height="18" rx="9" class="a-w"/><path d="M74 49h22" class="a-ls" stroke-width="6"/><path d="M100 49h40M100 36l34-14M100 62l34 14" class="a-ls" stroke-width="3.6" opacity=".7"/>', 'Feixe de laser'),
    harmonizacao: svg(face + '<path d="M66 44h.1M94 44h.1" class="a-ls" stroke-width="8.4"/><path d="M68 66c8 6 16 6 24 0" class="a-ls" stroke-width="4.8"/><path d="M30 50h10M120 50h10" class="a-ls" stroke-width="3.6"/>', 'Rosto em equilíbrio'),
    toxina: svg('<g transform="rotate(-30 80 50)"><rect x="40" y="42" width="64" height="16" rx="4" class="a-w"/><rect x="48" y="45" width="30" height="10" rx="2" class="a-s"/><path d="M104 50h26M36 50h-14M22 40v20" class="a-ls" stroke-width="4.8"/></g>', 'Seringa'),
    labial: svg('<path d="M28 50c14-16 30-20 40-12 4 3 8 3 12 0 10-8 26-4 40 12-16 20-34 26-52 26S44 70 28 50z" class="a-s"/><path d="M30 50h100" class="a-l" stroke-width="3.6"/>', 'Lábios'),
    sulcos: svg(face + '<path d="M66 54c-4 8-4 16 0 22M94 54c4 8 4 16 0 22" class="a-ls" stroke-width="4.2"/>', 'Sulcos do rosto'),
    bichectomia: svg(face + '<path d="M50 56c6 10 14 14 22 14M110 56c-6 10-14 14-22 14" class="a-ls" stroke-width="4.2"/>', 'Contorno das bochechas'),
    fios: svg(face + '<path d="M40 70c20-18 30-30 34-52M120 70c-20-18-30-30-34-52" class="a-ls" stroke-width="3" stroke-dasharray="4 5"/>', 'Fios de sustentação'),
    papada: svg('<path d="M48 14c0 34 12 56 32 56s32-22 32-56" class="a-l" stroke-width="4.2"/><path d="M58 78c8 8 36 8 44 0" class="a-ls" stroke-width="4.8"/>', 'Região da papada'),
    microagulhamento: svg('<rect x="60" y="30" width="56" height="26" rx="13" class="a-w"/><path d="M60 43H26" class="a-ls" stroke-width="6"/><path d="M68 62v6M78 62v6M88 62v6M98 62v6M108 62v6" class="a-ls" stroke-width="3"/>', 'Rolo de microagulhamento'),
    'limpeza-facial': svg(face + '<path d="M62 30c0 6-5 8-5 12a5 5 0 0 0 10 0c0-4-5-6-5-12zM98 30c0 6-5 8-5 12a5 5 0 0 0 10 0c0-4-5-6-5-12z" class="a-s"/>', 'Gotas sobre o rosto'),
    _fallback: svg(T(46, 14, 70), 'Dente')
  };
})();
