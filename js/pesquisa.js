// Função para pesquisar endereço usando a API Nominatim (OpenStreetMap)
async function pesquisarEndereco(query) {
    // Monta a URL da requisição com parâmetros para Portugal e limite de resultados
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=pt&bounded=1&viewbox=-9.5,42.2,-6.2,36.8`;
    const resp = await fetch(url, {
        headers: {
            "Accept-Language": "pt" // Solicita resultados em português
        }
    });
    if (!resp.ok) throw new Error('Erro ao contactar Nominatim');
    return await resp.json(); // Retorna os resultados em JSON
}

// Centraliza o mapa e adiciona um marcador quando o usuário seleciona o resultado
function irParaEndereco(lat, lon, descricao) {
    const novoZoom = 16; // Define o nível de zoom desejado

    // Pan + Zoom animado e suave até o endereço selecionado
    mapa.flyTo([lat, lon], novoZoom, {
        animate: true,
        duration: 1.5 // duração da animação em segundos
    });
}

// Mostra sugestões de resultados abaixo do input de pesquisa
function mostrarResultados(resultados) {
    let container = document.getElementById('searchResults');
    if (!container) {
        // Cria o container se não existir
        container = document.createElement('div');
        container.id = 'searchResults';
        container.className = 'search-results-list shadow';
        document.getElementById('searchBar').appendChild(container);
    }
    if (!resultados.length) {
        // Esconde o container se não houver resultados
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    // Esconde resultados ao clicar fora da barra de pesquisa
    document.addEventListener('click', e => {
        if (!e.target.closest('.map-searchbar')) {
            const el = document.getElementById('searchResults');
            if (el) {
                el.style.display = 'none';
                el.innerHTML = '';
            }
        }
    });

    container.style.display = 'block'; // Exibe o container
    container.innerHTML = '';
    resultados.forEach(res => {
        // Cria um item para cada resultado
        const el = document.createElement('div');
        el.className = 'search-result-item px-2 py-1';
        el.innerHTML = `<i class="bi bi-geo-alt-fill text-primary"></i> ${res.display_name}`;
        el.style.cursor = 'pointer';
        el.onclick = () => {
            irParaEndereco(res.lat, res.lon, res.display_name); // Vai para o endereço ao clicar
            container.style.display = 'none';
            container.innerHTML = '';
        };
        container.appendChild(el);
    });
}

// Seletores dos elementos de input e botão de pesquisa
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('searchBtn');

// Evento de clique no botão de pesquisa
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

// Permite pesquisar ao pressionar Enter no input
searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') searchBtn.click();
});

// Evento para mostrar sugestões enquanto digita (com debounce)
searchInput.addEventListener('input', debounce(async function() {
    const query = searchInput.value.trim();
    if (query.length < 3) {
        mostrarResultados([]); // Limpa se pouco texto
        return;
    }
    try {
        const results = await pesquisarEndereco(query);
        mostrarResultados(results);
    } catch (e) {
        mostrarResultados([]); // Limpa em erro
    }
}, 350));

// Função utilitária debounce para evitar chamadas excessivas à API
function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    }
}

// Limpa resultados ao clicar fora da barra de pesquisa
document.addEventListener('click', e => {
    if (!e.target.closest('.map-searchbar')) {
        const el = document.getElementById('searchResults');
        if (el) el.innerHTML = '';
    }
});

// Adiciona CSS para a lista flutuante de resultados de pesquisa
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