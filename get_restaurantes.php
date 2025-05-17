<?php
require_once 'conexao.php';
$conn = getConnection();
header('Content-Type: application/json'); // Define o cabeçalho como JSON

try {
    // Consulta SQL para buscar os dados dos restaurantes
    $sql = "
SELECT    
            \"name\",
            ST_X(ST_Centroid(geom)) AS longitude, 
            ST_Y(ST_Centroid(geom)) AS latitude
        FROM (
            SELECT (ST_Dump(geom)).geom, \"name\" 
            FROM public.restaurantes
        ) AS dump
        WHERE GeometryType(geom) = 'POINT';
    ";

    // Executa a consulta
    $stmt = $conn->query($sql);
    $restaurantes = $stmt->fetchAll(PDO::FETCH_ASSOC); // Obtém os resultados como array associativo

    // Retorna os dados no formato JSON
    echo json_encode($restaurantes);
} catch (PDOException $e) {
    // Retorna um erro em caso de falha
    echo json_encode(['error' => $e->getMessage()]);
}
?>