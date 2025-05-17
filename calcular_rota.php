<?php
require_once 'conexao.php';
$conn = getConnection();

// Mostrar todos os erros para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // Receber os dados da requisição
    $input = json_decode(file_get_contents('php://input'), true);
    $origem = $input['origem'];
    $destino = $input['destino'];

    // Verificar se os pontos foram recebidos
    if (!$origem || !$destino) {
        echo json_encode(['error' => 'Parâmetros inválidos']);
        exit;
    }

    // Encontrar os vértices mais próximos
    $queryVertices = "
        SELECT id, source, target, cost, reverse_cost, ST_AsText(geom_way) as geom_way 
        FROM pt_2po_4pgr
        ORDER BY geom_way <-> ST_SetSRID(ST_Point(:lng, :lat), 4326)
        LIMIT 1;
    ";

    $stmt = $conn->prepare($queryVertices);

    // Vértice de origem
    $stmt->execute(['lng' => $origem['lng'], 'lat' => $origem['lat']]);
    $origemVertice = $stmt->fetch(PDO::FETCH_ASSOC);

    // Vértice de destino
    $stmt->execute(['lng' => $destino['lng'], 'lat' => $destino['lat']]);
    $destinoVertice = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$origemVertice || !$destinoVertice) {
        echo json_encode(['error' => 'Vértices não encontrados']);
        exit;
    }

    $source = $origemVertice['source'];
    $target = $destinoVertice['target'];

    // Consulta para calcular a rota usando pgr_dijkstra
    $queryRota = "
    SELECT ST_AsGeoJSON(geom_way) as geojson, km
    FROM pgr_dijkstra(
        'SELECT id, source, target, cost, reverse_cost FROM pt_2po_4pgr',
        :source, :target, false
    ) AS route
    JOIN pt_2po_4pgr pt ON route.edge = pt.id
    ORDER BY seq;
";

    $stmt = $conn->prepare($queryRota);
    $stmt->execute(['source' => $source, 'target' => $target]);
    $rotas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $geojsonFeatures = [];
    $distanciaTotal = 0;
    $tempoTotal = 0;

    foreach ($rotas as $rota) {
        $geojsonFeatures[] = [
            'type' => 'Feature',
            'geometry' => json_decode($rota['geojson']),
            'properties' => ['km' => $rota['km']]
        ];
        $distanciaTotal += $rota['km'] * 1000;  // Conversão para metros
    }

    // Estrutura final em GeoJSON
    $geojson = [
        'type' => 'FeatureCollection',
        'features' => $geojsonFeatures,
        'distancia' => $distanciaTotal,
        'tempo' => $tempoTotal
    ];

    echo json_encode($geojson);

} catch (PDOException $e) {
    echo json_encode(['error' => 'Erro na base de dados: ' . $e->getMessage()]);
}
?>
