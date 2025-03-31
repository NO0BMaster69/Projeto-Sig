let routingControl;
let pontosSelecionados = [];
let modoTransporte = 'car';
let rotaLayer = null;

function iniciarRota() {
    pontosSelecionados = [];
    document.getElementById('routeInfo').classList.add('d-none');
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    map.on('click', onMapClick);
}

function onMapClick(e) {
    pontosSelecionados.push(e.latlng);
    if (pontosSelecionados.length === 2) {
        map.off('click', onMapClick);
        calcularRota();
    }
}

function setTransportMode(mode) {
    modoTransporte = mode;
    if (pontosSelecionados.length === 2) calcularRota();
}

function fecharRota() {
    if (routingControl) {
        map.removeControl(routingControl);
        routingControl = null;
    }
    pontosSelecionados = [];
    document.getElementById('routeInfo').classList.add('d-none');
}

function calcularRota() {
    if (rotaLayer) {
        map.removeLayer(rotaLayer);
        rotaLayer = null;
    }

    const start = `${pontosSelecionados[0].lat},${pontosSelecionados[0].lng}`;
    const end = `${pontosSelecionados[1].lat},${pontosSelecionados[1].lng}`;

    fetch(`calcular_rota.php?start=${start}&end=${end}&mode=${modoTransporte}`)
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                fecharRota();
                return;
            }

            rotaLayer = L.geoJSON(data.geojson, {
                style: { color: 'blue', weight: 5 }
            }).addTo(map);

            document.getElementById('routeDetails').innerText =
                `Distância estimada: ${data.custo.toFixed(1)} km (estimado)`;
            document.getElementById('routeInfo').classList.remove('d-none');
        })
        .catch(err => {
            console.error('Erro ao buscar rota:', err);
            alert('Erro ao calcular rota.');
            fecharRota();
        });
}
