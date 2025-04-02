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

try {
    // Cria uma nova conexão PDO com o banco de dados PostgreSQL
    // O DSN (Data Source Name) especifica o tipo de banco, host, porta e nome do banco
    $conn = new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);

    // Configura o modo de erro para exceções
    // Isso permite capturar erros de conexão ou execução de consultas
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Mensagem opcional para confirmar a conexão (comentada para evitar saída desnecessária)
    // echo "Ligação à base de dados estabelecida com sucesso.";
} catch (PDOException $e) {
    // Captura erros de conexão e exibe uma mensagem amigável
    // Em produção, é recomendável registrar o erro em vez de exibi-lo diretamente
    echo "Erro na ligação à base de dados: " . $e->getMessage();
}
?>