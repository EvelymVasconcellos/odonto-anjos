/* =====================================================================
   Build — gera dist/ a partir de src/ + src/site.config.js
   Sem dependências (Node 18+). Uso: node scripts/build.mjs
   ===================================================================== */
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');

/* ---------- Config ---------- */
const sandbox = { globalThis: {}, module: { exports: {} } };
vm.runInNewContext(readFileSync(join(SRC, 'site.config.js'), 'utf8'), sandbox);
const C = sandbox.module.exports;
if (!C || !C.brand) throw new Error('site.config.js inválido');

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const need = (v, path) => { if (v === undefined || v === null || v === '') throw new Error(`Campo obrigatório vazio em site.config.js: ${path}`); return v; };
const B = C.brand, T = C.content, U = C.units, demo = !!C.demo.enabled;
const siteUrl = (C.seo.siteUrl || '').replace(/\/$/, '');

/* ---------- Helpers de unidade ---------- */
const addrLine = (u) => `${u.street} – ${u.district}, ${u.city} – ${u.state}${u.zipCode ? `, CEP ${u.zipCode}` : ''}`;
const mapsQuery = (u) => encodeURIComponent(`${u.street}, ${u.district}, ${u.city} - ${u.state}${u.zipCode ? ', ' + u.zipCode : ''}`);
const mapsDir = (u) => `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery(u)}`;
const mapsPlace = (u) => `https://www.google.com/maps/search/?api=1&query=${mapsQuery(u)}`;
const telHref = (p) => 'tel:+55' + String(p).replace(/\D/g, '');

/* ---------- Ícones (Lucide, MIT) ---------- */
const I = {
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  pin: '<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  insta: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  wa: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  locate: '<line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/>',
  arrow: '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  map: '<path d="M14.1 6.3 9.9 4.2a2 2 0 0 0-1.8 0L3.6 6.4A1 1 0 0 0 3 7.3v12.1a1 1 0 0 0 1.4.9l3.7-1.9a2 2 0 0 1 1.8 0l4.2 2.1a2 2 0 0 0 1.8 0l4.5-2.2a1 1 0 0 0 .6-.9V5.3a1 1 0 0 0-1.4-.9l-3.7 1.9a2 2 0 0 1-1.8 0z"/><path d="M15 5.8v15M9 3.2v15"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  star: '<path d="M11.5 2.3a.5.5 0 0 1 .9 0l2.3 4.7a2 2 0 0 0 1.5 1.1l5.2.8a.5.5 0 0 1 .3.9l-3.8 3.7a2 2 0 0 0-.6 1.8l.9 5.2a.5.5 0 0 1-.8.5l-4.6-2.4a2 2 0 0 0-1.9 0l-4.6 2.4a.5.5 0 0 1-.8-.5l.9-5.2a2 2 0 0 0-.6-1.8L2.3 9.8a.5.5 0 0 1 .3-.9l5.2-.8A2 2 0 0 0 9.3 7l2.2-4.7z"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>', chevR: '<path d="m9 18 6-6-6-6"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  zoom: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
  down: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  sparkle: '<path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0L14.06 8.5A2 2 0 0 0 15.5 9.94l6.13 1.58a.5.5 0 0 1 0 .96L15.5 14.06a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z"/>'
};
const icon = (n, cls = '') => `<svg class="lucide${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true">${I[n] || ''}</svg>`;

/* ---------- Tema (tokens vindos de site.config.js) ---------- */
const hexRgb = (h) => { const n = parseInt(h.replace('#', ''), 16); return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`; };
const col = C.theme.colors, fonts = C.theme.fonts;
const themeCss = `:root{--yellow:${col.yellow};--gold:${col.gold};--gold-dark:${col.goldDark};--gold-ink:${col.goldInk};--yellow-soft:${col.yellowSoft};--bg:${col.bg};--bg-soft:${col.bgSoft};--text:${col.text};--text-soft:${col.textSoft};--line:${col.line};--focus:${col.focus};--gold-gradient:${C.theme.gradient};--text-gradient:${C.theme.textGradient};--text-rgb:${hexRgb(col.text)};--gold-rgb:${hexRgb(col.gold)};--yellow-rgb:${hexRgb(col.yellow)};--f-display:${fonts.display};--f-body:${fonts.body};--f-editorial:${fonts.editorial}}`;

/* ---------- Imagens ---------- */
const P = C.photos, M = C.mascot, L = B.logo;
function photo(key, base, { sizes, cls = '', eager = false, pos = '' } = {}) {
  const ph = P[key];
  const srcset = ph.widths.map(w => `${base}${ph.base}-${w}.webp ${w}w`).join(', ');
  const mid = ph.widths[Math.min(1, ph.widths.length - 1)];
  return `<img class="${cls}" src="${base}${ph.base}-${mid}.webp" srcset="${srcset}" sizes="${sizes}" width="${ph.w}" height="${ph.h}" alt="${esc(ph.alt)}"${eager ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"'}${pos ? ` style="object-position:${pos}"` : ''}>`;
}
// Logomarca: PNG oficial recortado; altura de exibição em CSS, srcset por densidade.
function logo(base, h, cls = '') {
  const w = Math.round(L.w * h / L.h);
  return `<img class="${cls}" src="${base}${L.base}-${L.heights[1]}.webp" srcset="${L.heights.map(x => `${base}${L.base}-${x}.webp ${x / h}x`).join(', ')}" width="${w}" height="${h}" alt="${esc(L.alt)}" decoding="async">`;
}
const mascotImg = (base, { cls, size = 640, sizes = '', eager = false, animated = false }) =>
  `<img class="${cls}" src="${base}${M.still[size]}" width="${M.w}" height="${M.h}" alt=""${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${animated ? ` data-anim="${base}${M.loop[size]}"` : ''}>`;

/* ---------- Cabeçalho HTML comum ---------- */
function head({ page, base, path, extraHead = '', css = ['css/styles.css'] }) {
  const meta = C.seo.pages[page];
  const canonical = siteUrl ? `${siteUrl}${path}` : '';
  const og = siteUrl ? `${siteUrl}/${B.ogImage}` : `${base}${B.ogImage}`;
  return `<!doctype html>
<html lang="${C.seo.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<meta name="robots" content="${esc(C.seo.robots)}">
<meta name="theme-color" content="${esc(B.themeColor)}">
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
<meta property="og:type" content="website">
<meta property="og:locale" content="${C.seo.locale}">
<meta property="og:site_name" content="${esc(B.name)}">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
${canonical ? `<meta property="og:url" content="${esc(canonical)}">` : ''}
<meta property="og:image" content="${esc(og)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${base}${B.favicon}" type="image/png" sizes="32x32">
<link rel="icon" href="${base}${B.faviconHi}" type="image/png" sizes="256x256">
<link rel="apple-touch-icon" href="${base}${B.appleTouch}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${esc(fonts.googleHref)}">
${css.map(c => `<link rel="stylesheet" href="${base}${c}">`).join('\n')}
<style id="theme">${themeCss}</style>
<script>(function(d){d.classList.add('js');try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('motion-ok')}catch(e){}})(document.documentElement);</script>
${extraHead}
</head>`;
}

/* ---------- Peças reutilizáveis ---------- */
const badge = (txt) => `<span class="badge">${esc(txt)}</span>`;
const wing = (cls) => `<svg class="wing ${cls}" viewBox="0 0 240 120" aria-hidden="true"><path d="M8 104C52 96 92 70 118 40 136 20 160 8 196 6c-16 8-24 16-28 24 14-2 26 0 34 4-14 4-24 10-30 18 10 0 20 2 26 6-16 2-28 6-38 14 8 2 14 4 18 8-22 0-42 6-58 14"/><path d="M60 98c26-6 52-22 72-44" opacity=".55"/></svg>`;
const sparkle = (cls) => `<svg class="spark ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c.9 5.6 2.4 7.1 8 8-5.6.9-7.1 2.4-8 8-.9-5.6-2.4-7.1-8-8 5.6-.9 7.1-2.4 8-8z" transform="translate(0 4)"/></svg>`;
// Mascote fixo no layout da seção. O contêiner não se move (sem scroll, mola, parallax,
// escala ou rotação); só a animação interna do WebP (asas, corpo) roda em loop.
// prefers-reduced-motion: mostra o primeiro quadro do loop, parado.
// mobile: também aparece no celular.
const spot = (key, base, { mobile = false, eager = false, size = 640 } = {}) =>
  `<div class="fly-spot mascot-spot fly-spot--${key}${mobile ? ' fly-spot--m' : ''}" aria-hidden="true"><picture>` +
  `<source media="(prefers-reduced-motion: reduce)" srcset="${base}${M.still[size]}">` +
  `<img class="fly-spot__still mascot-spot__media" src="${base}${M.loop[size]}" width="${M.w}" height="${M.h}" alt=""${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">` +
  `</picture></div>`;
const head2 = ({ eyebrow, title, lead, id, cls = '', extra = '' }) => `<header class="sec-head ${cls}">
        <p class="eyebrow reveal">${esc(eyebrow)}</p>
        <h2 id="${id}" class="h2 reveal">${esc(title)}</h2>
        ${lead ? `<p class="lead reveal">${esc(lead)}</p>` : ''}
        ${extra}
      </header>`;

/* Abas segmentadas (unidades, categorias e cartão): um só componente. */
function seg({ label, items, cls = '' }) {
  return `<div class="seg ${cls}" role="tablist" aria-label="${esc(label)}">
            ${items.map((it, i) => `<button type="button" role="tab" class="seg__tab" id="${it.id}" aria-controls="${it.controls}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" ${it.data}>${it.html}</button>`).join('\n            ')}
            <span class="seg__ink" data-ink aria-hidden="true"></span>
          </div>`;
}

/* Carrossel de fotos (js/carousel.js): uma foto por vez, troca a cada 5 s. */
function gallery(key, base, label, sizes) {
  const items = C.galleries[key];
  return `<div class="gal" data-carousel role="region" aria-roledescription="carrossel" aria-label="${esc(label)}">
          <div class="gal__view">
            ${items.map((it, i) => `<figure class="gal__slide${i === 0 ? ' is-on' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} de ${items.length}"${i ? ' aria-hidden="true"' : ''}>
              ${photo(it.photo, base, { sizes, pos: it.pos, eager: false })}
            </figure>`).join('\n            ')}
          </div>
          <div class="gal__bar">
            <div class="gal__dots" role="group" aria-label="Escolher foto">
              ${items.map((it, i) => `<button type="button" class="gal__dot" aria-label="Foto ${i + 1} de ${items.length}"${i === 0 ? ' aria-current="true"' : ''}></button>`).join('')}
            </div>
            <div class="gal__ctrl">
              <button type="button" class="gal__btn" data-gal="toggle" aria-label="Pausar troca automática">${icon('pause', 'i-pause')}${icon('play', 'i-play')}</button>
              <button type="button" class="gal__btn" data-gal="prev" aria-label="Foto anterior">${icon('chevL')}</button>
              <button type="button" class="gal__btn" data-gal="next" aria-label="Próxima foto">${icon('chevR')}</button>
            </div>
          </div>
          <p class="sr-only" aria-live="polite" data-gal="status"></p>
        </div>`;
}

function unitPanel(u, i) {
  const hours = u.openingHours && u.openingHours.length
    ? `<table class="hours"><caption>${icon('clock')} Horários</caption><tbody>${u.openingHours.map(h => `<tr><th scope="row">${esc(h.days)}</th><td>${esc(h.hours)}</td></tr>`).join('')}</tbody></table>`
    : `<p class="unit__line">${icon('clock')}<span>Horários: confirme pelo WhatsApp.</span></p>`;
  const contact = u.phone
    ? `<p class="unit__line">${icon('phone')}<span><a class="unit__phone" href="${telHref(u.phone)}">${esc(u.phone)}</a>${u.whatsapp ? ' · WhatsApp' : ''}</span></p>`
    : `<p class="unit__line">${icon('phone')}<span>WhatsApp em breve. Fale pelo Instagram <a href="${esc(C.contact.instagram.url)}" target="_blank" rel="noopener">${esc(C.contact.instagram.handle)}<span class="sr-only"> (abre em nova aba)</span></a>.</span></p>`;
  const notes = [u.addressPending || u.contactPending ? 'Endereço e contato sujeitos à confirmação final.' : '', u.hoursPending && u.openingHours.length ? 'Horários informados na fachada; confirme antes de ir.' : ''].filter(Boolean);
  return `<article class="unit" id="unit-${u.id}" role="tabpanel" aria-labelledby="tab-${u.id}" data-unit="${u.id}" tabindex="0"${i ? ' data-inactive' : ''}>
          <h3 class="unit__name">${esc(u.name)}</h3>
          <address class="unit__addr">${icon('pin')}<span><strong>${esc(u.street)}</strong>${esc(u.district)}, ${esc(u.city)} – ${esc(u.state)}${u.zipCode ? ` · <span class="nowrap">CEP ${esc(u.zipCode)}</span>` : ''}</span></address>
          ${hours}
          ${contact}
          <div class="unit__btns">
            <a class="btn btn--line" href="${mapsDir(u)}" target="_blank" rel="noopener" data-route="${u.id}">${icon('route')} Como chegar<span class="sr-only"> (abre o Google Maps em nova aba)</span></a>
            <a class="btn btn--gold" href="#contato" data-book-unit="${u.id}">${icon('wa')} Agendar nesta unidade</a>
          </div>
          ${notes.length ? `<p class="unit__note">${notes.map(esc).join(' ')}</p>` : ''}
        </article>`;
}

/* ---------- Site institucional ---------- */
function homeBody(base) {
  const H = T.hero, A = T.about, TR = T.treatments, ST = T.structure, PR = T.professional, IG = T.instagram, UN = T.units, BK = T.booking;
  const catCount = (id) => C.treatments.filter(t => t.cat === id).length;
  const svcCard = (t) => `<li class="svc reveal" data-svc="${t.id}"><div class="svc__art"></div><div class="svc__body"><h4>${esc(t.name)}</h4><p>${esc(t.text)}</p><a class="svc__more" href="#contato" data-book-treatment="${t.id}">Pedir informações<span class="sr-only"> sobre ${esc(t.name)}</span> ${icon('chevR')}</a></div></li>`;
  const igTiles = (C.contact.instagram.posts && C.contact.instagram.posts.length)
    ? C.contact.instagram.posts.slice(0, 3).map(p => `<a class="ig__tile" href="${esc(p.url)}" target="_blank" rel="noopener"><img src="${base}${esc(p.image)}" alt="${esc(p.alt)}" loading="lazy" width="400" height="400"><span class="sr-only"> (abre no Instagram)</span></a>`).join('')
    : [['portrait', '50% 28%'], ['ortho', '45% 58%'], ['structure', '55% 40%']].map(([k, pos]) => `<span class="ig__tile">${photo(k, base, { sizes: '(max-width: 760px) 30vw, 150px', pos })}</span>`).join('');
  return `
<a class="skip" href="#conteudo">Pular para o conteúdo</a>

<header class="hd" id="hd">
  <div class="wrap hd__in">
    <a class="hd__brand" href="#inicio" aria-label="${esc(B.name)}, voltar ao início">
      ${logo(base, 48, 'hd__logo')}
      <span class="hd__name">${esc(B.name)}</span>
    </a>
    <nav class="hd__nav" aria-label="Seções da página">
      ${C.nav.map(n => `<a href="${n.href}">${esc(n.label)}</a>`).join('\n      ')}
    </nav>
    <a class="btn btn--gold btn--sm hd__cta" href="#contato" data-book aria-label="${esc(H.headerCta)}">${esc(H.headerCta)}</a>
    <button type="button" class="hd__burger" id="menu-btn" aria-expanded="false" aria-controls="menu" aria-label="Abrir menu"><span></span><span></span></button>
  </div>
</header>

<div class="menu" id="menu" hidden>
  <nav class="menu__links" aria-label="Menu">
    ${C.nav.map(n => `<a href="${n.href}">${esc(n.label)}</a>`).join('\n    ')}
  </nav>
  <div class="menu__foot">
    <a class="btn btn--gold" href="#contato" data-book>${esc(H.headerCta)}</a>
    <a class="menu__ig" href="${esc(C.contact.instagram.url)}" target="_blank" rel="noopener">${icon('insta')} ${esc(C.contact.instagram.handle)}<span class="sr-only"> (abre em nova aba)</span></a>
  </div>
</div>

<main id="conteudo">

  <!-- 1 HOME -->
  <section class="hero" id="inicio" aria-labelledby="hero-title">
    <div class="hero__sky" aria-hidden="true"><span class="glow glow--a"></span><span class="glow glow--b"></span></div>
    <div class="wrap hero__grid">
      <div class="hero__stage">
        <div class="halo" aria-hidden="true"></div>
        ${sparkle('spark--1')}${sparkle('spark--2')}${sparkle('spark--3')}${sparkle('spark--4')}
        ${spot('hero', base, { mobile: true, eager: true })}
      </div>
      <p class="eyebrow hero__eyebrow reveal">${esc(H.eyebrow)}</p>
      <div class="hero__copy">
        <h1 id="hero-title" class="hero__title reveal">${esc(H.titleA)} <em class="hero__highlight">${esc(H.titleB)}</em> ${esc(H.titleC)}</h1>
        <p class="hero__sub reveal">${esc(H.subtitle)}</p>
        <p class="hero__lead reveal">${esc(H.lead)}</p>
        <div class="hero__ctas reveal">
          <a class="btn btn--gold btn--lg" href="#unidades">${icon('pin')} ${esc(H.ctaPrimary)}</a>
          <a class="btn btn--line btn--lg" href="#tratamentos">${esc(H.ctaSecondary)}</a>
        </div>
      </div>
    </div>
    ${demo ? `<div class="demo-pill js-demo-only" id="demo-bar" role="note"><span>${esc(C.demo.pill)}</span><button type="button" class="demo-pill__close" id="demo-close" aria-label="Fechar aviso de demonstração">×</button></div>` : ''}
  </section>

  <!-- 2 SOBRE -->
  <section class="sec sec--white about" id="sobre" aria-labelledby="sobre-title">
    <div class="wrap split">
      <div class="split__text">
        ${head2({ eyebrow: A.eyebrow, title: A.title, lead: A.lead, id: 'sobre-title', cls: 'sec-head--flush' })}
        <ul class="chips reveal">
          ${A.points.map(p => `<li><span class="chips__ico" aria-hidden="true">${icon(p.icon)}</span>${esc(p.text)}</li>`).join('\n          ')}
        </ul>
        <p class="slogan reveal">“${esc(B.slogan)}”</p>
      </div>
      <div class="split__media reveal">${gallery('about', base, 'Fotos da Odonto Anjos', '(max-width: 860px) 92vw, 560px')}</div>
    </div>
  </section>

  <!-- 3 TRATAMENTOS -->
  <section class="sec sec--soft treat" id="tratamentos" aria-labelledby="serv-title">
    <div class="wrap">
      ${head2({ eyebrow: TR.eyebrow, title: TR.title, lead: TR.lead, id: 'serv-title', cls: 'sec-head--spot', extra: spot('treat', base, { size: 420 }) })}
      <article class="ortho reveal" aria-labelledby="ortho-title">
        <div class="ortho__frame">${photo('ortho', base, { sizes: '(max-width: 860px) 92vw, 460px', pos: '45% 62%' })}</div>
        <div class="ortho__copy">
          <p class="eyebrow">${esc(TR.featureEyebrow)}</p>
          <h3 id="ortho-title">${esc(TR.featureTitle)}</h3>
          <p>${esc(TR.featureText)}</p>
          <a class="btn btn--dark" href="#contato" data-book-treatment="ortodontia">${esc(TR.featureCta)} ${icon('chevR')}</a>
        </div>
      </article>
      <div class="treat__tabs reveal">
        ${seg({ label: 'Categorias de tratamento', cls: 'seg--cats', items: C.treatmentCategories.map(c => ({ id: `cat-${c.id}`, controls: `svc-${c.id}`, data: `data-cat-tab="${c.id}"`, html: `<span class="seg__label">${esc(c.label)}</span><span class="seg__n">${catCount(c.id)}</span>` })) })}
      </div>
      ${C.treatmentCategories.map((c, i) => `<div class="svc-group" id="svc-${c.id}" role="tabpanel" aria-labelledby="cat-${c.id}"${i ? ' data-inactive' : ''}>
        <h3 class="svc-group__title">${esc(c.label)}</h3>
        <ul class="svc-grid">
          ${C.treatments.filter(t => t.cat === c.id).map(svcCard).join('\n          ')}
        </ul>
      </div>`).join('\n      ')}
      <p class="note treat__note reveal">${esc(TR.note)}</p>
    </div>
  </section>

  <!-- 4 ESTRUTURA -->
  <section class="sec sec--white struct" id="estrutura" aria-labelledby="struct-title">
    <div class="wrap split split--rev">
      <div class="split__text">
        ${head2({ eyebrow: ST.eyebrow, title: ST.title, lead: ST.lead, id: 'struct-title', cls: 'sec-head--flush' })}
        ${spot('struct', base, { size: 420 })}
      </div>
      <div class="split__media reveal">${gallery('structure', base, 'Fotos dos consultórios', '(max-width: 860px) 92vw, 640px')}</div>
    </div>
  </section>

  <!-- 5 PROFISSIONAL -->
  <section class="sec sec--soft pro" id="profissional" aria-labelledby="pro-title">
    <div class="wrap pro__grid">
      <div class="pro__text">
        <p class="eyebrow reveal">${esc(PR.eyebrow)}</p>
        <h2 id="pro-title" class="h2 pro__name reveal">${esc(PR.name)}</h2>
        <p class="pro__role reveal">${esc(PR.role)}</p>
        <p class="lead reveal">${esc(PR.text)}</p>
      </div>
      <figure class="pro__media reveal">
        <div class="pro__frame">${photo('portrait', base, { sizes: '(max-width: 860px) 76vw, 400px', pos: '50% 28%' })}</div>
      </figure>
      <div class="pro__more">
        ${PR.cro || PR.qualifications ? `<dl class="pro__facts reveal">${PR.cro ? `<div><dt>Registro</dt><dd>${esc(PR.cro)}</dd></div>` : ''}${PR.qualifications ? `<div><dt>Qualificações</dt><dd>${esc(PR.qualifications)}</dd></div>` : ''}</dl>` : ''}
        <a class="btn btn--dark reveal" href="#contato" data-book>${esc(PR.cta)} ${icon('chevR')}</a>
      </div>
    </div>
  </section>

  <!-- 6 INSTAGRAM -->
  <section class="sec sec--white ig" id="instagram" aria-labelledby="ig-title">
    <div class="wrap ig__grid">
      <div class="ig__text">
        <span class="ig__icon reveal" aria-hidden="true">${icon('insta')}</span>
        ${head2({ eyebrow: IG.eyebrow, title: IG.title, lead: IG.lead, id: 'ig-title', cls: 'sec-head--flush' })}
        <a class="btn btn--gold reveal" href="${esc(C.contact.instagram.url)}" target="_blank" rel="noopener">${icon('insta')} ${esc(IG.cta)}<span class="sr-only"> (abre em nova aba)</span></a>
      </div>
      <a class="ig__card reveal" href="${esc(C.contact.instagram.url)}" target="_blank" rel="noopener" aria-label="Abrir o perfil ${esc(C.contact.instagram.handle)} no Instagram (nova aba)">
        <span class="ig__top">
          <span class="ig__avatar">${logo(base, 48, '')}</span>
          <span class="ig__who"><strong>${esc(C.contact.instagram.handle)}</strong><span>${esc(B.name)}</span></span>
          <span class="ig__follow">Seguir</span>
        </span>
        <span class="ig__tiles">${igTiles}</span>
        <span class="ig__cap">${esc(IG.tilesLabel)} · mais no perfil</span>
      </a>
      ${spot('ig', base, { size: 420 })}
    </div>
  </section>

  <!-- 7 DÚVIDAS -->
  <section class="sec sec--soft faq" id="duvidas" aria-labelledby="faq-title">
    <div class="wrap faq__grid">
      <div class="faq__side">
        ${head2({ eyebrow: T.faq.eyebrow, title: T.faq.title, id: 'faq-title', cls: 'sec-head--flush' })}
        ${spot('faq', base, { size: 420 })}
      </div>
      <div class="faq__list">
        ${T.faq.items.map((f, i) => `<details class="faq__item reveal"${i === 0 ? ' open' : ''}>
          <summary><span>${esc(f.q)}</span><span class="faq__icon" aria-hidden="true"></span></summary>
          <div class="faq__a"><p>${esc(f.a)}</p></div>
        </details>`).join('\n        ')}
      </div>
    </div>
  </section>

  <!-- 8 AGENDE -->
  <section class="final" id="contato" aria-labelledby="final-title">
    <div class="final__sky" aria-hidden="true"><span class="glow glow--c"></span></div>
    ${wing('final__wing final__wing--r')}
    <div class="wrap final__grid">
      <div class="final__copy">
        <p class="eyebrow reveal">${esc(BK.eyebrow)}</p>
        <h2 id="final-title" class="h2 final__title reveal">${esc(BK.title)}</h2>
        <p class="lead reveal">${esc(BK.lead)}</p>
      </div>
      <div class="final__stage">
        <div class="halo" aria-hidden="true"></div>
        ${sparkle('spark--5')}${sparkle('spark--6')}
        ${spot('final', base, { mobile: true })}
      </div>
      <form class="book reveal" id="book" novalidate>
        <fieldset class="book__units">
          <legend>${esc(BK.unitLabel)}</legend>
          <div class="book__choices">
            ${U.map((u, i) => `<label class="choice"><input type="radio" name="unit" value="${u.id}"${i === 0 ? ' checked' : ''}><span class="choice__box"><strong>${esc(u.short)}</strong><span>${esc(u.street)}</span></span></label>`).join('\n            ')}
          </div>
        </fieldset>
        <div class="book__field">
          <label for="book-treatment">${esc(BK.treatmentLabel)}</label>
          <div class="select"><select id="book-treatment" name="treatment">
            <option value="">${esc(BK.treatmentNone)}</option>
            ${C.treatmentCategories.map(c => `<optgroup label="${esc(c.label)}">${C.treatments.filter(t => t.cat === c.id).map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}</optgroup>`).join('')}
          </select></div>
        </div>
        <div class="book__go">
          <button type="submit" class="btn btn--gold btn--lg" id="cta-main">${icon('wa')} ${esc(BK.submit)}</button>
          <p class="book__status" id="book-status" role="status" aria-live="polite"></p>
        </div>
        <noscript><p class="book__status">Para agendar, fale com a clínica pelo Instagram ${esc(C.contact.instagram.handle)}.</p></noscript>
      </form>
    </div>
  </section>

  <!-- 9 UNIDADES (última seção) -->
  <section class="sec sec--white units" id="unidades" aria-labelledby="units-title">
    <div class="wrap">
      ${head2({ eyebrow: UN.eyebrow, title: UN.title, lead: UN.lead, id: 'units-title' })}
      <div class="units__grid">
        <div class="units__main">
          <div class="reveal">
          ${seg({ label: 'Escolha a unidade', cls: 'seg--units', items: U.map(u => ({ id: `tab-${u.id}`, controls: `unit-${u.id}`, data: `data-unit-tab="${u.id}"`, html: `<span class="seg__label">${esc(u.short)}</span>` })) })}
          </div>
          <div class="unit-panels reveal">
            ${U.map((u, i) => unitPanel(u, i)).join('\n            ')}
          </div>
        </div>
        <aside class="units__side reveal" aria-label="Mapa">
          <div class="map" id="map">
            <div class="map__ph" id="map-facade">
              <svg class="map__streets" viewBox="0 0 600 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <path d="M-20 300 C 120 280 220 330 360 290 S 560 220 640 240" class="map__road map__road--main"/><path d="M180 -20 C 200 120 170 260 230 480" class="map__road"/><path d="M420 -20 C 400 140 450 300 420 480" class="map__road"/><path d="M-20 120 C 140 140 300 100 640 130" class="map__road"/><path d="M-20 400 C 160 390 360 420 640 380" class="map__road"/>
                <rect x="470" y="300" width="120" height="90" rx="18" class="map__park"/><rect x="30" y="160" width="110" height="80" rx="16" class="map__park"/>
              </svg>
              <span class="map__pin" aria-hidden="true">${icon('pin')}</span>
              <p class="map__label" id="map-label">${esc(U[0].name)}</p>
              <p class="map__fine" id="map-addr">${esc(U[0].street)} · ${esc(U[0].district)}</p>
              <button type="button" class="btn btn--dark btn--sm" id="map-load">${icon('map')} Ver no mapa</button>
              <p class="map__note">O mapa do Google só carrega quando você pede.</p>
            </div>
          </div>
          <p class="near__status" id="near-status" role="status" aria-live="polite"></p>
        </aside>
      </div>
    </div>
  </section>
</main>
${footer(base)}
${waDialog()}
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><symbol id="i-tooth" viewBox="0 0 24 24"><path vector-effect="non-scaling-stroke" d="M7 3C4.5 3 3 5 3 7.5c0 2 .7 3.6 1.4 5.3.6 1.5.8 3.2 1.2 5 .4 1.8 1 3.2 2 3.2s1.4-1.3 1.7-3c.3-1.6.8-3 2.7-3s2.4 1.4 2.7 3c.3 1.7.7 3 1.7 3s1.6-1.4 2-3.2c.4-1.8.6-3.5 1.2-5 .7-1.7 1.4-3.3 1.4-5.3C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z"/></symbol></defs></svg>
<script src="${base}site.config.js" defer></script>
<script src="${base}js/core.js" defer></script>
<script src="${base}js/illustrations.js" defer></script>
<script src="${base}js/main.js" defer></script>
<script src="${base}js/units.js" defer></script>
<script src="${base}js/carousel.js" defer></script>`;
}

function footer(base) {
  const tr = C.legal.technicalResponsible;
  return `<footer class="foot" aria-label="Rodapé">
  <div class="wrap">
    <div class="foot__grid">
      <div class="foot__col foot__brand">
        <span class="foot__logo">${logo(base, 48, '')}<strong>${esc(B.name)}</strong></span>
        <p>${esc(C.footer.tagline)}</p>
        <p class="foot__slogan">“${esc(B.slogan)}”</p>
      </div>
      ${U.map(u => `<div class="foot__col">
        <h3>${esc(u.short)}</h3>
        <p>${esc(u.street)}<br>${esc(u.district)}<br><span class="nowrap">${esc(u.city)} – ${esc(u.state)}</span>${u.zipCode ? `<br><span class="nowrap">CEP ${esc(u.zipCode)}</span>` : ''}</p>
        ${u.phone ? `<p><a href="${telHref(u.phone)}">${esc(u.phone)}</a></p>` : ''}
        <p><a href="${mapsDir(u)}" target="_blank" rel="noopener">Como chegar →<span class="sr-only"> (abre o Google Maps em nova aba)</span></a></p>
      </div>`).join('\n      ')}
      <div class="foot__col">
        <h3>Contato</h3>
        <ul class="foot__list">
          <li><a class="foot__ig" href="${esc(C.contact.instagram.url)}" target="_blank" rel="noopener">${icon('insta')} ${esc(C.contact.instagram.handle)}<span class="sr-only"> (abre em nova aba)</span></a></li>
          <li><a href="${base}cartao-digital/">Cartão digital</a></li>
          <li><a href="${base}politica-de-privacidade/">Política de Privacidade</a></li>
        </ul>
        ${tr.name ? `<p class="foot__rt">Responsável técnico: ${esc(tr.name)} · CRO ${esc(tr.cro)}</p>` : ''}
      </div>
    </div>
    <div class="foot__base">
      <p>© <span id="year">2026</span> ${esc(B.name)}. ${esc(C.footer.disclaimer)}</p>
      ${demo ? `<p class="js-demo-only">${esc(C.demo.notice)} <a href="${esc(C.demo.agency.url)}" target="_blank" rel="noopener">${esc(C.demo.agency.label)} →<span class="sr-only"> (abre em nova aba)</span></a></p>` : ''}
    </div>
  </div>
</footer>`;
}

function waDialog() {
  return `<dialog class="dlg" id="wa-dialog" aria-labelledby="wa-dialog-title" aria-describedby="wa-dialog-text">
  <div class="dlg__box">
    <span class="dlg__ico" aria-hidden="true">${icon('wa')}</span>
    <p class="eyebrow">${demo ? 'Prévia · projeto demonstrativo' : 'Agendamento'}</p>
    <h2 class="dlg__title" id="wa-dialog-title">Abrir o WhatsApp da unidade <span data-wa="unit"></span>?</h2>
    <p class="dlg__text" id="wa-dialog-text">A mensagem já vai preenchida. Você pode editar antes de enviar.</p>
    <blockquote class="wa-preview"><p data-wa="message"></p><footer>Para <span data-wa="number"></span></footer></blockquote>
    ${demo ? `<p class="dlg__note">Demonstração: o número exibido foi divulgado no cartão digital atual e ainda será confirmado pela clínica.</p>` : ''}
    <div class="dlg__btns">
      <a class="btn btn--gold" data-wa="link" href="#" target="_blank" rel="noopener">${icon('wa')} Abrir WhatsApp<span class="sr-only"> (abre em nova aba)</span></a>
      <button type="button" class="btn btn--line" data-close>Voltar</button>
    </div>
  </div>
</dialog>`;
}

/* ---------- Dados estruturados ---------- */
function jsonLd() {
  const graph = U.map(u => {
    const o = {
      '@type': 'Dentist',
      '@id': `${siteUrl || ''}/#${u.id}`,
      name: u.name,
      parentOrganization: { '@type': 'Organization', name: B.name },
      address: { '@type': 'PostalAddress', streetAddress: u.street, addressLocality: `${u.district}, ${u.city}`, addressRegion: u.state, addressCountry: 'BR', ...(u.zipCode ? { postalCode: u.zipCode } : {}) },
      sameAs: [C.contact.instagram.url]
    };
    if (siteUrl) { o.url = siteUrl + '/'; o.image = `${siteUrl}/${P.hero.base}-1000.webp`; o.logo = `${siteUrl}/${L.base}-144.webp`; }
    if (u.phone && !u.contactPending) o.telephone = '+55' + u.phone.replace(/\D/g, '');
    if (u.openingHours.length && !u.hoursPending) o.openingHours = u.openingHours.map(h => h.schema);
    if (u.geo) o.geo = { '@type': 'GeoCoordinates', latitude: u.geo.lat, longitude: u.geo.lng };
    return o;
  });
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
}

/* ---------- Cartão digital (mesma estrutura; identidade visual do site) ---------- */
function cardBody(base) {
  return `
<a class="skip" href="#cartao">Pular para o conteúdo</a>
<main class="vcard" id="cartao">
  <div class="vcard__card">
    <header class="vcard__head">
      ${logo(base, 48, 'vcard__logo')}
      <div>
        <h1 class="vcard__name">${esc(B.name)}</h1>
        <p class="vcard__pro">${esc(B.professional)}</p>
      </div>
    </header>
    <div class="vcard__hero">
      <div class="vcard__photo">${photo('hero', base, { sizes: '(max-width: 520px) 92vw, 440px', eager: true, pos: '50% 30%' })}</div>
      <div class="mascot-inline" aria-hidden="true">${mascotImg(base, { cls: 'mascot-inline__media', size: 420, eager: true, animated: true })}</div>
      <p class="vcard__slogan">“${esc(B.slogan)}”</p>
    </div>

    <section class="vcard__sec" aria-labelledby="vc-units">
      <h2 class="vcard__h" id="vc-units">Escolha a unidade</h2>
      ${seg({ label: 'Escolha a unidade', cls: 'seg--units seg--card', items: U.map(u => ({ id: `tab-${u.id}`, controls: `unit-${u.id}`, data: `data-unit-tab="${u.id}"`, html: `<span class="seg__label">${esc(u.short)}</span>` })) })}
      ${U.map((u, i) => `<div class="vunit" id="unit-${u.id}" role="tabpanel" aria-labelledby="tab-${u.id}" data-unit="${u.id}"${i ? ' data-inactive' : ''}>
        <p class="vunit__addr">${icon('pin')}<span>${esc(u.street)}<br>${esc(u.district)}, ${esc(u.city)} – ${esc(u.state)}${u.zipCode ? `<br>CEP ${esc(u.zipCode)}` : ''}</span></p>
        <p class="vunit__hours">${icon('clock')}<span>${u.openingHours.length ? u.openingHours.map(h => `${esc(h.days)}: ${esc(h.hours)}`).join('<br>') : 'Horários: confirme pelo WhatsApp'}</span></p>
        <div class="vunit__btns">
          ${u.whatsapp ? `<a class="btn btn--gold" href="#" data-book-unit="${u.id}">${icon('wa')} WhatsApp ${esc(u.short)}</a>` : `<p class="vunit__miss">${icon('info')} WhatsApp desta unidade em breve.</p>`}
          <a class="btn btn--line" href="${mapsDir(u)}" target="_blank" rel="noopener">${icon('route')} Como chegar<span class="sr-only"> (abre o Google Maps em nova aba)</span></a>
        </div>
      </div>`).join('')}
    </section>

    <section class="vcard__sec" aria-labelledby="vc-svc">
      <h2 class="vcard__h" id="vc-svc">Tratamentos</h2>
      ${C.treatmentCategories.map((c, i) => `<details class="vchips"${i === 0 ? ' open' : ''}><summary>${esc(c.label)} <span class="seg__n">${C.treatments.filter(t => t.cat === c.id).length}</span></summary><ul>${C.treatments.filter(t => t.cat === c.id).map(t => `<li>${esc(t.name)}</li>`).join('')}</ul></details>`).join('')}
    </section>

    <div class="vcard__links">
      <a class="btn btn--line" href="${esc(C.contact.instagram.url)}" target="_blank" rel="noopener">${icon('insta')} ${esc(C.contact.instagram.handle)}<span class="sr-only"> (abre em nova aba)</span></a>
      <a class="btn btn--dark" href="${base}">${icon('globe')} Ver site completo</a>
      <button type="button" class="btn btn--line" id="vc-share" hidden>${icon('share')} Compartilhar</button>
    </div>

    <section class="vqr" aria-labelledby="vc-qr">
      <h2 class="vcard__h" id="vc-qr">QR Code do cartão</h2>
      <div class="vqr__box" id="vc-qr-box" data-url="${C.seo.siteUrlConfirmed && siteUrl ? esc(siteUrl + '/cartao-digital/') : ''}">
        <p>O QR Code será gerado quando o endereço definitivo do site for publicado.</p>
      </div>
    </section>
    ${demo ? `<p class="vcard__demo">${esc(C.demo.notice)}</p>` : ''}
  </div>
</main>
${waDialog()}
<script src="${base}site.config.js" defer></script>
<script src="${base}js/core.js" defer></script>
<script src="${base}js/units.js" defer></script>
<script src="${base}js/card.js" defer></script>`;
}

/* ---------- Política ---------- */
function privacyBody(base) {
  return `
<header class="pnav"><a href="${base}">${logo(base, 48, 'pnav__logo')} ← Voltar para ${esc(B.name)}</a></header>
<main class="policy">
  <h1>Política de Privacidade</h1>
  ${demo ? `<p class="policy__note">${esc(C.demo.notice)} Este texto é um modelo e precisa ser revisado pela clínica, de preferência com orientação jurídica, antes da publicação definitiva.</p>` : ''}
  <h2>Quem somos</h2>
  <p>${esc(B.name)}, com unidades em ${U.map(u => `${esc(u.short)} (${esc(addrLine(u))})`).join(' e ')}.</p>
  <h2>Quais dados este site coleta</h2>
  <p>O site não possui formulários de cadastro e não solicita dados de saúde. O agendamento abre o WhatsApp com uma mensagem que você pode editar antes de enviar; a conversa segue as regras do WhatsApp.</p>
  <h2>Imagens</h2>
  <p>As fotografias da profissional e dos consultórios pertencem à Odonto Anjos.</p>
  <h2>Cookies e armazenamento local</h2>
  <p>O site guarda apenas preferências temporárias no seu navegador (por exemplo, se o aviso de demonstração foi fechado). Não usamos cookies de publicidade.</p>
  <h2>Serviços de terceiros</h2>
  <p>Fontes do Google Fonts e, quando você pede, o mapa do Google Maps. O site não incorpora conteúdo do Instagram: os links abrem o perfil no próprio Instagram. Esses serviços podem registrar dados técnicos de acesso conforme as próprias políticas.</p>
  <h2>Seus direitos</h2>
  <p>Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode solicitar informações sobre o tratamento dos seus dados pelos canais oficiais da clínica.</p>
  <h2>Atualizações</h2>
  <p>Última revisão: outubro de 2026.</p>
</main>`;
}

/* ---------- Escrita ---------- */
function page(file, html) { const p = join(DIST, file); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, html); }

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
['css', 'js', 'assets'].forEach(d => cpSync(join(SRC, d), join(DIST, d), { recursive: true }));
cpSync(join(SRC, 'site.config.js'), join(DIST, 'site.config.js'));

need(B.name, 'brand.name'); U.forEach((u, i) => { need(u.name, `units[${i}].name`); need(u.street, `units[${i}].street`); });
Object.entries(P).forEach(([k, ph]) => ph.widths.forEach(w => { if (!existsSync(join(SRC, `${ph.base}-${w}.webp`))) throw new Error(`Foto ausente: ${ph.base}-${w}.webp (photos.${k})`); }));
Object.entries(C.galleries).forEach(([g, items]) => items.forEach(it => { if (!P[it.photo]) throw new Error(`galleries.${g}: foto "${it.photo}" não existe em photos`); }));
[...Object.values(M.loop), ...Object.values(M.still), ...L.heights.map(h => `${L.base}-${h}.webp`), B.favicon, B.faviconHi, B.appleTouch].forEach(f => { if (!existsSync(join(SRC, f))) throw new Error(`Arquivo ausente: ${f}`); });

const preload = (base) => `<link rel="preload" as="image" type="image/webp" href="${base}${M.still[420]}">
${jsonLd()}`;

page('index.html', head({ page: 'home', base: '', path: '/', extraHead: preload('') }) + '\n<body>' + homeBody('') + '\n</body>\n</html>\n');
page('cartao-digital/index.html', head({ page: 'card', base: '../', path: '/cartao-digital/', css: ['css/styles.css', 'css/card.css'], extraHead: jsonLd() }) + '\n<body class="vbody">' + cardBody('../') + '\n</body>\n</html>\n');
page('politica-de-privacidade/index.html', head({ page: 'privacy', base: '../', path: '/politica-de-privacidade/' }) + '\n<body class="pbody">' + privacyBody('../') + '\n</body>\n</html>\n');
page('404.html', head({ page: 'home', base: '/', path: '/404' }).replace(/<title>.*<\/title>/, `<title>Página não encontrada | ${esc(B.name)}</title>`) + `\n<body class="pbody"><header class="pnav"><a href="/">${logo('/', 48, 'pnav__logo')} ${esc(B.name)}</a></header><main class="policy"><h1>Página não encontrada</h1><p>O endereço pode ter mudado.</p><p><a class="btn btn--gold" href="/">Voltar ao início</a> <a class="btn btn--line" href="/cartao-digital/">Cartão digital</a></p></main></body></html>\n`);

/* SEO: robots, sitemap; Cloudflare Pages: cabeçalhos e redirecionamentos */
const indexable = !/noindex/.test(C.seo.robots);
writeFileSync(join(DIST, 'robots.txt'), indexable ? `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}` : 'User-agent: *\nDisallow: /\n');
if (siteUrl) {
  const urls = ['/', '/cartao-digital/', '/politica-de-privacidade/'];
  writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${siteUrl}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
}
writeFileSync(join(DIST, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(self), camera=(), microphone=()
  X-Frame-Options: SAMEORIGIN
${indexable ? '' : '  X-Robots-Tag: noindex, nofollow\n'}
/assets/*
  Cache-Control: public, max-age=2592000

/css/*
  Cache-Control: public, max-age=86400

/js/*
  Cache-Control: public, max-age=86400
`);
writeFileSync(join(DIST, '_redirects'), '/cartao-digital /cartao-digital/ 301\n/cartao /cartao-digital/ 301\n');
console.log(`✓ dist/ gerado (${demo ? 'modo demonstração' : 'produção'})`);
