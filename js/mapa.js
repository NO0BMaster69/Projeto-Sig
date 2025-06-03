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
    const valor = document.getElementById("selectRaio").value;

    // Remover círculo anterior
    if (circuloRaio) {
        mapa.removeLayer(circuloRaio);
        circuloRaio = null;
    }

    if (!valor) {
        // Ocultar menu de raio
        document.getElementById("menuRaioArqueo").classList.add("d-none");

        // Resetar raio e centro
        raioSelecionado = null;
        pontoCentro = null;

        // Remover cafés e restaurantes previamente filtrados
        todosPontosDisponiveis.forEach(ponto => {
            if ((ponto.tipo === "cafe" || ponto.tipo === "resto") && ponto._marker) {
                mapa.removeLayer(ponto._marker);
                ponto._marker = null;
                ponto._adicionado = false;
            }
        });

        // Recarrega dinamicamente todos os visíveis com base no mapa e checkboxes
        if (typeof carregarMarcadoresVisiveis === "function") {
            carregarMarcadoresVisiveis(mapa.getBounds());
        }

        return;
    }

    // Definir novo raio e centro
    raioSelecionado = parseInt(valor);
    circuloRaio = L.circle(pontoCentro, {
        radius: raioSelecionado,
        color: "#007BFF",
        fillColor: "#007BFF",
        fillOpacity: 0.1
    }).addTo(mapa);

    // Aplicar filtro de raio
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

mapa.zoomControl.setPosition('bottomright');
