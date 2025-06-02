function toggleLayer(tipo) {
  // Após mudar o estado dos checkboxes, apenas recarregue os marcadores visíveis
  if (typeof carregarMarcadoresVisiveis === 'function' && typeof mapa !== 'undefined') {
    carregarMarcadoresVisiveis(mapa.getBounds());
  }
}



const iconeArqueo = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1597/1597883.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const iconeCafe = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/12257/12257378.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

const iconeResto = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2537/2537867.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

let todosPontosDisponiveis = [];
const todosMarcadoresRestauração = [];
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

    const dadosLocal = await responseLocal.json();
    const dadosCafe = await responseCafe.json();
    const dadosRest = await responseRest.json();

    console.log("Locais:", dadosLocal.length);
    console.log("Cafés:", dadosCafe.length);
    console.log("Restaurantes:", dadosRest.length);

    dadosLocal.forEach(loc => {
      todosPontosDisponiveis.push({
        lat: parseFloat(loc.latitude),
        lng: parseFloat(loc.longitude),
        tipo: "arqueo",
        nome: loc.nome,
        id: loc.id
      });
    });

    dadosCafe.forEach(cafe => {
      todosPontosDisponiveis.push({
        lat: parseFloat(cafe.latitude),
        lng: parseFloat(cafe.longitude),
        tipo: "cafe",
        nome: cafe.nome,
        id: cafe.id
      });
    });

    dadosRest.forEach(resto => {
      todosPontosDisponiveis.push({
        lat: parseFloat(resto.latitude),
        lng: parseFloat(resto.longitude),
        tipo: "resto",
        nome: resto.nome,
        id: resto.id
      });
    });

    if (typeof mapa !== 'undefined') {
      carregarMarcadoresVisiveis(mapa.getBounds());
    }

  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
  }
}

function carregarMarcadoresVisiveis(bounds) {
  const arqueoAtivo = document.getElementById("chkArqueo")?.checked;
  const cafeAtivo = document.getElementById("chkCafe")?.checked;
  const restoAtivo = document.getElementById("chkResto")?.checked;

  todosPontosDisponiveis.forEach(ponto => {
    const tipo = ponto.tipo;
    const latlng = L.latLng(ponto.lat, ponto.lng);

    const estaAtivo =
        (tipo === "arqueo" && arqueoAtivo) ||
        (tipo === "cafe" && cafeAtivo) ||
        (tipo === "resto" && restoAtivo);

    const dentroDoMapa = bounds.contains(latlng);

    // Aplicar raio só a café/restaurante
    const dentroDoRaio = (
        tipo === "arqueo" || raioSelecionado === null || pontoCentro === null
            ? true
            : pontoCentro.distanceTo(latlng) <= raioSelecionado
    );

    const deveMostrar = estaAtivo && dentroDoMapa && dentroDoRaio;

    // ❌ Remover se não deve mostrar
    if (!deveMostrar && ponto._adicionado && ponto._marker) {
      mapa.removeLayer(ponto._marker);
      ponto._adicionado = false;
      ponto._marker = null;
      return;
    }

    // ✅ Adicionar se deve mostrar e ainda não foi adicionado
    if (deveMostrar && !ponto._adicionado) {
      let icone;
      switch (tipo) {
        case "cafe": icone = iconeCafe; break;
        case "resto": icone = iconeResto; break;
        case "arqueo": icone = iconeArqueo; break;
      }

      const marker = L.marker(latlng, { icon: icone }).bindTooltip(ponto.nome);
      marker.addTo(mapa);

      if (tipo === "cafe" || tipo === "resto") {
        todosMarcadoresRestauração.push({ marker, tipo });
      }

      if (tipo === "arqueo") {
        marker.on("click", () => {
          ultimoPontoSelecionado = ponto;
          if (typeof mostrarMenuRaio === "function") {
            mostrarMenuRaio(marker);
          }
        });
        LocaisArqueo.push(marker);
      }

      ponto._marker = marker;
      ponto._adicionado = true;
    }
  });
}

carregarDados();
