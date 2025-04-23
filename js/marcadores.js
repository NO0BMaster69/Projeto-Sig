
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

const restaurantes = [
  { nome: "Restaurante Maré", coords: [39.55, -8.05] },
  { nome: "Cantinho da Vila", coords: [39.45, -8.15] },
];

// Grupos de marcadores
const grupoArqueo = L.layerGroup();
const grupoCafe = L.layerGroup();
const grupoResto = L.layerGroup();

async function carregarDados() {
  try {
    // Fazer a requisição ao arquivo PHP que retorna o JSON
    const responseLocal = await fetch("get_locais.php");
    if (!responseLocal.ok) {
      throw new Error("Erro ao carregar os dados");
    }

    // Fazer a requisição ao arquivo PHP que retorna os dados dos cafés
    const responseCafe = await fetch("get_cafes.php");
    if (!responseCafe.ok) {
      throw new Error("Erro ao carregar os dados dos cafés");
    }

    // Fazer a requisição ao arquivo PHP que retorna os dados dos restaurantes
    const responseRest = await fetch("get_restaurantes.php");
    if (!responseRest.ok) {
      throw new Error("Erro ao carregar os dados dos restaurantes");
    }

    const dadosLocal = await responseLocal.json();
    const dadosCafe = await responseCafe.json();
    const dadosRest = await responseRest.json();

    // Criar marcadores para os locais arqueológicos
    const locaisArqueo = dadosLocal.map((local) => ({
      nome: local.nome,
      coords: [local.latitude, local.longitude],
      website: local.website,
    }));

    // Criar marcadores para os cafés
    const listaCafes = dadosCafe.map((cafe) => ({
      nome: cafe.name,
      coords: [cafe.latitude, cafe.longitude],
      website: cafe.website,
    }));

    // Criar marcadores para os restaurantes
    const listaRestaurantes = dadosRest.map((restaurante) => ({
        nome: restaurante.name,
        coords: [restaurante.latitude, restaurante.longitude],
        website: restaurante.website,
      }));


    // Criar os marcadores no mapa
    criarMarcadores(locaisArqueo, grupoArqueo, "arqueo");
    // Criar os marcadores no mapa
    criarMarcadores(listaCafes, grupoCafe, "cafe");
    // Criar os marcadores no mapa
    criarMarcadores(listaRestaurantes, grupoResto, "resto");


    // Ativar o grupo de marcadores arqueológicos por padrão
    toggleLayer("arqueo");
  } catch (error) {
    console.error("Erro ao carregar os dados:", error);
  }
}
// 

function criarMarcadores(lista, grupo, classeIcone) {
  grupo.clearLayers();
  lista.forEach((local) => {
    const marker = L.marker(local.coords, {
      icon: L.divIcon({ className: `${classeIcone}-icon` }),
      title: local.nome,
    }).bindPopup(`<strong>${local.nome}</strong>`);
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
//toggleLayer('arqueo'); // Mostrar arqueo por defeito
// Carregar os dados ao iniciar
carregarDados();
