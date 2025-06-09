<?php

use PHPUnit\Framework\TestCase;

class ConexaoTest extends TestCase
{
    /**
     * Testa a conexão com a base de dados PostgreSQL/PostGIS.
     *
     * Este teste verifica se a função getConnection() retorna uma instância válida de PDO.
     * Também verifica se a conexão falha corretamente com credenciais inválidas.
     */
    public function testGetConnection()
    {
        require_once 'c:/xampp/htdocs/Projeto-Sig/conexao.php';

        $conn = getConnection();

        $this->assertInstanceOf(PDO::class, $conn, 'A conexão deve ser uma instância de PDO');
    }


    /**
     * Testa a conexão com a base de dados usando credenciais inválidas.
     *
     * Este teste verifica se uma exceção é lançada ao tentar conectar com credenciais inválidas.
     */
    public function testConnectionFailure()
    {
        $this->expectException(PDOException::class);

        // Substitui as credenciais por valores inválidos
        $host = 'invalid_host';
        $port = '5432';
        $dbname = 'invalid_db';
        $user = 'invalid_user';
        $password = 'invalid_password';

        new PDO("pgsql:host=$host;port=$port;dbname=$dbname", $user, $password);
    }


    /**
     * Testa os atributos da conexão com a base de dados.
     *
     * Este teste verifica se o modo de erro da conexão está configurado para PDO::ERRMODE_EXCEPTION.
     */
    public function testConnectionAttributes()
    {
        require_once 'c:/xampp/htdocs/Projeto-Sig/conexao.php';

        $conn = getConnection();

        $this->assertEquals(PDO::ERRMODE_EXCEPTION, $conn->getAttribute(PDO::ATTR_ERRMODE), 'O modo de erro deve ser PDO::ERRMODE_EXCEPTION');
    }


    /**
     * Testa a criação de múltiplas conexões.
     *
     * Este teste verifica se cada chamada à função getConnection() retorna uma nova instância de conexão.
     */
    public function testMultipleConnections()
    {
        require_once 'c:/xampp/htdocs/Projeto-Sig/conexao.php';

        $conn1 = getConnection();
        $conn2 = getConnection();

        $this->assertNotSame($conn1, $conn2, 'Cada chamada deve retornar uma nova instância de conexão');
    }


    /**
     * Testa uma consulta simples na base de dados.
     *
     * Este teste executa uma consulta SQL simples e verifica se o resultado é o esperado.
     */
    public function testSimpleQuery()
    {
        require_once 'c:/xampp/htdocs/Projeto-Sig/conexao.php';

        $conn = getConnection();

        $stmt = $conn->query('SELECT 1');
        $result = $stmt->fetchColumn();

        $this->assertEquals(1, $result, 'A consulta deve retornar 1');
    }


}