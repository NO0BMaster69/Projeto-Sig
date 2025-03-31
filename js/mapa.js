// Inicialização do mapa e camadas base
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

bases.osm.addTo(map); // Inicializar com OSM
