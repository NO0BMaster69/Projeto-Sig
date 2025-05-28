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
    const menu = document.getElementById("menuRaioArqueo");
    menu.classList.add("active");
    menu.classList.remove("d-none");
    document.getElementById("selectRaio").value = "";
}

function aplicarFiltroRaioArqueo() {
    const menu = document.getElementById("menuRaioArqueo");
    const valor = document.getElementById("selectRaio").value;

    if (circuloRaio) {
        mapa.removeLayer(circuloRaio);
        circuloRaio = null;
    }

    if (!valor) {
        menu.classList.remove("active");
        setTimeout(() => menu.classList.add("d-none"), 300);
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

// Função para remover marcadores filtrados do raio anterior
function filtrarMarcadoresPorRaio(raio) {
    const cafeAtivo = document.getElementById("chkCafe")?.checked;
    const restoAtivo = document.getElementById("chkResto")?.checked;

    todosMarcadoresRestauração.forEach(({ marker, tipo }) => {
        const estaAtivo = (tipo === "cafe" && cafeAtivo) || (tipo === "resto" && restoAtivo);

        if (!estaAtivo) {
            marker.setOpacity(0);
            return;
        }

        if (raio && pontoCentro) {
            const dentro = pontoCentro.distanceTo(marker.getLatLng()) <= raio;
            marker.setOpacity(dentro ? 1 : 0);
        } else {
            marker.setOpacity(1); // Sem raio → mostrar todos os ativos
        }
    });
}

