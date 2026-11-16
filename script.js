/* ============================================
   Portfólio SENAI — Interatividade (Apple Liquid Glass)
   ============================================ */

// 1) Menu mobile: abre/fecha com acessibilidade e clique externo
const menuToggle = document.getElementById('menu-toggle');
const navList = document.querySelector('.nav-list');
const headerEl = document.querySelector('.header');

function setMenuOpen(isOpen) {
    if (!menuToggle || !navList) return;
    navList.classList.toggle('active', isOpen);
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
}

if (menuToggle && navList) {
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = !navList.classList.contains('active');
        setMenuOpen(isOpen);
    });

    // Fecha o menu ao clicar em um link
    document.querySelectorAll('.nav-list a').forEach(link => {
        link.addEventListener('click', () => {
            setMenuOpen(false);
        });
    });

    // Fecha ao clicar fora do menu ou pressionar Escape
    document.addEventListener('click', (e) => {
        if (navList.classList.contains('active') && !navList.contains(e.target) && !menuToggle.contains(e.target)) {
            setMenuOpen(false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navList.classList.contains('active')) {
            setMenuOpen(false);
            menuToggle.focus();
        }
    });
}

// 2) Cursor piscando no nome do hero (após carregamento)
window.addEventListener('load', () => {
    // O efeito de cursor piscando já é feito via CSS
});

// 3) Animação ao scrollar (fade-in com stagger sutil)
const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
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
    '.info-card, .skill-card, .projeto-card, .timeline-card, .contato-card, .sobre-texto-glass'
).forEach((el) => {
    el.classList.add('fade-in');
    const siblingIndex = Array.from(el.parentElement ? el.parentElement.children : []).indexOf(el);
    if (siblingIndex > 0 && siblingIndex < 8) {
        el.style.transitionDelay = `${siblingIndex * 45}ms`;
    }
    observer.observe(el);
});

// Helper: acopla reflexo especular dinâmico (Liquid Glass Glare) em um elemento
const canAnimatePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

function bindLiquidGlassGlare(el) {
    if (!canAnimatePointer || !el || el.dataset.glassBound === '1') return;
    el.dataset.glassBound = '1';

    let rafId = 0;
    el.addEventListener('pointermove', (e) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                const mx = ((e.clientX - rect.left) / rect.width) * 100;
                const my = ((e.clientY - rect.top) / rect.height) * 100;
                el.style.setProperty('--mx', `${mx.toFixed(1)}%`);
                el.style.setProperty('--my', `${my.toFixed(1)}%`);
            }
            rafId = 0;
        });
    }, { passive: true });
}

/* ============================================
   Seção Certificados — Base de Dados & Renderização
   ============================================
   Para adicionar um novo certificado futuramente:
   1. Salve o arquivo PDF dentro da pasta: assets/certificados/
   2. Adicione um novo objeto na lista "certificadosData" abaixo:
      {
          titulo: "Nome do Curso ou Certificação",
          instituicao: "Instituição de Ensino",
          data: "DD/MM/AAAA",             // Opcional (se não houver, deixe "")
          cargaHoraria: "XX horas",        // Opcional (se não houver, deixe "")
          categoria: "Nome da Categoria", // Cria filtros automáticos!
          descricao: "Resumo do que foi aprendido...", // Opcional
          pdf: "assets/certificados/seu-arquivo.pdf"
      }
   ============================================ */
const certificadosData = [
    {
        titulo: "Fluência — Fundamentos da Inteligência Artificial",
        instituicao: "Escola SENAI Roberto Simonsen",
        data: "22/04/2025",
        cargaHoraria: "8 horas",
        categoria: "Inteligência Artificial",
        descricao: "Fundamentos e aplicações de IA tradicional e generativa, impactos nos mecanismos de pesquisa, boas práticas éticas e uso do Copilot e Bing Chat para aumento de produtividade.",
        pdf: "assets/certificados/certificado-fundamentos-inteligencia-artificial.pdf"
    },
    {
        titulo: "Ética na Inteligência Artificial",
        instituicao: "Escola SENAI Roberto Simonsen",
        data: "21/04/2025",
        cargaHoraria: "4 horas",
        categoria: "Inteligência Artificial",
        descricao: "Pilares da IA responsável, importância ética nas decisões algorítmicas, marco regulatório e desafios para o desenvolvimento consciente de soluções inteligentes.",
        pdf: "assets/certificados/certificado-etica-inteligencia-artificial.pdf"
    },
    {
        titulo: "Por Dentro da Segurança Cibernética",
        instituicao: "Escola SENAI Roberto Simonsen",
        data: "30/04/2025",
        cargaHoraria: "4 horas",
        categoria: "Segurança da Informação",
        descricao: "Identificação de riscos, vulnerabilidades e tipos de ameaças cibernéticas no ambiente corporativo, técnicas de prevenção e boas práticas para proteção de ativos digitais.",
        pdf: "assets/certificados/certificado-seguranca-cibernetica.pdf"
    },
    {
        titulo: "Cidadania Digital e Uso Consciente da Internet",
        instituicao: "Escola SENAI Roberto Simonsen",
        data: "11/06/2026",
        cargaHoraria: "4 horas",
        categoria: "Segurança da Informação",
        descricao: "Uso estratégico e responsável da internet com auxílio de IA, diretrizes legais de privacidade, proteção de dados pessoais e conscientização sobre impactos do mundo digital.",
        pdf: "assets/certificados/certificado-cidadania-digital.pdf"
    },
    {
        titulo: "Desvendando a Indústria 4.0",
        instituicao: "Escola SENAI Roberto Simonsen",
        data: "11/05/2026",
        cargaHoraria: "20 horas",
        categoria: "Tecnologia & Inovação",
        descricao: "Tecnologias habilitadoras: Big Data, IoT, Computação em Nuvem, Robótica Avançada, Manufatura Digital e integração de sistemas para tomada de decisão em tempo real.",
        pdf: "assets/certificados/certificado-desvendando-a-industria-4-0.pdf"
    },
    {
        titulo: "Excel Básico",
        instituicao: "Escola SENAI Roberto Simonsen",
        data: "12/04/2025",
        cargaHoraria: "20 horas",
        categoria: "Produtividade",
        descricao: "Edição e formatação de dados em planilhas, utilização de fórmulas essenciais (soma, média, divisão, porcentagem), funções básicas, formatação condicional e gráficos.",
        pdf: "assets/certificados/certificado-excel-basico.pdf"
    },
    {
        titulo: "Competência Transversal — Segurança no Trabalho",
        instituicao: "Escola SENAI Roberto Simonsen",
        data: "20/04/2025",
        cargaHoraria: "14 horas",
        categoria: "Normas & Segurança",
        descricao: "Conceitos fundamentais de prevenção de acidentes, equipamentos de proteção (EPI e EPC), atribuições da CIPA, elaboração de mapa de risco e ergonomia aplicada.",
        pdf: "assets/certificados/certificado-seguranca-no-trabalho.pdf"
    },
    {
        titulo: "Desvendando o ESG",
        instituicao: "Escola SENAI Roberto Simonsen",
        data: "21/05/2026",
        cargaHoraria: "20 horas",
        categoria: "Gestão & Sustentabilidade",
        descricao: "Governança ambiental, social e corporativa (ESG), estratégias para mitigação de impactos socioambientais e adoção de práticas empresariais sustentáveis e conscientes.",
        pdf: "assets/certificados/certificado-desvendando-o-esg.pdf"
    },
    {
        titulo: "Desvendando a Descarbonização",
        instituicao: "Escola SENAI Roberto Simonsen",
        data: "13/05/2025",
        cargaHoraria: "20 horas",
        categoria: "Gestão & Sustentabilidade",
        descricao: "Economia de baixo carbono, diagnóstico de impactos ambientais, transição energética e aplicação de práticas industriais sustentáveis diante da agenda climática.",
        pdf: "assets/certificados/certificado-desvendando-a-descarbonizacao.pdf"
    },
    {
        titulo: "Geração de Valor Circular e Modelos de Negócio",
        instituicao: "Escola SENAI Roberto Simonsen",
        data: "17/05/2026",
        cargaHoraria: "4 horas",
        categoria: "Gestão & Sustentabilidade",
        descricao: "Princípios da economia circular, estratégias de extensão da vida útil de recursos, desenvolvimento de modelos de negócio sustentáveis e avaliação de vantagens competitivas.",
        pdf: "assets/certificados/certificado-geracao-valor-circular.pdf"
    },
    {
        titulo: "Matrícula Regular — Técnico em Desenvolvimento de Sistemas",
        instituicao: "Escola SENAI Roberto Simonsen",
        data: "Vigente (2025 - 2026)",
        cargaHoraria: "Curso Técnico Regular",
        categoria: "Formação Técnica",
        descricao: "Comprovante oficial de matrícula regular no Curso Técnico em Desenvolvimento de Sistemas (período integral), capacitando em desenvolvimento de software, web e banco de dados.",
        pdf: "assets/certificados/declaracao-matricula-tecnico-desenvolvimento-sistemas.pdf"
    }
];

// Ícones SVG reutilizáveis para os cards
const iconesCertificados = {
    certificado: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>`,
    escola: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`,
    calendario: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    relogio: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    linkExterno: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`
};

function renderizarCertificados(categoriaSelecionada = 'Todos') {
    const grid = document.getElementById('certificados-grid');
    if (!grid) return;

    // Filtra lista de acordo com a categoria selecionada
    const listaFiltrada = categoriaSelecionada === 'Todos'
        ? certificadosData
        : certificadosData.filter(c => c.categoria === categoriaSelecionada);

    grid.innerHTML = '';

    listaFiltrada.forEach((cert, index) => {
        const card = document.createElement('article');
        card.className = 'certificado-card glass-interactive fade-in';
        card.style.transitionDelay = `${Math.min(index * 40, 240)}ms`;

        // Cabeçalho do card: Ícone + Carga Horária Badge
        const topHtml = `
            <div class="certificado-top">
                <div class="certificado-icon-wrap" title="Certificação Oficial">
                    ${iconesCertificados.certificado}
                </div>
                ${cert.cargaHoraria ? `
                    <span class="certificado-carga-badge">
                        ${iconesCertificados.relogio}
                        ${cert.cargaHoraria}
                    </span>
                ` : ''}
            </div>
        `;

        // Informações meta (Data e Carga)
        const metaHtml = (cert.data || cert.cargaHoraria) ? `
            <div class="certificado-meta">
                ${cert.data ? `
                    <div class="cert-meta-item">
                        <span class="cert-meta-label">${iconesCertificados.calendario} Conclusão</span>
                        <span class="cert-meta-val">${cert.data}</span>
                    </div>
                ` : ''}
                ${cert.cargaHoraria ? `
                    <div class="cert-meta-item">
                        <span class="cert-meta-label">${iconesCertificados.relogio} Carga horária</span>
                        <span class="cert-meta-val">${cert.cargaHoraria}</span>
                    </div>
                ` : ''}
            </div>
        ` : '';

        // Botão de visualização do PDF
        const btnHtml = `
            <div class="certificado-footer">
                <a href="${cert.pdf}" target="_blank" rel="noopener noreferrer" class="btn-certificado" aria-label="Visualizar certificado de ${cert.titulo} em nova aba">
                    <span>Visualizar certificado</span>
                    ${iconesCertificados.linkExterno}
                </a>
            </div>
        `;

        card.innerHTML = `
            ${topHtml}
            ${cert.categoria ? `<span class="certificado-categoria">${cert.categoria}</span>` : ''}
            <h3 class="certificado-titulo">${cert.titulo}</h3>
            <div class="certificado-instituicao">
                ${iconesCertificados.escola}
                <span>${cert.instituicao}</span>
            </div>
            ${cert.descricao ? `<p class="certificado-descricao">${cert.descricao}</p>` : ''}
            ${metaHtml}
            ${btnHtml}
        `;

        grid.appendChild(card);
        observer.observe(card);
        bindLiquidGlassGlare(card);
    });
}

function inicializarFiltrosCertificados() {
    const filtrosContainer = document.getElementById('certificados-filtros');
    if (!filtrosContainer) return;

    // Extrai categorias únicas preservando a ordem
    const categorias = ['Todos', ...new Set(certificadosData.map(c => c.categoria).filter(Boolean))];

    filtrosContainer.innerHTML = '';

    categorias.forEach(cat => {
        const count = cat === 'Todos'
            ? certificadosData.length
            : certificadosData.filter(c => c.categoria === cat).length;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `filtro-btn ${cat === 'Todos' ? 'active' : ''}`;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', cat === 'Todos' ? 'true' : 'false');
        btn.innerHTML = `${cat} <span class="filtro-count">${count}</span>`;

        btn.addEventListener('click', () => {
            filtrosContainer.querySelectorAll('.filtro-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            renderizarCertificados(cat);
        });

        filtrosContainer.appendChild(btn);
    });
}

// Inicializa a seção de certificados imediatamente
inicializarFiltrosCertificados();
renderizarCertificados('Todos');

// Inicializa reflexo especular (glare) e parallax sutil nos elementos Liquid Glass estáticos
document.querySelectorAll('.glass-interactive').forEach(bindLiquidGlassGlare);

(function initHeroGlassParallax() {
    if (!canAnimatePointer) return;
    const heroSection = document.querySelector('.hero');
    const heroStage = document.querySelector('.hero-glass-stage');
    if (!heroSection || !heroStage) return;

    let rafId = 0;
    heroSection.addEventListener('pointermove', (e) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            const rect = heroSection.getBoundingClientRect();
            const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
            heroStage.style.transform = `translate3d(${(nx * 6).toFixed(2)}px, ${(ny * 5).toFixed(2)}px, 0)`;
            rafId = 0;
        });
    }, { passive: true });

    heroSection.addEventListener('pointerleave', () => {
        heroStage.style.transform = 'translate3d(0, 0, 0)';
    });
})();

// 4) Destacar link ativo na navegação + sombra sutil no cabeçalho
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-list a');

function highlightActiveLink() {
    const scrollY = window.pageYOffset;

    if (headerEl) {
        headerEl.classList.toggle('scrolled', scrollY > 12);
    }

    const triggerOffset = scrollY + 160;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (triggerOffset >= sectionTop && triggerOffset < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                const isMatch = link.getAttribute('href') === `#${sectionId}`;
                link.classList.toggle('active', isMatch);
            });
        }
    });
}

window.addEventListener('scroll', highlightActiveLink, { passive: true });
highlightActiveLink();

// 5) Atualizar ano do rodapé dinamicamente
const yearSpan = document.getElementById('current-year');
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

// 6) Dark Theme — alterna e persiste com ícones SVG estilo Apple (padrão: claro Apple Design)
(function themeToggle() {
    const STORAGE_KEY = 'portfolio-theme-apple';
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = saved === 'dark' ? 'dark' : 'light';

    const icon = btn.querySelector('.theme-icon');

    const moonSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    const sunSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;

    function apply(theme) {
        document.body.classList.toggle('dark', theme === 'dark');
        if (icon) icon.innerHTML = theme === 'dark' ? sunSvg : moonSvg;
        btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        btn.setAttribute(
            'title',
            theme === 'dark' ? 'Tema escuro (clique para claro)' : 'Tema claro (clique para escuro)'
        );
    }

    apply(initial);

    btn.addEventListener('click', () => {
        const next = document.body.classList.contains('dark') ? 'light' : 'dark';
        apply(next);
        try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
    });

    // Reage se o usuário mudar a preferência do sistema (só se nunca escolheu manualmente)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(STORAGE_KEY)) {
            apply(e.matches ? 'dark' : 'light');
        }
    });
})();

// 7) Console — easter egg técnico
console.log(
    '%c🎓 Portfólio SENAI — Desenvolvimento de Sistemas',
    'color: #0071E3; font-size: 16px; font-weight: bold;'
);
console.log(
    '%cFeito com HTML, CSS e JavaScript puro — Apple Design System.',
    'color: #86868B; font-size: 13px;'
);
console.log(
    '%c📧 Aberto a oportunidades de estágio!',
    'color: #0071E3; font-size: 13px; font-weight: bold;'
);
