// mapa.js (atualizado para suportar carregamento progressivo de pontos)

// Inicialização do mapa centrado em Aveiro
window.mapa = L.map('map', {
    center: [40.64, -8.65],
    zoom: 13,
    zoomControl: true
});

// Adiciona camada base OpenStreetMap por defeito
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(mapa);



let timeoutCarregamento = null;

mapa.on('moveend', () => {
    if (typeof carregarMarcadoresVisiveis === "function") {
        carregarMarcadoresVisiveis(mapa.getBounds());
    }
});
// Chamar também ao iniciar o mapa


// Camadas alternativas
const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenTopoMap contributors'
});

const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri & contributors'
});

const bases = {
    'osm': osmLayer,
    'topo': topoLayer,
    'satellite': satLayer
};

function mudarBase(tipo) {
    mapa.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
            mapa.removeLayer(layer);
        }
    });
    bases[tipo].addTo(mapa);
}

let raioSelecionado = null;
let circuloRaio = null;
let pontoCentro = null;

// Mostrar o menu ao clicar num ponto arqueológico
function mostrarMenuRaio(marker) {
    pontoCentro = marker.getLatLng();
    document.getElementById("menuRaioArqueo").classList.remove("d-none");
    document.getElementById("selectRaio").value = "";
}

// Aplicar o filtro de raio e desenhar círculo
function aplicarFiltroRaioArqueo() {
    // Pegue o raio selecionado
    const raio = parseFloat(document.getElementById('selectRaio').value);
    if (!raio || !ultimoPontoSelecionado) {
        // Remove marcadores filtrados, se houver
        removerMarcadoresRestauracaoProximos();
        return;
    }

    // Remove marcadores de filtros anteriores
    removerMarcadoresRestauracaoProximos();

    // Crie o circulo de raio para referência visual
    if (currentRestorationCircle) {
        mapa.removeLayer(currentRestorationCircle);
    }
    currentRestorationCircle = L.circle([ultimoPontoSelecionado.lat, ultimoPontoSelecionado.lng], {
        radius: raio,
        color: 'blue',
        fillOpacity: 0.1
    }).addTo(mapa);

    // Filtra todos os pontos do tipo cafe/resto no raio escolhido
    const pontosFiltrados = todosPontosDisponiveis.filter(p =>
        (p.tipo === "cafe" || p.tipo === "resto") &&
        mapa.distance([p.lat, p.lng], [ultimoPontoSelecionado.lat, ultimoPontoSelecionado.lng]) <= raio
    );

    // Adicione e salve os marcadores do filtro atual
    currentRestorationMarkers = [];

    pontosFiltrados.forEach(p => {
        let icone = p.tipo === "cafe" ? iconeCafe : iconeResto;
        const marker = L.marker([p.lat, p.lng], {icon: icone})
            .bindTooltip(p.nome)
            .addTo(mapa);
        currentRestorationMarkers.push(marker);
    });
}

// Função para remover marcadores filtrados do raio anterior
function removerMarcadoresRestauracaoProximos() {
    if (currentRestorationMarkers && currentRestorationMarkers.length) {
        currentRestorationMarkers.forEach(m => mapa.removeLayer(m));
        currentRestorationMarkers = [];
    }
    if(currentRestorationCircle) {
        mapa.removeLayer(currentRestorationCircle);
        currentRestorationCircle = null;
    }
}


