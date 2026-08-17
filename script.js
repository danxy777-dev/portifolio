/* ============================================
   Portfólio SENAI — Interatividade
   ============================================ */

// 1) Menu mobile: abre/fecha
const menuToggle = document.getElementById('menu-toggle');
const navList = document.querySelector('.nav-list');

menuToggle.addEventListener('click', () => {
    navList.classList.toggle('active');
});

// Fecha o menu ao clicar em um link
document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active');
    });
});

// 2) Cursor piscando no nome do hero (após carregamento)
window.addEventListener('load', () => {
    // O efeito de cursor piscando já é feito via CSS
});

// 3) Animação ao scrollar (fade-in nos elementos)
const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll(
    '.info-card, .skill-card, .projeto-card, .timeline-item, .contato-card, .sobre-texto'
).forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// 4) Destacar link ativo na navegação
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-list a');

function highlightActiveLink() {
    const scrollY = window.pageYOffset + 150;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.style.color = '';
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.style.color = 'var(--senai-red)';
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightActiveLink);

// 5) Atualizar ano do rodapé dinamicamente
const yearSpan = document.getElementById('current-year');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

// 6) Console — easter egg técnico
console.log(
    '%c🎓 Portfólio SENAI — Desenvolvimento de Sistemas',
    'color: #DA291C; font-size: 16px; font-weight: bold;'
);
console.log(
    '%cFeito com HTML, CSS e JavaScript puro.',
    'color: #525252; font-size: 13px;'
);
console.log(
    '%c📧 Aberto a oportunidades de estágio!',
    'color: #DA291C; font-size: 13px; font-weight: bold;'
);
