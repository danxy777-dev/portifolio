/**
 * POKÉDEX - SCRIPT.JS
 * JavaScript principal — PokéAPI + lógica completa
 * Organizado em módulos funcionais
 */

/* ====================================================
   CONFIGURAÇÕES GLOBAIS
   ==================================================== */
   const CONFIG = {
    API: 'https://pokeapi.co/api/v2',
    IMG: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork',
    SPRITE: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon',
    TOTAL: 1025,
    PER_PAGE: 40,
  };
  
  /* Cache em memória para evitar re-fetches */
  const CACHE = new Map();
  
  /* ====================================================
     UTILITÁRIOS
     ==================================================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  
  /** Busca com cache */
  async function apiFetch(url) {
    if (CACHE.has(url)) return CACHE.get(url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      CACHE.set(url, data);
      return data;
    } catch (e) {
      console.error('API Error:', url, e);
      return null;
    }
  }
  
  /** Mostra toast */
  function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2600);
  }
  
  /** Capitaliza */
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ') : '';
  
  /** Formata número Pokédex */
  const padNum = n => String(n).padStart(4, '0');
  
  /** Cor da barra HP */
  function hpColor(pct) {
    if (pct >= 60) return 'hp-high';
    if (pct >= 30) return 'hp-mid';
    return 'hp-low';
  }
  
  /** Som de clique */
  function playClick() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'square'; o.frequency.value = 800;
      g.gain.setValueAtTime(.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .1);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + .1);
    } catch (e) { /* silencioso se AudioContext bloqueado */ }
  }
  
  /* ====================================================
     TEMA ESCURO / CLARO
     ==================================================== */
  const ThemeManager = {
    init() {
      const saved = localStorage.getItem('theme') || 'light';
      this.apply(saved);
      $$('.btn-dark-toggle').forEach(btn => {
        btn.addEventListener('click', () => this.toggle());
      });
    },
    apply(theme) {
      document.body.classList.toggle('dark', theme === 'dark');
      $$('.btn-dark-toggle').forEach(b => b.textContent = theme === 'dark' ? '☀️' : '🌙');
      localStorage.setItem('theme', theme);
    },
    toggle() {
      playClick();
      const cur = document.body.classList.contains('dark') ? 'dark' : 'light';
      this.apply(cur === 'dark' ? 'light' : 'dark');
    }
  };
  
  /* ====================================================
     NAVBAR — menu mobile
     ==================================================== */
  function initNavbar() {
    const hamburger = document.getElementById('nav-hamburger');
    const mobileMenu = document.getElementById('nav-mobile');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
      });
      // Fecha ao clicar fora
      document.addEventListener('click', e => {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
          mobileMenu.classList.remove('open');
        }
      });
    }
  
    // Marca link ativo
    const path = window.location.pathname.split('/').pop() || 'index.html';
    $$('.nav-links a, #nav-mobile a').forEach(a => {
      if (a.getAttribute('href') === path) a.classList.add('active');
    });
  
    // Scroll to top
    const scrollBtn = document.getElementById('scroll-top');
    if (scrollBtn) {
      window.addEventListener('scroll', () => {
        scrollBtn.classList.toggle('visible', window.scrollY > 400);
      });
      scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }
  
  /* ====================================================
     LOADING SCREEN
     ==================================================== */
  async function hideLoader() {
    await sleep(900);
    const ls = document.getElementById('loading-screen');
    if (ls) {
      ls.classList.add('hidden');
      setTimeout(() => ls.remove(), 600);
    }
  }
  
  /* ====================================================
     FAVORITOS (LocalStorage)
     ==================================================== */
  const Favorites = {
    get() { return JSON.parse(localStorage.getItem('poke-favs') || '[]'); },
    has(id) { return this.get().includes(Number(id)); },
    toggle(id) {
      id = Number(id);
      let favs = this.get();
      if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
        showToast('💔 Removido dos favoritos');
      } else {
        favs.push(id);
        showToast('⭐ Adicionado aos favoritos!');
      }
      localStorage.setItem('poke-favs', JSON.stringify(favs));
      return favs.includes(id);
    }
  };
  
  /* ====================================================
     HISTÓRICO
     ==================================================== */
  const History = {
    get() { return JSON.parse(localStorage.getItem('poke-history') || '[]'); },
    add(id, name) {
      let h = this.get().filter(x => x.id !== id);
      h.unshift({ id, name, date: Date.now() });
      if (h.length > 20) h = h.slice(0, 20);
      localStorage.setItem('poke-history', JSON.stringify(h));
    }
  };
  
  /* ====================================================
     TIPOS — dados completos
     ==================================================== */
  const TYPE_DATA = {
    normal:   { color: '#A8A878', icon: '⚪', weakTo: ['fighting'], resistedBy: [], immune: ['ghost'] },
    fire:     { color: '#F08030', icon: '🔥', weakTo: ['water','rock','ground'], resistedBy: ['grass','ice','bug','steel','fire','fairy'] },
    water:    { color: '#6890F0', icon: '💧', weakTo: ['electric','grass'], resistedBy: ['water','fire','ice','steel'] },
    electric: { color: '#F8D030', icon: '⚡', weakTo: ['ground'], resistedBy: ['electric','flying','steel'], immune: ['ground'] },
    grass:    { color: '#78C850', icon: '🌿', weakTo: ['fire','ice','poison','flying','bug'], resistedBy: ['water','electric','grass','ground'] },
    ice:      { color: '#98D8D8', icon: '❄️', weakTo: ['fire','fighting','rock','steel'], resistedBy: ['ice'] },
    fighting: { color: '#C03028', icon: '🥊', weakTo: ['flying','psychic','fairy'], resistedBy: ['bug','rock','dark'] },
    poison:   { color: '#A040A0', icon: '☠️', weakTo: ['ground','psychic'], resistedBy: ['grass','fighting','poison','bug','fairy'] },
    ground:   { color: '#E0C068', icon: '🌍', weakTo: ['water','grass','ice'], resistedBy: ['poison','rock'], immune: ['electric'] },
    flying:   { color: '#A890F0', icon: '🦅', weakTo: ['electric','ice','rock'], resistedBy: ['grass','fighting','bug'] },
    psychic:  { color: '#F85888', icon: '🔮', weakTo: ['bug','ghost','dark'], resistedBy: ['fighting','psychic'], immune: ['dark'] },
    bug:      { color: '#A8B820', icon: '🐛', weakTo: ['fire','flying','rock'], resistedBy: ['grass','fighting','ground'] },
    rock:     { color: '#B8A038', icon: '🪨', weakTo: ['water','grass','fighting','ground','steel'], resistedBy: ['normal','fire','poison','flying'] },
    ghost:    { color: '#705898', icon: '👻', weakTo: ['ghost','dark'], resistedBy: ['poison','bug'], immune: ['normal','fighting'] },
    dragon:   { color: '#7038F8', icon: '🐉', weakTo: ['ice','dragon','fairy'], resistedBy: ['fire','water','electric','grass'] },
    dark:     { color: '#705848', icon: '🌑', weakTo: ['fighting','bug','fairy'], resistedBy: ['ghost','dark'], immune: ['psychic'] },
    steel:    { color: '#B8B8D0', icon: '⚙️', weakTo: ['fire','fighting','ground'], resistedBy: ['normal','grass','ice','flying','psychic','bug','rock','dragon','steel','fairy'] },
    fairy:    { color: '#EE99AC', icon: '✨', weakTo: ['poison','steel'], resistedBy: ['fighting','bug','dark'], immune: ['dragon'] },
  };
  
  /* ====================================================
     PÁGINA: POKÉDEX (pokedex.html)
     ==================================================== */
  const PokedexPage = {
    allPokemon: [],    // dados básicos pré-carregados
    filtered: [],
    page: 0,
    loading: false,
    filters: { search: '', type: '', gen: '', legendary: '', sort: 'number' },
  
    async init() {
      if (!document.getElementById('pokemon-grid')) return;
      await this.preload();
      this.bindEvents();
      this.render();
    },
  
    /** Carrega lista básica (nome + id) */
    async preload() {
      const el = document.getElementById('pokemon-grid');
      el.innerHTML = '<div class="spinner"></div>';
      const data = await apiFetch(`${CONFIG.API}/pokemon?limit=${CONFIG.TOTAL}&offset=0`);
      if (!data) { el.innerHTML = '<div class="empty-state"><div class="icon">❌</div><p>Erro ao carregar dados</p></div>'; return; }
      this.allPokemon = data.results.map((p, i) => ({ ...p, id: i + 1 }));
      this.filtered = [...this.allPokemon];
      this.updateCount();
    },
  
    bindEvents() {
      const searchInput = document.getElementById('search-input');
      const typeFilter  = document.getElementById('type-filter');
      const genFilter   = document.getElementById('gen-filter');
      const sortFilter  = document.getElementById('sort-filter');
      const legendBtn   = document.getElementById('filter-legendary');
      const mythicBtn   = document.getElementById('filter-mythic');
      const favBtn      = document.getElementById('filter-favs');
      const loadMoreBtn = document.getElementById('load-more-btn');
  
      if (searchInput) {
        let timer;
        searchInput.addEventListener('input', () => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            this.filters.search = searchInput.value.trim().toLowerCase();
            this.applyFilters();
          }, 320);
        });
      }
      if (typeFilter) typeFilter.addEventListener('change', () => { this.filters.type = typeFilter.value; this.applyFilters(); });
      if (genFilter)  genFilter.addEventListener('change',  () => { this.filters.gen  = genFilter.value;  this.applyFilters(); });
      if (sortFilter) sortFilter.addEventListener('change', () => { this.filters.sort = sortFilter.value; this.applyFilters(); });
  
      if (legendBtn) legendBtn.addEventListener('click', () => {
        legendBtn.classList.toggle('active');
        this.filters.legendary = legendBtn.classList.contains('active') ? 'legendary' : '';
        this.applyFilters();
      });
      if (mythicBtn) mythicBtn.addEventListener('click', () => {
        mythicBtn.classList.toggle('active');
        this.filters.legendary = mythicBtn.classList.contains('active') ? 'mythical' : '';
        this.applyFilters();
      });
      if (favBtn) favBtn.addEventListener('click', () => {
        favBtn.classList.toggle('active');
        this.filters.favs = favBtn.classList.contains('active');
        this.applyFilters();
      });
      if (loadMoreBtn) loadMoreBtn.addEventListener('click', () => this.loadMore());
    },
  
    applyFilters() {
      const { search, type, gen, legendary, favs, sort } = this.filters;
      let list = [...this.allPokemon];
  
      if (search) {
        const num = parseInt(search);
        if (!isNaN(num)) list = list.filter(p => p.id === num);
        else list = list.filter(p => p.name.includes(search));
      }
      if (favs) {
        const f = Favorites.get();
        list = list.filter(p => f.includes(p.id));
      }
      if (gen) {
        const ranges = { '1':[ 1,151],'2':[152,251],'3':[252,386],'4':[387,493],'5':[494,649],'6':[650,721],'7':[722,809],'8':[810,905],'9':[906,1025] };
        const r = ranges[gen];
        if (r) list = list.filter(p => p.id >= r[0] && p.id <= r[1]);
      }
      // Filtragem por tipo e lendário requer dados detalhados — aplica após render
      this.filtered = list;
      this.page = 0;
      this.updateCount();
      this.render();
    },
  
    updateCount() {
      const el = document.getElementById('results-count');
      if (el) el.textContent = `${this.filtered.length} Pokémon encontrados`;
    },
  
    render() {
      const grid = document.getElementById('pokemon-grid');
      if (!grid) return;
      grid.innerHTML = '';
      const slice = this.filtered.slice(0, CONFIG.PER_PAGE * (this.page + 1));
      slice.forEach(p => grid.appendChild(this.createCard(p)));
      const lb = document.getElementById('load-more-btn');
      if (lb) lb.style.display = slice.length < this.filtered.length ? 'inline-block' : 'none';
    },
  
    loadMore() {
      this.page++;
      this.render();
    },
  
    createCard(p) {
      const div = document.createElement('div');
      div.className = 'pokemon-card fade-in';
      div.setAttribute('data-id', p.id);
  
      const imgUrl = `${CONFIG.IMG}/${p.id}.png`;
      const fav = Favorites.has(p.id);
  
      div.innerHTML = `
        <button class="card-fav ${fav ? 'active' : ''}" data-fav="${p.id}" title="Favoritar">★</button>
        <div class="card-img-wrap">
          <div class="card-bg-circle" style="background: #888"></div>
          <img class="pokemon-card-img official" 
               src="${imgUrl}" 
               alt="${p.name}"
               onerror="this.src='${CONFIG.SPRITE}/${p.id}.png';this.classList.add('pixelated')"
               loading="lazy">
        </div>
        <div class="card-number">#${padNum(p.id)}</div>
        <div class="card-name">${cap(p.name)}</div>
        <div class="card-types" data-id="${p.id}">
          <span class="type-badge type-unknown">···</span>
        </div>`;
  
      // Clique → detalhe
      div.addEventListener('click', e => {
        if (e.target.closest('.card-fav')) return;
        playClick();
        window.location.href = `pokemon.html?id=${p.id}`;
      });
  
      // Botão favorito
      div.querySelector('.card-fav').addEventListener('click', e => {
        e.stopPropagation();
        const active = Favorites.toggle(p.id);
        e.currentTarget.classList.toggle('active', active);
      });
  
      // Carrega tipos de forma assíncrona
      this.loadCardTypes(p.id, div);
      return div;
    },
  
    async loadCardTypes(id, cardEl) {
      const data = await apiFetch(`${CONFIG.API}/pokemon/${id}`);
      if (!data) return;
      const typesEl = cardEl.querySelector('.card-types');
      const bgEl = cardEl.querySelector('.card-bg-circle');
      if (typesEl) {
        typesEl.innerHTML = data.types.map(t =>
          `<span class="type-badge type-${t.type.name}">${cap(t.type.name)}</span>`
        ).join('');
      }
      if (bgEl && data.types[0]) {
        const c = TYPE_DATA[data.types[0].type.name]?.color || '#888';
        bgEl.style.background = c;
      }
    }
  };
  
  /* ====================================================
     PÁGINA: DETALHE DO POKÉMON (pokemon.html)
     ==================================================== */
  const PokemonDetail = {
    data: null,
    speciesData: null,
    shiny: false,
  
    async init() {
      if (!document.getElementById('detail-root')) return;
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 1;
      await this.load(id);
    },
  
    async load(id) {
      const root = document.getElementById('detail-root');
      root.innerHTML = '<div class="spinner"></div>';
  
      const [data, specData] = await Promise.all([
        apiFetch(`${CONFIG.API}/pokemon/${id}`),
        apiFetch(`${CONFIG.API}/pokemon-species/${id}`)
      ]);
  
      if (!data) {
        root.innerHTML = '<div class="empty-state"><div class="icon">❌</div><p>Pokémon não encontrado</p></div>';
        return;
      }
  
      this.data = data;
      this.speciesData = specData;
  
      // Atualiza título da página
      document.title = `${cap(data.name)} — Pokédex`;
  
      // Adiciona ao histórico
      History.add(data.id, data.name);
  
      this.renderHero();
      this.renderTabs();
    },
  
    renderHero() {
      const d = this.data;
      const s = this.speciesData;
      const imgUrl = `${CONFIG.IMG}/${d.id}.png`;
      const types = d.types.map(t =>
        `<span class="type-badge type-${t.type.name}">${cap(t.type.name)}</span>`
      ).join('');
  
      const hero = document.getElementById('detail-hero');
      if (!hero) return;
  
      const mainColor = TYPE_DATA[d.types[0]?.type.name]?.color || '#CC0000';
      hero.style.background = `linear-gradient(135deg, ${mainColor} 0%, #111 100%)`;
      hero.innerHTML = `
        <div class="breadcrumb" style="color:rgba(255,255,255,.7);justify-content:center">
          <a href="index.html" style="color:rgba(255,255,255,.7)">Início</a>
          <span class="breadcrumb-sep">/</span>
          <a href="pokedex.html" style="color:rgba(255,255,255,.7)">Pokédex</a>
          <span class="breadcrumb-sep">/</span>
          <span>${cap(d.name)}</span>
        </div>
        <div class="shiny-toggle" id="shiny-toggle">
          <span>✨ Shiny</span>
          <div class="toggle-dot"></div>
        </div>
        <img class="detail-hero-img" id="hero-img" src="${imgUrl}"
             onerror="this.src='${CONFIG.SPRITE}/${d.id}.png'"
             alt="${d.name}">
        <div class="detail-number">#${padNum(d.id)}</div>
        <div class="detail-name">${cap(d.name)}</div>
        <div class="detail-types">${types}</div>
        <div style="display:flex;gap:12px;justify-content:center;margin-top:8px">
          <span style="opacity:.8">${d.height / 10}m</span>
          <span style="opacity:.4">|</span>
          <span style="opacity:.8">${d.weight / 10}kg</span>
          ${s?.is_legendary ? '<span style="background:rgba(255,215,0,.3);padding:3px 10px;border-radius:20px;font-size:.8rem">⭐ Lendário</span>' : ''}
          ${s?.is_mythical ? '<span style="background:rgba(255,100,200,.3);padding:3px 10px;border-radius:20px;font-size:.8rem">✨ Mítico</span>' : ''}
        </div>
        <div style="margin-top:16px;display:flex;gap:12px;justify-content:center">
          <button onclick="Favorites.toggle(${d.id});this.textContent=Favorites.has(${d.id})?'💛 Favoritado':'☆ Favoritar'" 
            style="padding:8px 20px;border-radius:50px;background:rgba(255,255,255,.2);color:#fff;border:2px solid rgba(255,255,255,.4);font-weight:700;cursor:pointer">
            ${Favorites.has(d.id) ? '💛 Favoritado' : '☆ Favoritar'}
          </button>
          <button onclick="window.location.href='batalhas.html?id=${d.id}'"
            style="padding:8px 20px;border-radius:50px;background:rgba(255,255,255,.2);color:#fff;border:2px solid rgba(255,255,255,.4);font-weight:700;cursor:pointer">
            ⚔️ Batalhar
          </button>
        </div>`;
  
      // Toggle shiny
      document.getElementById('shiny-toggle')?.addEventListener('click', () => {
        this.shiny = !this.shiny;
        document.getElementById('shiny-toggle').classList.toggle('active', this.shiny);
        const img = document.getElementById('hero-img');
        if (img) img.src = this.shiny
          ? `${CONFIG.SPRITE}/shiny/${d.id}.png`
          : imgUrl;
      });
    },
  
    renderTabs() {
      const d = this.data;
      const s = this.speciesData;
  
      // Descrição Pokédex
      const desc = s?.flavor_text_entries
        ?.find(e => e.language.name === 'en')?.flavor_text
        ?.replace(/\f/g, ' ') || 'Sem descrição disponível.';
  
      // Stats
      const statsHtml = d.stats.map(stat => {
        const names = { 'hp':'HP','attack':'Ataque','defense':'Defesa','special-attack':'Atq. Esp.','special-defense':'Def. Esp.','speed':'Velocidade' };
        const pct = Math.min(100, Math.round(stat.base_stat / 255 * 100));
        const color = stat.base_stat >= 100 ? '#4ade80' : stat.base_stat >= 60 ? '#facc15' : '#f87171';
        return `<div class="stats-bar-wrap">
          <div class="stats-bar-label">
            <span class="stats-bar-name">${names[stat.stat.name] || cap(stat.stat.name)}</span>
            <span class="stats-bar-val">${stat.base_stat}</span>
          </div>
          <div class="stats-bar-track"><div class="stats-bar-fill" style="width:0%;background:${color}" data-width="${pct}%"></div></div>
        </div>`;
      }).join('');
      const total = d.stats.reduce((s, x) => s + x.base_stat, 0);
  
      // Habilidades
      const abilitiesHtml = d.abilities.map(a =>
        `<div class="ability-card">
          <div class="ability-name">${cap(a.ability.name)}</div>
          ${a.is_hidden ? '<div class="ability-hidden">★ Habilidade Oculta</div>' : ''}
        </div>`
      ).join('');
  
      // Info básica
      const category = s?.genera?.find(g => g.language.name === 'en')?.genus || '—';
      const eggGroups = s?.egg_groups?.map(e => cap(e.name)).join(', ') || '—';
      const genderRate = s?.gender_rate === -1 ? 'Sem gênero' :
        s?.gender_rate !== undefined ? `♂ ${((8 - s.gender_rate) / 8 * 100).toFixed(0)}% / ♀ ${(s.gender_rate / 8 * 100).toFixed(0)}%` : '—';
      const captureRate = s?.capture_rate ?? '—';
      const baseExp = d.base_experience ?? '—';
      const growthRate = cap(s?.growth_rate?.name || '—');
  
      const root = document.getElementById('detail-root');
      root.innerHTML = `
        <div id="detail-hero" class="detail-hero"></div>
        <div class="detail-tabs">
          <button class="detail-tab active" data-tab="sobre">Sobre</button>
          <button class="detail-tab" data-tab="stats">Estatísticas</button>
          <button class="detail-tab" data-tab="evolucao">Evolução</button>
          <button class="detail-tab" data-tab="movimentos">Movimentos</button>
        </div>
  
        <div class="container" style="padding-top:24px">
  
          <!-- ABA SOBRE -->
          <div class="detail-panel active" id="tab-sobre">
            <div class="card mb-2">
              <div class="section-title" style="margin-bottom:12px">Descrição</div>
              <p style="line-height:1.7;color:var(--text2)">${desc}</p>
            </div>
            <div class="info-grid mb-2">
              <div class="info-card"><div class="info-card-label">Categoria</div><div class="info-card-value">${category}</div></div>
              <div class="info-card"><div class="info-card-label">Altura</div><div class="info-card-value">${d.height / 10} m</div></div>
              <div class="info-card"><div class="info-card-label">Peso</div><div class="info-card-value">${d.weight / 10} kg</div></div>
              <div class="info-card"><div class="info-card-label">Gênero</div><div class="info-card-value">${genderRate}</div></div>
              <div class="info-card"><div class="info-card-label">Taxa de Captura</div><div class="info-card-value">${captureRate}</div></div>
              <div class="info-card"><div class="info-card-label">Grupo de Ovos</div><div class="info-card-value">${eggGroups}</div></div>
              <div class="info-card"><div class="info-card-label">Exp. Base</div><div class="info-card-value">${baseExp}</div></div>
              <div class="info-card"><div class="info-card-label">Taxa de Crescimento</div><div class="info-card-value">${growthRate}</div></div>
            </div>
            <div class="card">
              <div class="section-title" style="margin-bottom:14px">Habilidades</div>
              ${abilitiesHtml}
            </div>
          </div>
  
          <!-- ABA STATS -->
          <div class="detail-panel" id="tab-stats">
            <div class="card">
              <div class="section-title" style="margin-bottom:20px">Estatísticas Base</div>
              ${statsHtml}
              <div style="border-top:2px solid var(--border);margin-top:12px;padding-top:12px">
                <div class="stats-bar-label">
                  <span class="stats-bar-name" style="font-weight:800">Total</span>
                  <span class="stats-bar-val" style="font-size:1.1rem;color:var(--accent)">${total}</span>
                </div>
              </div>
            </div>
          </div>
  
          <!-- ABA EVOLUÇÃO -->
          <div class="detail-panel" id="tab-evolucao">
            <div class="card">
              <div class="section-title" style="margin-bottom:20px">Cadeia Evolutiva</div>
              <div class="evo-chain" id="evo-chain"><div class="spinner"></div></div>
            </div>
          </div>
  
          <!-- ABA MOVIMENTOS -->
          <div class="detail-panel" id="tab-movimentos">
            <div class="card">
              <div class="section-title" style="margin-bottom:14px">Movimentos por Nível</div>
              <div id="moves-list"><div class="spinner"></div></div>
            </div>
          </div>
  
        </div>`;
  
      // Botão voltar
      history.pushState(null, '', `pokemon.html?id=${d.id}`);
  
      // Renderiza hero
      this.renderHero();
  
      // Tabs
      $$('.detail-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          $$('.detail-tab').forEach(b => b.classList.remove('active'));
          $$('.detail-panel').forEach(p => p.classList.remove('active'));
          btn.classList.add('active');
          const tab = btn.dataset.tab;
          document.getElementById(`tab-${tab}`)?.classList.add('active');
          if (tab === 'evolucao') this.loadEvoChain();
          if (tab === 'movimentos') this.loadMoves();
        });
      });
  
      // Anima barras de stat após render
      setTimeout(() => {
        $$('.stats-bar-fill').forEach(el => {
          el.style.width = el.dataset.width;
        });
      }, 300);
    },
  
    async loadEvoChain() {
      const s = this.speciesData;
      if (!s?.evolution_chain?.url) return;
      const chain = await apiFetch(s.evolution_chain.url);
      if (!chain) return;
  
      const steps = this.flattenChain(chain.chain);
      const el = document.getElementById('evo-chain');
      if (!el) return;
  
      let html = '';
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const id = step.url.split('/').filter(Boolean).pop();
        const imgUrl = `${CONFIG.IMG}/${id}.png`;
        html += `
          <div class="evo-step" onclick="window.location.href='pokemon.html?id=${id}'">
            <img src="${imgUrl}" onerror="this.src='${CONFIG.SPRITE}/${id}.png'" alt="${step.name}" width="80" height="80">
            <div class="evo-step-name">${cap(step.name)}</div>
            <div class="evo-method">${step.trigger || ''}</div>
          </div>`;
        if (i < steps.length - 1) html += '<div class="evo-arrow">→</div>';
      }
      el.innerHTML = html || '<p style="color:var(--text2);text-align:center">Este Pokémon não possui cadeia evolutiva.</p>';
    },
  
    flattenChain(node, arr = []) {
      if (!node) return arr;
      const id = node.species.url.split('/').filter(Boolean).pop();
      const trigger = node.evolution_details?.[0]
        ? this.evoTrigger(node.evolution_details[0]) : '';
      arr.push({ name: node.species.name, url: node.species.url, trigger });
      if (node.evolves_to?.[0]) this.flattenChain(node.evolves_to[0], arr);
      return arr;
    },
  
    evoTrigger(d) {
      if (d.min_level) return `Nv. ${d.min_level}`;
      if (d.item) return cap(d.item.name);
      if (d.trigger?.name === 'trade') return 'Troca';
      if (d.min_happiness) return 'Amizade';
      return '';
    },
  
    async loadMoves() {
      const d = this.data;
      const el = document.getElementById('moves-list');
      if (!el || !d) return;
  
      const levelMoves = d.moves
        .filter(m => m.version_group_details.some(v => v.move_learn_method.name === 'level-up'))
        .map(m => ({
          name: m.move.name,
          level: m.version_group_details.find(v => v.move_learn_method.name === 'level-up')?.level_learned_at || 0
        }))
        .sort((a, b) => a.level - b.level)
        .slice(0, 30);
  
      el.innerHTML = `
        <table style="width:100%;border-collapse:collapse">
          <thead><tr>
            <th style="text-align:left;padding:8px;color:var(--text2);font-size:.85rem;border-bottom:2px solid var(--border)">Nível</th>
            <th style="text-align:left;padding:8px;color:var(--text2);font-size:.85rem;border-bottom:2px solid var(--border)">Movimento</th>
          </tr></thead>
          <tbody>
            ${levelMoves.map(m => `<tr>
              <td style="padding:8px;border-bottom:1px solid var(--border);font-weight:700;color:var(--accent)">${m.level || '—'}</td>
              <td style="padding:8px;border-bottom:1px solid var(--border);text-transform:capitalize">${m.name.replace(/-/g,' ')}</td>
            </tr>`).join('')}
          </tbody>
        </table>`;
    }
  };
  
  /* ====================================================
     PÁGINA: TIPOS (tipos.html)
     ==================================================== */
  const TypesPage = {
    async init() {
      const grid = document.getElementById('types-grid');
      if (!grid) return;
  
      grid.innerHTML = Object.entries(TYPE_DATA).map(([name, t]) => `
        <div class="type-card" onclick="TypesPage.showDetail('${name}')">
          <div class="type-card-header" style="background:${t.color}">
            <span class="type-card-icon">${t.icon}</span>
            <span class="type-card-name">${cap(name)}</span>
          </div>
          <div class="type-card-body">
            <div class="type-rel">
              <div class="type-rel-label">⚠️ Fraco contra</div>
              <div class="type-rel-badges">
                ${(t.weakTo||[]).map(w => `<span class="type-rel-badge type-${w}">${cap(w)}</span>`).join('')||'Nenhum'}
              </div>
            </div>
            <div class="type-rel">
              <div class="type-rel-label">🛡️ Resiste a</div>
              <div class="type-rel-badges">
                ${(t.resistedBy||[]).slice(0,4).map(w => `<span class="type-rel-badge type-${w}">${cap(w)}</span>`).join('')||'Nenhum'}
              </div>
            </div>
            ${t.immune?.length ? `
            <div class="type-rel">
              <div class="type-rel-label">🚫 Imune a</div>
              <div class="type-rel-badges">
                ${t.immune.map(w => `<span class="type-rel-badge" style="background:#555">${cap(w)}</span>`).join('')}
              </div>
            </div>` : ''}
          </div>
        </div>`).join('');
    },
  
    showDetail(typeName) {
      const t = TYPE_DATA[typeName];
      if (!t) return;
      const modal = document.getElementById('type-modal');
      const content = document.getElementById('type-modal-content');
      if (!modal || !content) return;
  
      content.innerHTML = `
        <div style="background:${t.color};padding:20px;border-radius:10px;color:#fff;margin-bottom:20px;text-align:center">
          <div style="font-size:3rem">${t.icon}</div>
          <div style="font-size:1.5rem;font-weight:900;text-transform:uppercase;letter-spacing:1px">${cap(typeName)}</div>
        </div>
        <div class="info-grid">
          <div class="info-card">
            <div class="info-card-label">⚠️ Fraco contra</div>
            <div class="type-rel-badges" style="margin-top:6px">
              ${(t.weakTo||[]).map(w => `<span class="type-badge type-${w}" style="margin:2px">${cap(w)}</span>`).join('')||'Nenhum'}
            </div>
          </div>
          <div class="info-card">
            <div class="info-card-label">🛡️ Resiste a</div>
            <div class="type-rel-badges" style="margin-top:6px">
              ${(t.resistedBy||[]).map(w => `<span class="type-badge type-${w}" style="margin:2px">${cap(w)}</span>`).join('')||'Nenhum'}
            </div>
          </div>
          ${t.immune?.length ? `
          <div class="info-card">
            <div class="info-card-label">🚫 Imune a</div>
            <div class="type-rel-badges" style="margin-top:6px">
              ${t.immune.map(w => `<span class="type-badge" style="background:#555;margin:2px">${cap(w)}</span>`).join('')}
            </div>
          </div>` : ''}
        </div>`;
  
      modal.classList.add('open');
    }
  };
  
  /* ====================================================
     PÁGINA: TREINADORES (treinadores.html)
     ==================================================== */
  const TRAINERS_DATA = [
    {
      name: 'Ash Ketchum', region: 'Kanto', color: '#3B82F6',
      bio: 'O mais famoso treinador Pokémon do mundo. Saiu de Pallet Town aos 10 anos para se tornar Mestre Pokémon. Após inúmeras jornadas, finalmente alcançou seu sonho ao vencer o Campeonato Mundial.',
      achievements: ['Campeão Mundial Pokémon', '8 Insígnias de Kanto', 'Campeão de Alola', 'Vencedor da Liga de Lugia'],
      appearances: ['Série Original','Advanced Generation','XY','Sun & Moon','Journeys'],
      team: [25, 6, 658, 706, 823, 392]
    },
    {
      name: 'Red', region: 'Kanto', color: '#EF4444',
      bio: 'O treinador silencioso do topo do Monte Silver. Considerado o mais forte treinador de todos os tempos nos jogos, Red derrotou os Rockets e o campeão Blue antes de se isolar.',
      achievements: ['Campeão de Kanto','Derrotou Giovanni','Desbloqueou Cerulean Cave'],
      appearances: ['Pokémon Red/Blue/Yellow', 'Gold/Silver/Crystal', 'FireRed/LeafGreen', 'HeartGold/SoulSilver'],
      team: [196, 65, 112, 59, 143, 131]
    },
    {
      name: 'Cynthia', region: 'Sinnoh', color: '#8B5CF6',
      bio: 'A lendária Campeã de Sinnoh. Uma das personagens mais amadas da franquia, conhecida por sua equipe devastadora liderada pelo poderoso Garchomp.',
      achievements: ['Campeã de Sinnoh', 'Especialista em mitologia Pokémon', 'Derrotada apenas pelos melhores'],
      appearances: ['Diamond/Pearl/Platinum', 'Black/White', 'Black2/White2', 'Legends: Arceus', 'Brilliant Diamond/Shining Pearl'],
      team: [571, 445, 473, 350, 450, 437]
    },
    {
      name: 'Leon', region: 'Galar', color: '#F59E0B',
      bio: 'O campeão invicto de Galar e o treinador mais forte do mundo. Seu Charizard é temido por todos. Famoso por se perder mesmo com mapa.',
      achievements: ['Campeão invicto de Galar', 'Vencedor da Copa de Galar 10 anos seguidos', 'Derrotado pelo jogador em SwSh'],
      appearances: ['Sword & Shield'],
      team: [6, 815, 839, 884, 823, 596]
    },
    {
      name: 'Lance', region: 'Johto', color: '#7C3AED',
      bio: 'O Mestre Dragão e Campeão de Johto. Usa apenas Pokémon do tipo Dragão e é considerado um dos campeões mais icônicos. Também atua como Elite Four em Kanto.',
      achievements: ['Campeão de Johto', 'Elite Four de Kanto', 'Membro do Conselho de Pokémon'],
      appearances: ['Red/Blue', 'Gold/Silver/Crystal', 'FireRed/LeafGreen', 'HeartGold/SoulSilver'],
      team: [149, 148, 230, 334, 130, 445]
    },
    {
      name: 'Steven Stone', region: 'Hoenn', color: '#6B7280',
      bio: 'Colecionador de pedras raras e Campeão de Hoenn. Filho do presidente da Devon Corporation. Especialista em Pokémon de aço e pedra.',
      achievements: ['Campeão de Hoenn', 'Especialista em Mega Evolução', 'Descobridor de Pokémon fósseis'],
      appearances: ['Ruby/Sapphire', 'Emerald', 'Omega Ruby/Alpha Sapphire'],
      team: [376, 379, 378, 306, 373, 227]
    },
    {
      name: 'Misty', region: 'Kanto', color: '#06B6D4',
      bio: 'A Líder de Ginásio de Cerulean City e especialista em tipos Água. Companheira de Ash em toda a série original. Apaixonada e corajosa, exceto quando o assunto é Bug.',
      achievements: ['Líder de Ginásio de Cerulean', 'Especialista em tipos Água', 'Companheira de viagem de Ash'],
      appearances: ['Série Original', 'Advanced Generation (especial)', 'Sun & Moon (especial)', 'Journeys'],
      team: [121, 131, 120, 54, 118, 72]
    },
    {
      name: 'Brock', region: 'Kanto', color: '#92400E',
      bio: 'Líder do Ginásio de Pewter City e especialista em tipos Pedra/Terra. Companheiro histórico de Ash e Misty. Sonha em ser o melhor criador de Pokémon do mundo.',
      achievements: ['Líder de Ginásio de Pewter', 'Especialista em Pokémon Rocha', 'Aspirante a médico Pokémon'],
      appearances: ['Série Original', 'Diamond & Pearl', 'Johto', 'Hoenn'],
      team: [95, 76, 74, 232, 111, 213]
    },
    {
      name: 'N', region: 'Unova', color: '#10B981',
      bio: 'O misterioso "Rei Natural" de Unova. Criado por Ghetsis para liderar o Team Plasma. Capaz de ouvir os pensamentos dos Pokémon. Sua visão do mundo é única e perturbadora.',
      achievements: ['Rei do Team Plasma', 'Liberou todos seus Pokémon', 'Derrotou a Liga de Unova', 'Domesticou Zekrom/Reshiram'],
      appearances: ['Black/White', 'Black2/White2'],
      team: [644, 612, 505, 537, 376, 571]
    },
    {
      name: 'Iris', region: 'Unova', color: '#EC4899',
      bio: 'A Campeã de Unova em Black 2/White 2. Ex-Líder de Ginásio de Opelucid City, especialista em tipos Dragão. Selvagem e enérgica, cresceu entre Pokémon Dragão.',
      achievements: ['Campeã de Unova (B2W2)', 'Líder do Ginásio de Opelucid', 'Especialista em tipos Dragão'],
      appearances: ['Black/White (Líder)','Black2/White2 (Campeã)','Série animada'],
      team: [445, 612, 373, 621, 330, 149]
    },
    {
      name: 'Blue', region: 'Kanto', color: '#3B82F6',
      bio: 'O eterno rival de Red. Neto do Prof. Oak e o primeiro Campeão de Kanto da história — derrotado por Red. Apesar da arrogância, evolui para um Líder de Ginásio respeitado.',
      achievements: ['1º Campeão de Kanto', 'Líder do Ginásio de Viridian', 'Venceu a Liga antes de Red'],
      appearances: ['Red/Blue/Yellow', 'Gold/Silver/Crystal', 'FireRed/LeafGreen', 'HeartGold/SoulSilver'],
      team: [9, 59, 103, 18, 65, 112]
    }
  ];
  
  const TrainersPage = {
    async init() {
      const grid = document.getElementById('trainers-grid');
      if (!grid) return;
      grid.innerHTML = TRAINERS_DATA.map(t => this.createCard(t)).join('');
      // Carrega sprites dos Pokémon
    },
  
    createCard(trainer) {
      const teamHtml = trainer.team.map(id => `
        <div class="trainer-poke">
          <img src="${CONFIG.SPRITE}/${id}.png" 
               onerror="this.style.opacity=.3"
               alt="pokemon-${id}" loading="lazy">
          <div class="trainer-poke-name">#${id}</div>
        </div>`).join('');
  
      const achievementsHtml = trainer.achievements.map(a => `<li>🏆 ${a}</li>`).join('');
  
      return `
        <div class="trainer-card">
          <div class="trainer-banner" style="background:linear-gradient(135deg, ${trainer.color}, #111)">
            <img class="trainer-avatar"
                 src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${trainer.team[0]}.png"
                 alt="${trainer.name}" 
                 onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${trainer.team[0]}.png'">
          </div>
          <div class="trainer-body">
            <div class="trainer-name">${trainer.name}</div>
            <div class="trainer-region">📍 ${trainer.region}</div>
            <div class="trainer-team">${teamHtml}</div>
            <p class="trainer-bio">${trainer.bio}</p>
            <div style="margin-top:12px;text-align:left">
              <div style="font-size:.82rem;font-weight:700;color:var(--text2);margin-bottom:6px">CONQUISTAS</div>
              <ul style="list-style:none;font-size:.82rem;color:var(--text2);line-height:2">${achievementsHtml}</ul>
            </div>
            <div style="margin-top:10px;text-align:left">
              <div style="font-size:.82rem;font-weight:700;color:var(--text2);margin-bottom:6px">APARIÇÕES</div>
              <div style="display:flex;flex-wrap:wrap;gap:5px">
                ${trainer.appearances.map(a => `<span style="background:var(--surface2);padding:2px 8px;border-radius:20px;font-size:.75rem">${a}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>`;
    }
  };
  
  /* ====================================================
     PÁGINA: BATALHAS (batalhas.html)
     ==================================================== */
  const BattlePage = {
    poke1: null, poke2: null,
    hp1: 100, hp2: 100,
    running: false,
  
    async init() {
      const arena = document.getElementById('battle-arena');
      if (!arena) return;
      await this.loadPicker();
  
      // Verifica se veio com ID na URL
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) {
        const sel = document.getElementById('poke1-select');
        if (sel) { sel.value = id; this.onSelect1(); }
      }
    },
  
    async loadPicker() {
      const data = await apiFetch(`${CONFIG.API}/pokemon?limit=251&offset=0`);
      if (!data) return;
      const opts = data.results.map((p, i) =>
        `<option value="${i+1}">${cap(p.name)}</option>`
      ).join('');
  
      const sel1 = document.getElementById('poke1-select');
      const sel2 = document.getElementById('poke2-select');
      if (sel1) { sel1.innerHTML = `<option value="">-- Escolha --</option>${opts}`; sel1.addEventListener('change', () => this.onSelect1()); }
      if (sel2) { sel2.innerHTML = `<option value="">-- Escolha --</option>${opts}`; sel2.addEventListener('change', () => this.onSelect2()); }
  
      document.getElementById('btn-battle-start')?.addEventListener('click', () => this.startBattle());
      document.getElementById('btn-battle-reset')?.addEventListener('click', () => this.reset());
    },
  
    async onSelect1() {
      const id = document.getElementById('poke1-select')?.value;
      if (!id) return;
      this.poke1 = await apiFetch(`${CONFIG.API}/pokemon/${id}`);
      this.updateSlot(1);
    },
    async onSelect2() {
      const id = document.getElementById('poke2-select')?.value;
      if (!id) return;
      this.poke2 = await apiFetch(`${CONFIG.API}/pokemon/${id}`);
      this.updateSlot(2);
    },
  
    updateSlot(n) {
      const p = n === 1 ? this.poke1 : this.poke2;
      if (!p) return;
      const img = document.getElementById(`battle-img-${n}`);
      const name = document.getElementById(`battle-name-${n}`);
      const hp = document.getElementById(`battle-hp-${n}`);
      if (img) { img.src = `${CONFIG.IMG}/${p.id}.png`; img.onerror = () => { img.src = `${CONFIG.SPRITE}/${p.id}.png`; }; }
      if (name) name.textContent = cap(p.name);
      if (hp) hp.style.width = '100%';
      const hpEl = hp?.parentElement;
      if (hpEl) hpEl.classList.remove('hp-low','hp-mid');
      if (n === 1) this.hp1 = 100;
      else this.hp2 = 100;
    },
  
    addLog(msg, cls = 'info') {
      const log = document.getElementById('battle-log');
      if (!log) return;
      const div = document.createElement('div');
      div.className = `log-entry ${cls}`;
      div.textContent = msg;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    },
  
    typeMultiplier(atkTypes, defTypes) {
      let m = 1;
      atkTypes.forEach(at => {
        defTypes.forEach(dt => {
          const d = TYPE_DATA[dt];
          if (d?.immune?.includes(at)) m *= 0;
          else if (d?.weakTo?.includes(at)) m *= 2;
          else if (d?.resistedBy?.includes(at)) m *= 0.5;
        });
      });
      return m;
    },
  
    async startBattle() {
      if (this.running || !this.poke1 || !this.poke2) {
        if (!this.poke1 || !this.poke2) showToast('Escolha dois Pokémon!');
        return;
      }
      this.running = true;
      const log = document.getElementById('battle-log');
      if (log) log.innerHTML = '';
      this.hp1 = 100; this.hp2 = 100;
      this.updateHpBar(1, 100);
      this.updateHpBar(2, 100);
  
      this.addLog(`⚔️ ${cap(this.poke1.name)} VS ${cap(this.poke2.name)}!`, 'info');
      this.addLog('Batalha iniciada!', 'info');
  
      const p1 = this.poke1;
      const p2 = this.poke2;
      const p1Types = p1.types.map(t => t.type.name);
      const p2Types = p2.types.map(t => t.type.name);
      const p1Spd = p1.stats.find(s => s.stat.name === 'speed')?.base_stat || 50;
      const p2Spd = p2.stats.find(s => s.stat.name === 'speed')?.base_stat || 50;
      const first = p1Spd >= p2Spd ? 1 : 2;
  
      this.addLog(`${cap(first===1?p1.name:p2.name)} ataca primeiro! (SPD ${first===1?p1Spd:p2Spd})`, 'info');
      await sleep(500);
  
      let round = 0;
      while (this.hp1 > 0 && this.hp2 > 0 && round < 20) {
        round++;
        for (const turn of [first, first===1?2:1]) {
          if (this.hp1 <= 0 || this.hp2 <= 0) break;
          const atk = turn === 1 ? p1 : p2;
          const def = turn === 1 ? p2 : p1;
          const atkTypes = atk.types.map(t => t.type.name);
          const defTypes = def.types.map(t => t.type.name);
          const atkStat = atk.stats.find(s => s.stat.name === 'attack')?.base_stat || 50;
          const defStat = def.stats.find(s => s.stat.name === 'defense')?.base_stat || 50;
          const multi = this.typeMultiplier(atkTypes, defTypes);
          const dmg = Math.max(1, Math.round((atkStat / defStat * 15 + Math.random() * 5) * multi));
          const dmgPct = Math.min(turn===1?this.hp2:this.hp1, Math.round(dmg / def.stats[0].base_stat * 100 * multi + 2));
  
          if (turn === 1) {
            this.hp2 = Math.max(0, this.hp2 - dmgPct);
            this.updateHpBar(2, this.hp2);
            document.getElementById('battle-img-2')?.classList.add('shake');
            setTimeout(() => document.getElementById('battle-img-2')?.classList.remove('shake'), 600);
          } else {
            this.hp1 = Math.max(0, this.hp1 - dmgPct);
            this.updateHpBar(1, this.hp1);
            document.getElementById('battle-img-1')?.classList.add('shake');
            setTimeout(() => document.getElementById('battle-img-1')?.classList.remove('shake'), 600);
          }
  
          const multi_txt = multi >= 2 ? '💥 Súper eficaz! ' : multi === 0 ? '🚫 Sem efeito! ' : multi < 1 ? '😑 Pouco eficaz. ' : '';
          this.addLog(`${multi_txt}${cap(atk.name)} causou ${dmgPct} de dano em ${cap(def.name)}!`, 'hit');
          await sleep(700);
        }
      }
  
      const winner = this.hp1 > this.hp2 ? p1 : (this.hp2 > this.hp1 ? p2 : null);
      if (winner) {
        this.addLog(`🏆 ${cap(winner.name)} VENCEU A BATALHA!`, 'win');
        showToast(`🏆 ${cap(winner.name)} venceu!`);
      } else {
        this.addLog('🤝 EMPATE!', 'win');
      }
      this.running = false;
    },
  
    updateHpBar(n, pct) {
      const el = document.getElementById(`battle-hp-${n}`);
      if (!el) return;
      el.style.width = `${pct}%`;
      el.className = `battle-hp-fill ${pct > 50 ? 'hp-high' : pct > 20 ? 'hp-mid' : 'hp-low'}`;
    },
  
    reset() {
      this.hp1 = this.hp2 = 100;
      this.poke1 = this.poke2 = null;
      this.running = false;
      document.getElementById('poke1-select').value = '';
      document.getElementById('poke2-select').value = '';
      const log = document.getElementById('battle-log');
      if (log) log.innerHTML = '';
      ['battle-img-1','battle-img-2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.src = '';
      });
      ['battle-name-1','battle-name-2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '?';
      });
      ['battle-hp-1','battle-hp-2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.width='100%'; el.className='battle-hp-fill hp-high'; }
      });
    }
  };
  
  /* ====================================================
     ÍNDICE: Dados da homepage (index.html)
     ==================================================== */
  const IndexPage = {
    async init() {
      if (!document.getElementById('featured-grid')) return;
      await this.loadFeatured();
      this.renderHistory();
      this.renderFavorites();
    },
  
    async loadFeatured() {
      const featured = [1, 4, 7, 25, 39, 52, 94, 143, 149, 150, 151, 384];
      const grid = document.getElementById('featured-grid');
      if (!grid) return;
      grid.innerHTML = '<div class="spinner"></div>';
  
      const cards = [];
      for (const id of featured) {
        const p = await apiFetch(`${CONFIG.API}/pokemon/${id}`);
        if (p) cards.push(p);
      }
  
      grid.innerHTML = '';
      cards.forEach(p => {
        const types = p.types.map(t =>
          `<span class="type-badge type-${t.type.name}">${cap(t.type.name)}</span>`
        ).join('');
        const div = document.createElement('div');
        div.className = 'pokemon-card fade-in';
        div.innerHTML = `
          <div class="card-img-wrap">
            <div class="card-bg-circle" style="background:${TYPE_DATA[p.types[0]?.type.name]?.color||'#888'}"></div>
            <img class="pokemon-card-img official" src="${CONFIG.IMG}/${p.id}.png" 
                 onerror="this.src='${CONFIG.SPRITE}/${p.id}.png'" alt="${p.name}" loading="lazy">
          </div>
          <div class="card-number">#${padNum(p.id)}</div>
          <div class="card-name">${cap(p.name)}</div>
          <div class="card-types">${types}</div>`;
        div.addEventListener('click', () => {
          playClick();
          window.location.href = `pokemon.html?id=${p.id}`;
        });
        grid.appendChild(div);
      });
    },
  
    renderHistory() {
      const el = document.getElementById('history-list');
      if (!el) return;
      const h = History.get();
      if (!h.length) { el.innerHTML = '<p style="color:var(--text2);font-size:.88rem">Nenhum Pokémon visitado ainda.</p>'; return; }
      el.innerHTML = h.slice(0, 8).map(x => `
        <a href="pokemon.html?id=${x.id}" style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:8px;transition:.2s;background:var(--surface2)" 
           onmouseover="this.style.background='var(--border)'" onmouseout="this.style.background='var(--surface2)'">
          <img src="${CONFIG.SPRITE}/${x.id}.png" width="36" height="36" style="image-rendering:pixelated">
          <span style="font-weight:700;text-transform:capitalize">${x.name}</span>
          <span style="font-size:.75rem;color:var(--text2);margin-left:auto">#${padNum(x.id)}</span>
        </a>`).join('');
    },
  
    renderFavorites() {
      const el = document.getElementById('favs-list');
      if (!el) return;
      const favs = Favorites.get();
      if (!favs.length) { el.innerHTML = '<p style="color:var(--text2);font-size:.88rem">Nenhum favorito ainda. ⭐</p>'; return; }
      el.innerHTML = favs.slice(0, 8).map(id => `
        <a href="pokemon.html?id=${id}" style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:8px;background:var(--surface2)">
          <img src="${CONFIG.SPRITE}/${id}.png" width="36" height="36" style="image-rendering:pixelated">
          <span style="font-weight:700">Pokémon #${id}</span>
        </a>`).join('');
    }
  };
  
  /* ====================================================
     QUIZ POKÉMON
     ==================================================== */
  const Quiz = {
    questions: [
      { q: 'Qual é o nº nacional do Pikachu?', opts: ['#024', '#025', '#026', '#035'], ans: 1 },
      { q: 'Qual tipo é fraco contra Fada?', opts: ['Aço', 'Dragão', 'Fada', 'Grama'], ans: 1 },
      { q: 'Qual Pokémon é chamado de "Pokémon Semente"?', opts: ['Bulbasaur', 'Squirtle', 'Charmander', 'Caterpie'], ans: 0 },
      { q: 'Quem é o lendário mascote de Pokémon Gold?', opts: ['Lugia', 'Ho-Oh', 'Entei', 'Suicune'], ans: 1 },
      { q: 'Qual é a evolução final de Magikarp?', opts: ['Gyarados', 'Lapras', 'Vaporeon', 'Dragonite'], ans: 0 },
      { q: 'Qual tipo não afeta Pokémon Normal?', opts: ['Psíquico', 'Sombrio', 'Fantasma', 'Lutador'], ans: 2 },
      { q: 'Em qual região fica Pallet Town?', opts: ['Johto', 'Hoenn', 'Kanto', 'Sinnoh'], ans: 2 },
      { q: 'Qual Pokémon foi criado artificialmente?', opts: ['Mew', 'Mewtwo', 'Arceus', 'Deoxys'], ans: 1 },
      { q: 'Quantos tipos existem no Pokémon atual?', opts: ['16', '17', '18', '19'], ans: 2 },
      { q: 'Qual é o tipo de Eevee?', opts: ['Normal', 'Terra', 'Fada', 'Voador'], ans: 0 },
    ],
    current: 0, score: 0, answered: false,
  
    init() {
      const wrap = document.getElementById('quiz-wrap');
      if (!wrap) return;
      this.questions = this.questions.sort(() => Math.random() - .5);
      this.renderQuestion();
    },
  
    renderQuestion() {
      const wrap = document.getElementById('quiz-wrap');
      if (!wrap) return;
      const q = this.questions[this.current];
      if (!q) return this.showResult();
      this.answered = false;
  
      const pokeId = Math.floor(Math.random() * 251) + 1;
      wrap.innerHTML = `
        <div class="quiz-card fade-in">
          <img class="quiz-img" src="${CONFIG.IMG}/${pokeId}.png" onerror="this.src='${CONFIG.SPRITE}/${pokeId}.png'" alt="">
          <div style="font-size:.85rem;color:var(--text2);margin-bottom:12px">Pergunta ${this.current+1} / ${this.questions.length} • Pontos: ${this.score}</div>
          <div class="quiz-question">${q.q}</div>
          <div class="quiz-options">
            ${q.opts.map((o, i) => `
              <button class="quiz-opt" data-i="${i}">${o}</button>`).join('')}
          </div>
        </div>`;
  
      $$('.quiz-opt', wrap).forEach(btn => {
        btn.addEventListener('click', () => this.answer(Number(btn.dataset.i)));
      });
    },
  
    answer(i) {
      if (this.answered) return;
      this.answered = true;
      const q = this.questions[this.current];
      if (i === q.ans) {
        this.score++;
        $$('.quiz-opt')[i].classList.add('correct');
        showToast('✅ Correto!');
      } else {
        $$('.quiz-opt')[i].classList.add('wrong');
        $$('.quiz-opt')[q.ans].classList.add('correct');
        showToast('❌ Errado!');
      }
      setTimeout(() => {
        this.current++;
        this.renderQuestion();
      }, 1500);
    },
  
    showResult() {
      const wrap = document.getElementById('quiz-wrap');
      const pct = Math.round(this.score / this.questions.length * 100);
      wrap.innerHTML = `
        <div class="quiz-card fade-in" style="text-align:center">
          <div style="font-size:3rem;margin-bottom:12px">${pct >= 80 ? '🏆' : pct >= 50 ? '🥈' : '😅'}</div>
          <div style="font-size:1.5rem;font-weight:900;margin-bottom:8px">Quiz Concluído!</div>
          <div style="font-size:1.1rem;margin-bottom:20px">
            Você acertou <strong>${this.score}</strong> de <strong>${this.questions.length}</strong> perguntas (${pct}%)
          </div>
          <div style="margin-bottom:20px;font-size:.95rem;color:var(--text2)">
            ${pct >= 80 ? 'Você é um verdadeiro Mestre Pokémon! 🎉' : pct >= 50 ? 'Bom trabalho! Continue estudando a Pokédex.' : 'Pratique mais, Treinador! A jornada continua.'}
          </div>
          <button onclick="Quiz.current=0;Quiz.score=0;Quiz.init()" 
            style="padding:12px 28px;border-radius:50px;background:var(--accent);color:#fff;font-weight:700;border:none;cursor:pointer;font-size:1rem">
            🔄 Jogar Novamente
          </button>
        </div>`;
    }
  };
  
  /* ====================================================
     CURIOSIDADES
     ==================================================== */
  const CURIOSITIES = [
    { icon: '🔴', title: 'Por que Pokémon é Red?', text: 'O criador Satoshi Tajiri baseou o jogo na paixão de infância por colecionar insetos em Machida, Japão. A cor vermelha representa energia e combate.' },
    { icon: '⚡', title: 'Pikachu foi quase diferente', text: 'A equipe de design considerou tornar Clefairy o mascote, mas Pikachu foi escolhido por ser mais neutro em gênero e mais fofo para o público geral.' },
    { icon: '👁️', title: 'Gengar é a sombra de Clefable', text: 'Esta é uma teoria popular — Gengar seria a sombra de Clefable. Ambos têm silhuetas similares e são opostos em tipo (Fada vs Fantasma).' },
    { icon: '🧬', title: 'Ditto é Mew?', text: 'Uma teoria diz que Ditto é um clone fracassado de Mew. Ambos têm os mesmos status base totais (100 pts cada) e Ditto é um dos poucos a aprender Transform.' },
    { icon: '🏔️', title: 'O Pokémon mais alto', text: 'Eternatus tem 20 metros de altura em sua forma Eternamax, fazendo dele o maior Pokémon oficialmente confirmado nos jogos.' },
    { icon: '💰', title: 'O Pokémon mais caro', text: 'Uma carta holográfica de Pikachu Illustrator foi vendida em 2022 por US$ 5.275.000 — o item Pokémon mais caro já registrado.' },
    { icon: '🌍', title: 'Mais de 1 bilhão de jogos vendidos', text: 'Pokémon é a franquia de mídia mais lucrativa de todos os tempos, ultrapassando US$ 150 bilhões incluindo jogos, anime, merchandise e cartas.' },
    { icon: '🎮', title: 'Pokémon GO e o mundo real', text: 'No pico de 2016, Pokémon GO tinha 232 milhões de jogadores ativos mensais. O jogo já arrecadou mais de US$ 6 bilhões em receita.' },
    { icon: '🔢', title: 'Quantos Pokémon existem?', text: 'Como de junho 2025, existem 1025 espécies de Pokémon confirmadas, com novas sendo adicionadas a cada geração de jogos.' },
    { icon: '🤫', title: 'Easter egg no Pokémon Stadium', text: 'No Pokémon Stadium 2, se você deixar o jogo ocioso na tela título por tempo suficiente, um Togepi aparece dançando.' },
    { icon: '🎨', title: 'Ken Sugimori e o art style', text: 'Ken Sugimori foi responsável pelos designs originais dos 151 Pokémon da Gen 1. Ele ainda supervisiona o design de novos Pokémon hoje.' },
    { icon: '🏆', title: 'Mewtwo e a história', text: 'Mewtwo foi o primeiro Pokémon lendário a aparecer no anime, no filme de 1999. O filme foi o maior sucesso de bilheteria de anime até então.' },
  ];
  
  const CuriositiesPage = {
    init() {
      const grid = document.getElementById('curiosities-grid');
      if (!grid) return;
      grid.innerHTML = CURIOSITIES.map(c => `
        <div class="curiosity-card fade-in">
          <div class="curiosity-icon">${c.icon}</div>
          <div class="curiosity-title">${c.title}</div>
          <div class="curiosity-text">${c.text}</div>
        </div>`).join('');
    }
  };
  
  /* ====================================================
     COMPARADOR
     ==================================================== */
  const Comparator = {
    async init() {
      const wrap = document.getElementById('comparator-wrap');
      if (!wrap) return;
  
      const data = await apiFetch(`${CONFIG.API}/pokemon?limit=251&offset=0`);
      if (!data) return;
      const opts = data.results.map((p, i) =>
        `<option value="${i+1}">${cap(p.name)}</option>`
      ).join('');
  
      document.getElementById('cmp-select-1')?.insertAdjacentHTML('afterbegin', `<option value="">-- Pokémon 1 --</option>${opts}`);
      document.getElementById('cmp-select-2')?.insertAdjacentHTML('afterbegin', `<option value="">-- Pokémon 2 --</option>${opts}`);
  
      document.getElementById('btn-compare')?.addEventListener('click', () => this.compare());
    },
  
    async compare() {
      const id1 = document.getElementById('cmp-select-1')?.value;
      const id2 = document.getElementById('cmp-select-2')?.value;
      if (!id1 || !id2) { showToast('Escolha dois Pokémon!'); return; }
  
      const [p1, p2] = await Promise.all([
        apiFetch(`${CONFIG.API}/pokemon/${id1}`),
        apiFetch(`${CONFIG.API}/pokemon/${id2}`)
      ]);
      if (!p1 || !p2) return;
  
      const statNames = { hp:'HP', attack:'Ataque', defense:'Defesa', 'special-attack':'Atq. Esp.', 'special-defense':'Def. Esp.', speed:'Velocidade' };
      const rows = p1.stats.map(s => {
        const s2 = p2.stats.find(x => x.stat.name === s.stat.name);
        const v1 = s.base_stat, v2 = s2?.base_stat ?? 0;
        const cl1 = v1 > v2 ? 'compare-win' : v1 < v2 ? 'compare-lose' : '';
        const cl2 = v2 > v1 ? 'compare-win' : v2 < v1 ? 'compare-lose' : '';
        return `<tr>
          <td>${statNames[s.stat.name] || cap(s.stat.name)}</td>
          <td class="${cl1}">${v1}</td>
          <td class="${cl2}">${v2}</td>
        </tr>`;
      }).join('');
  
      const total1 = p1.stats.reduce((acc, s) => acc + s.base_stat, 0);
      const total2 = p2.stats.reduce((acc, s) => acc + s.base_stat, 0);
  
      document.getElementById('compare-result').innerHTML = `
        <div class="card mt-2">
          <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:center;margin-bottom:20px">
            <div style="text-align:center">
              <img src="${CONFIG.IMG}/${p1.id}.png" width="80" height="80" style="object-fit:contain;margin:0 auto">
              <div style="font-weight:800;text-transform:capitalize">${p1.name}</div>
            </div>
            <div style="font-size:1.2rem;font-weight:900;color:var(--text2)">VS</div>
            <div style="text-align:center">
              <img src="${CONFIG.IMG}/${p2.id}.png" width="80" height="80" style="object-fit:contain;margin:0 auto">
              <div style="font-weight:800;text-transform:capitalize">${p2.name}</div>
            </div>
          </div>
          <table class="compare-table">
            <thead><tr><th>Estatística</th><th>${cap(p1.name)}</th><th>${cap(p2.name)}</th></tr></thead>
            <tbody>
              ${rows}
              <tr style="border-top:2px solid var(--border)">
                <td><strong>Total</strong></td>
                <td class="${total1 > total2 ? 'compare-win' : total1 < total2 ? 'compare-lose' : ''}"><strong>${total1}</strong></td>
                <td class="${total2 > total1 ? 'compare-win' : total2 < total1 ? 'compare-lose' : ''}"><strong>${total2}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>`;
    }
  };
  
  /* ====================================================
     EASTER EGG — Código Konami
     ==================================================== */
  const EasterEgg = {
    code: ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'],
    pos: 0,
    init() {
      document.addEventListener('keydown', e => {
        if (e.key === this.code[this.pos]) {
          this.pos++;
          if (this.pos === this.code.length) {
            this.pos = 0;
            this.trigger();
          }
        } else {
          this.pos = 0;
        }
      });
    },
    trigger() {
      showToast('🎉 Código Konami ativado! Você é um verdadeiro Mestre Pokémon!');
      document.body.style.animation = 'pulse .5s 3';
      setTimeout(() => document.body.style.animation = '', 1500);
      // Confetti effect
      for (let i = 0; i < 30; i++) {
        const el = document.createElement('div');
        el.style.cssText = `position:fixed;top:${Math.random()*100}vh;left:${Math.random()*100}vw;
          font-size:1.5rem;z-index:9999;pointer-events:none;
          animation:fadeIn 2s ease forwards`;
        el.textContent = ['⭐','🎉','🎊','🏆','✨'][Math.floor(Math.random()*5)];
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2200);
      }
    }
  };
  
  /* ====================================================
     INICIALIZAÇÃO GLOBAL
     ==================================================== */
  document.addEventListener('DOMContentLoaded', async () => {
    ThemeManager.init();
    initNavbar();
    EasterEgg.init();
  
    // Inicia módulos conforme a página
    await hideLoader();
    await IndexPage.init();
    await PokedexPage.init();
    await PokemonDetail.init();
    await TypesPage.init();
    await TrainersPage.init();
    await BattlePage.init();
    Comparator.init();
    Quiz.init();
    CuriositiesPage.init();
  
    // Fecha modais
    $$('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });
    $$('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('open'));
    });
  });