// ==========================================================
// Panha Hin — Portfolio Interactivity
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  setupMobileNav();
  setupScrollSpy();
  setupBackToTop();
  setupHeroVisualReveal();
  setupSectionReveals();
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

/* ---------- Back-to-top button ---------- */
function setupBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Hero visual: fade the trading chart in once it's on screen ---------- */
function setupHeroVisualReveal() {
  const wrapper = document.querySelector('.hero-visual');
  if (!wrapper) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        wrapper.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(wrapper);
}

/* ---------- Staggered section reveals ---------- */
function setupSectionReveals() {
  const sections = document.querySelectorAll('main section[id]:not(.hero)');
  if (!sections.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STAGGER = 110; // ms between successive elements (within the 80–150ms range)

  // Tag the elements to reveal in each section, top to bottom, and give
  // each one an increasing delay. Done once up front so the observer
  // callback stays cheap — it only toggles a single class per section.
  sections.forEach(section => {
    const inner = section.querySelector('.section-inner') || section;

    // Direct children of the inner wrapper, plus the items inside any
    // grid/list container, so cards and timeline entries stagger too
    // rather than appearing as one block.
    const items = [];
    Array.from(inner.children).forEach(child => {
      // Visualizations are handled separately below, after the content.
      if (child.classList.contains('sec-viz')) return;

      const groupSelector = [
        '.skill-card',
        '.project-card',
        '.timeline-item',
        '.contact-card'
      ].join(',');
      const group = child.matches('.skills-grid, .projects-grid, .timeline, .contact-cards')
        ? Array.from(child.querySelectorAll(groupSelector))
        : null;

      if (group && group.length) {
        items.push(...group);
      } else {
        items.push(child);
      }
    });

    items.forEach((el, i) => {
      el.classList.add('reveal-item');
      el.style.setProperty('--reveal-delay', `${i * STAGGER}ms`);
    });

    // Data visualizations enter slightly after the main content has landed.
    const vizDelay = items.length * STAGGER + 200;
    section.querySelectorAll('.sec-viz:not(.sec-viz-symbols)').forEach(viz => {
      viz.classList.add('reveal-item');
      viz.style.setProperty('--reveal-delay', `${vizDelay}ms`);
    });
  });

  // Background data-science accents drift in more slowly, behind the
  // content. These live in the hero, which is otherwise excluded above
  // (it has its own load-time entrance animation), so handle it here.
  const heroFx = document.querySelector('.hero .viz-datafx');
  if (heroFx) {
    Array.from(heroFx.children).forEach((el, i) => {
      el.classList.add('reveal-bg');
      el.style.setProperty('--reveal-delay', `${400 + i * 60}ms`);
    });
    if (prefersReducedMotion) {
      heroFx.closest('.hero').classList.add('is-revealed');
    } else {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          entry.target.classList.toggle('is-revealed', entry.isIntersecting);
        });
      }, { threshold: 0.1 });
      heroObserver.observe(heroFx.closest('.hero'));
    }
  }

  if (prefersReducedMotion) {
    sections.forEach(section => section.classList.add('is-revealed'));
    return;
  }

  // Toggle on enter, untoggle on exit, so returning to a section
  // replays the reveal rather than showing it already-finished.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-revealed', entry.isIntersecting);
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -10% 0px'
  });

  sections.forEach(section => observer.observe(section));

  setupDonutSegments();
}

/* ---------- Projects donut: draw segments around the circle ---------- */
function setupDonutSegments() {
  const segments = document.querySelectorAll('.donut-seg');
  if (!segments.length) return;

  const section = segments[0].closest('section');
  if (!section) return;

  const CIRCUMFERENCE = 214; // 2πr for r=34, matching the SVG
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const draw = () => {
    segments.forEach((seg, i) => {
      const arc = parseFloat(seg.dataset.arc) || 0;
      seg.style.transitionDelay = prefersReducedMotion ? '0ms' : `${600 + i * 220}ms`;
      seg.style.strokeDasharray = `${arc} ${CIRCUMFERENCE - arc}`;
    });
  };

  const reset = () => {
    segments.forEach(seg => {
      seg.style.transitionDelay = '0ms';
      seg.style.strokeDasharray = `0 ${CIRCUMFERENCE}`;
    });
  };

  if (prefersReducedMotion) {
    draw();
    return;
  }

  // Redraw whenever the section re-enters, matching the reveal replay.
  const donutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        draw();
      } else {
        reset();
      }
    });
  }, { threshold: 0.15 });

  donutObserver.observe(section);
}