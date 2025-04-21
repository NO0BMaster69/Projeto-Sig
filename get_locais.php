<?php
require_once 'conexao.php'; // Inclui o arquivo de conexão com o banco de dados
header('Content-Type: application/json'); // Define o cabeçalho como JSON

try {
    // Query para buscar os dados da tabela pontos_arqueologicos
    $sql = "
        SELECT    
            alt_name AS nome,
            \"heritage:website\" AS website,
            ST_X(geom) AS longitude, 
            ST_Y(geom) AS latitude
        FROM (
            SELECT (ST_Dump(geom)).geom, alt_name, \"heritage:website\" 
            FROM public.pontos_arqueologicos
        ) AS dump;
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
