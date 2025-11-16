/* ===========================
  HQs Online - app.js
  Gera conteúdo dinâmico para index.html e detalhes.html
  Agora com integração opcional a uma API JSON Server (http://localhost:3000)
  Se a API não estiver disponível o comportamento volta a usar os dados locais
  =========================== */

// API backend (JSON Server) - altere se desejar outro host/porta
const API_BASE = 'http://localhost:3000';

// ---------- Estrutura JSON das HQs (fallback local) ----------
const dados = [
  {
    id: 1,
    nome: "Batman",
    autor: "DC Comics",
    ano: "1939",
    categoria: "Herói",
    descricao:
      "O Cavaleiro das Trevas protege Gotham City com inteligência, estratégia e gadgets de alta tecnologia.",
    imagem:
      "https://miro.medium.com/v2/resize:fit:720/format:webp/1*KpcmzkdswPGdPpp_TOc33A.jpeg",
    pdf: "#",
    fotos: [
        "https://miro.medium.com/v2/resize:fit:720/format:webp/1*KpcmzkdswPGdPpp_TOc33A.jpeg",
        "https://upload.wikimedia.org/wikipedia/en/1/17/Batman-BenAffleck.jpg",
        "https://upload.wikimedia.org/wikipedia/en/3/3f/Batman-DCRebirth.jpg",
    ],
  },
  {
    id: 2,
    nome: "Homem-Aranha",
    autor: "Marvel Comics",
    ano: "1962",
    categoria: "Herói",
    descricao:
      "Peter Parker usa seus poderes aracnídeos para proteger Nova York e equilibrar sua vida como herói e estudante.",
    imagem:
      "https://www.planocritico.com/wp-content/uploads/2024/06/ultimate-homem-aranha-vol-1-2024-plano-critico.jpg",
    pdf: "#",
    fotos: [
        "https://www.planocritico.com/wp-content/uploads/2024/06/ultimate-homem-aranha-vol-1-2024-plano-critico.jpg",
        "https://upload.wikimedia.org/wikipedia/en/4/44/SpiderMan2018.png",
        "https://upload.wikimedia.org/wikipedia/en/1/1e/Spider-Man_PS4_cover.jpg",
    ],
  },
  {
    id: 3,
    nome: "Superman",
    autor: "DC Comics",
    ano: "1938",
    categoria: "Herói",
    descricao:
      "O Homem de Aço, símbolo de esperança e justiça, luta pela verdade e pelo bem com poderes sobre-humanos.",
    imagem:
      "https://upload.wikimedia.org/wikipedia/en/3/35/Supermanflying.png",
    pdf: "#",
    fotos: [
      "https://upload.wikimedia.org/wikipedia/en/3/35/Supermanflying.png",
      "https://upload.wikimedia.org/wikipedia/en/3/3c/SupermanEarthOne.jpg",
      "https://upload.wikimedia.org/wikipedia/en/e/eb/SupermanShazam.png",
    ],
  },
  {
    id: 4,
    nome: "Mulher-Maravilha",
    autor: "DC Comics",
    ano: "1941",
    categoria: "Heroína",
    descricao:
      "Diana, princesa das Amazonas, representa força, coragem e compaixão na luta pela paz mundial.",
    imagem:
      "https://hqrock.files.wordpress.com/2014/07/wonder-woman-36-cover-2014-by-david-finch.jpg?w=389&h=519&crop=1",
    pdf: "#",
    fotos: [
        "https://hqrock.files.wordpress.com/2014/07/wonder-woman-36-cover-2014-by-david-finch.jpg?w=389&h=519&crop=1",
        "https://upload.wikimedia.org/wikipedia/en/9/93/WonderWoman1984poster.jpg",
        "https://upload.wikimedia.org/wikipedia/en/1/1b/Wonder_Woman_2017_poster.jpg",
    ],
  },
  {
    id: 5,
    nome: "Homem de Ferro",
    autor: "Marvel Comics",
    ano: "1963",
    categoria: "Herói",
    descricao:
      "Tony Stark, o gênio bilionário, usa sua armadura tecnológica para combater ameaças globais e proteger o mundo.",
    imagem:
      "http://www.guiadosquadrinhos.com/edicaoestrangeira/ShowImage.aspx?id=9734&path=ir899076_9734.jpg&w=400&h=627",
    pdf: "#",
    fotos: [
  "http://www.guiadosquadrinhos.com/edicaoestrangeira/ShowImage.aspx?id=9734&path=ir899076_9734.jpg&w=400&h=627",
        "https://upload.wikimedia.org/wikipedia/en/0/00/Iron_Man_bleeding_edge_2.jpg",
        "https://upload.wikimedia.org/wikipedia/en/1/1a/Iron_Man_3_poster.jpg",
    ],
  },
  {
    id: 6,
    nome: "Capitão América",
    autor: "Marvel Comics",
    ano: "1941",
    categoria: "Herói",
    descricao:
      "Steve Rogers, o supersoldado, luta pela liberdade e justiça com seu lendário escudo indestrutível.",
    imagem:
      "https://www.blogdoselback.com.br/wp-content/uploads/2023/05/cropped-Capitao-America-1-710x399.jpg",
    pdf: "#",
    fotos: [
        "https://www.blogdoselback.com.br/wp-content/uploads/2023/05/cropped-Capitao-America-1-710x399.jpg",
        "https://upload.wikimedia.org/wikipedia/en/5/5d/CaptainAmericaTheWinterSoldierPoster.jpg",
        "https://upload.wikimedia.org/wikipedia/en/2/25/Captain_America_Civil_War_poster.jpg",
    ],
  },
];

// Combined data (base + uploaded). Will be populated on init.
let allData = [];
let apiAvailable = false; // true quando a API responder

// helper: normalize uploaded items (from upload.html/localStorage) into the same shape used by the app
function normalizeUploaded(item) {
  // item may have keys like titulo/conteudo/pdfDataUrl or nome/descricao/pdf
  const id = Number(item.id) || Date.now();
  const nome = item.titulo || item.nome || `HQ ${id}`;
  const autor = item.autor || item.autor || "Desconhecido";
  const data = item.data || item.ano || new Date().toISOString().split("T")[0];
  const categoria = item.categoria || "Outros";
  const descricao = item.conteudo || item.descricao || "Descrição não disponível.";
  const imagem = item.imagem || item.capa || "https://via.placeholder.com/800x1200?text=Sem+Capa";
  const pdf = item.pdfDataUrl || item.pdf || "#";

  return {
    id,
    nome,
    autor,
    ano: data.split("-")[0] || data,
    categoria,
    descricao,
    imagem,
    pdf,
    fotos: item.fotos || [imagem],
  };
}

// ---------- Funções: API (CRUD) ----------
async function fetchFromApi() {
  try {
    const res = await fetch(`${API_BASE}/hqs`);
    if (!res.ok) throw new Error('API não disponível');
    const json = await res.json();
    apiAvailable = true;
    return Array.isArray(json) ? json : [];
  } catch (e) {
    apiAvailable = false;
    return null;
  }
}

async function apiCreate(hq) {
  try {
    const res = await fetch(`${API_BASE}/hqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hq),
    });
    if (!res.ok) throw new Error('Falha ao criar via API');
    const created = await res.json();
    return created;
  } catch (e) {
    // fallback: save in localStorage
    const raw = localStorage.getItem('uploadedHqs') || '[]';
    const arr = JSON.parse(raw);
    arr.push(hq);
    localStorage.setItem('uploadedHqs', JSON.stringify(arr));
    return hq;
  }
}

async function apiDelete(id) {
  try {
    const res = await fetch(`${API_BASE}/hqs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete falhou');
    return true;
  } catch (e) {
    // fallback: remove from localStorage uploadedHqs if present
    const raw = localStorage.getItem('uploadedHqs') || '[]';
    const arr = JSON.parse(raw).filter((x) => Number(x.id) !== Number(id));
    localStorage.setItem('uploadedHqs', JSON.stringify(arr));
    return false;
  }
}

// ---------- Função: Montar Carrossel (index.html) ----------
function mountCarousel() {
  const carousel = document.getElementById("carouselInner");
  const indicators = document.getElementById("carouselIndicators");
  if (!carousel) return;

  // use the first three itens of allData
  carousel.innerHTML = allData
    .slice(0, 3)
    .map(
      (hq, index) => `
      <div class="carousel-item ${index === 0 ? "active" : ""}">
        <img data-src="${hq.imagem}" class="d-block w-100 lozad" alt="${hq.nome}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/1200x400?text=Sem+Capa'">
        <div class="carousel-caption d-none d-md-block">
          <h5>${hq.nome}</h5>
          <p>${(hq.descricao || "").slice(0, 80)}${(hq.descricao || "").length>80?"...":""}</p>
        </div>
      </div>
    `
    )
    .join("");

  // indicators
  if (indicators) {
    indicators.innerHTML = allData
      .slice(0, 3)
      .map((_, i) => `<button type="button" data-bs-target="#destaqueCarousel" data-bs-slide-to="${i}" class="${i===0? 'active': ''}" aria-current="${i===0? 'true': 'false'}" aria-label="Slide ${i+1}"></button>`)
      .join('');
  }
}

// ---------- Função: Montar Cards (index.html) ----------
function mountCards(list = allData) {
  const container = document.getElementById("cardsContainer");
  if (!container) return;

  container.innerHTML = list
    .map(
      (hq) => `
      <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100 shadow-sm">
          <img data-src="${hq.imagem}" class="card-img-top lozad" alt="${hq.nome}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/400x600?text=Sem+Capa'">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${hq.nome}</h5>
            <p class="text-muted">${hq.autor}</p>
            <a href="detalhes.html?id=${hq.id}" class="btn btn-warning mt-auto">Ver Detalhes</a>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

// ---------- Função: Pesquisa de HQs ----------
function searchHQs() {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");

  if (!searchForm) return;

  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const term = (searchInput.value || "").trim().toLowerCase();

    const filtered = allData.filter((hq) =>
      (hq.nome || "").toLowerCase().includes(term)
    );

    mountCards(filtered.length ? filtered : allData);
  });
}

// ---------- Função: Montar Detalhes (detalhes.html) ----------
function mountDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));
  const hq = allData.find((item) => Number(item.id) === id);
  if (!hq) return;

  const container = document.getElementById("detalhesHQ");
  if (container) {
    container.innerHTML = `
      <article class="col-md-6">
        <img src="${hq.imagem}" alt="${hq.nome}" class="img-fluid rounded shadow">
      </article>
      <article class="col-md-6">
        <h2 class="text-primary">${hq.nome}</h2>
        <p><strong>Autor:</strong> ${hq.autor}</p>
        <p><strong>Ano:</strong> ${hq.ano}</p>
        <p><strong>Categoria:</strong> ${hq.categoria}</p>
        <p><strong>Descrição:</strong> ${hq.descricao}</p>
        <div class="mt-3">
          <a href="index.html" class="btn btn-secondary me-2">Voltar</a>
          <a href="${hq.pdf || '#'}" class="btn btn-danger" target="_blank">Baixar PDF</a>
        </div>
      </article>
    `;
  }

  const galeria = document.getElementById("fotosRelacionadas");
  if (galeria) {
    galeria.innerHTML = (hq.fotos || [hq.imagem])
      .map(
        (fotoObj, idx) => {
          // fotoObj may be a string or an object {imagem, titulo, descricao}
          const src = typeof fotoObj === 'string' ? fotoObj : (fotoObj.imagem || fotoObj.src || fotoObj.url);
          const title = typeof fotoObj === 'string' ? `Imagem ${idx+1}` : (fotoObj.titulo || fotoObj.title || `Imagem ${idx+1}`);
          const desc = typeof fotoObj === 'string' ? '' : (fotoObj.descricao || fotoObj.description || '');
          return `
            <div class="col-6 col-md-4 col-lg-3 text-center">
              <img data-src="${src}" class="img-fluid rounded border border-primary mb-2 lozad" alt="${title}" loading="lazy" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x450?text=Sem+Imagem'">
              <div class="small text-muted">${title}</div>
              ${desc? `<div class="small text-muted">${desc}</div>`: ''}
            </div>
          `;
        }
      )
      .join("");
  }
}

// Open lightbox modal with given src and caption (works on both index and detalhes)
function openLightbox(src, caption) {
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');
  if (img) img.src = src;
  if (cap) cap.textContent = caption || '';
  const modalEl = document.getElementById('lightboxModal');
  if (modalEl) {
    const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    bsModal.show();
  }
}

// delegate clicks for images to open lightbox
function initLightboxDelegation() {
  document.body.addEventListener('click', (ev) => {
    const img = ev.target.closest && ev.target.closest('img');
    if (!img) return;
    // only open if the image is inside cardsContainer or fotosRelacionadas
    if (img.closest('#cardsContainer') || img.closest('#fotosRelacionadas') || img.closest('.carousel-inner')) {
      const src = img.getAttribute('data-src') || img.src;
      const caption = img.alt || img.getAttribute('title') || '';
      openLightbox(src, caption);
    }
  });
}

// IntersectionObserver based lazy loader for images with class 'lozad'
function initLazyLoader() {
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, {rootMargin: '50px 0px', threshold: 0.01});

    document.querySelectorAll('img.lozad').forEach(img => obs.observe(img));
  } else {
    // fallback: load all images immediately
    document.querySelectorAll('img.lozad').forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) img.src = src;
    });
  }
}

// ---------- Inicialização Automática ----------
// load uploaded items from localStorage and merge with base `dados`
function loadUploadedAndMerge() {
  const raw = localStorage.getItem("uploadedHqs") || "[]";
  let uploaded = [];
  try {
    uploaded = JSON.parse(raw);
  } catch (e) {
    uploaded = [];
  }

  const normalized = Array.isArray(uploaded) ? uploaded.map(normalizeUploaded) : [];

  // avoid id collisions: if an uploaded has an id that matches a base item, increment it
  const existingIds = new Set(dados.map((d) => Number(d.id)));
  normalized.forEach((u) => {
    while (existingIds.has(Number(u.id))) {
      u.id = Number(u.id) + 1;
    }
    existingIds.add(Number(u.id));
  });

  // put uploaded items at the beginning so newest appear first
  allData = [...normalized.reverse(), ...dados];
}

document.addEventListener("DOMContentLoaded", async () => {
  // Try to load data from API. If available, prefer API data and attempt to sync any locally saved uploads.
  const apiData = await fetchFromApi();
  if (apiData) {
    // If there are locally uploaded items, try to POST them to the API (best-effort)
    const raw = localStorage.getItem('uploadedHqs') || '[]';
    let uploaded = [];
    try { uploaded = JSON.parse(raw); } catch (e) { uploaded = []; }
    const normalized = Array.isArray(uploaded) ? uploaded.map(normalizeUploaded) : [];
    for (const u of normalized) {
      try { await apiCreate(u); } catch (e) { /* ignore */ }
    }
    // fetch fresh data after possible sync
    const fresh = await fetchFromApi();
    allData = Array.isArray(fresh) ? fresh : apiData;
  } else {
    // API not available -> fallback to bundled data + local uploads
    loadUploadedAndMerge();
  }

  mountCarousel();
  mountCards();
  searchHQs();
  mountDetails();
  // initialize intersection-observer lazy loader (for images with data-src)
  initLazyLoader();

  // enable carousel autoplay and pause on hover
  try {
    const carouselEl = document.getElementById('destaqueCarousel');
    if (carouselEl) {
      const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carouselEl, { interval: 4000, ride: 'carousel' });
      carouselEl.addEventListener('mouseenter', () => bsCarousel.pause());
      carouselEl.addEventListener('mouseleave', () => bsCarousel.cycle());
    }
  } catch (e) {
    // bootstrap may not be available in some test contexts
    console.warn('Carousel autoplay init failed', e);
  }
  // lightbox delegation
  initLightboxDelegation();
});
