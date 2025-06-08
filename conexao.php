<?php
/**
 * Exibe todos os erros e avisos do PHP para facilitar o debug durante o desenvolvimento.
 * ATENÇÃO: Não utilizar estas configurações em produção.
 */
ini_set('display_errors', 1); // Exibe erros
ini_set('display_startup_errors', 1); // Exibe erros durante a inicialização
error_reporting(E_ALL); // Relata todos os tipos de erros

/**
 * Credenciais de conexão com o banco de dados PostgreSQL.
 * @var string $host     Endereço do servidor do banco de dados
 * @var string $port     Porta do PostgreSQL
 * @var string $dbname   Nome do banco de dados
 * @var string $user     Nome de usuário para autenticação
 * @var string $password Senha do usuário
 */
$host = 'www.gis4cloud.com'; // Endereço do servidor do banco de dados
$port = '5432'; // Porta padrão do PostgreSQL
$dbname = 'grupo3_ptas2025'; // Nome do banco de dados
$user = 'grupo3_ptas2025'; // Nome de usuário para autenticação
$password = 'dusCrias@4'; // Senha do usuário

/**
 * Cria e retorna uma conexão PDO com o banco de dados PostgreSQL.
 *
 * @return PDO Conexão ativa com o banco de dados
 * @throws PDOException Caso ocorra erro na conexão
 */
function getConnection() {
    $host = 'www.gis4cloud.com';
    $port = '5432';
    $dbname = 'grupo3_ptas2025';
    $user = 'grupo3_ptas2025';
    $password = 'dusCrias@4';

    try {
        // Cria uma nova conexão PDO com o banco PostgreSQL
        $conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
        // Define o modo de erro para exceções
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch (PDOException $e) {
        // Exibe mensagem de erro e encerra o script em caso de falha na conexão
        echo "Erro na ligação à base de dados: " . $e->getMessage();
        exit;
    }
}
?>