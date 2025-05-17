<?php
// Mostrar todos os erros (para debug)
// As configurações abaixo garantem que todos os erros e avisos sejam exibidos.
// Útil durante o desenvolvimento, mas deve ser desativado em produção.
ini_set('display_errors', 1); // Exibe erros
ini_set('display_startup_errors', 1); // Exibe erros durante a inicialização
error_reporting(E_ALL); // Relata todos os tipos de erros

// Credenciais de conexão com o banco de dados PostgreSQL
$host = 'www.gis4cloud.com'; // Endereço do servidor do banco de dados
$port = '5432'; // Porta padrão do PostgreSQL
$dbname = 'grupo3_ptas2025'; // Nome do banco de dados
$user = 'grupo3_ptas2025'; // Nome de usuário para autenticação
$password = 'dusCrias@4'; // Senha do usuário

function getConnection() {
    $host = 'www.gis4cloud.com';
    $port = '5432';
    $dbname = 'grupo3_ptas2025';
    $user = 'grupo3_ptas2025';
    $password = 'dusCrias@4';

    try {
        $conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        echo "Erro na ligação à base de dados: " . $e->getMessage();
        exit;
    }
}
?>