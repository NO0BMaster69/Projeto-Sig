// Função para pesquisar endereço usando a API Nominatim (OpenStreetMap)
async function pesquisarEndereco(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`;
    const resp = await fetch(url, {
        headers: {
            "Accept-Language": "pt"
        }
    });
    if (!resp.ok) throw new Error('Erro ao contactar Nominatim');
    return await resp.json();
}

// Centraliza o mapa e adiciona um marcador quando o usuário seleciona o resultado
function irParaEndereco(lat, lon, descricao) {
    mapa.panTo([lat, lon], {
        animate: true,
        duration: 1  // duração da animação em segundos (pode ajustar se quiser mais lenta ou rápida)
    });
    // Se quiser adicionar efeitos visuais (como highlight ou animação), pode fazer aqui
}


// Mostra sugestões de resultados abaixo do input
function mostrarResultados(resultados) {
    let container = document.getElementById('searchResults');
    if (!container) {
        container = document.createElement('div');
        container.id = 'searchResults';
        container.className = 'search-results-list shadow';
        document.getElementById('searchBar').appendChild(container);
    }
    container.innerHTML = '';
    if (!resultados.length) {
        container.innerHTML = '<small class="text-muted px-2">Nenhum resultado encontrado.</small>';
        return;
    }
    resultados.forEach(res => {
        const el = document.createElement('div');
        el.className = 'search-result-item px-2 py-1';
        el.innerHTML = `<i class="bi bi-geo-alt-fill text-primary"></i> ${res.display_name}`;
        el.style.cursor = 'pointer';
        el.onclick = () => {
            irParaEndereco(res.lat, res.lon, res.display_name);
            container.innerHTML = '';
        };
        container.appendChild(el);
    });
}

const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');

searchBtn.addEventListener('click', async function() {
    const query = searchInput.value.trim();
    if (!query) return;
    try {
        const results = await pesquisarEndereco(query);
        mostrarResultados(results);
    } catch (e) {
        alert('Erro ao pesquisar endereço.');
    }
});

// Pesquisar ao pressionar Enter
searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') searchBtn.click();
});

// Clean results when clicking outside
document.addEventListener('click', e => {
    if (!e.target.closest('.map-searchbar')) {
        const el = document.getElementById('searchResults');
        if (el) el.innerHTML = '';
    }
});

// Pequeno CSS para lista flutuante de resultados
document.head.insertAdjacentHTML('beforeend', `
<style>
.search-results-list {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    background: #fff;
    z-index: 9999;
    max-height: 240px;
    overflow-y: auto;
    border: 1px solid #bbb;
    border-radius: 0 0 4px 4px;
}
.search-result-item:hover { background: #f0f8ff; }
.map-searchbar { position: absolute; left: 42px; top: 24px; z-index: 1100; width: 390px; display: flex; }
</style>
`);