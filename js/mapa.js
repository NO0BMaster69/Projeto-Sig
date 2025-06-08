/**
 * mapa.js
 *
 * Este ficheiro gere a inicialização do mapa Leaflet, a troca de camadas base,
 * a seleção e filtragem de pontos arqueológicos e de restauração/serviços por raio,
 * bem como a exibição dinâmica de marcadores conforme a área visível e filtros ativos.
 *
 * Funções principais:
 * - Inicialização do mapa e camadas base (OSM, Topo, Satélite)
 * - Troca de camada base
 * - Seleção de ponto arqueológico e aplicação de filtro por raio
 * - Carregamento e filtragem de marcadores visíveis
 * - Exibição de marcadores de acordo com filtros e área do mapa
 *
 * @author Grupo 3 PTAS 2025
 * @version 1.0
 */

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

/**
 * Evento disparado ao terminar o movimento do mapa (pan/zoom).
 * Atualiza os marcadores visíveis conforme a área do mapa.
 */
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

/**
 * Objeto com as camadas base disponíveis.
 */
const bases = {
    'osm': osmLayer,
    'topo': topoLayer,
    'satellite': satLayer
};

/**
 * Troca a camada base do mapa conforme o tipo selecionado.
 * Remove a camada anterior e adiciona a nova.
 *
 * @param {string} tipo - Tipo da camada base ('osm', 'topo', 'satellite')
 */
function mudarBase(tipo) {
    mapa.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
            mapa.removeLayer(layer);
        }
    });
    bases[tipo].addTo(mapa);
}

let raioSelecionado = null;   // Raio selecionado para filtro (em metros)
let circuloRaio = null;       // Objeto círculo desenhado no mapa
let pontoCentro = null;       // Centro do raio (LatLng)

/**
 * Mostra o menu de seleção de raio ao clicar num marcador arqueológico.
 * Atualiza ou move o círculo de raio no mapa e aplica o filtro.
 *
 * @param {L.Marker} marker - Marcador arqueológico selecionado
 */
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

/**
 * Aplica o filtro de raio selecionado para mostrar apenas marcadores dentro do raio.
 * Remove o círculo e filtros se o utilizador cancelar.
 */
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

        // Aplica imediatamente o filtro por raio
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

/**
 * Mostra todos os marcadores arqueológicos no mapa.
 * Adiciona eventos de clique para seleção e filtro por raio.
 */
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

/**
 * Filtra e mostra apenas os marcadores de restauração/serviços dentro do raio selecionado.
 * Remove marcadores fora do raio e redesenha os que cumprem o critério.
 *
 * @param {number} raio - Raio em metros para filtrar marcadores
 */
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

        //Apaga qualquer marcador existente antes de redesenhar
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

// Define a posição do controlo de zoom no canto inferior direito
mapa.zoomControl.setPosition('bottomright');