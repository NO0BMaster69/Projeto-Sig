<?php
function criarConexao() {
    $host = 'localhost';
    $port = '5432';
    $dbname = 'grupo3_ptas2025';
    $user = 'grupo3_ptas2025';
    $password = 'dusCrias@4';

    try {
        $conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        die("Erro na conexão: " . $e->getMessage());
    }
}
?>

