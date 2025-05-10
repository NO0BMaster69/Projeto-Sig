
// Dados simulados
/*
const locaisArqueo = [
    { nome: "Castro do Zambujal", coords: [39.4, -9.15] },
    { nome: "Ruínas Romanas", coords: [40.2, -8.4] }
];




const cafes = [
    { nome: "Café Central", coords: [39.5, -8.1] },
    { nome: "Pastelaria Doce", coords: [39.6, -8.2] }
];*/

// Grupos de marcadores
const grupoArqueo = L.layerGroup();
const grupoCafe = L.layerGroup();
const grupoResto = L.layerGroup();

let marcadoresProximos = [];
let currentRestorationCircle = null;
let currentRestorationMarkers = [];
let ultimoPontoSelecionado = null;
let LocaisArqueo = [];

async function carregarDados() {
  try {
    const responseLocal = await fetch("get_locais.php");
    const responseCafe = await fetch("get_cafes.php");
    const responseRest = await fetch("get_restaurantes.php");

    if (!responseLocal.ok || !responseCafe.ok || !responseRest.ok) {
      throw new Error("Erro ao carregar dados");
    }

    const dadosLocal = await responseLocal.json();
    const dadosCafe = await responseCafe.json();
    const dadosRest = await responseRest.json();

    LocaisArqueo = dadosLocal.map(local => ({
      nome: local.nome,
      coords: [local.latitude, local.longitude],
      website: local.website,
    }));

    const listaCafes = dadosCafe.map(cafe => ({
      nome: cafe.name,
      coords: [cafe.latitude, cafe.longitude],
      website: cafe.website,
    }));

    const listaRestaurantes = dadosRest.map(rest => ({
      nome: rest.name,
      coords: [rest.latitude, rest.longitude],
      website: rest.website,
    }));

    criarMarcadores(LocaisArqueo, grupoArqueo, "arqueo");
    criarMarcadores(listaCafes, grupoCafe, "cafe");
    criarMarcadores(listaRestaurantes, grupoResto, "resto");

    toggleLayer("arqueo");
  } catch (error) {
    console.error("Erro ao carregar os dados:", error);
  }
}

function toggleLayer(tipo) {
  switch (tipo) {
    case "arqueo":
      document.getElementById("chkArqueo").checked ? grupoArqueo.addTo(map) : map.removeLayer(grupoArqueo);
      break;
    case "cafe":
      document.getElementById("chkCafe").checked ? grupoCafe.addTo(map) : map.removeLayer(grupoCafe);
      break;
    case "resto":
      document.getElementById("chkResto").checked ? grupoResto.addTo(map) : map.removeLayer(grupoResto);
      break;
  }
}

function criarMarcadores(lista, grupo, classeIcone) {
  grupo.clearLayers();
  lista.forEach(local => {
    const marker = L.marker(local.coords, {
      icon: L.divIcon({ className: `${classeIcone}-icon` }),
      title: local.nome,
    });

    if (classeIcone === "arqueo") {
      const popup = `
        <strong>${local.nome}</strong><br/>
        <button class="btn-restauracao" data-lat="${local.coords[0]}" data-lng="${local.coords[1]}" data-raio="5">Restauração 5km</button>
        <button class="btn-restauracao" data-lat="${local.coords[0]}" data-lng="${local.coords[1]}" data-raio="10">Restauração 10km</button>
        <button class="btn-restauracao" data-lat="${local.coords[0]}" data-lng="${local.coords[1]}" data-raio="25">Restauração 25km</button>
      `;
      marker.bindPopup(popup);

      marker.on('popupopen', function (e) {
        const popupEl = e.popup.getElement();
        popupEl.querySelectorAll('.btn-restauracao').forEach(btn => {
          btn.addEventListener('click', function (evt) {
            evt.stopPropagation(); // Evita fechar o popup
            const lat = parseFloat(this.dataset.lat);
            const lng = parseFloat(this.dataset.lng);
            const raio = parseFloat(this.dataset.raio);
            mostrarLocaisRestauracao(L.latLng(lat, lng), raio);
          });
        });
      });
    } else {
      marker.bindPopup(`<strong>${local.nome}</strong>`);
    }

    grupo.addLayer(marker);
  });
}

function calcularZoomAdequado(raioKm) {
  if (raioKm <= 0.2) return 17;
  if (raioKm <= 0.5) return 16;
  if (raioKm <= 1) return 15;
  if (raioKm <= 2) return 14;
  if (raioKm <= 5) return 13;
  if (raioKm <= 10) return 12;
  if (raioKm <= 20) return 11;
  return 10;
}

function limparMarcadoresRestauracao() {
  currentRestorationMarkers.forEach(m => map.removeLayer(m));
  currentRestorationMarkers = [];

  if (currentRestorationCircle) {
    map.removeLayer(currentRestorationCircle);
    currentRestorationCircle = null;
  }

  ultimoPontoSelecionado = null;
}

function mostrarLocaisRestauracao(pontoArqueo, raioKm) {
  const mesmaLocalizacao = ultimoPontoSelecionado &&
      pontoArqueo.lat === ultimoPontoSelecionado.lat &&
      pontoArqueo.lng === ultimoPontoSelecionado.lng;

  if (mesmaLocalizacao) {
    limparMarcadoresRestauracao();
    return;
  }

  limparMarcadoresRestauracao();
  ultimoPontoSelecionado = pontoArqueo;

  map.createPane('restorationCirclePane');
  map.getPane('restorationCirclePane').style.zIndex = 650;

  currentRestorationCircle = L.circle(pontoArqueo, {
    radius: raioKm * 1000,
    color: '#0066ff',
    fillColor: '#0066ff',
    fillOpacity: 0.3,
    weight: 3,
    pane: 'restorationCirclePane'
  }).addTo(map);

  const todosLocais = [...grupoCafe.getLayers(), ...grupoResto.getLayers()];
  todosLocais.forEach(marker => {
    const distancia = pontoArqueo.distanceTo(marker.getLatLng());
    if (distancia <= raioKm * 1000) {
      marker.addTo(map);
      currentRestorationMarkers.push(marker);
    }
  });

  map.setView(pontoArqueo, calcularZoomAdequado(raioKm));
}

// Fecha popup e limpa tudo ao clicar fora
map.on('click', function (e) {
  if (e.originalEvent.target.closest('.leaflet-popup')) return;

  limparMarcadoresRestauracao();
  map.closePopup();
  ultimoPontoSelecionado = null;
});

document.head.insertAdjacentHTML('beforeend', `
  <style>
    .restoration-circle {
      stroke-dasharray: 5, 5;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { fill-opacity: 0.2; }
      50% { fill-opacity: 0.3; }
      100% { fill-opacity: 0.2; }
    }
  </style>
`);

// Iniciar
carregarDados();