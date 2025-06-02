const ORS_API_KEY = '5b3ce3597851110001cf624856745b046b754835925a6b04b8fc7880';

let modoRotaAtivo = false;
let pontos = [];
let camadaRota = null;
let marcadoresRota = [];

/**
 * Calcula a rota entre dois pontos usando a OpenRouteService API.
 */
function calcularRota(origem, destino) {
    const modo = document.querySelector('input[name="transportMode"]:checked')?.value || 'driving-car';

    const url = `https://api.openrouteservice.org/v2/directions/${modo}/geojson`;
    const body = {
        coordinates: [
            [origem.lng, origem.lat],
            [destino.lng, destino.lat]
        ]
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': ORS_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(resp => resp.json())
        .then(data => {
            if (!data?.features?.length) {
                alert("Rota não encontrada.");
                return;
            }

            // Limpa rota anterior
            if (camadaRota) mapa.removeLayer(camadaRota);

            camadaRota = L.geoJSON(data, {
                style: { color: 'blue', weight: 4 }
            }).addTo(mapa);

            mapa.fitBounds(camadaRota.getBounds());

            const props = data.features[0].properties.summary;
            const distanciaKm = (props.distance / 1000).toFixed(2);
            const tempoMin = (props.duration / 60).toFixed(1);
            document.getElementById('travelTime').innerText = `${tempoMin} min`;
            document.getElementById('travelDistance').innerText = `${distanciaKm} km`;

            // Mostrar botão de fechar rota
            document.getElementById('btnFecharRota')?.classList.remove('d-none');
        })
        .catch(err => {
            console.error("Erro ao calcular rota:", err);
            alert("Erro ao calcular rota.");
        });
}

/**
 * Ativa o modo de criação de rota e limpa estados anteriores.
 */
function iniciarRota() {
    modoRotaAtivo = true;
    pontos = [];

    if (camadaRota) {
        mapa.removeLayer(camadaRota);
        camadaRota = null;
    }

    marcadoresRota.forEach(m => mapa.removeLayer(m));
    marcadoresRota = [];

    document.getElementById('btnFecharRota')?.classList.add('d-none');
}

/**
 * Fecha/limpa a rota ativa do mapa.
 */
function fecharRota() {
    if (camadaRota) mapa.removeLayer(camadaRota);
    camadaRota = null;

    marcadoresRota.forEach(m => mapa.removeLayer(m));
    marcadoresRota = [];
    pontos = [];

    document.getElementById('travelTime').innerText = '--';
    document.getElementById('travelDistance').innerText = '--';
    document.getElementById('btnFecharRota')?.classList.add('d-none');
}

// Captação dos cliques no mapa para definir origem/destino
mapa.on('click', function (e) {
    if (!modoRotaAtivo) return;

    const { lat, lng } = e.latlng;
    const marcador = L.marker([lat, lng]).addTo(mapa);
    marcadoresRota.push(marcador);
    pontos.push({ lat, lng });

    if (pontos.length === 2) {
        calcularRota(pontos[0], pontos[1]);
        modoRotaAtivo = false;
    }
});

// Atualiza a rota ao mudar o modo de transporte
document.getElementById('modoTransporte').addEventListener('change', function () {
    if (pontos.length === 2) {
        calcularRota(pontos[0], pontos[1]);
    }
});

// Expõe funções globalmente
window.iniciarRota = iniciarRota;
window.fecharRota = fecharRota;
