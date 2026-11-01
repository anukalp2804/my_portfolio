/* =========================================================
   ORGANIZATION PAGES (Apache + OWASP) - shared logic
   - theme toggle (same "theme" setting as the home page)
   - particle background (same look as the home page)
   - loads merged / pending / issues lists, shows counts,
     search, keyboard-friendly tabs, safe rendering
========================================================= */
(function () {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Particle background ---------- */
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let particleColor = 'rgba(255,255,255,0.5)';
  let lineColor = 'rgba(255,255,255,0.09)';
  let lastWidth = window.innerWidth;
  let rafId = null;
  let resizeTimer = null;
  const MAX_PARTICLES = 70;
  const LINK_DISTANCE = 120;

  function updateParticlesTheme(theme) {
    const rgb = getComputedStyle(root).getPropertyValue('--particle').trim() || '255, 255, 255';
    const light = theme === 'light';
    particleColor = 'rgba(' + rgb + ', ' + (light ? 0.32 : 0.55) + ')';
    lineColor = 'rgba(' + rgb + ', 0.09)';
    if (reduceMotion && particles.length) drawFrame(false);
  }
  function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  function initParticles() {
    const count = Math.min(MAX_PARTICLES, Math.floor((canvas.width * canvas.height) / 18000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1, vx: Math.random() * 1.2 - 0.6, vy: Math.random() * 1.2 - 0.6
      });
    }
  }
  function drawFrame(move) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (move) {
        p.x += p.vx; p.y += p.vy;
        if (p.x > canvas.width || p.x < 0) p.vx *= -1;
        if (p.y > canvas.height || p.y < 0) p.vy *= -1;
      }
      ctx.fillStyle = particleColor;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const dx = p.x - particles[j].x, dy = p.y - particles[j].y;
        if (dx * dx + dy * dy < LINK_DISTANCE * LINK_DISTANCE) {
          ctx.beginPath(); ctx.strokeStyle = lineColor; ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
        }
      }
    }
  }
  function animate() { drawFrame(true); rafId = requestAnimationFrame(animate); }

  resizeCanvas();
  initParticles();
  updateParticlesTheme(root.getAttribute('data-theme'));
  if (reduceMotion) {
    drawFrame(false);
  } else {
    animate();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(rafId); rafId = null; }
      else if (!rafId) animate();
    });
  }
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resizeCanvas();
      if (window.innerWidth !== lastWidth) { lastWidth = window.innerWidth; initParticles(); }
      if (reduceMotion) drawFrame(false);
    }, 150);
  });

  /* ---------- Theme toggle ---------- */
  const toggle = document.getElementById('theme-toggle');
  const icon = toggle.querySelector('i');
  function setThemeUI(theme) {
    icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    toggle.setAttribute('aria-pressed', String(theme === 'light'));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#fffbf2' : '#0c0b14');
  }
  setThemeUI(root.getAttribute('data-theme') || 'dark');
  toggle.addEventListener('click', function () {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    setThemeUI(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    updateParticlesTheme(next);
  });

  /* ---------- Footer year, scroll progress, navbar, back-to-top ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  (function () {
    const progress = document.querySelector('.scroll-progress');
    const navbar = document.querySelector('.navbar');
    const toTop = document.querySelector('.back-to-top');
    let ticking = false;
    function onScroll() {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      navbar.classList.toggle('scrolled', y > 20);
      if (toTop) toTop.classList.toggle('visible', y > 500);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  })();

  /* ---------- Data lists ---------- */
  const tabs = Array.from(document.querySelectorAll('.org-tab'));
  const keys = tabs.map(function (t) { return t.dataset.key; });
  const list = document.getElementById('results-panel');
  const search = document.getElementById('org-search');
  const resultEl = document.getElementById('org-result');
  const state = {};
  let active = null;

  const GH = /https?:\/\/github\.com\/([^\/\s]+)\/([^\/\s]+)\/(pull|issues)\/(\d+)/i;
  const URL_RE = /(https?:\/\/[^\s]+|www\.[^\s]+)/;

  // Turn one line of the .txt file into a displayable record (text only - never HTML)
  function parseLine(line) {
    const found = line.match(URL_RE);
    const item = { url: null, repo: null, kind: null, title: '', display: line, haystack: line.toLowerCase() };
    if (!found) { item.title = line; return item; }
    item.url = found[0].indexOf('www.') === 0 ? 'https://' + found[0] : found[0];
    item.title = line.replace(found[0], '').replace(/^[\s:\-\u2013|,]+|[\s:\-\u2013|,]+$/g, '');
    item.display = item.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const gh = item.url.match(GH);
    if (gh) {
      item.repo = gh[1] + '/' + gh[2];
      item.kind = (gh[3].toLowerCase() === 'pull' ? 'PR' : 'Issue') + ' #' + gh[4];
    } else {
      try { item.repo = new URL(item.url).hostname.replace(/^www\./, ''); } catch (e) {}
    }
    return item;
  }

  // The data folder is looked up next to the page first, then at the project root
  function candidates(path) {
    const list = [path];
    if (path.indexOf('../Data/') === 0) list.push('../' + path);
    return list;
  }
  async function fetchText(path) {
    const tries = candidates(path);
    for (let i = 0; i < tries.length; i++) {
      try {
        const res = await fetch(tries[i], { cache: 'no-cache' });
        if (!res.ok) continue;
        const text = await res.text();
        if (/^\s*<(!doctype|html)/i.test(text)) continue; // a server returned an HTML error page
        return text;
      } catch (e) { /* try the next location */ }
    }
    throw new Error('Not found: ' + path);
  }

  function countTo(el, n) {
    if (reduceMotion || n === 0) { el.textContent = n; return; }
    const start = performance.now(), duration = 900;
    (function step(now) {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(n * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }
  function setCount(key, n) {
    const badge = document.querySelector('.org-tab[data-key="' + key + '"] .count');
    const stat = document.querySelector('[data-stat="' + key + '"]');
    if (n === null) { badge.textContent = '!'; if (stat) stat.textContent = '\u2013'; return; }
    badge.textContent = n;
    if (stat) countTo(stat, n);
  }

  function loadKey(tab) {
    const key = tab.dataset.key;
    state[key] = { status: 'loading', items: [] };
    return fetchText(tab.dataset.file).then(function (text) {
      const items = text.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean).map(parseLine);
      state[key] = { status: 'ok', items: items };
      setCount(key, items.length);
    }).catch(function () {
      state[key] = { status: 'error', items: [], path: tab.dataset.file };
      setCount(key, null);
    }).then(function () { if (active === key) render(); });
  }

  /* ---- rendering (DOM methods + textContent: file text can never inject HTML) ---- */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function stateBox(iconClass, title, message, code) {
    const box = el('div', 'org-state');
    const i = el('i', iconClass); i.setAttribute('aria-hidden', 'true');
    box.append(i, el('strong', '', title), el('p', '', message));
    if (code) box.append(el('code', '', code));
    return box;
  }
  function card(item, index) {
    const node = el(item.url ? 'a' : 'div', 'org-card');
    node.style.setProperty('--i', Math.min(index, 10));
    if (item.url) { node.href = item.url; node.target = '_blank'; node.rel = 'noopener noreferrer'; }
    node.append(el('span', 'org-num', String(index + 1).padStart(2, '0')));
    const body = el('div', 'org-body');
    if (item.repo || item.kind) {
      const meta = el('div', 'org-meta');
      if (item.repo) meta.append(el('span', 'org-chip', item.repo));
      if (item.kind) meta.append(el('span', 'org-kind', item.kind));
      body.append(meta);
    }
    if (item.title) body.append(el('p', 'org-text is-title', item.title));
    else body.append(el('p', 'org-text', item.display));
    node.append(body);
    if (item.url) {
      const go = el('i', 'fas fa-arrow-up-right-from-square org-go');
      go.setAttribute('aria-hidden', 'true');
      node.append(go);
    }
    return node;
  }

  function render() {
    const s = state[active];
    list.replaceChildren();
    list.setAttribute('aria-busy', String(!s || s.status === 'loading'));
    if (!s || s.status === 'loading') {
      for (let i = 0; i < 6; i++) list.append(el('div', 'org-skel'));
      resultEl.textContent = '';
      return;
    }
    if (s.status === 'error') {
      list.append(stateBox('fas fa-triangle-exclamation', 'Could not load this list',
        'The data file was not found. If you opened this page by double-clicking it, start a local server (for example VS Code "Live Server") - browsers block loading files from your disk.', s.path));
      resultEl.textContent = '';
      return;
    }
    const q = search.value.trim().toLowerCase();
    const items = q ? s.items.filter(function (it) { return it.haystack.indexOf(q) !== -1; }) : s.items;
    resultEl.textContent = q
      ? items.length + ' of ' + s.items.length + ' shown'
      : s.items.length + (s.items.length === 1 ? ' record' : ' records');
    if (!s.items.length) {
      list.append(stateBox('fas fa-seedling', 'Nothing here yet', 'No records have been added to this list yet.'));
      return;
    }
    if (!items.length) {
      list.append(stateBox('fas fa-magnifying-glass', 'No matches', 'Nothing matches \u201c' + search.value.trim() + '\u201d. Try a shorter search.'));
      return;
    }
    const frag = document.createDocumentFragment();
    items.forEach(function (item, i) { frag.append(card(item, i)); });
    list.append(frag);
  }

  function select(key, opts) {
    opts = opts || {};
    active = key;
    tabs.forEach(function (t) {
      const on = t.dataset.key === key;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) list.setAttribute('aria-labelledby', t.id);
    });
    if (opts.focus) tabs[keys.indexOf(key)].focus();
    if (opts.hash !== false) { try { history.replaceState(null, '', '#' + key); } catch (e) {} }
    render();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(tab.dataset.key); });
    tab.addEventListener('keydown', function (e) {
      let target = null;
      if (e.key === 'ArrowRight') target = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') target = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') target = 0;
      else if (e.key === 'End') target = tabs.length - 1;
      if (target !== null) { e.preventDefault(); select(keys[target], { focus: true }); }
    });
  });

  let searchTimer = null;
  search.addEventListener('input', function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(render, 120);
  });

  const fromHash = location.hash.slice(1);
  select(keys.indexOf(fromHash) !== -1 ? fromHash : keys[0], { hash: false });
  tabs.forEach(loadKey);
})();
