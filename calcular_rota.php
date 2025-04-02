<?php
require_once 'conexao.php'; // Inclui o arquivo de conexão com o banco de dados
header('Content-Type: application/json'); // Define o cabeçalho da resposta como JSON

// Recebe os dados enviados no corpo da requisição (JSON) e os decodifica
$data = json_decode(file_get_contents('php://input'), true);
$origem = $data['origem']; // Coordenadas de origem
$destino = $data['destino']; // Coordenadas de destino
$modo = isset($data['modo']) ? $data['modo'] : 'car'; // Modo de transporte (padrão: carro)

/**
 * Função para encontrar o vértice mais próximo de um ponto geográfico (latitude e longitude).
 * Utiliza a distância geográfica para determinar o vértice mais realista.
 *
 * @param float $lat Latitude do ponto
 * @param float $lon Longitude do ponto
 * @param PDO $conn Conexão com o banco de dados
 * @return int|null Retorna o ID do vértice mais próximo ou null se não encontrado
 */
function encontrar_vertice_realista($lat, $lon, $conn) {
    $sql = "
        SELECT id, source, target, x1, y1, x2, y2,
               LEAST(
                   ST_Distance(ST_SetSRID(ST_Point(x1, y1), 4326)::geography, ST_SetSRID(ST_Point(:lon, :lat), 4326)::geography),
                   ST_Distance(ST_SetSRID(ST_Point(x2, y2), 4326)::geography, ST_SetSRID(ST_Point(:lon, :lat), 4326)::geography)
               ) AS dist
        FROM pt_2po_4pgr
        ORDER BY dist ASC, id ASC
        LIMIT 1;
    ";
    $stmt = $conn->prepare($sql); // Prepara a consulta SQL
    $stmt->execute([':lat' => $lat, ':lon' => $lon]); // Executa a consulta com os parâmetros

    $row = $stmt->fetch(PDO::FETCH_ASSOC); // Obtém o resultado da consulta
    if ($row) {
        // Calcula a distância para os vértices source e target
        $dist_source = haversine($lat, $lon, $row['y1'], $row['x1']);
        $dist_target = haversine($lat, $lon, $row['y2'], $row['x2']);

        // Retorna o vértice mais próximo
        return $dist_source <= $dist_target ? $row['source'] : $row['target'];
    }
    return null; // Retorna null se nenhum vértice for encontrado
}

/**
 * Função para calcular a distância entre dois pontos geográficos usando a fórmula de Haversine.
 *
 * @param float $lat1 Latitude do primeiro ponto
 * @param float $lon1 Longitude do primeiro ponto
 * @param float $lat2 Latitude do segundo ponto
 * @param float $lon2 Longitude do segundo ponto
 * @return float Distância em metros
 */
function haversine($lat1, $lon1, $lat2, $lon2) {
    $R = 6371e3; // Raio da Terra em metros
    $phi1 = deg2rad($lat1); // Converte latitude 1 para radianos
    $phi2 = deg2rad($lat2); // Converte latitude 2 para radianos
    $delta_phi = deg2rad($lat2 - $lat1); // Diferença de latitude em radianos
    $delta_lambda = deg2rad($lon2 - $lon1); // Diferença de longitude em radianos

    // Fórmula de Haversine
    $a = sin($delta_phi / 2) * sin($delta_phi / 2) +
        cos($phi1) * cos($phi2) *
        sin($delta_lambda / 2) * sin($delta_lambda / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

    return $R * $c; // Retorna a distância em metros
}

// Extrai as coordenadas de origem e destino
$lat1 = $origem['lat']; $lon1 = $origem['lng'];
$lat2 = $destino['lat']; $lon2 = $destino['lng'];

// Encontra os vértices mais próximos para origem e destino
$source = encontrar_vertice_realista($lat1, $lon1, $conn);
$target = encontrar_vertice_realista($lat2, $lon2, $conn);

// Verifica se os vértices foram encontrados
if (!$source || !$target) {
    echo json_encode(['erro' => 'Não foi possível encontrar os nós.']);
    exit;
}

// Consulta SQL para calcular a rota usando o algoritmo de Dijkstra
$sql = "
    SELECT pt.geom_way, pt.km, pt.kmh
    FROM pgr_dijkstra(
        'SELECT id, source, target, cost, reverse_cost FROM pt_2po_4pgr',
        $source, $target, false
    ) AS rotas
    JOIN pt_2po_4pgr pt ON rotas.edge = pt.id
    ORDER BY seq;
";

$stmt = $conn->query($sql); // Executa a consulta
$features = []; // Array para armazenar os recursos GeoJSON
$total_km = 0; // Total de quilômetros da rota
$tempo_seg = 0; // Tempo total em segundos

// Processa os resultados da consulta
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    // Converte a geometria para GeoJSON
    $geojson = $conn->query("SELECT ST_AsGeoJSON('" . $row['geom_way'] . "')")->fetchColumn();
    $features[] = [
        "type" => "Feature",
        "geometry" => json_decode($geojson),
        "properties" => new stdClass()
    ];

    // Calcula a distância total e o tempo estimado
    $total_km += $row['km'];
    $kmh = max($row['kmh'], 5); // Garante uma velocidade mínima de 5 km/h
    $tempo_seg += ($row['km'] / $kmh) * 3600; // Converte para segundos
}

// Retorna a resposta como um objeto GeoJSON com informações adicionais
echo json_encode([
    "type" => "FeatureCollection",
    "features" => $features,
    "distancia" => $total_km * 1000, // Distância total em metros
    "tempo" => $tempo_seg // Tempo total em segundos
]);

// Algoritmo alternativo por distância física (comentado para referência futura)
// SELECT ST_AsGeoJSON(geom_way) AS geojson
// FROM pgr_dijkstra(
//     'SELECT id, source, target, km AS cost, km AS reverse_cost FROM pt_2po_4pgr',
//     CAST(:source AS integer),
//     CAST(:target AS integer),
//     false
// )
// JOIN pt_2po_4pgr pt ON rotas.edge = pt.id
// ORDER BY seq;