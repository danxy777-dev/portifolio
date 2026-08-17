/* ============================================
   ACADEMIA DO BAIRRO - Interações
   ============================================ */

(function () {
    'use strict';

    // ============================================
    // 1. MENU MOBILE (hambúrguer)
    // ============================================
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');
    const navLinks = nav ? nav.querySelectorAll('.nav__link') : [];

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            const isOpen = nav.classList.toggle('open');
            toggle.classList.toggle('active');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
        });

        // Fecha o menu ao clicar em qualquer link (mobile)
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 768) {
                    nav.classList.remove('open');
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.setAttribute('aria-label', 'Abrir menu');
                }
            });
        });

        // Fecha o menu com a tecla ESC
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                nav.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Abrir menu');
            }
        });
    }

    // ============================================
    // 2. SCROLL SUAVE para links internos
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId.length < 2) return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
            const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 1;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        });
    });

    // ============================================
    // 3. ANIMAÇÃO DE FADE-IN NO SCROLL
    // ============================================
    const reveals = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // anima só uma vez
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        // Fallback para navegadores antigos: mostra tudo imediatamente
        reveals.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    // ============================================
    // 4. LINK ATIVO no menu conforme scroll
    // ============================================
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav__link');

    if (sections.length && navItems.length) {
        const setActiveLink = function () {
            const scrollY = window.pageYOffset;
            const headerHeight = document.querySelector('.header')?.offsetHeight || 70;

            let currentSectionId = '';

            sections.forEach(function (section) {
                if (scrollY >= section.offsetTop - headerHeight - 50) {
                    currentSectionId = section.id;
                }
            });

            navItems.forEach(function (link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + currentSectionId) {
                    link.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', setActiveLink, { passive: true });
        setActiveLink();
    }

    // ============================================
    // 5. ANO ATUAL no footer
    // ============================================
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

})();