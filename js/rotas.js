let modoRotaAtivo = false;
let pontos = [];
let camadaRota = null;
let marcadoresRota = [];

function calcularRota(origem, destino) {
    const apiKey = '5b3ce3597851110001cf624856745b046b754835925a6b04b8fc7880';

    const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

    const body = {
        coordinates: [
            [origem.lng, origem.lat],
            [destino.lng, destino.lat]
        ]
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(resp => resp.json())
        .then(data => {
            if (!data || !data.features || data.features.length === 0) {
                alert("Rota não encontrada.");
                return;
            }

            if (camadaRota) mapa.removeLayer(camadaRota);

            camadaRota = L.geoJSON(data, {
                style: { color: 'blue', weight: 4 }
            }).addTo(mapa);

            mapa.fitBounds(camadaRota.getBounds());

            const props = data.features[0].properties.summary;
            const distanciaKm = (props.distance / 1000).toFixed(2);
            const tempoMin = (props.duration / 60).toFixed(1);
            document.getElementById('routeDetails').innerText = `Distância: ${distanciaKm} km | Tempo: ${tempoMin} min`;
            document.getElementById('routeInfo').classList.remove('d-none');
        })
        .catch(err => {
            console.error("Erro ao calcular rota:", err);
            alert("Erro ao calcular rota.");
        });
}

function iniciarRota() {
    modoRotaAtivo = true;
    pontos = [];

    if (camadaRota) {
        mapa.removeLayer(camadaRota);
        camadaRota = null;
    }

    marcadoresRota.forEach(m => mapa.removeLayer(m));
    marcadoresRota = [];

    document.getElementById('routeInfo').classList.add('d-none');
}

mapa.on('click', function (e) {
    if (!modoRotaAtivo) return;

    const { lat, lng } = e.latlng;
    const marcador = L.marker([lat, lng])
        .addTo(mapa)
        .bindPopup(`Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)}`)
        .openPopup();

    marcadoresRota.push(marcador);
    pontos.push({ lat, lng });

    if (pontos.length === 2) {
        calcularRota(pontos[0], pontos[1]);
        modoRotaAtivo = false;
    }
});

function fecharRota() {
    if (camadaRota) mapa.removeLayer(camadaRota);
    camadaRota = null;

    marcadoresRota.forEach(m => mapa.removeLayer(m));
    marcadoresRota = [];

    document.getElementById('routeInfo').classList.add('d-none');
}

window.iniciarRota = iniciarRota;
window.fecharRota = fecharRota;