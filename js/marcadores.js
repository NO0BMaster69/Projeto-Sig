
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

// Variável para guardar marcadores temporários dos locais próximos
let marcadoresProximos = [];

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

    const locaisArqueo = dadosLocal.map(local => ({
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

    criarMarcadores(locaisArqueo, grupoArqueo, "arqueo");
    criarMarcadores(listaCafes, grupoCafe, "cafe");
    criarMarcadores(listaRestaurantes, grupoResto, "resto");

    toggleLayer("arqueo");
  } catch (error) {
    console.error("Erro ao carregar os dados:", error);
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
        <button onclick="mostrarProximos([${local.coords}], 5)">Mostrar 5km</button>
        <button onclick="mostrarProximos([${local.coords}], 10)">10km</button>
        <button onclick="mostrarProximos([${local.coords}], 25)">25km</button>
      `;
      marker.bindPopup(popup);
    } else {
      marker.bindPopup(`<strong>${local.nome}</strong>`);
    }

    grupo.addLayer(marker);
  });
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

map.on('click', function (e) {
  const {lat, lng} = e.latlng;

  LocaisArqueo.forEach((local) => {
    if (local.coords[0] === lat && local.coords[1] === lng) {
      document.getElementsByClassName("map-popup").classList.add("active");
      document.getElementsByClassName("location-name").innerHTML = local.nome;
      document.getElementsByClassName("website-label").innerHTML = `<a href="${local.website}" target="_blank">Visitar</a>`;
      document.getElementsByI("valor_lat").innerHTML = `${lat.toFixed(5)}`;
      document.getElementsByI("valor_lng").innerHTML = `${lng.toFixed(5)}`;

    }
  });
});
function mostrarProximos(pontoArqueo, raioKm) {
  // Se já existem marcadores, remove-os e cancela a ação
  if (marcadoresProximos.length > 0) {
    marcadoresProximos.forEach(m => map.removeLayer(m));
    marcadoresProximos = [];
    return;
  }

  const raioMetros = raioKm * 1000;
  const todosLocais = [...grupoCafe.getLayers(), ...grupoResto.getLayers()];

  todosLocais.forEach(marcadorOriginal => {
    const latlng = marcadorOriginal.getLatLng();
    const distancia = map.distance(pontoArqueo, latlng);

    if (distancia <= raioMetros) {
      const marcadorClone = L.marker(latlng, { icon: marcadorOriginal.options.icon })
          .bindPopup(marcadorOriginal.getPopup().getContent());
      marcadorClone.addTo(map);
      marcadoresProximos.push(marcadorClone);
    }
  });
}

// Iniciar carregamento de dados ao abrir a página
carregarDados();