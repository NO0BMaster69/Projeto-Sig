// Dados simulados
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

criarMarcadores(locaisArqueo, grupoArqueo, 'arqueo');
criarMarcadores(cafes, grupoCafe, 'cafe');
criarMarcadores(restaurantes, grupoResto, 'resto');

function toggleLayer(tipo) {
    switch (tipo) {
        case 'arqueo':
            document.getElementById('chkArqueo').checked
                ? grupoArqueo.addTo(map)
                : map.removeLayer(grupoArqueo);
            break;
        case 'cafe':
            document.getElementById('chkCafe').checked
                ? grupoCafe.addTo(map)
                : map.removeLayer(grupoCafe);
            break;
        case 'resto':
            document.getElementById('chkResto').checked
                ? grupoResto.addTo(map)
                : map.removeLayer(grupoResto);
            break;
    }
}

toggleLayer('arqueo'); // Mostrar arqueo por defeito
