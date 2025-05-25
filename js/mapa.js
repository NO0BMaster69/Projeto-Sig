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
    const valor = document.getElementById("selectRaio").value;

    // Remover área anterior se existir
    if (circuloRaio) {
        mapa.removeLayer(circuloRaio);
        circuloRaio = null;
    }

    if (!valor) {
        document.getElementById("menuRaioArqueo").classList.add("d-none");
        filtrarMarcadoresPorRaio(null);
        return;
    }

    raioSelecionado = parseInt(valor);
    circuloRaio = L.circle(pontoCentro, {
        radius: raioSelecionado,
        color: "#007BFF",
        fillColor: "#007BFF",
        fillOpacity: 0.1
    }).addTo(mapa);

    filtrarMarcadoresPorRaio(raioSelecionado);
}

// Filtrar cafés e restaurantes pelo raio
function filtrarMarcadoresPorRaio(raio) {
    if (!pontoCentro) return;

    todosMarcadoresRestauração.forEach(({ marker }) => {
        const dentro = raio ? pontoCentro.distanceTo(marker.getLatLng()) <= raio : true;
        marker.setOpacity(dentro ? 1 : 0);
    });
}

