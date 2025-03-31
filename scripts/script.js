const map = L.map('map').setView([39.5, -8.0], 7);

const bases = {
    osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contribuidores'
    }),
    topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenTopoMap & OpenStreetMap'
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri & contributors'
    })
};

function mudarBase(tipo) {
    map.eachLayer(layer => {
        if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });
    bases[tipo].addTo(map);
}

let routingControl;
let pontosSelecionados = [];
let modoTransporte = 'car';

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

let rotaLayer = null;

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


// ------------------- MARCADORES TEMÁTICOS -------------------

// Dados simulados (GeoJSON-like)
const locaisArqueo = [
    { nome: "Castro do Zambujal", coords: [39.4, -9.15] },
    { nome: "Ruínas Romanas", coords: [40.2, -8.4] }
];

const cafes = [
    { nome: "Café Central", coords: [39.5, -8.1] },
    { nome: "Pastelaria Doce", coords: [39.6, -8.2] }
];

const restaurantes = [
    { nome: "Restaurante Maré", coords: [39.55, -8.05] },
    { nome: "Cantinho da Vila", coords: [39.45, -8.15] }
];

// Grupos de marcadores
const grupoArqueo = L.layerGroup();
const grupoCafe = L.layerGroup();
const grupoResto = L.layerGroup();

// Função para criar marcadores personalizados
function criarMarcadores(lista, grupo, classeIcone) {
    grupo.clearLayers();
    lista.forEach(local => {
        const marker = L.marker(local.coords, {
            icon: L.divIcon({ className: `${classeIcone}-icon` }),
            title: local.nome
        }).bindPopup(`<strong>${local.nome}</strong>`);
        grupo.addLayer(marker);
    });
}

// Criar todos os marcadores inicialmente (mas não adicioná-los ao mapa)
criarMarcadores(locaisArqueo, grupoArqueo, 'arqueo');
criarMarcadores(cafes, grupoCafe, 'cafe');
criarMarcadores(restaurantes, grupoResto, 'resto');

// Lógica para mostrar/ocultar camadas temáticas
function toggleLayer(tipo) {
    switch (tipo) {
        case 'arqueo':
            if (document.getElementById('chkArqueo').checked) {
                grupoArqueo.addTo(map);
            } else {
                map.removeLayer(grupoArqueo);
            }
            break;
        case 'cafe':
            if (document.getElementById('chkCafe').checked) {
                grupoCafe.addTo(map);
            } else {
                map.removeLayer(grupoCafe);
            }
            break;
        case 'resto':
            if (document.getElementById('chkResto').checked) {
                grupoResto.addTo(map);
            } else {
                map.removeLayer(grupoResto);
            }
            break;
    }
}

//Inicializar o mapa com a camada base OSM
bases.osm.addTo(map);
toggleLayer('arqueo');