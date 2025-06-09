/**
 * js/marcadores.js
 *
 * Este ficheiro gere a lógica de carregamento, filtragem e visualização de marcadores
 * (arqueológicos, restauração, serviços) num mapa Leaflet, com suporte a filtros por tipo,
 * área visível e raio de seleção.
 *
 * @author Grupo 3 PTAS 2025
 * @version 1.0
 */

/**
 * Alterna a camada de marcadores no mapa consoante o tipo e o estado dos filtros.
 * Se um raio estiver selecionado, filtra os marcadores por raio; caso contrário,
 * carrega os marcadores visíveis na área do mapa.
 *
 * @param {string} tipo - Tipo de marcador a alternar.
 */
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

// Definição dos ícones personalizados para cada tipo de marcador
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

// Arrays globais para gestão dos pontos e marcadores
let todosPontosDisponiveis = [];
const todosMarcadoresRestauração = [];
let ultimoPontoSelecionado = null;
let LocaisArqueo = [];
let currentRestorationMarkers = [];
let ultimoValorSlider = 15000;

/**
 * Carrega dados de locais arqueológicos, restauração e serviços via AJAX,
 * processa-os e armazena-os em `todosPontosDisponiveis`.
 * Após o carregamento, chama a função para mostrar os marcadores visíveis.
 *
 * @async
 * @returns {Promise<void>}
 */
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

    // Processa locais arqueológicos
    dadosLocal.forEach(loc => {
      let nomeFinal = "Nome desconhecido";

      if (loc.nome && loc.nome.trim() !== "") {
        nomeFinal = loc.nome;
      } else if (loc.alt_name && loc.alt_name.trim() !== "") {
        nomeFinal = loc.alt_name;
      }

      todosPontosDisponiveis.push({
        lat: parseFloat(loc.latitude),
        lng: parseFloat(loc.longitude),
        tipo: "arqueo",
        nome: nomeFinal,
        id: loc.id
      });
    });

    // Processa cafés
    restauracao.cafes.forEach(cafe => {
      todosPontosDisponiveis.push({
        lat: parseFloat(cafe.latitude),
        lng: parseFloat(cafe.longitude),
        tipo: "cafe",
        nome: cafe.nome,
        id: cafe.id
      });
    });

    // Processa restaurantes
    restauracao.restaurantes.forEach(resto => {
      todosPontosDisponiveis.push({
        lat: parseFloat(resto.latitude),
        lng: parseFloat(resto.longitude),
        tipo: "resto",
        nome: resto.nome,
        id: resto.id
      });
    });

    // Processa bombas de gasolina
    servicos.bombas.forEach(bomba => {
      todosPontosDisponiveis.push({
        lat: parseFloat(bomba.latitude),
        lng: parseFloat(bomba.longitude),
        tipo: "gas",
        nome: bomba.nome,
        id: bomba.id
      });
    });

    // Processa estações de comboio
    servicos.comboios.forEach(estacao => {
      todosPontosDisponiveis.push({
        lat: parseFloat(estacao.latitude),
        lng: parseFloat(estacao.longitude),
        tipo: "comb",
        nome: estacao.nome,
        id: estacao.id
      });
    });

    // Processa estações de autocarro
    servicos.autocarros.forEach(auto => {
      todosPontosDisponiveis.push({
        lat: parseFloat(auto.latitude),
        lng: parseFloat(auto.longitude),
        tipo: "auto",
        nome: auto.nome,
        id: auto.id
      });
    });

    // Carrega marcadores visíveis após o carregamento dos dados
    if (typeof mapa !== 'undefined') {
      carregarMarcadoresVisiveis(mapa.getBounds());
    }

  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
  }
}

function atualizarSliderRaio(valor) {
  const km = valor / 1000;
  document.getElementById("valorRaioLabel").innerText = `${km} km`;

  valor = parseInt(valor);
  raioSelecionado = valor;

  // Atualizar ou criar o círculo
  if (circuloRaio) {
    circuloRaio.setRadius(valor);
  } else if (pontoCentro) {
    circuloRaio = L.circle(pontoCentro, {
      radius: valor,
      color: "#007BFF",
      fillColor: "#007BFF",
      fillOpacity: 0.1
    }).addTo(mapa);
  }

  // ➕ Animação de zoom com base na direção
  if (pontoCentro) {
    const zoomAtual = mapa.getZoom();
    let novoZoom = zoomAtual;

    if (valor > ultimoValorSlider) {
      novoZoom = zoomAtual - 1; // zoom out
    } else if (valor < ultimoValorSlider) {
      novoZoom = zoomAtual + 1; // zoom in
    }

    // Limita o zoom entre 5 e 18, por exemplo
    novoZoom = Math.max(5, Math.min(18, novoZoom));

    mapa.flyTo(pontoCentro, novoZoom, {
      animate: true,
      duration: 1
    });
  }

  ultimoValorSlider = valor;

  // Atualizar pontos
  if (typeof filtrarMarcadoresPorRaio === "function") {
    filtrarMarcadoresPorRaio(raioSelecionado);
  }
}

/**
 * Carrega e mostra os marcadores no mapa de acordo com os filtros ativos (checkboxes),
 * área visível do mapa e, se aplicável, raio de seleção.
 * Remove marcadores que deixaram de cumprir os critérios.
 *
 * @param {L.LatLngBounds} bounds - Limites atuais do mapa.
 */
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

    // Remove marcador se não deve ser mostrado
    if (!deveMostrar && ponto._adicionado && ponto._marker) {
      mapa.removeLayer(ponto._marker);
      ponto._adicionado = false;
      ponto._marker = null;
      return;
    }

    // Adiciona marcador se deve ser mostrado e ainda não está no mapa
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

      // Guarda referência para cafés/restaurantes
      if (tipo === "cafe" || tipo === "resto") {
        todosMarcadoresRestauração.push({ marker, tipo });
      }

      // Eventos e gestão para locais arqueológicos
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

// Inicia o carregamento dos dados ao carregar o ficheiro
carregarDados();