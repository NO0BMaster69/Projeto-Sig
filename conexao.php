<?php
// Mostrar todos os erros (para debug)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Credenciais
$host = 'www.gis4cloud.com';
$port = '5432';
$dbname = 'grupo3_ptas2025';
$user = 'grupo3_ptas2025';
$password = 'dusCrias@4';

try {
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Ligação à base de dados estabelecida com sucesso.";
} catch (PDOException $e) {
    echo "Erro na ligação à base de dados: " . $e->getMessage();
}
?>

