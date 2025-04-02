// Variáveis globais para controle do estado da rota
let modoRotaAtivo = false; // Indica se o modo de seleção de rota está ativo
let pontos = []; // Armazena os pontos selecionados no mapa (origem e destino)
let camadaRota = null; // Camada que exibe a rota no mapa
let marcadoresRota = []; // Lista de marcadores adicionados ao mapa

/**
 * Função para iniciar ou reiniciar o modo de seleção de rota.
 * Limpa os pontos, marcadores e a camada de rota do mapa.
 */
function iniciarRota() {
    modoRotaAtivo = !modoRotaAtivo; // Alterna o estado do modo de rota
    pontos = []; // Reinicia os pontos selecionados

    // Remove a camada de rota do mapa, se existir
    if (camadaRota) {
        map.removeLayer(camadaRota);
        camadaRota = null;
    }

    // Remove todos os marcadores do mapa
    marcadoresRota.forEach(m => map.removeLayer(m));
    marcadoresRota = [];

    // Esconde as informações da rota na interface
    document.getElementById('routeInfo').classList.add('d-none');
}

// Evento de clique no mapa para selecionar pontos de origem e destino
map.on('click', function (e) {
    if (!modoRotaAtivo) return; // Ignora cliques se o modo de rota não estiver ativo

    const { lat, lng } = e.latlng; // Obtém as coordenadas do clique
    const marcador = L.marker([lat, lng]) // Cria um marcador no mapa
        .addTo(map)
        .bindPopup(`Lat: ${lat.toFixed(5)}, Lon: ${lng.toFixed(5)}`) // Exibe as coordenadas no popup
        .openPopup();

    marcadoresRota.push(marcador); // Adiciona o marcador à lista
    pontos.push({ lat, lng }); // Adiciona as coordenadas à lista de pontos

    // Quando dois pontos forem selecionados, calcula a rota
    if (pontos.length === 2) {
        calcularRota(pontos[0], pontos[1]); // Chama a função para calcular a rota
        modoRotaAtivo = false; // Desativa o modo de seleção de rota
    }
});

/**
 * Função para calcular a rota entre dois pontos.
 * Envia uma requisição para o servidor e exibe a rota no mapa.
 *
 * @param {Object} origem Coordenadas do ponto de origem (lat, lng)
 * @param {Object} destino Coordenadas do ponto de destino (lat, lng)
 */
function calcularRota(origem, destino) {
    fetch('calcular_rota.php', { // Envia uma requisição POST para o servidor
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Define o tipo de conteúdo como JSON
        body: JSON.stringify({ origem, destino }) // Envia as coordenadas no corpo da requisição
    })
        .then(resp => resp.json()) // Converte a resposta para JSON
        .then(geojson => {
            // Verifica se a resposta contém uma rota válida
            if (!geojson || !geojson.features || geojson.features.length === 0) {
                alert("Rota não encontrada."); // Exibe um alerta se não houver rota
                return;
            }

            // Remove a camada de rota anterior, se existir
            if (camadaRota) map.removeLayer(camadaRota);

            // Adiciona a nova rota ao mapa como uma camada GeoJSON
            camadaRota = L.geoJSON(geojson, {
                style: { color: 'blue', weight: 4 } // Define o estilo da linha da rota
            }).addTo(map);

            // Ajusta o zoom do mapa para a extensão da rota
            map.fitBounds(camadaRota.getBounds());

            // Exibe as informações da rota na interface
            document.getElementById('routeInfo').classList.remove('d-none');

            // Calcula e exibe a distância e o tempo estimado
            const distanciaKm = (geojson.distancia / 1000).toFixed(2); // Distância em km
            const tempoMin = (geojson.tempo / 60).toFixed(1); // Tempo em minutos
            document.getElementById('routeDetails').innerText = `Distância: ${distanciaKm} km | Tempo: ${tempoMin} min`;
        })
        .catch(err => {
            // Trata erros na requisição ou no cálculo da rota
            console.error("Erro ao calcular rota:", err);
            alert("Erro ao calcular rota.");
        });
}

/**
 * Função para fechar a rota exibida no mapa.
 * Remove a camada de rota e os marcadores, e esconde as informações da rota.
 */
function fecharRota() {
    if (camadaRota) map.removeLayer(camadaRota); // Remove a camada de rota do mapa
    camadaRota = null; // Reseta a variável da camada de rota

    // Remove todos os marcadores do mapa
    marcadoresRota.forEach(m => map.removeLayer(m));
    marcadoresRota = [];

    // Esconde as informações da rota na interface
    document.getElementById('routeInfo').classList.add('d-none');
}