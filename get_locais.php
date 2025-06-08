<?php
/**
 * Este script retorna, em formato JSON, os locais arqueológicos presentes na base de dados.
 * Ele conecta ao banco PostgreSQL/PostGIS, executa uma consulta para extrair nome alternativo,
 * website e coordenadas (longitude e latitude) dos pontos arqueológicos, e retorna os dados.
 *
 * Requer o arquivo 'conexao.php' com a função getConnection().
 *
 * @package    LocaisArqueologicosAPI
 * @author     [Seu Nome]
 * @version    1.0
 */

require_once 'conexao.php'; // Inclui o arquivo de conexão com o banco de dados

$conn = getConnection(); // Obtém a conexão PDO com o banco

header('Content-Type: application/json'); // Define o cabeçalho da resposta como JSON

try {
    /**
     * Consulta SQL para buscar os dados dos pontos arqueológicos.
     * - alt_name: nome alternativo do local
     * - heritage:website: site associado ao local
     * - ST_X(geom): longitude extraída da geometria
     * - ST_Y(geom): latitude extraída da geometria
     * Utiliza ST_Dump para lidar com geometrias multiponto.
     */
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

    // Executa a consulta SQL
    $stmt = $conn->query($sql);

    // Obtém todos os resultados como array associativo
    $locais = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Retorna os dados em formato JSON
    echo json_encode($locais);
} catch (PDOException $e) {
    /**
     * Em caso de erro na consulta ou conexão, retorna um JSON com a mensagem de erro.
     */
    echo json_encode(['error' => $e->getMessage()]);
}