/* ==========================================================================
   MISTAKE SURVIVAL — DOCS · INTERACTIONS
   Vanilla JS · No dependencies
   ========================================================================== */

(() => {
    'use strict';

    /* --------------------------------------------------------------------------
       01 · UTILITIES
    -------------------------------------------------------------------------- */
    const $  = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --------------------------------------------------------------------------
       02 · FOOTER YEAR
    -------------------------------------------------------------------------- */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* --------------------------------------------------------------------------
       03 · NAVBAR — scroll state, active link, mobile toggle
    -------------------------------------------------------------------------- */
    const navbar   = $('#navbar');
    const navToggle = $('#navToggle');
    const mobileMenu = $('#mobileMenu');
    const navLinksAll = $$('a[data-link]');

    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 24);
        backToTop.classList.toggle('show', window.scrollY > 600);
    };

    const closeMobile = () => {
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
    };

    on(navToggle, 'click', () => {
        const open = mobileMenu.classList.toggle('open');
        navToggle.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        mobileMenu.setAttribute('aria-hidden', String(!open));
    });

    navLinksAll.forEach(a => on(a, 'click', closeMobile));

    /* --------------------------------------------------------------------------
       04 · SMOOTH SCROLL + ACTIVE SECTION
    -------------------------------------------------------------------------- */
    const sections = ['#home', '#downloads', '#install', '#faq', '#support']
        .map(id => $(id))
        .filter(Boolean);

    const setActiveLink = () => {
        const offset = window.innerHeight * 0.35;
        let current = '#home';
        sections.forEach(s => {
            const top = s.getBoundingClientRect().top;
            if (top - offset < 0) current = `#${s.id}`;
        });
        navLinksAll.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === current);
        });
    };

    /* --------------------------------------------------------------------------
       05 · SCROLL REVEAL (IntersectionObserver)
    -------------------------------------------------------------------------- */
    const reveals = $$('[data-reveal]');
    if ('IntersectionObserver' in window && !prefersReduced) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('is-visible');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
        reveals.forEach(el => io.observe(el));
    } else {
        reveals.forEach(el => el.classList.add('is-visible'));
    }

    /* --------------------------------------------------------------------------
       06 · INSTALLATION RAIL — current step highlight + progress
    -------------------------------------------------------------------------- */
    const stepCards = $$('.step-card');
    const railLinks = $$('#railList a');
    const railProgress = $('#railProgress');

    const setActiveStep = () => {
        if (!stepCards.length) return;
        const trigger = window.innerHeight * 0.4;
        let activeIdx = 0;
        stepCards.forEach((card, i) => {
            const rect = card.getBoundingClientRect();
            if (rect.top - trigger < 0) activeIdx = i;
        });
        stepCards.forEach((c, i) => c.classList.toggle('is-active', i === activeIdx));
        railLinks.forEach((a, i) => {
            a.classList.toggle('active', i === activeIdx);
            a.classList.toggle('passed', i < activeIdx);
        });
        if (railProgress) {
            const pct = ((activeIdx + 1) / stepCards.length) * 100;
            railProgress.style.width = `${pct}%`;
        }
    };

    /* --------------------------------------------------------------------------
       07 · TOAST
    -------------------------------------------------------------------------- */
    const toast = $('#toast');
    let toastTimer;
    const showToast = (msg) => {
        if (!toast) return;
        toast.textContent = '';
        toast.appendChild(document.createTextNode(msg));
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
    };

    /* --------------------------------------------------------------------------
       08 · COPY SERVER IP
    -------------------------------------------------------------------------- */
    const copyButtons = $$('.copy-ip');
    copyButtons.forEach(btn => {
        on(btn, 'click', async () => {
            const ip = btn.dataset.ip;
            if (!ip) return;
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(ip);
                } else {
                    const ta = document.createElement('textarea');
                    ta.value = ip;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                }
                showToast(`Copied · ${ip}`);
            } catch {
                showToast('Copy failed — please copy manually');
            }
        });
    });

    /* --------------------------------------------------------------------------
       09 · SCREENSHOT PLACEHOLDERS — click to replace with <img>
    -------------------------------------------------------------------------- */
    const shots = $$('[data-shot]');
    shots.forEach(fig => {
        on(fig, 'click', () => promptImageReplace(fig));
    });

    function promptImageReplace(fig) {
        if (fig.querySelector('img')) {
            openLightbox(fig.querySelector('img').src);
            return;
        }
        const url = window.prompt(
            'Paste an image URL to replace this placeholder.\n\nLeave empty to cancel.',
            ''
        );
        if (!url) return;
        replacePlaceholder(fig, url.trim());
    }

    function replacePlaceholder(fig, url) {
        const ph = fig.querySelector('.shot-ph');
        if (!ph) return;
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = fig.querySelector('figcaption')?.textContent || 'Screenshot';
        img.src = url;
        img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
        ph.replaceWith(img);
        fig.dataset.hasImage = '1';
    }

    /* --------------------------------------------------------------------------
       10 · LIGHTBOX
    -------------------------------------------------------------------------- */
    const lightbox = $('#lightbox');
    const lightboxContent = $('#lightboxContent');
    const lightboxClose = $('#lightboxClose');

    const openLightbox = (src) => {
        if (!lightbox) return;
        lightboxContent.innerHTML = '';
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'Preview';
        lightboxContent.appendChild(img);
        lightbox.classList.add('show');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.classList.remove('show');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    on(lightboxClose, 'click', closeLightbox);
    on(lightbox, 'click', (e) => { if (e.target === lightbox) closeLightbox(); });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

    /* --------------------------------------------------------------------------
       11 · BACK TO TOP
    -------------------------------------------------------------------------- */
    const backToTop = $('#toTop');
    on(backToTop, 'click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* --------------------------------------------------------------------------
       12 · PARTICLES — light floating network of dots
    -------------------------------------------------------------------------- */
    const canvas = $('#particles');
    if (canvas && !prefersReduced) {
        const ctx = canvas.getContext('2d');
        let w, h, particles, mouse = { x: -9999, y: -9999 };
        const COUNT = 70;
        const MAX_DIST = 130;

        const resize = () => {
            w = canvas.width  = window.innerWidth  * window.devicePixelRatio;
            h = canvas.height = window.innerHeight * window.devicePixelRatio;
            canvas.style.width  = window.innerWidth  + 'px';
            canvas.style.height = window.innerHeight + 'px';
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        const init = () => {
            particles = Array.from({ length: COUNT }, () => ({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 1.6 + 0.6,
            }));
        };

        const tick = () => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > window.innerWidth)  p.vx *= -1;
                if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(63, 185, 80, .55)';
                ctx.fill();
            });
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i], b = particles[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const d = Math.hypot(dx, dy);
                    if (d < MAX_DIST) {
                        const alpha = (1 - d / MAX_DIST) * 0.18;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(88, 166, 255, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
                const p = particles[i];
                const dxm = p.x - mouse.x, dym = p.y - mouse.y;
                const dm = Math.hypot(dxm, dym);
                if (dm < 160) {
                    const alpha = (1 - dm / 160) * 0.35;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(63, 185, 80, ${alpha})`;
                    ctx.lineWidth = 1.2;
                    ctx.stroke();
                }
            }
            requestAnimationFrame(tick);
        };

        on(window, 'resize', () => { resize(); init(); });
        on(window, 'mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
        on(window, 'mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

        resize();
        init();
        tick();
    }

    /* --------------------------------------------------------------------------
       13 · SCROLL HANDLER (throttled via rAF)
    -------------------------------------------------------------------------- */
    let ticking = false;
    const onScrollAll = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                onScroll();
                setActiveLink();
                setActiveStep();
                ticking = false;
            });
            ticking = true;
        }
    };
    on(window, 'scroll', onScrollAll, { passive: true });
    onScrollAll();

    /* --------------------------------------------------------------------------
       14 · LAZY IMAGE OBSERVER
    -------------------------------------------------------------------------- */
    if ('IntersectionObserver' in window) {
        const lazyIO = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const img = e.target;
                    if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
                    lazyIO.unobserve(img);
                }
            });
        });
        $$('img[data-src]').forEach(img => lazyIO.observe(img));
    }

})();
