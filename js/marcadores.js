function toggleLayer(tipo) {
  if (typeof mapa === 'undefined') return;

  if (raioSelecionado && pontoCentro && typeof filtrarMarcadoresPorRaio === 'function') {
    // Se o raio estiver ativo, aplica só os pontos dentro do raio com checkbox ativo
    filtrarMarcadoresPorRaio(raioSelecionado);
  } else if (typeof carregarMarcadoresVisiveis === 'function') {
    // Se o raio estiver desativado, carrega pontos com base em checkbox e área visível
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

const iconeGas = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/890/890964.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

const iconeComboio = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/724/724080.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

const iconeAutocarro = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1042/1042263.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

let todosPontosDisponiveis = [];
const todosMarcadoresRestauração = [];
let ultimoPontoSelecionado = null;
let LocaisArqueo = [];
let currentRestorationMarkers = [];

async function carregarDados() {
  try {
    const responseLocal = await fetch("get_locais.php");
    const responseResta = await fetch("get_restauracao.php");
    const responseServicos = await fetch("get_servicos.php");

    const dadosLocal = await responseLocal.json();
    const servicos = await responseServicos.json();
    const restauracao =  await responseResta.json();


    console.log("Locais:", dadosLocal.length);
    console.log("Servicos:", servicos.bombas.length);
    console.log("Restauração", restauracao.cafes.length);


    dadosLocal.forEach(loc => {
      todosPontosDisponiveis.push({
        lat: parseFloat(loc.latitude),
        lng: parseFloat(loc.longitude),
        tipo: "arqueo",
        nome: loc.nome,
        id: loc.id
      });
    });

    restauracao.cafes.forEach(cafe => {
      todosPontosDisponiveis.push({
        lat: parseFloat(cafe.latitude),
        lng: parseFloat(cafe.longitude),
        tipo: "cafe",
        nome: cafe.nome,
        id: cafe.id
      });
    });

    restauracao.restaurantes.forEach(resto => {
      todosPontosDisponiveis.push({
        lat: parseFloat(resto.latitude),
        lng: parseFloat(resto.longitude),
        tipo: "resto",
        nome: resto.nome,
        id: resto.id
      });
    });

    // Bombas de gasolina
    servicos.bombas.forEach(bomba => {
      todosPontosDisponiveis.push({
        lat: parseFloat(bomba.latitude),
        lng: parseFloat(bomba.longitude),
        tipo: "gas",
        nome: bomba.nome,
        id: bomba.id
      });
    });

    servicos.comboios.forEach(estacao => {
      todosPontosDisponiveis.push({
        lat: parseFloat(estacao.latitude),
        lng: parseFloat(estacao.longitude),
        tipo: "comb",
        nome: estacao.nome,
        id: estacao.id
      });
    });

    servicos.autocarros.forEach(auto => {
      todosPontosDisponiveis.push({
        lat: parseFloat(auto.latitude),
        lng: parseFloat(auto.longitude),
        tipo: "auto",
        nome: auto.nome,
        id: auto.id
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
  const gasAtivo = document.getElementById("chkGas")?.checked;
  const combAtivo = document.getElementById("chkComb")?.checked;
  const autoAtivo = document.getElementById("chkAuto")?.checked;

  todosPontosDisponiveis.forEach(ponto => {
    const tipo = ponto.tipo;
    const latlng = L.latLng(ponto.lat, ponto.lng);

    const estaAtivo =
        (tipo === "arqueo" && arqueoAtivo) ||
        (tipo === "cafe" && cafeAtivo) ||
        (tipo === "resto" && restoAtivo) ||
        (tipo === "gas" && gasAtivo) ||
        (tipo === "comb" && combAtivo) ||
        (tipo === "auto" && autoAtivo);

    const dentroDoMapa = bounds.contains(latlng);

    const dentroDoRaio = (
        tipo === "arqueo" || raioSelecionado === null || pontoCentro === null
            ? true
            : pontoCentro.distanceTo(latlng) <= raioSelecionado
    );

    const deveMostrar = estaAtivo && dentroDoMapa && dentroDoRaio;

    if (!deveMostrar && ponto._adicionado && ponto._marker) {
      mapa.removeLayer(ponto._marker);
      ponto._adicionado = false;
      ponto._marker = null;
      return;
    }

    if (deveMostrar && !ponto._adicionado) {
      let icone;
      switch (tipo) {
        case "cafe": icone = iconeCafe; break;
        case "resto": icone = iconeResto; break;
        case "arqueo": icone = iconeArqueo; break;
        case "gas": icone = iconeGas; break;
        case "comb": icone = iconeComboio; break;
        case "auto": icone = iconeAutocarro; break;
      }

      const marker = L.marker(latlng, { icon: icone }).bindTooltip(ponto.nome);
      marker.addTo(mapa);

      if (tipo === "cafe" || tipo === "resto") {
        todosMarcadoresRestauração.push({ marker, tipo });
      }

      if (tipo === "arqueo") {
        marker.on("click", () => {
          ultimoPontoSelecionado = ponto;

          mapa.flyTo(latlng, mapa.getZoom(), {
            animate: true,
            duration: 1.2
          });

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
