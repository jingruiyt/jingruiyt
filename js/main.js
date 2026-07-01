/* Jingrui Yuetao - Main JavaScript */
(function () {
  'use strict';

  // ============== Utilities ==============
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============== Header scroll effect ==============
  const header = $('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 30) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ============== Mobile menu ==============
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('.mobile-menu');
  const mobileOverlay = $('.mobile-overlay');
  if (menuToggle && mobileMenu) {
    const openMenu = () => {
      menuToggle.classList.add('open');
      menuToggle.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('open');
      if (mobileOverlay) mobileOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      if (mobileOverlay) mobileOverlay.classList.remove('open');
      document.body.style.overflow = '';
    };
    menuToggle.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) closeMenu();
      else openMenu();
    });
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);
    $$('a', mobileMenu).forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
    });
  }

  // ============== Reveal on scroll ==============
  const revealEls = $$('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  // ============== Card mouse glow tracking ==============
  $$('.feature-card, .app-card, .value-card, .contact-info-card, .news-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '0%');
    });
  });

  // ============== Animated stat counters ==============
  const counters = $$('.stat .num[data-target]');
  if (counters.length && 'IntersectionObserver' in window) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.target);
      const duration = prefersReducedMotion ? 0 : 1800;
      const start = performance.now();
      const isFloat = target % 1 !== 0;
      const step = (now) => {
        const progress = Math.min(1, (now - start) / Math.max(duration, 1));
        const eased = 1 - Math.pow(1 - progress, 3);
        const v = target * eased;
        el.textContent = isFloat ? v.toFixed(1) : Math.floor(v).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString();
      };
      if (prefersReducedMotion) {
        el.textContent = isFloat ? target.toFixed(1) : target.toLocaleString();
      } else {
        requestAnimationFrame(step);
      }
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => cio.observe(c));
  }

  // ============== Smooth scroll for anchors ==============
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    });
  });

  // ============== Auto-update copyright year ==============
  $$('.js-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // ============== Cookie banner ==============
  const cookieBanner = $('.cookie-banner');
  if (cookieBanner) {
    const CONSENT_KEY = 'jry_cookie_consent';
    const accepted = localStorage.getItem(CONSENT_KEY);
    if (!accepted) {
      setTimeout(() => cookieBanner.classList.add('show'), 1200);
    }
    const dismiss = (value) => {
      try { localStorage.setItem(CONSENT_KEY, value); } catch (err) { /* storage disabled */ }
      cookieBanner.classList.remove('show');
    };
    $('.cb-accept', cookieBanner)?.addEventListener('click', () => dismiss('all'));
    $('.cb-reject', cookieBanner)?.addEventListener('click', () => dismiss('essential'));
  }

  // ============== Back-to-top button ==============
  const backToTop = $('.back-to-top');
  if (backToTop) {
    const toggleBtt = () => {
      if (window.scrollY > 600) backToTop.classList.add('show');
      else backToTop.classList.remove('show');
    };
    window.addEventListener('scroll', toggleBtt, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
    toggleBtt();
  }

  // ============== Scroll progress bar ==============
  const progressBar = $('.scroll-progress');
  if (progressBar) {
    const updateProgress = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, (window.scrollY / docHeight) * 100) : 0;
      progressBar.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  // ============== Parallax hero (subtle, disabled on reduced motion) ==============
  if (!prefersReducedMotion) {
    const hero = $('.hero-bg');
    if (hero) {
      let ticking = false;
      const onScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const y = window.scrollY;
            if (y < window.innerHeight) {
              hero.style.transform = `translateY(${y * 0.3}px)`;
            }
            ticking = false;
          });
          ticking = true;
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  // ============== Contact form: lightweight client validation ==============
  const contactForm = $('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      const required = $$('[required]', contactForm);
      let valid = true;
      required.forEach(field => {
        const wrap = field.closest('.form-group');
        if (!field.value.trim()) {
          valid = false;
          if (wrap) wrap.style.borderColor = '#e82127';
        } else if (wrap) {
          wrap.style.borderColor = '';
        }
      });
      if (!valid) {
        e.preventDefault();
      }
    });
  }

  // ============== Active nav highlight (already in HTML, but reinforces on scroll) ==============
  // (No-op placeholder kept for future enhancements)

  // ============== Page fade-in on load ==============
  if (!prefersReducedMotion) {
    document.documentElement.classList.add('js-ready');
  }
})();