<?php
require_once 'conexao.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$origem = $data['origem'];
$destino = $data['destino'];
$modo = isset($data['modo']) ? $data['modo'] : 'car';

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
    $stmt = $conn->prepare($sql);
    $stmt->execute([':lat' => $lat, ':lon' => $lon]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $dist_source = haversine($lat, $lon, $row['y1'], $row['x1']);
        $dist_target = haversine($lat, $lon, $row['y2'], $row['x2']);

        return $dist_source <= $dist_target ? $row['source'] : $row['target'];
    }
    return null;
}

function haversine($lat1, $lon1, $lat2, $lon2) {
    $R = 6371e3;
    $phi1 = deg2rad($lat1);
    $phi2 = deg2rad($lat2);
    $delta_phi = deg2rad($lat2 - $lat1);
    $delta_lambda = deg2rad($lon2 - $lon1);

    $a = sin($delta_phi / 2) * sin($delta_phi / 2) +
        cos($phi1) * cos($phi2) *
        sin($delta_lambda / 2) * sin($delta_lambda / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

    return $R * $c;
}

$lat1 = $origem['lat']; $lon1 = $origem['lng'];
$lat2 = $destino['lat']; $lon2 = $destino['lng'];

$source = encontrar_vertice_realista($lat1, $lon1, $conn);
$target = encontrar_vertice_realista($lat2, $lon2, $conn);

if (!$source || !$target) {
    echo json_encode(['erro' => 'Não foi possível encontrar os nós.']);
    exit;
}

$sql = "
    SELECT pt.geom_way, pt.km, pt.kmh
    FROM pgr_dijkstra(
        'SELECT id, source, target, cost, reverse_cost FROM pt_2po_4pgr',
        $source, $target, false
    ) AS rotas
    JOIN pt_2po_4pgr pt ON rotas.edge = pt.id
    ORDER BY seq;
";

$stmt = $conn->query($sql);
$features = [];
$total_km = 0;
$tempo_seg = 0;

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $geojson = $conn->query("SELECT ST_AsGeoJSON('" . $row['geom_way'] . "')")->fetchColumn();
    $features[] = [
        "type" => "Feature",
        "geometry" => json_decode($geojson),
        "properties" => new stdClass()
    ];

    $total_km += $row['km'];
    $kmh = max($row['kmh'], 5);
    $tempo_seg += ($row['km'] / $kmh) * 3600;
}

echo json_encode([
    "type" => "FeatureCollection",
    "features" => $features,
    "distancia" => $total_km * 1000,
    "tempo" => $tempo_seg
]);


//Algoritmo alternativo por distância física
//SELECT ST_AsGeoJSON(geom_way) AS geojson
//FROM pgr_dijkstra(
//    'SELECT id, source, target, km AS cost, km AS reverse_cost FROM pt_2po_4pgr',
//    CAST(:source AS integer),
//    CAST(:target AS integer),
//    false
//)
//JOIN pt_2po_4pgr pt ON rotas.edge = pt.id
//ORDER BY seq;