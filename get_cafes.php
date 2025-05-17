<?php
require_once 'conexao.php';
$conn = getConnection();
header('Content-Type: application/json'); // Define o cabeçalho como JSON

try {
    // Query para buscar os dados da tabela pontos_arqueologicos
    $sql = "
       			SELECT    
    \"name\",
    ST_X(ST_Centroid(geom)) AS longitude, 
    ST_Y(ST_Centroid(geom)) AS latitude
FROM (
    SELECT (ST_Dump(geom)).geom, \"name\" 
    FROM public.cafes
) AS dump
WHERE GeometryType(geom) = 'POINT';

    ";

    // Executa a query
    $stmt = $conn->query($sql);
    $locais = $stmt->fetchAll(PDO::FETCH_ASSOC); // Obtém os resultados como array associativo

    // Retorna os dados no formato JSON
    echo json_encode($locais);
} catch (PDOException $e) {
    // Retorna um erro em caso de falha
    echo json_encode(['error' => $e->getMessage()]);
}
