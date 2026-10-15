/* ─────────────────────────────────────────────────────────────
   Pandai Gadai · Gadai HP LP · shared runtime (Variants A, B and C)
   One config object, event helper, UTM passthrough, WA links,
   sticky CTA, video players, variant assignment helper.
   Every [CONFIRM] value is listed in CONFIRM_LIST.md.
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────
  var CONFIG = {
    // Google Tag Manager container ID, e.g. 'GTM-ABC1234'. Loaded on every page that uses this file.
    // Leave as is to skip loading GTM (events still queue in window.dataLayer).
    GTM_ID: 'GTM-MQXLCGLX',                             // [CONFIRM]
    // Variants in the live test. Must match ACTIVE_VARIANTS in gadai-hp.html (the split page).
    ACTIVE_VARIANTS: ['a', 'b'],
    SIMULASI_URL: 'https://pandaigadai.com/app/simulasi/gadai',               // [CONFIRM] live simulasi URL (use the full https:// address)
    WA_NUMBER: '6285715322146',                        // [CONFIRM] CS WhatsApp number for LP traffic
    BRANCH_LOCATOR_URL: 'https://pandaigadai.com/outlet', // [CONFIRM]
    APP_URL: '#',                                      // [CONFIRM]
    PRICE_API: 'https://api.pandaigadai.com/landing/v1/price-references', // [CONFIRM] approved for LP use + CORS
    // Video sources. Leave '' until the video team delivers (see brief section 4).
    VIDEO_SRC_V1: 'https://youtu.be/h8nM4xGgr4E', VIDEO_POSTER_V1: '',             // Hero UGC 9:16
    VIDEO_SRC_V2: 'https://youtu.be/aLUr0-W36lw', VIDEO_POSTER_V2: '',             // Process explainer 16:9 or 1:1
    VIDEO_SRC_V3: 'https://www.youtube.com/watch?v=uI_TSc1WED4', VIDEO_POSTER_V3: '',             // Storage and care 16:9 or 1:1
    // Approved real Google Maps reviews only. Empty = section hidden.
    // Shape: { stars: 5, quote: '', name: 'First name', branch: 'Cabang ...' }
    REVIEWS: [],
    // Draft review mode: shows labelled placeholders for missing assets.
    // Set to false for production so empty video / review blocks hide themselves.
    DRAFT_MODE: false,
    LP_ID: 'hp'
  };
  window.PG_CONFIG = CONFIG;

  var root = document.documentElement;
  var VARIANT = root.getAttribute('data-lp-variant') || 'a';
  if (CONFIG.DRAFT_MODE) root.classList.add('is-draft');

  // ── VARIANT ASSIGNMENT ──────────────────────────────────────
  // Even split across ACTIVE_VARIANTS, sticky by first party cookie for 30 days;
  // ?v=a|b forces a variant. gadai-hp.html runs the same logic and redirects.
  function getCookie(n) {
    var m = document.cookie.match('(?:^|; )' + n + '=([^;]*)');
    return m ? decodeURIComponent(m[1]) : null;
  }
  function assignVariant() {
    var active = CONFIG.ACTIVE_VARIANTS;
    var forced = new URLSearchParams(location.search).get('v');
    if (forced && active.indexOf(forced) > -1) return forced;
    var v = getCookie('pg_lp_hp_variant');
    if (!v || active.indexOf(v) === -1) {
      v = active[Math.floor(Math.random() * active.length)];
      document.cookie = 'pg_lp_hp_variant=' + v + ';path=/;max-age=' + 60 * 60 * 24 * 30 + ';SameSite=Lax';
    }
    return v;
  }

  // ── EVENTS ──────────────────────────────────────────────────
  window.dataLayer = window.dataLayer || [];
  // Google Tag Manager loader (standard snippet, driven by CONFIG.GTM_ID)
  if (CONFIG.GTM_ID && CONFIG.GTM_ID.indexOf('XXXX') === -1) {
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var gtm = document.createElement('script');
    gtm.async = true;
    gtm.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(CONFIG.GTM_ID);
    document.head.appendChild(gtm);
  }
  function track(event, params) {
    var payload = Object.assign({ event: event, lp_id: CONFIG.LP_ID, lp_variant: VARIANT }, params || {});
    window.dataLayer.push(payload);
  }

  // ── URL HELPERS (keep UTM / gclid on every outbound CTA) ────
  var PASS_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
  function withTracking(url, extra) {
    var u = new URL(url, location.href);
    var here = new URLSearchParams(location.search);
    PASS_KEYS.forEach(function (k) { if (here.has(k) && !u.searchParams.has(k)) u.searchParams.set(k, here.get(k)); });
    Object.keys(extra || {}).forEach(function (k) { if (extra[k]) u.searchParams.set(k, extra[k]); });
    u.searchParams.set('lp_id', CONFIG.LP_ID);
    u.searchParams.set('lp_variant', VARIANT);
    return u.toString();
  }
  function simulasiUrl(extra) { return withTracking(CONFIG.SIMULASI_URL, Object.assign({ device: 'hp' }, extra || {})); }
  function waUrl(text) { return 'https://wa.me/' + CONFIG.WA_NUMBER + '?text=' + encodeURIComponent(text); }

  // ── WIRING ──────────────────────────────────────────────────
  function wireLinks() {
    // Simulasi CTAs: <a data-cta="simulasi" data-brand="samsung">
    document.querySelectorAll('[data-cta="simulasi"]').forEach(function (a) {
      a.href = simulasiUrl({ brand: a.getAttribute('data-brand') });
      a.addEventListener('click', function () { track('cta_click', { cta: 'simulasi', placement: a.getAttribute('data-placement') || '' }); });
    });
    // WA CTAs: <a data-cta="wa"> uses the page level prefill on <body data-wa-text>
    document.querySelectorAll('[data-cta="wa"]').forEach(function (a) {
      a.href = waUrl(a.getAttribute('data-wa-text') || document.body.getAttribute('data-wa-text') || '');
      a.target = '_blank'; a.rel = 'noopener';
      a.addEventListener('click', function () { track('wa_click', { placement: a.getAttribute('data-placement') || '' }); });
    });
    document.querySelectorAll('[data-cta="branch"]').forEach(function (a) {
      a.href = withTracking(CONFIG.BRANCH_LOCATOR_URL);
      a.addEventListener('click', function () { track('branch_click', { placement: a.getAttribute('data-placement') || '' }); });
    });
    document.querySelectorAll('[data-cta="app"]').forEach(function (a) { a.href = CONFIG.APP_URL; });
  }

  // Sticky CTA appears once the element marked [data-sticky-anchor] scrolls above the viewport.
  function wireSticky() {
    var anchor = document.querySelector('[data-sticky-anchor]');
    var bar = document.getElementById('sticky-cta');
    if (!anchor || !bar || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      var show = !e.isIntersecting && e.boundingClientRect.top < 0;
      bar.classList.toggle('show', show);
      bar.setAttribute('aria-hidden', show ? 'false' : 'true');
      bar.querySelectorAll('a,button').forEach(function (el) { el.tabIndex = show ? 0 : -1; });
    }).observe(anchor);
  }

  // Scroll depth diagnostics (50 / 75)
  function wireScrollDepth() {
    var fired = {};
    window.addEventListener('scroll', function () {
      var h = document.documentElement;
      var pct = (h.scrollTop + window.innerHeight) / h.scrollHeight * 100;
      [50, 75].forEach(function (p) { if (pct >= p && !fired[p]) { fired[p] = true; track('scroll_depth', { percent: p }); } });
    }, { passive: true });
  }

  // ── VIDEO ───────────────────────────────────────────────────
  function slowConnection() {
    var c = navigator.connection;
    return !!(c && (c.saveData || /(^|-)(2g|3g)$/.test(c.effectiveType || '')));
  }
  function attachVideoEvents(video, id) {
    var sent = {};
    video.addEventListener('play', function () { if (!sent.play) { sent.play = 1; track('video_play', { video_id: id }); } });
    video.addEventListener('timeupdate', function () {
      if (!sent.half && video.duration && video.currentTime / video.duration >= 0.5) { sent.half = 1; track('video_50', { video_id: id }); }
    });
    video.addEventListener('ended', function () { if (!sent.done) { sent.done = 1; track('video_complete', { video_id: id }); } });
  }

  // Hero video (V1): poster first, muted autoplay only after window load, tap to unmute,
  // end card after the first full play (video keeps looping behind it).
  function initHeroVideo() {
    var host = document.querySelector('[data-hero-video]');
    if (!host) return;
    if (!CONFIG.VIDEO_SRC_V1) {
      host.classList.add('no-src');
      if (!CONFIG.DRAFT_MODE && CONFIG.VIDEO_POSTER_V1 === '') host.hidden = true;
      return;
    }
    var video = document.createElement('video');
    video.muted = true; video.loop = true; video.playsInline = true;
    video.setAttribute('playsinline', ''); video.preload = 'none';
    if (CONFIG.VIDEO_POSTER_V1) video.poster = CONFIG.VIDEO_POSTER_V1;
    video.src = CONFIG.VIDEO_SRC_V1;
    host.querySelector('.hv-media').innerHTML = '';
    host.querySelector('.hv-media').appendChild(video);
    host.classList.add('has-src');
    attachVideoEvents(video, 'v1_hero');

    var plays = 0;
    video.addEventListener('timeupdate', function () {
      if (video.duration && video.currentTime > video.duration - 0.3 && plays === 0) { plays = 1; host.classList.add('show-endcard'); track('video_complete', { video_id: 'v1_hero' }); }
    });
    var soundBtn = host.querySelector('.hv-sound');
    host.querySelector('.hv-media').addEventListener('click', function () {
      if (video.paused) { video.play(); host.classList.add('playing'); return; }
      video.muted = !video.muted; host.classList.toggle('unmuted', !video.muted);
    });
    if (soundBtn) soundBtn.addEventListener('click', function (e) { e.stopPropagation(); video.muted = !video.muted; host.classList.toggle('unmuted', !video.muted); });

    window.addEventListener('load', function () {
      if (slowConnection()) { host.classList.add('tap-to-play'); return; }
      video.play().then(function () { host.classList.add('playing'); }).catch(function () { host.classList.add('tap-to-play'); });
    });
  }

  // Video cards (V2, V3): tap to play in an inline lightbox, lazy loaded on tap.
  function initVideoCards() {
    var cards = document.querySelectorAll('[data-video-card]');
    if (!cards.length) return;
    var anyMissing = false;
    cards.forEach(function (card) {
      var key = card.getAttribute('data-video-card'); // 'V2' | 'V3'
      var src = CONFIG['VIDEO_SRC_' + key], poster = CONFIG['VIDEO_POSTER_' + key];
      if (!src) anyMissing = true;
      if (poster) { var t = card.querySelector('.vc-thumb'); t.style.backgroundImage = 'url("' + poster + '")'; t.classList.add('has-poster'); }
      card.addEventListener('click', function () { openLightbox(key, src, card.querySelector('.vc-title').textContent); });
    });
    var row = document.querySelector('[data-video-row]');
    if (row && anyMissing && !CONFIG.DRAFT_MODE) row.hidden = true; // production rule: hide until videos exist
  }
  function openLightbox(key, src, title) {
    var lb = document.createElement('div');
    lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', title);
    var body = src
      ? '<video controls autoplay playsinline preload="metadata" src="' + src + '"></video>'
      : '<div class="ph"><span class="ph-tag">Placeholder</span><span class="ph-title">Video ' + key + ' belum tersedia</span><span class="ph-note">Inline player. Isi VIDEO_SRC_' + key + ' di file konfigurasi.</span></div>';
    lb.innerHTML = '<div class="lightbox-inner"><button class="lightbox-close" aria-label="Tutup"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' + body +
      '<div class="lb-endcard" hidden><a class="btn btn-primary btn-lg" data-cta="simulasi" data-placement="video_endcard_' + key.toLowerCase() + '">Cek Taksiran Sekarang</a></div></div>';
    document.body.appendChild(lb);
    var v = lb.querySelector('video');
    if (v) {
      attachVideoEvents(v, key.toLowerCase());
      v.addEventListener('ended', function () { lb.querySelector('.lb-endcard').hidden = false; });
    }
    wireLinks();
    function close() { if (v) v.pause(); lb.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    lb.querySelector('.lightbox-close').addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    lb.querySelector('.lightbox-close').focus();
  }

  // Review cards: real approved reviews only. Hidden when empty (draft shows a labelled placeholder).
  function initReviews() {
    var sec = document.querySelector('[data-reviews]');
    if (!sec) return;
    var list = sec.querySelector('.review-list');
    var reviews = CONFIG.REVIEWS.slice(0, 3);
    if (!reviews.length) { if (!CONFIG.DRAFT_MODE) sec.hidden = true; return; }
    list.innerHTML = reviews.map(function (r) {
      var stars = new Array((r.stars || 5) + 1).join('★');
      return '<figure class="card review"><div class="stars" aria-label="' + r.stars + ' bintang">' + stars + '</div>' +
        '<blockquote class="body-2">' + escapeHtml(r.quote) + '</blockquote>' +
        '<figcaption class="caption-1 text-subtle"><strong class="subtitle-2" style="color:var(--text-default)">' + escapeHtml(r.name) + '</strong> · ' + escapeHtml(r.branch) + ' · Google Maps</figcaption></figure>';
    }).join('');
    sec.classList.add('has-reviews');
  }
  function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  // ── EXPORTS ─────────────────────────────────────────────────
  window.PG = { CONFIG: CONFIG, VARIANT: VARIANT, track: track, simulasiUrl: simulasiUrl, waUrl: waUrl, withTracking: withTracking, assignVariant: assignVariant, wireLinks: wireLinks };

  document.addEventListener('DOMContentLoaded', function () {
    wireLinks(); wireSticky(); wireScrollDepth(); initHeroVideo(); initVideoCards(); initReviews();
    track('lp_view');
  });
})();
