<?php
// Ligação à base de dados
require_once 'conexao.php';
header('Content-Type: text/plain');

// Coordenadas hardcoded
$lat1 = 40.642517; $lon1 = -7.9620079;
$lat2 = 41.1675639; $lon2 = -8.6437992;

// Função original corrigida (com sintaxe correta)
function encontrarVertice($conn, $lat, $lon) {
    $sql = "
        SELECT id
        FROM pt_2po_4pgr
        ORDER BY geom_way <-> ST_SetSRID(ST_Point(:lon, :lat), 4326)
        LIMIT 1
    ";
    $stmt = $conn->prepare($sql);
    $stmt->execute([':lat' => $lat, ':lon' => $lon]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? $row['id'] : null;
}

//Se quiseres realismo, substitui pelas próximas duas funções:
$source = encontrar_vertice($lat1, $lon1, $conn);
$target = encontrar_vertice($lat2, $lon2, $conn);

if (!$source || !$target) {
    echo "Não foi possível encontrar os nós.\n";
    exit;
}

// 2. Executar pgr_dijkstra
$sql = "
SELECT pt.id, ST_AsText(pt.geom_way) AS geom_text
FROM pgr_dijkstra(
    'SELECT id, source, target, cost, reverse_cost FROM pt_2po_4pgr',
    CAST(:source AS integer),
    CAST(:target AS integer),
    false
) AS rotas
JOIN pt_2po_4pgr pt ON rotas.edge = pt.id
ORDER BY seq;
";

$stmt = $conn->prepare($sql);
$stmt->execute([
    ':source' => $source,
    ':target' => $target
]);

echo "Rota de $source → $target:\n\n";
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "Segmento ID {$row['id']} → {$row['geom_text']}\n";
}

// Função realista
function encontrar_vertice($lat, $lon, $conn) {
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
    $R = 6371e3; // Raio da Terra em metros
    $phi1 = deg2rad($lat1);
    $phi2 = deg2rad($lat2);
    $delta_phi = deg2rad($lat2 - $lat1);
    $delta_lambda = deg2rad($lon2 - $lon1);

    $a = sin($delta_phi / 2) ** 2 +
        cos($phi1) * cos($phi2) * sin($delta_lambda / 2) ** 2;
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

    return $R * $c;
}
?>
