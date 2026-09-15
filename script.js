// ==========================================================
// Panha Hin — Portfolio Interactivity
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  setupMobileNav();
  setupScrollSpy();
  setupCounters();
  setupContactForm();
  setupBackToTop();
  setupRainChart();
});

/* ---------- Footer year ---------- */
function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Mobile nav toggle ---------- */
function setupMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a link is clicked (mobile)
  links.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Scroll-spy: highlight nav link for section in view ---------- */
function setupScrollSpy() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const linkFor = id => document.querySelector(`.nav-link[href="#${id}"]`);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = linkFor(entry.target.id);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, {
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
}

/* ---------- Animated hero stat counters ---------- */
function setupCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 900;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach(counter => observer.observe(counter));
}

/* ---------- Contact form (client-side only, no backend) ---------- */
function setupContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      status.textContent = 'Please fill in every field before sending.';
      status.style.color = '#b3541e';
      return;
    }

    if (!isValidEmail(email)) {
      status.textContent = 'That email address doesn\'t look right — check it and try again.';
      status.style.color = '#b3541e';
      return;
    }

    // No backend is connected yet, so this simulates a successful send.
    // To make this real, wire it up to a service like Formspree, EmailJS,
    // or your own backend endpoint.
    status.textContent = `Thanks, ${name}! Your message has been noted — I'll get back to you at ${email} soon.`;
    status.style.color = '#006d77';
    form.reset();
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* ---------- Back-to-top button ---------- */
function setupBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Rainy Days project: binomial distribution bar chart ---------- */
function setupRainChart() {
  const canvas = document.getElementById('rainChart');
  if (!canvas || !canvas.getContext) return;

  // Sample parameters — replace with your project's real n and p.
  const n = 30;   // days in the month
  const p = 0.4;  // probability it rains on any given day

  const probabilities = binomialPmf(n, p);
  drawBarChart(canvas, probabilities);

  // Redraw on resize so the chart stays crisp at the new CSS width.
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => drawBarChart(canvas, probabilities), 150);
  });
}

// P(X = k) for k = 0..n, X ~ Binomial(n, p)
function binomialPmf(n, p) {
  const results = [];
  for (let k = 0; k <= n; k++) {
    results.push(binomialCoefficient(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k));
  }
  return results;
}

function binomialCoefficient(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

function drawBarChart(canvas, values) {
  const dpr = window.devicePixelRatio || 1;

  // Preserve the canvas's original aspect ratio across redraws/resizes,
  // since canvas.width/height get overwritten below for retina sharpness.
  if (!canvas.dataset.aspectRatio) {
    canvas.dataset.aspectRatio = canvas.height / canvas.width;
  }
  const aspectRatio = parseFloat(canvas.dataset.aspectRatio);

  const cssWidth = canvas.clientWidth || parseInt(canvas.getAttribute('width'), 10);
  const cssHeight = cssWidth * aspectRatio;

  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const width = cssWidth;
  const height = cssHeight;
  const padding = { top: 16, right: 12, bottom: 26, left: 12 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  ctx.clearRect(0, 0, width, height);

  const styles = getComputedStyle(document.documentElement);
  const olive = styles.getPropertyValue('--olive').trim() || '#606c38';
  const oliveDark = styles.getPropertyValue('--olive-dark').trim() || '#283618';
  const rust = styles.getPropertyValue('--rust').trim() || '#bc6c25';
  const inkSoft = styles.getPropertyValue('--ink-soft').trim() || '#4a5a5c';

  const maxValue = Math.max(...values);
  const barGap = 2;
  const barWidth = chartWidth / values.length - barGap;

  // Highlight the most likely outcome (the expected value, n*p) in rust.
  const peakIndex = values.indexOf(maxValue);

  values.forEach((value, i) => {
    const barHeight = (value / maxValue) * chartHeight;
    const x = padding.left + i * (barWidth + barGap);
    const y = padding.top + (chartHeight - barHeight);

    ctx.fillStyle = i === peakIndex ? rust : olive;
    ctx.fillRect(x, y, barWidth, barHeight);
  });

  // Baseline
  ctx.strokeStyle = inkSoft;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top + chartHeight + 0.5);
  ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight + 0.5);
  ctx.stroke();

  // X-axis labels every 5 days
  ctx.fillStyle = oliveDark;
  ctx.font = '10px "Space Mono", monospace';
  ctx.textAlign = 'center';
  values.forEach((_, i) => {
    if (i % 5 === 0) {
      const x = padding.left + i * (barWidth + barGap) + barWidth / 2;
      ctx.fillText(String(i), x, height - 8);
    }
  });
}