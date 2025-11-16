// visualizations.js — busca dados, processa e renderiza gráficos e mapa
(function(){
  const DATA_URL = '../db/db.json';

  function fetchData(){
    return fetch(DATA_URL).then(r=>{
      if(!r.ok) throw new Error('Falha ao carregar dados');
      return r.json();
    });
  }

  function groupCounts(items, key){
    return items.reduce((acc,item)=>{
      const k = item[key] || 'Desconhecido';
      acc[k] = (acc[k]||0)+1; return acc;
    },{});
  }

  function createPie(ctx, labels, data){
    return new Chart(ctx, {
      type: 'pie',
      data: { labels, datasets:[{ data, backgroundColor: generateColors(labels.length) }] },
      options: { responsive:true }
    });
  }

  function createBar(ctx, labels, data){
    return new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets:[{ label:'Quantidade', data, backgroundColor: 'rgba(54,162,235,0.7)' }] },
      options: { responsive:true, scales:{ y:{ beginAtZero:true, precision:0 } } }
    });
  }

  function generateColors(n){
    const base = ['#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f','#edc949','#af7aa1','#ff9da7','#9c755f','#bab0ac'];
    const out=[]; for(let i=0;i<n;i++) out.push(base[i%base.length]); return out;
  }

  function renderGallery(items){
    const container = document.getElementById('gallery');
    container.innerHTML = '';
    items.forEach(hq=>{
      const col = document.createElement('div'); col.className='col-6 col-md-4';
      const card = document.createElement('div'); card.className='card h-100';
      card.innerHTML = `<img src="${hq.imagem}" class="card-img-top" alt="${hq.nome}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x180?text=Imagem'">`;
      const body = document.createElement('div'); body.className='card-body p-2 small';
      body.innerHTML = `<strong>${hq.nome}</strong><br/><span class='text-muted'>${hq.autor} — ${hq.ano}</span>`;
      card.appendChild(body); col.appendChild(card); container.appendChild(col);
    });
  }


  function renderMap(authors){
    const map = L.map('map').setView([39.5, -98.35], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19, attribution:'© OpenStreetMap'}).addTo(map);

    const coordsByAuthor = {
      'Marvel Comics': [38.9072, -77.0369],
      'DC Comics': [40.7128, -74.0060]
    };

    authors.forEach(a=>{
      const coords = coordsByAuthor[a] || [39.5, -98.35];
      L.marker(coords).addTo(map).bindPopup(`<strong>${a}</strong>`);
    });
  }

  // read uploaded items from localStorage and normalize to the same shape as db entries
  function readLocalUploaded() {
    try {
      const raw = localStorage.getItem('uploadedHqs') || '[]';
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.map(item => normalizeUploaded(item));
    } catch (e) { return []; }
  }

  function normalizeUploaded(item) {
    // item may have keys like titulo/conteudo/pdfDataUrl or nome/descricao/pdf
    const id = Number(item.id) || Date.now();
    const nome = item.titulo || item.nome || `HQ ${id}`;
    const autor = item.autor || 'Desconhecido';
    const data = item.data || item.ano || new Date().toISOString().split('T')[0];
    const categoria = item.categoria || 'Outros';
    const descricao = item.conteudo || item.descricao || 'Descrição não disponível.';
    const imagem = item.imagem || item.capa || 'https://via.placeholder.com/800x1200?text=Sem+Capa';
    const pdf = item.pdfDataUrl || item.pdf || '#';

    return {
      id,
      nome,
      autor,
      ano: (String(data).split('-')[0]) || data,
      categoria,
      descricao,
      imagem,
      pdf,
      fotos: item.fotos || [imagem]
    };
  }

  // Filtragem interativa: ao clicar fatia do pie mostra apenas essa categoria no gráfico de barras e galeria
  function setupInteractions(pie, pieLabels, allItems, bar){
    pie.canvas.addEventListener('click', (evt)=>{
      const points = pie.getElementsAtEventForMode(evt, 'nearest', {intersect:true}, false);
      if(points.length){
        const idx = points[0].index; const label = pieLabels[idx];
        const filtered = allItems.filter(i=> (i.categoria||'Desconhecido') === label);
        const counts = groupCounts(filtered,'ano');
        const sortedYears = Object.keys(counts).sort((a,b)=>a-b);
        const data = sortedYears.map(y=>counts[y]);
        bar.data.labels = sortedYears; bar.data.datasets[0].data = data; bar.update();
        renderGallery(filtered);
      } else {
        // click em vazio: restaurar
        const counts = groupCounts(allItems,'ano');
        const years = Object.keys(counts).sort((a,b)=>a-b);
        bar.data.labels = years; bar.data.datasets[0].data = years.map(y=>counts[y]); bar.update();
        renderGallery(allItems);
      }
    });
  }

  // MAIN
  fetchData().then(json=>{
    const remote = json.hqs || [];
    const local = readLocalUploaded();
    // put local uploads first so newest appear first in gallery
    const items = [...local.reverse(), ...remote];
    renderGallery(items);

    // Pie: categorias
    const catCounts = groupCounts(items,'categoria');
    const pieLabels = Object.keys(catCounts);
    const pieData = pieLabels.map(l=>catCounts[l]);
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const pie = createPie(pieCtx, pieLabels, pieData);

    // Bar: anos
    const yearCounts = groupCounts(items,'ano');
    const years = Object.keys(yearCounts).sort((a,b)=>a-b);
    const barData = years.map(y=>yearCounts[y]);
    const barCtx = document.getElementById('barChart').getContext('2d');
    const bar = createBar(barCtx, years, barData);

    // Map: autores únicos
    const authors = Array.from(new Set(items.map(i=>i.autor||'Desconhecido')));
    renderMap(authors);

    // Setup interactions
    setupInteractions(pie, pieLabels, items, bar);

  }).catch(err=>{
    console.error(err);
    alert('Erro ao carregar dados: ' + err.message);
  });

})();
