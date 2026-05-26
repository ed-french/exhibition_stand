/* ── Config ──────────────────────────────────────────────────────────────── */
const CFG = window.APP_CONFIG;

/* ── DOM refs ────────────────────────────────────────────────────────────── */
const views = {
  advertising:  document.getElementById('advertising-view'),
  registration: document.getElementById('registration-view'),
  success:      document.getElementById('success-view'),
};
const canvas    = document.getElementById('particle-canvas');
const ctx       = canvas.getContext('2d');
const form      = document.getElementById('registration-form');
const errorMsg  = document.getElementById('form-error');
const submitBtn = form.querySelector('.submit-btn');

/* ── Populate text from config ───────────────────────────────────────────── */
document.getElementById('offer-title').textContent    = CFG.offerTitle;
document.getElementById('offer-subtitle').textContent = CFG.offerSubtitle;
document.getElementById('offer-cta').textContent      = CFG.offerCta;
document.getElementById('form-title').textContent     = CFG.offerTitle;
document.getElementById('form-subtitle').textContent  = CFG.offerSubtitle;

/* ── App state ───────────────────────────────────────────────────────────── */
let mode      = 'advertising'; // 'advertising' | 'collecting' | 'success'
let idleTimer = null;
let rafId     = null;

/* ═══════════════════════════════════════════════════════════════════════════
   PARTICLE ANIMATION
   ═══════════════════════════════════════════════════════════════════════════ */

const PARTICLE_COUNT = 95;
const CONNECT_DIST   = 130;
const SPEED          = 0.45;

class Particle {
  constructor() { this.init(true); }

  init(scatter = false) {
    this.x  = Math.random() * canvas.width;
    this.y  = scatter ? Math.random() * canvas.height : -10;
    const a = Math.random() * Math.PI * 2;
    const s = SPEED * (0.4 + Math.random() * 0.6);
    this.vx = Math.cos(a) * s;
    this.vy = Math.sin(a) * s;
    this.r  = 0.8 + Math.random() * 1.6;
    this.ph = Math.random() * Math.PI * 2;
    this.ps = 0.012 + Math.random() * 0.022;
  }

  update() {
    this.x  += this.vx;
    this.y  += this.vy;
    this.ph += this.ps;
    const m = 15;
    if (this.x < -m) this.x = canvas.width  + m;
    if (this.x > canvas.width  + m) this.x = -m;
    if (this.y < -m) this.y = canvas.height + m;
    if (this.y > canvas.height + m) this.y = -m;
  }

  draw() {
    const a = 0.45 + 0.55 * Math.sin(this.ph);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(166,138,185,${(a * 0.85).toFixed(2)})`;  /* --plum-light */
    ctx.fill();
  }
}

let particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Connections (O(n²) — fine for ~95 particles)
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < CONNECT_DIST) {
        const a = ((1 - dist / CONNECT_DIST) * 0.2).toFixed(3);
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(92,66,110,${a})`; /* --plum */
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }
    }
  }

  particles.forEach(p => { p.update(); p.draw(); });
  rafId = requestAnimationFrame(drawParticles);
}

function stopAnimation() {
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
}

function startAnimation() {
  if (rafId === null) drawParticles();
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODE SWITCHING
   ═══════════════════════════════════════════════════════════════════════════ */

function showOnly(name) {
  Object.entries(views).forEach(([k, el]) =>
    el.classList.toggle('hidden', k !== name)
  );
}

function enterAdvertising() {
  clearIdleTimer();
  mode = 'advertising';
  showOnly('advertising');
  startAnimation();
}

function enterCollecting() {
  mode = 'collecting';
  showOnly('registration');
  stopAnimation();   // spare GPU while the form is shown
  resetForm();
  setTimeout(() => document.getElementById('name').focus(), 80);
  resetIdleTimer();
}

function enterSuccess(name) {
  clearIdleTimer();
  mode = 'success';
  document.getElementById('success-name').textContent =
    name ? `Thank you, ${name}!` : 'Thank you!';
  showOnly('success');
  setTimeout(enterAdvertising, 3500);
}

/* ── Idle timer ──────────────────────────────────────────────────────────── */
function resetIdleTimer() {
  clearIdleTimer();
  if (mode === 'collecting') {
    idleTimer = setTimeout(enterAdvertising, CFG.idleTimeoutMs);
  }
}
function clearIdleTimer() {
  if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
}

/* ── Form reset ──────────────────────────────────────────────────────────── */
function resetForm() {
  form.reset();
  document.getElementById('keep_updated').checked = true;
  errorMsg.classList.add('hidden');
  errorMsg.textContent = '';
  document.getElementById('name').classList.remove('invalid');
  document.getElementById('email').classList.remove('invalid');
  submitBtn.disabled    = false;
  submitBtn.textContent = 'Register My Interest';
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECRET EXIT KEY
   ═══════════════════════════════════════════════════════════════════════════ */

function parseKeySpec(str) {
  const parts = str.toLowerCase().split('+').map(s => s.trim());
  return {
    ctrl:  parts.includes('ctrl'),
    shift: parts.includes('shift'),
    alt:   parts.includes('alt'),
    key:   parts[parts.length - 1],
  };
}

const exitSpec = parseKeySpec(CFG.secretExitKey);

function isExitKey(e) {
  return (
    e.key.toLowerCase() === exitSpec.key &&
    !!e.ctrlKey  === exitSpec.ctrl  &&
    !!e.shiftKey === exitSpec.shift &&
    !!e.altKey   === exitSpec.alt
  );
}

function triggerExit() {
  fetch('/api/exit', { method: 'POST' }).catch(() => {});
}

/* ═══════════════════════════════════════════════════════════════════════════
   INPUT HANDLING
   ═══════════════════════════════════════════════════════════════════════════ */

const IGNORE_KEYS = new Set([
  'Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab',
  'NumLock', 'ScrollLock', 'Pause', 'Insert',
  'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
]);

document.addEventListener('keydown', e => {
  // Exit shortcut always takes priority
  if (isExitKey(e)) {
    e.preventDefault();
    triggerExit();
    return;
  }

  if (mode === 'advertising') {
    if (!IGNORE_KEYS.has(e.key)) enterCollecting();
    return;
  }

  if (mode === 'collecting') {
    if (e.key === 'Escape') { e.preventDefault(); enterAdvertising(); return; }
    resetIdleTimer();
  }
});

// Reset idle timer on any activity inside the form
views.registration.addEventListener('pointerdown', resetIdleTimer);
views.registration.addEventListener('pointermove', resetIdleTimer);

/* ═══════════════════════════════════════════════════════════════════════════
   FORM SUBMISSION
   ═══════════════════════════════════════════════════════════════════════════ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

form.addEventListener('submit', async e => {
  e.preventDefault();

  const name  = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();

  let valid = true;
  document.getElementById('name').classList.toggle('invalid', !name);
  document.getElementById('email').classList.toggle('invalid', !email || !EMAIL_RE.test(email));
  if (!name || !email || !EMAIL_RE.test(email)) valid = false;

  if (!valid) {
    errorMsg.textContent = 'Please enter your name and a valid email address.';
    errorMsg.classList.remove('hidden');
    return;
  }

  errorMsg.classList.add('hidden');
  submitBtn.disabled    = true;
  submitBtn.textContent = 'Registering…';

  try {
    const payload = {
      name,
      company:          document.getElementById('company').value.trim(),
      email,
      application_area: document.getElementById('application_area').value.trim(),
      keep_updated:     document.getElementById('keep_updated').checked,
    };

    const res = await fetch('/api/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Server error');
    enterSuccess(name);

  } catch {
    errorMsg.textContent = 'Something went wrong — please try again.';
    errorMsg.classList.remove('hidden');
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Register My Interest';
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════════════════════ */

window.addEventListener('resize', () => {
  resizeCanvas();
  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
});

resizeCanvas();
enterAdvertising();
