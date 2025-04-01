let modoRotaAtivo = false;
let pontos = [];
let camadaRota = null;
let marcadoresRota = [];

// Ativar/Desativar modo rota
function iniciarRota() {
    modoRotaAtivo = !modoRotaAtivo;
    pontos = [];

    // Remover rota existente
    if (camadaRota) {
        map.removeLayer(camadaRota);
        camadaRota = null;
    }

    // Remover marcadores anteriores
    marcadoresRota.forEach(m => map.removeLayer(m));
    marcadoresRota = [];

    document.getElementById('routeInfo').classList.add('d-none');

    alert(modoRotaAtivo ? "Modo de rota ativo. Clique em dois pontos no mapa." : "Modo de rota desativado.");
}

// Evento de clique no mapa (apenas se modoRotaAtivo = true)
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

// Enviar pontos para o PHP
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

            // Exibir caixa de informação
            document.getElementById('routeInfo').classList.remove('d-none');
            document.getElementById('routeDetails').innerText = `Distância aproximada: ${(geojson.features.length * 0.3).toFixed(1)} km`;
        })
        .catch(err => {
            console.error("Erro ao calcular rota:", err);
            alert("Erro ao calcular rota.");
        });
}

// Fechar info rota
function fecharRota() {
    if (camadaRota) map.removeLayer(camadaRota);
    camadaRota = null;

    marcadoresRota.forEach(m => map.removeLayer(m));
    marcadoresRota = [];

    document.getElementById('routeInfo').classList.add('d-none');
}
