// --- Theme Toggle ---
const root = document.documentElement;
const body = document.body;
const themeToggle = document.getElementById("theme-toggle");
const icon = themeToggle.querySelector("i");

function setThemeUI(theme) {
  icon.className = theme === "light" ? "fas fa-sun" : "fas fa-moon";
  themeToggle.setAttribute("aria-pressed", String(theme === "light"));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#fffbf2" : "#0c0b14");
}
// The saved theme was already applied by the inline <head> script
setThemeUI(root.getAttribute("data-theme") || "dark");

themeToggle.addEventListener("click", () => {
  const newTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", newTheme);
  setThemeUI(newTheme);
  try { localStorage.setItem("theme", newTheme); } catch (e) {}
  updateParticlesTheme(newTheme); // particle colours follow the theme
});

// --- Modals (single, accessible implementation) ---
let lastFocused = null;

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  lastFocused = document.activeElement;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden'; // stop background scrolling
  const closeBtn = modal.querySelector('.close-modal');
  if (closeBtn) closeBtn.focus();
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

// Close when clicking the dark backdrop
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});
// Close with Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
});

// --- Mobile Menu ---
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");

function setMenu(open) {
  hamburger.classList.toggle("active", open);
  navMenu.classList.toggle("active", open);
  hamburger.setAttribute("aria-expanded", String(open));
  hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.classList.toggle("menu-open", open);
}

hamburger.addEventListener("click", () => setMenu(!navMenu.classList.contains("active")));
navLinks.forEach(link => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
window.addEventListener("resize", () => { if (window.innerWidth > 768) setMenu(false); });

// --- Scroll Animation ---
const observerOptions = { threshold: 0.15 };
const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.hidden-left, .hidden-right, .hidden-up').forEach((el) => observer.observe(el));

// --- Contact Form Handling ---
const contactForm = document.getElementById('contactForm');
const formStatus = contactForm.querySelector('.form-status');

function setStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = 'form-status' + (type ? ' ' + type : '');
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // prevents page reload
  const btn = contactForm.querySelector('.submit-btn');
  if (btn.disabled) return; // ignore double clicks
  const originalHTML = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  setStatus('');

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
    });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || 'Request failed');

    btn.innerHTML = '<i class="fas fa-check"></i> Sent!';
    btn.classList.add('is-success');
    setStatus("Thanks! Your message was sent. I'll get back to you soon.", 'success');
    contactForm.reset();
  } catch (error) {
    console.error(error);
    btn.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Failed';
    btn.classList.add('is-error');
    setStatus('Something went wrong. Please try again, or email me directly.', 'error');
  } finally {
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
      btn.classList.remove('is-success', 'is-error');
    }, 3000);
  }
});


// --- Projects Carousel Navigation ---
const track = document.getElementById('projectTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Scroll step = real card width + gap (works at every screen size)
function cardStep() {
  const card = track.querySelector('.project-card');
  if (!card) return 380;
  const styles = getComputedStyle(track);
  const gap = parseFloat(styles.columnGap || styles.gap) || 0;
  return card.getBoundingClientRect().width + gap;
}

function updateCarouselButtons() {
  const maxScroll = track.scrollWidth - track.clientWidth - 2;
  prevBtn.disabled = track.scrollLeft <= 2;
  nextBtn.disabled = track.scrollLeft >= maxScroll;
}

nextBtn.addEventListener('click', () => track.scrollBy({ left: cardStep(), behavior: 'smooth' }));
prevBtn.addEventListener('click', () => track.scrollBy({ left: -cardStep(), behavior: 'smooth' }));
track.addEventListener('scroll', updateCarouselButtons, { passive: true });
window.addEventListener('resize', updateCarouselButtons);
updateCarouselButtons();

// --- Particle Network Animation (Canvas) ---
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const MAX_PARTICLES = 90;
const LINK_DISTANCE = 120;
let particles = [];
let particleColor = "rgba(255, 255, 255, 0.5)";
let lineColor = "rgba(255, 255, 255, 0.05)";
let lastWidth = window.innerWidth;
let rafId = null;
let resizeTimer = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function updateParticlesTheme(theme) {
  const rgb = getComputedStyle(root).getPropertyValue("--particle").trim() || "255, 255, 255";
  const light = theme === "light";
  particleColor = `rgba(${rgb}, ${light ? 0.32 : 0.55})`;
  lineColor = `rgba(${rgb}, ${light ? 0.09 : 0.09})`;
  if (prefersReducedMotion && particles.length) drawFrame(false); // static mode: repaint with new colours
}
updateParticlesTheme(root.getAttribute("data-theme"));

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 1;
    this.speedX = Math.random() * 1.5 - 0.75;
    this.speedY = Math.random() * 1.5 - 0.75;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
    if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
  }
  draw() {
    ctx.fillStyle = particleColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  const count = Math.min(MAX_PARTICLES, Math.floor((canvas.width * canvas.height) / 15000));
  for (let i = 0; i < count; i++) particles.push(new Particle());
}

function drawFrame(move) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i++) {
    if (move) particles[i].update();
    particles[i].draw();
    for (let j = i + 1; j < particles.length; j++) { // j = i + 1: never compare a particle with itself
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      if (dx * dx + dy * dy < LINK_DISTANCE * LINK_DISTANCE) { // squared distance: no Math.sqrt needed
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  drawFrame(true);
  rafId = requestAnimationFrame(animateParticles);
}

resizeCanvas();
initParticles();
if (prefersReducedMotion) {
  drawFrame(false);
} else {
  animateParticles();
  // Save battery: stop drawing while the tab is hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(rafId); rafId = null; }
    else if (!rafId) animateParticles();
  });
}

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeCanvas();
    if (window.innerWidth !== lastWidth) { // ignore height-only changes (mobile address bar)
      lastWidth = window.innerWidth;
      initParticles();
    }
    if (prefersReducedMotion) drawFrame(false);
  }, 150);
});



// --- Footer year ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Typing effect (hero) ---
(function () {
  const el = document.getElementById('typing-text');
  if (!el || prefersReducedMotion) return; // keep the static text
  const phrases = ['Learn and Build/Code', 'Contribute to Open Source', 'Build Scalable Backends', 'Create AI Agents'];
  let p = 0, c = phrases[0].length, deleting = true;
  function tick() {
    const text = phrases[p];
    c += deleting ? -1 : 1;
    el.textContent = text.slice(0, c);
    let delay = deleting ? 40 : 80;
    if (!deleting && c === text.length) { deleting = true; delay = 1600; }
    else if (deleting && c === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 400; }
    setTimeout(tick, delay);
  }
  setTimeout(tick, 1800);
})();

// --- Scroll effects: progress bar, navbar shrink, back-to-top (one throttled listener) ---
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
    if (toTop) toTop.classList.toggle('visible', y > 600);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
})();

// --- Highlight the menu link of the section being viewed ---
(function () {
  const sections = [...navLinks]
    .map(l => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));
})();

// --- Count-up numbers in the hero stats ---
document.querySelectorAll('.stat-num').forEach((el) => {
  if (prefersReducedMotion) return;
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const io = new IntersectionObserver(([entry], obs) => {
    if (!entry.isIntersecting) return;
    obs.disconnect();
    const start = performance.now(), duration = 1200;
    (function step(now) {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))) + suffix; // ease-out
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }, { threshold: 0.6 });
  io.observe(el);
});

// --- GitHub "more" dropdown: tap/click support (hover does not exist on phones) ---
(function () {
  const btn = document.querySelector('.gh-more-btn');
  const menu = document.querySelector('.gh-dropdown-content');
  if (!btn || !menu) return;
  const close = () => { menu.classList.remove('show-menu'); btn.setAttribute('aria-expanded', 'false'); };
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle('show-menu');
    btn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

// =====================================================================
// SECURITY HARDENING (no inline code in the HTML any more)
// =====================================================================

// --- Open / close dialogs from data attributes (replaces inline onclick) ---
document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-modal-open]');
  if (opener) { openModal(opener.getAttribute('data-modal-open')); return; }
  const closer = e.target.closest('[data-modal-close]');
  if (closer) closeModal(closer.getAttribute('data-modal-close'));
});

// --- Image fallbacks (replaces inline onerror) ---
// An image can fail BEFORE this script runs, so check for that as well as listening for the error event.
(function () {
  function onFail(img, fn) {
    img.addEventListener('error', fn);
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fn();
  }
  const avatar = document.querySelector('.hv-avatar img');
  if (avatar) onFail(avatar, () => avatar.remove());                       // initials "AP" stay visible

  const chart = document.querySelector('.gh-chart');
  if (chart) {
    const wrap = chart.closest('.graph-wrapper');
    if (wrap) onFail(chart, () => wrap.classList.add('is-empty'));         // friendly message instead of a broken icon
  }
})();

// --- E-mail link: the address is joined only when someone clicks ---
// Keeps the address out of the page source so simple spam bots cannot harvest it.
(function () {
  const link = document.querySelector('.email-link[data-email-user]');
  if (!link) return;
  const user = link.getAttribute('data-email-user');
  const domain = link.getAttribute('data-email-domain');
  if (!user || !domain || /^YOUR-/i.test(user) || /^YOUR-/i.test(domain)) return; // not set up yet: link jumps to the form
  link.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'mailto:' + user + '@' + domain;
  });
})();
