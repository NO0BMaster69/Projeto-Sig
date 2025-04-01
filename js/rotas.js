let modoRotaAtivo = false;
let pontos = [];
let camadaRota = null;
let marcadoresRota = [];

function iniciarRota() {
    modoRotaAtivo = !modoRotaAtivo;
    pontos = [];

    if (camadaRota) {
        map.removeLayer(camadaRota);
        camadaRota = null;
    }

    marcadoresRota.forEach(m => map.removeLayer(m));
    marcadoresRota = [];

    document.getElementById('routeInfo').classList.add('d-none');
}

map.on('click', function (e) {
    if (!modoRotaAtivo) return;

    const { lat, lng } = e.latlng;
    const marcador = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)}`)
        .openPopup();

    marcadoresRota.push(marcador);
    pontos.push({ lat, lng });

    if (pontos.length === 2) {
        calcularRota(pontos[0], pontos[1]);
        modoRotaAtivo = false;
    }
});

function calcularRota(origem, destino) {
    fetch('calcular_rota.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origem, destino })
    })
        .then(resp => resp.json())
        .then(geojson => {
            if (!geojson || !geojson.features || geojson.features.length === 0) {
                alert("Rota não encontrada.");
                return;
            }

            if (camadaRota) map.removeLayer(camadaRota);
            camadaRota = L.geoJSON(geojson, {
                style: { color: 'blue', weight: 4 }
            }).addTo(map);

            map.fitBounds(camadaRota.getBounds());

            document.getElementById('routeInfo').classList.remove('d-none');

            const distanciaKm = (geojson.distancia / 1000).toFixed(2);
            const tempoMin = (geojson.tempo / 60).toFixed(1);

            document.getElementById('routeDetails').innerText = `Distância: ${distanciaKm} km | Tempo: ${tempoMin} min`;
        })
        .catch(err => {
            console.error("Erro ao calcular rota:", err);
            alert("Erro ao calcular rota.");
        });
}

function fecharRota() {
    if (camadaRota) map.removeLayer(camadaRota);
    camadaRota = null;

    marcadoresRota.forEach(m => map.removeLayer(m));
    marcadoresRota = [];

    document.getElementById('routeInfo').classList.add('d-none');
}
