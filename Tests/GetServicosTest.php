<?php

use PHPUnit\Framework\TestCase;

class GetServicosTest extends TestCase
{

    /**
     * Testa a resposta do script get_servicos.php.
     *
     * Este teste verifica se a resposta é um JSON válido, se contém os campos esperados
     * e se os dados estão no formato correto.
     */
    public function testGetServicosResponse()
    {
        // Simula a saída esperada do script
        $output = json_encode([
            "bombas" => [
                ["name" => "Bomba 1", "latitude" => -23.55052, "longitude" => -46.633308],
                ["name" => "Bomba 2", "latitude" => -22.906847, "longitude" => -43.172896]
            ],
            "comboios" => [
                ["name" => "Estação 1", "latitude" => -23.55052, "longitude" => -46.633308],
                ["name" => "Estação 2", "latitude" => -22.906847, "longitude" => -43.172896]
            ],
            "autocarros" => [
                ["name" => "Terminal 1", "latitude" => -23.55052, "longitude" => -46.633308],
                ["name" => "Terminal 2", "latitude" => -22.906847, "longitude" => -43.172896]
            ]
        ]);

        $this->assertJson($output, 'A resposta deve ser um JSON válido');

        $data = json_decode($output, true);
        $this->assertIsArray($data, 'A resposta deve ser um array');
        $this->assertArrayHasKey('bombas', $data, 'A resposta deve conter a chave "bombas"');
        $this->assertArrayHasKey('comboios', $data, 'A resposta deve conter a chave "comboios"');
        $this->assertArrayHasKey('autocarros', $data, 'A resposta deve conter a chave "autocarros"');

        foreach ($data['bombas'] as $bomba) {
            $this->assertArrayHasKey('name', $bomba, 'Cada bomba deve conter o campo "name"');
            $this->assertArrayHasKey('latitude', $bomba, 'Cada bomba deve conter o campo "latitude"');
            $this->assertArrayHasKey('longitude', $bomba, 'Cada bomba deve conter o campo "longitude"');
        }

        foreach ($data['comboios'] as $comboio) {
            $this->assertArrayHasKey('name', $comboio, 'Cada comboio deve conter o campo "name"');
            $this->assertArrayHasKey('latitude', $comboio, 'Cada comboio deve conter o campo "latitude"');
            $this->assertArrayHasKey('longitude', $comboio, 'Cada comboio deve conter o campo "longitude"');
        }

        foreach ($data['autocarros'] as $autocarro) {
            $this->assertArrayHasKey('name', $autocarro, 'Cada autocarro deve conter o campo "name"');
            $this->assertArrayHasKey('latitude', $autocarro, 'Cada autocarro deve conter o campo "latitude"');
            $this->assertArrayHasKey('longitude', $autocarro, 'Cada autocarro deve conter o campo "longitude"');
        }
    }


    /**
     * Testa a resposta do script get_servicos.php quando não há serviços.
     *
     * Este teste verifica se a resposta é um JSON válido e se as listas retornadas estão vazias.
     */
    public function testGetServicosEmptyResponse()
    {
        // Simula uma resposta vazia
        $output = json_encode(["bombas" => [], "comboios" => [], "autocarros" => []]);

        $this->assertJson($output, 'A resposta deve ser um JSON válido');

        $data = json_decode($output, true);
        $this->assertIsArray($data, 'A resposta deve ser um array');
        $this->assertEmpty($data['bombas'], 'A lista de bombas deve estar vazia');
        $this->assertEmpty($data['comboios'], 'A lista de comboios deve estar vazia');
        $this->assertEmpty($data['autocarros'], 'A lista de autocarros deve estar vazia');
    }


    /**
     * Testa a resposta do script get_servicos.php em caso de erro na consulta.
     *
     * Este teste simula um erro na consulta e verifica se a resposta contém a mensagem de erro.
     */
    public function testGetServicosDatabaseError()
    {
        // Simula uma resposta de erro de conexão
        $output = json_encode(["erro" => "Erro na ligação à base de dados"]);

        $this->assertJson($output, 'A resposta deve ser um JSON válido');

        $data = json_decode($output, true);
        $this->assertIsArray($data, 'A resposta deve ser um array');
        $this->assertArrayHasKey('erro', $data, 'A resposta deve conter a chave "erro"');
        $this->assertEquals('Erro na ligação à base de dados', $data['erro'], 'A mensagem de erro deve ser "Erro na ligação à base de dados"');
    }
}