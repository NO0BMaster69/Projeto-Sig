<?php
/**
 * Script para retornar, em formato JSON, os serviços públicos presentes na base de dados:
 * - Bombas de gasolina
 * - Estações de comboio
 * - Terminais de autocarro
 *
 * Realiza conexão com o banco PostgreSQL/PostGIS, consulta as tabelas correspondentes,
 * extrai nome e coordenadas (longitude e latitude) dos pontos, e retorna os dados agrupados.
 *
 * @package    ServicosPublicosAPI
 * @author     [Seu Nome]
 * @version    1.0
 */

// Exibe todos os erros e avisos do PHP para facilitar o debug durante o desenvolvimento.
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Define o cabeçalho da resposta como JSON
header("Content-Type: application/json");

// Conecta ao banco de dados PostgreSQL/PostGIS
$conn = pg_connect("host=www.gis4cloud.com port=5432 dbname=grupo3_ptas2025 user=grupo3_ptas2025 password=dusCrias@4");

// Verifica se a conexão foi bem-sucedida
if (!$conn) {
    echo json_encode(["erro" => "Erro na ligação à base de dados"]);
    exit;
}

// Inicializa o array de dados para armazenar os serviços
$dados = [
    "bombas" => [],
    "comboios" => [],
    "autocarros" => []
];

// Consulta SQL para buscar bombas de gasolina (nome e coordenadas)
/**
 * Consulta as geometrias de bombas de gasolina, extraindo nome, longitude e latitude.
 * Apenas pontos são considerados.
 */
$sql = "
          SELECT
    \"name\",
    ST_X(ST_Centroid(geom)) AS longitude,
    ST_Y(ST_Centroid(geom)) AS latitude
FROM (
    SELECT (ST_Dump(geom)).geom, \"name\"
    FROM public.bombas_gasolina
) AS dump
WHERE GeometryType(geom) = 'POINT';

    ";
$res = pg_query($conn, $sql);
if ($res) {
    while ($linha = pg_fetch_assoc($res)) {
        $dados["bombas"][] = $linha;
    }
}

// Consulta SQL para buscar estações de comboio (nome e coordenadas)
/**
 * Consulta as geometrias de estações de comboio, extraindo nome, longitude e latitude.
 * Apenas pontos são considerados.
 */
$sql = "
          SELECT
    \"name\",
    ST_X(ST_Centroid(geom)) AS longitude,
    ST_Y(ST_Centroid(geom)) AS latitude
FROM (
    SELECT (ST_Dump(geom)).geom, \"name\"
    FROM public.estacoes_comboio
) AS dump
WHERE GeometryType(geom) = 'POINT';

    ";
$res = pg_query($conn, $sql);
if ($res) {
    while ($linha = pg_fetch_assoc($res)) {
        $dados["comboios"][] = $linha;
    }
}

// Consulta SQL para buscar terminais de autocarro (nome e coordenadas)
/**
 * Consulta as geometrias de terminais de autocarro, extraindo nome, longitude e latitude.
 * Apenas pontos são considerados.
 */
$sql = "
          SELECT
    \"name\",
    ST_X(ST_Centroid(geom)) AS longitude,
    ST_Y(ST_Centroid(geom)) AS latitude
FROM (
    SELECT (ST_Dump(geom)).geom, \"name\"
    FROM public.terminais_autocarro
) AS dump
WHERE GeometryType(geom) = 'POINT';

    ";
$res = pg_query($conn, $sql);
if ($res) {
    while ($linha = pg_fetch_assoc($res)) {
        $dados["autocarros"][] = $linha;
    }
}

// Retorna os dados dos serviços em formato JSON
echo json_encode($dados);
?>