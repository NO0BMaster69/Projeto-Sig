<?php
/**
 * get_restauracao.php
 *
 * Este script PHP conecta-se a uma base de dados PostgreSQL/PostGIS e retorna,
 * em formato JSON, a lista de cafés e restaurantes, incluindo os seus nomes e coordenadas geográficas.
 *
 * Funcionalidades:
 * - Liga-se à base de dados especificada.
 * - Extrai os nomes e coordenadas (latitude e longitude) dos cafés e restaurantes.
 * - Retorna os dados em formato JSON, separados por categoria.
 *
 * @author  Grupo 3 PTAS 2025
 * @version 1.0
 */

// Ativa a exibição de erros para debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Define o cabeçalho da resposta como JSON
header("Content-Type: application/json");

// Liga-se à base de dados PostgreSQL/PostGIS
$conn = pg_connect("host=www.gis4cloud.com port=5432 dbname=grupo3_ptas2025 user=grupo3_ptas2025 password=dusCrias@4");

// Verifica se a ligação foi bem-sucedida
if (!$conn) {
    echo json_encode(["erro" => "Erro na ligação à base de dados"]);
    exit;
}

// Inicializa o array de dados de resposta
$dados = [
    "cafes" => [],
    "restaurantes" => [],
];

// Consulta SQL para obter cafés (nome e coordenadas)
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
$res = pg_query($conn, $sql);
if ($res) {
    while ($linha = pg_fetch_assoc($res)) {
        $dados["cafes"][] = $linha;
    }
}

// Consulta SQL para obter restaurantes (nome e coordenadas)
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
$res = pg_query($conn, $sql);
if ($res) {
    while ($linha = pg_fetch_assoc($res)) {
        $dados["restaurantes"][] = $linha;
    }
}

// Retorna os dados em formato JSON
echo json_encode($dados);
?>