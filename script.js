/* ================================================================
   SCRIPT.JS — Rishi Adepu Portfolio
   ================================================================
   1.  Helpers + preferences
   2.  Dynamic year
   3.  Navbar (sticky, progress bar, active link) + mobile menu
   4.  Smooth scroll with navbar offset
   5.  Scroll-reveal (IntersectionObserver)
   6.  Typewriter role line
   7.  Contact form (Web3Forms) + toasts
   8.  Intro loader (dot -> ADEPU RISHI -> PORTFOLIO -> curtain)
   9.  ASCII portrait engine (assemble, pointer repel, depth parallax,
       dissolve on scroll)
   10. Hero pointer effects (metal sheen, 3D code-card tilt)
   11. Magnetic buttons, card tilt + spotlight, cursor glow
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* 1. HELPERS ================================================== */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer  = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const body   = document.body;
  const navbar = $('#navbar');
  const hero   = $('#hero');


  /* 2. DYNAMIC YEAR ============================================= */
  const yearEl = $('#currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* 3. NAVBAR + MOBILE MENU ===================================== */
  const progressBar = $('#scrollProgress');
  const sections    = $$('section[id]');
  const navLinkEls  = $$('.nav-link');
  let scrollTick = false;

  function onScroll() {
    scrollTick = false;
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);

    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;

    let current = '';
    sections.forEach(s => { if (y >= s.offsetTop - 140) current = s.id; });
    navLinkEls.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${current}`));
  }
  window.addEventListener('scroll', () => {
    if (!scrollTick) { scrollTick = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');

  function setMenu(open) {
    hamburger.classList.toggle('active', open);
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    body.style.overflow = open ? 'hidden' : '';
  }
  hamburger.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
  navLinkEls.forEach(l => l.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (innerWidth > 768) setMenu(false); });


  /* 4. SMOOTH SCROLL =========================================== */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = id.length > 1 ? $(id) : null;
      if (!target) return;
      e.preventDefault();
      const top = id === '#hero' ? 0 : target.getBoundingClientRect().top + scrollY - navbar.offsetHeight - 12;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });


  /* 5. SCROLL REVEAL =========================================== */
  $$('.skills-row').forEach(row => $$('.skill-tag-pill', row).forEach((p, i) => p.style.setProperty('--i', i)));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('visible');
      if (el.hasAttribute('data-tilt')) setTimeout(() => el.classList.add('tilt-ready'), 1100);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => revealObserver.observe(el));


  /* 6. TYPEWRITER ============================================== */
  const roleEl = $('#heroRole');
  const titles = [
    'BTech CSE Student',
    'AI & ML Enthusiast',
    'Building Impactful Solutions',
    'Problem Solver & Creator'
  ];
  let tIdx = 0, cIdx = 0, deleting = false, typing = false;

  function typeWriter() {
    const cur = titles[tIdx];
    cIdx += deleting ? -1 : 1;
    roleEl.textContent = cur.substring(0, cIdx);

    let speed = deleting ? 40 : 85;
    if (!deleting && cIdx === cur.length) { speed = 2200; deleting = true; }
    else if (deleting && cIdx === 0)      { deleting = false; tIdx = (tIdx + 1) % titles.length; speed = 350; }
    setTimeout(typeWriter, speed);
  }
  function startTypewriter() {
    if (typing || reduceMotion) return;
    typing = true;
    cIdx = roleEl.textContent.length; deleting = true;   // start by erasing the static line
    cIdx = 0; roleEl.textContent = '';
    deleting = false; tIdx = 0;
    setTimeout(typeWriter, 500);
  }


  /* 7. CONTACT FORM ============================================ */
  const contactForm = $('#contactForm');

  function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast' + (isError ? ' toast-error' : '');
    toast.setAttribute('role', 'status');
    body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3200);
  }
  const showFormError = msg => showToast(msg, true);

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name    = $('#name').value.trim();
    const email   = $('#email').value.trim();
    const message = $('#message').value.trim();

    if (!name || !email || !message) return showFormError('Please fill in all fields.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showFormError('Please enter a valid email address.');

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtn = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';

    const fd = new FormData();
    fd.append('access_key', '18c8b651-bf8c-42b4-b0ef-6813e032d6e7');
    fd.append('name', name);
    fd.append('email', email);
    fd.append('message', message);

    fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
      .then(async res => {
        const json = await res.json();
        if (res.status === 200) { showToast('Message sent successfully!'); contactForm.reset(); }
        else showFormError(json.message || 'Something went wrong. Please try again.');
      })
      .catch(() => showFormError('Network error. Please try again.'))
      .then(() => { submitBtn.disabled = false; submitBtn.innerHTML = originalBtn; });
  });


  /* Fit the headline name to a fixed share of the container width */
  const heroWord = $('#heroWord');
  function fitName() {
    const box = $('.hero-content');
    const avail = box.clientWidth;
    const el = $('#heroName');
    el.style.fontSize = '100px';
    const w = heroWord.getBoundingClientRect().width;
    const frac = innerWidth <= 768 ? 0.96 : 0.56;
    el.style.fontSize = Math.floor(100 * avail * frac / w) + 'px';
  }
  fitName();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);
  window.addEventListener('resize', fitName);


  /* 9. ASCII PORTRAIT ENGINE =================================== */
  // Declared before the intro because the intro calls portrait.start()
  const portrait = (() => {
    const canvas = $('#ascii');
    const ctx = canvas.getContext('2d', { alpha: true });
    const nameEl = $('#heroName');
    const DATA = window.PORTRAIT_DATA;
    if (!DATA) return { start() {}, ready: false };

    // glyph ramps: level 1..9 (dim -> bright); row 1/2 = binary shimmer
    const RAMP = ' .:-=+*#%@';
    const LEVELS = 10;

    let W = 0, H = 0, dpr = 1;
    let N = 0, hx, hy, px_, py_, vx, vy, zz, delay, lvl, alt;
    let atlas = null, gw = 0, gh = 0, cellW = 0, cellH = 0, cx = 0;
    let running = false, visible = true, started = false, t0 = 0, introDone = false;
    const ptr = { x: -9999, y: -9999, nx: 0, ny: 0, sx: 0, sy: 0 };

    function ramp(level) {            // dark teal -> cyan -> white
      const t = (level - 1) / 8;
      const stops = [[44, 44, 44], [112, 112, 112], [196, 196, 196], [255, 255, 255]];
      const f = t * 3, i = Math.min(2, Math.floor(f)), k = f - i;
      const a = stops[i], b = stops[i + 1];
      return `rgb(${a[0] + (b[0] - a[0]) * k | 0},${a[1] + (b[1] - a[1]) * k | 0},${a[2] + (b[2] - a[2]) * k | 0})`;
    }

    function buildAtlas(fs) {
      gw = Math.ceil(cellW * dpr) + 4;
      gh = Math.ceil(cellH * dpr) + 4;
      atlas = document.createElement('canvas');
      atlas.width = gw * LEVELS; atlas.height = gh * 3;
      const a = atlas.getContext('2d');
      a.textAlign = 'center'; a.textBaseline = 'middle';
      a.font = `700 ${fs * dpr}px "JetBrains Mono", ui-monospace, monospace`;
      for (let l = 1; l < LEVELS; l++) {
        a.fillStyle = ramp(l);
        if (l >= 7) { a.shadowColor = 'rgba(255,236,208,0.5)'; a.shadowBlur = 5 * dpr; } else a.shadowBlur = 0;
        const x = l * gw + gw / 2, y0 = gh / 2;
        a.fillText(RAMP[l], x, y0);
        a.fillText('0', x, y0 + gh);
        a.fillText('1', x, y0 + gh * 2);
      }
    }

    function build() {
      const mobile = innerWidth <= 768;
      const set = mobile ? DATA.m : DATA.d;
      const cols = set.cols, rows = set.rows;

      fitName();
      const hr = hero.getBoundingClientRect();
      W = hr.width; H = hr.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);

      // portrait box: top under the nav, bottom tucked behind the giant name
      const nr = nameEl.getBoundingClientRect();
      const navH = navbar.offsetHeight;
      const top = navH + (mobile ? 6 : 10);
      let bottom = nr.top - hr.top + nr.height * (mobile ? 0.3 : 0.2);
      let bh = Math.max(180, bottom - top);
      const aspect = cols / (rows * 1.9);
      let bw = bh * aspect;
      const maxW = W * (mobile ? 1.08 : 0.66);
      if (bw > maxW) { bw = maxW; bh = bw / aspect; }
      cx = mobile ? W / 2 : W * 0.675;
      const left = cx - bw / 2, topPos = bottom - bh;

      cellW = bw / cols; cellH = bh / rows;
      const fs = (cellW / 0.6) * 1.04;

      buildAtlas(fs);

      // particles
      const old = { n: N, x: px_, y: py_ };
      let count = 0;
      for (const row of set.data) for (let c = 0; c < cols; c++) if (row.charCodeAt(c) > 48) count++;
      N = count;
      hx = new Float32Array(N); hy = new Float32Array(N);
      px_ = new Float32Array(N); py_ = new Float32Array(N);
      vx = new Float32Array(N); vy = new Float32Array(N);
      zz = new Float32Array(N); delay = new Float32Array(N);
      lvl = new Uint8Array(N); alt = new Uint8Array(N);

      let i = 0;
      const midX = cols / 2, midY = rows * 0.4;
      for (let r = 0; r < rows; r++) {
        const row = set.data[r];
        for (let c = 0; c < cols; c++) {
          const l = row.charCodeAt(c) - 48;
          if (l <= 0) continue;
          hx[i] = left + (c + 0.5) * cellW;
          hy[i] = topPos + (r + 0.5) * cellH;
          lvl[i] = l; zz[i] = l / 9;
          const d = Math.hypot((c - midX) / cols, (r - midY) / rows);
          delay[i] = d * 1.1 + Math.random() * 0.7;
          if (introDone || reduceMotion) { px_[i] = hx[i]; py_[i] = hy[i]; delay[i] = -1; }
          else {
            const ang = Math.random() * 6.283, rad = (0.25 + Math.random() * 0.75) * Math.max(W, H) * 0.6;
            px_[i] = cx + Math.cos(ang) * rad; py_[i] = H * 0.4 + Math.sin(ang) * rad * 0.7;
          }
          i++;
        }
      }
    }

    let last = 0, frame = 0;
    function draw(now) {
      if (!running) return;
      requestAnimationFrame(draw);
      if (!visible || document.hidden) { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now; frame++;
      const t = (now - t0) / 1000;

      // smooth pointer parallax
      ptr.sx += (ptr.nx - ptr.sx) * 0.06; ptr.sy += (ptr.ny - ptr.sy) * 0.06;

      const sp = clamp(scrollY / (H * 0.85), 0, 1);       // dissolve progress
      if (sp >= 1) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }

      const mobile = innerWidth <= 768;
      const R = (mobile ? 70 : 120), R2 = R * R;
      const K = 0.05 * (dt * 60), DAMP = Math.pow(0.84, dt * 60);
      const mx = ptr.x, my = ptr.y;
      const parX = ptr.sx * (mobile ? 6 : 22), parY = ptr.sy * (mobile ? 3 : 12);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // random binary shimmer
      for (let s = 0; s < 14; s++) alt[(Math.random() * N) | 0] = 10 + ((Math.random() * 14) | 0);

      let curAlpha = -1;
      for (let i = 0; i < N; i++) {
        const age = t - delay[i];
        if (age < 0) continue;
        const z = zz[i];

        let tx = hx[i] + parX * z, ty = hy[i] + parY * z;
        if (sp > 0) {
          tx += (hx[i] - cx) * sp * 0.8 * (0.3 + z);
          ty -= sp * H * 0.3 * (0.25 + z) + Math.sin(i) * sp * 30;
        }

        let x = px_[i], y = py_[i], ax = vx[i], ay = vy[i];
        ax += (tx - x) * K; ay += (ty - y) * K;

        let near = false;
        const dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) || 1, f = (1 - d / R);
          const push = f * f * 9;
          ax += (dx / d) * push; ay += (dy / d) * push;
          near = f > 0.35;
        }
        ax *= DAMP; ay *= DAMP;
        x += ax; y += ay;
        px_[i] = x; py_[i] = y; vx[i] = ax; vy[i] = ay;

        let a = 1 - sp;
        if (age < 0.5) a *= age / 0.5;
        if (a !== curAlpha) { ctx.globalAlpha = a; curAlpha = a; }

        let row = 0;
        if (alt[i] > 0) { alt[i]--; row = 1 + (i & 1); } else if (near) row = 1 + ((frame + i) & 1);

        ctx.drawImage(atlas, lvl[i] * gw, row * gh, gw, gh, (x - cellW / 2) * dpr - 2, (y - cellH / 2) * dpr - 2, gw, gh);
      }
      ctx.globalAlpha = 1;
    }

    function drawStatic() {   // reduced-motion: one settled frame
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < N; i++)
        ctx.drawImage(atlas, lvl[i] * gw, 0, gw, gh, (hx[i] - cellW / 2) * dpr - 2, (hy[i] - cellH / 2) * dpr - 2, gw, gh);
    }

    function init() {
      build();
      if (reduceMotion) { drawStatic(); return; }
      running = true; t0 = performance.now(); requestAnimationFrame(draw);
    }

    // pointer (mouse + touch drag)
    window.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
      ptr.nx = (e.clientX / innerWidth - 0.5) * 2; ptr.ny = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });
    const leave = () => { ptr.x = ptr.y = -9999; ptr.nx = ptr.ny = 0; };
    window.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') leave(); }, { passive: true });
    window.addEventListener('pointercancel', leave, { passive: true });
    document.addEventListener('mouseleave', leave);

    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(hero);

    let rz;
    window.addEventListener('resize', () => {
      clearTimeout(rz);
      rz = setTimeout(() => { if (!started) return; build(); if (reduceMotion) drawStatic(); }, 180);
    });

    return {
      ready: true,
      start() {
        if (started) return; started = true;
        const go = () => init();
        (document.fonts && document.fonts.load)
          ? document.fonts.load('700 14px "JetBrains Mono"').then(go, go)
          : go();
        setTimeout(() => { introDone = true; }, 3500);
      }
    };
  })();


  /* 10. HERO POINTER EFFECTS =================================== */
  const heroName = $('#heroName');
  const codeCard = $('#codeCard');

  if (finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', e => {
      const r = heroName.getBoundingClientRect();
      heroName.style.setProperty('--sx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
      heroName.style.setProperty('--sy', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);

    });

    window.addEventListener('pointermove', e => {
      const cr = codeCard.getBoundingClientRect();
      if (cr.bottom < 0 || cr.top > innerHeight) return;
      const nx = clamp((e.clientX - (cr.left + cr.width / 2)) / 600, -1, 1);
      const ny = clamp((e.clientY - (cr.top + cr.height / 2)) / 600, -1, 1);
      codeCard.style.setProperty('--ry', `${(nx * 14).toFixed(2)}deg`);
      codeCard.style.setProperty('--rx', `${(-ny * 12).toFixed(2)}deg`);
    }, { passive: true });
  } else if (!reduceMotion) {
    // touch devices: let the sheen drift on its own
    let ph = 0;
    (function drift() {
      ph += 0.008;
      heroName.style.setProperty('--sx', `${50 + Math.sin(ph) * 45}%`);
      heroName.style.setProperty('--sy', `${40 + Math.cos(ph * 0.7) * 25}%`);
      requestAnimationFrame(drift);
    })();
  }


  /* 8. INTRO LOADER ============================================ */
  const loader = $('#loader');

  function finishIntro() {
    body.classList.remove('is-loading');
    body.classList.add('ready');
    if (loader) { loader.classList.add('done'); setTimeout(() => loader.classList.add('gone'), 1100); }
    portrait.start();
        startTypewriter();
  }

  if (!loader || reduceMotion || !document.documentElement.classList.contains('js')) {
    if (loader) loader.classList.add('gone');
    body.classList.remove('is-loading'); body.classList.add('ready');
    portrait.start();
  } else {
    const textEl = $('#loaderText'), pctEl = $('#loaderPct'), dot = $('#loaderDot');
    const NAME = 'ADEPU RISHI', WORD = 'PORTFOLIO';
    const GLYPHS = '01{}<>/\\#@%&*+=-_?';
    const DOT_MS = 650, DECODE_MS = 1000, HOLD_MS = 550, MORPH_MS = 900, END_MS = 300;
    const T1 = DOT_MS + DECODE_MS, T2 = T1 + HOLD_MS, T3 = T2 + MORPH_MS;
    const start = performance.now();
    let finished = false;
    const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

    // resolve `to` left->right at progress k; positions past `to` resolve to blank
    function scramble(from, to, k) {
      const len = Math.max(from.length, to.length);
      const settled = Math.floor(k * len);
      let out = '';
      for (let i = 0; i < len; i++) {
        const target = i < to.length ? to[i] : ' ';
        out += i < settled ? target : (target === ' ' && i >= to.length ? rnd() : (target === ' ' ? ' ' : rnd()));
      }
      return out;
    }

    (function tick(now) {
      const t = now - start;
      if (t > DOT_MS - 120) dot.classList.add('morph');

      if (t >= DOT_MS - 120 && t < T1)       textEl.textContent = scramble('', NAME, clamp((t - DOT_MS) / DECODE_MS, 0, 1));
      else if (t >= T1 && t < T2)            textEl.textContent = NAME;
      else if (t >= T2 && t < T3)            textEl.textContent = scramble(NAME, WORD, clamp((t - T2) / MORPH_MS, 0, 1)).replace(/\s+$/, '');
      pctEl.textContent = Math.round(clamp(t / T3, 0, 1) * 100);

      if (t >= T3 && !finished) {
        finished = true;
        textEl.textContent = WORD;
        setTimeout(finishIntro, END_MS);
        return;
      }
      if (!finished) requestAnimationFrame(tick);
    })(start);

    // safety net: never trap the visitor behind the loader
    setTimeout(() => { if (!body.classList.contains('ready')) finishIntro(); }, 5000);
  }


  /* 11. MAGNETIC BUTTONS, CARD TILT, CURSOR GLOW =============== */
  if (finePointer && !reduceMotion) {

    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    $$('.bento-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
        if (card.classList.contains('tilt-ready')) {
          card.style.setProperty('--ry', `${((x / r.width - 0.5) * 7).toFixed(2)}deg`);
          card.style.setProperty('--rx', `${(-(y / r.height - 0.5) * 7).toFixed(2)}deg`);
        }
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
      });
    });

    const glow = $('#cursorGlow');
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
    window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; glow.classList.add('on'); }, { passive: true });
    (function follow() {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      requestAnimationFrame(follow);
    })();
  }

}); // end DOMContentLoaded
