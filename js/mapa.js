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
    const menu = document.getElementById("menuRaioArqueo");
    if (menu) {
        menu.classList.remove("d-none");
    }

    pontoCentro = marker.getLatLng();

    // Atualiza ou move o círculo existente
    if (circuloRaio) {
        circuloRaio.setLatLng(pontoCentro);
    } else if (raioSelecionado) {
        circuloRaio = L.circle(pontoCentro, {
            radius: raioSelecionado,
            color: "#007BFF",
            fillColor: "#007BFF",
            fillOpacity: 0.1
        }).addTo(mapa);
    }

    // Aplicar filtro novamente com novo centro
    filtrarMarcadoresPorRaio(raioSelecionado);
}

function aplicarFiltroRaioArqueo() {
    const valor = document.getElementById("selectRaio").value;

    // Remove o círculo anterior, se existir
    if (circuloRaio) {
        mapa.removeLayer(circuloRaio);
        circuloRaio = null;
    }

    if (!valor) {
        // Se for "Cancelar", limpa tudo
        document.getElementById("menuRaioArqueo").classList.add("d-none");
        raioSelecionado = null;
        pontoCentro = null;

        // Recarrega todos os marcadores com base nas checkboxes
        if (typeof carregarMarcadoresVisiveis === "function") {
            carregarMarcadoresVisiveis(mapa.getBounds());
        }

        return;
    }

    // Define novo raio selecionado
    raioSelecionado = parseInt(valor);

    // Se ponto central já está definido (ex: clicado anteriormente)
    if (pontoCentro) {
        // Desenha novo círculo
        circuloRaio = L.circle(pontoCentro, {
            radius: raioSelecionado,
            color: "#007BFF",
            fillColor: "#007BFF",
            fillOpacity: 0.1
        }).addTo(mapa);

        // ✅ Aplica imediatamente o filtro por raio
        if (typeof filtrarMarcadoresPorRaio === "function") {
            filtrarMarcadoresPorRaio(raioSelecionado);
        }

        // (Opcional) mostrar div caso não esteja visível
        const menu = document.getElementById("menuRaioArqueo");
        if (menu) {
            menu.classList.remove("d-none");
        }
    } else {
        alert("Seleciona primeiro um ponto arqueológico no mapa para aplicar o raio.");
    }
}

function mostrarArqueologicos() {
    todosPontosDisponiveis.forEach(ponto => {
        if (ponto.tipo === "arqueo" && !ponto._adicionado) {
            const latlng = L.latLng(ponto.lat, ponto.lng);
            const marker = L.marker(latlng, { icon: iconeArqueo }).bindTooltip(ponto.nome);
            marker.addTo(mapa);
            ponto._marker = marker;
            ponto._adicionado = true;

            marker.on("click", () => {
                ultimoPontoSelecionado = ponto;
                mapa.flyTo(latlng, mapa.getZoom(), { animate: true, duration: 1.2 });
                if (typeof mostrarMenuRaio === "function") {
                    mostrarMenuRaio(marker);
                }
            });

            LocaisArqueo.push(marker);
        }
    });
}


// Função para remover marcadores filtrados do raio anterior
function filtrarMarcadoresPorRaio(raio) {
    currentRestorationMarkers.forEach(m => mapa.removeLayer(m));
    currentRestorationMarkers = [];

    if (!pontoCentro || !raio) return;

    const cafeAtivo = document.getElementById("chkCafe")?.checked;
    const restoAtivo = document.getElementById("chkResto")?.checked;
    const gasAtivo = document.getElementById("chkGas")?.checked;
    const combAtivo = document.getElementById("chkComb")?.checked;
    const autoAtivo = document.getElementById("chkAuto")?.checked;

    todosPontosDisponiveis.forEach(ponto => {
        const tipo = ponto.tipo;
        const latlng = L.latLng(ponto.lat, ponto.lng);

        const ativo =
            (tipo === "cafe" && cafeAtivo) ||
            (tipo === "resto" && restoAtivo) ||
            (tipo === "gas" && gasAtivo) ||
            (tipo === "comb" && combAtivo) ||
            (tipo === "auto" && autoAtivo);

        const dentro = pontoCentro.distanceTo(latlng) <= raio;

        // 🔁 Apaga qualquer marcador existente antes de redesenhar
        if (ponto._marker) {
            mapa.removeLayer(ponto._marker);
            ponto._marker = null;
            ponto._adicionado = false;
        }

        if (ativo && dentro) {
            let icone;
            switch (tipo) {
                case "cafe": icone = iconeCafe; break;
                case "resto": icone = iconeResto; break;
                case "gas": icone = iconeGas; break;
                case "comb": icone = iconeComboio; break;
                case "auto": icone = iconeAutocarro; break;
            }

            const marker = L.marker(latlng, { icon: icone }).bindTooltip(ponto.nome);
            marker.addTo(mapa);
            ponto._marker = marker;
            ponto._adicionado = true;

            currentRestorationMarkers.push(marker);
        }
    });

    // Reforça os arqueológicos (opcional)
    carregarMarcadoresVisiveis(mapa.getBounds());
}






mapa.zoomControl.setPosition('bottomright');
