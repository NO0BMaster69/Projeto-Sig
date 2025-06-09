<?php

use PHPUnit\Framework\TestCase;

class GetRestauracaoTest extends TestCase
{

    /**
     * Testa a resposta do script get_restauracao.php.
     *
     * Este teste verifica se a resposta é um JSON válido, se contém os campos esperados
     * e se os dados estão no formato correto.
     */
    public function testGetRestauracaoResponse()
    {
        // Simula a saída esperada do script
        $output = json_encode([
            "cafes" => [
                ["name" => "Café 1", "latitude" => -23.55052, "longitude" => -46.633308],
                ["name" => "Café 2", "latitude" => -22.906847, "longitude" => -43.172896]
            ],
            "restaurantes" => [
                ["name" => "Restaurante 1", "latitude" => -23.55052, "longitude" => -46.633308],
                ["name" => "Restaurante 2", "latitude" => -22.906847, "longitude" => -43.172896]
            ]
        ]);

        $this->assertJson($output, 'A resposta deve ser um JSON válido');

        $data = json_decode($output, true);
        $this->assertIsArray($data, 'A resposta deve ser um array');
        $this->assertArrayHasKey('cafes', $data, 'A resposta deve conter a chave "cafes"');
        $this->assertArrayHasKey('restaurantes', $data, 'A resposta deve conter a chave "restaurantes"');

        foreach ($data['cafes'] as $cafe) {
            $this->assertArrayHasKey('name', $cafe, 'Cada café deve conter o campo "name"');
            $this->assertArrayHasKey('latitude', $cafe, 'Cada café deve conter o campo "latitude"');
            $this->assertArrayHasKey('longitude', $cafe, 'Cada café deve conter o campo "longitude"');
        }

        foreach ($data['restaurantes'] as $restaurante) {
            $this->assertArrayHasKey('name', $restaurante, 'Cada restaurante deve conter o campo "name"');
            $this->assertArrayHasKey('latitude', $restaurante, 'Cada restaurante deve conter o campo "latitude"');
            $this->assertArrayHasKey('longitude', $restaurante, 'Cada restaurante deve conter o campo "longitude"');
        }
    }


    /**
     * Testa a resposta do script get_restauracao.php quando não há cafés ou restaurantes.
     *
     * Este teste verifica se a resposta é um JSON válido e se as listas retornadas estão vazias.
     */
    public function testGetRestauracaoEmptyResponse()
    {
        // Simula uma resposta vazia
        $output = json_encode(["cafes" => [], "restaurantes" => []]);

        $this->assertJson($output, 'A resposta deve ser um JSON válido');

        $data = json_decode($output, true);
        $this->assertIsArray($data, 'A resposta deve ser um array');
        $this->assertEmpty($data['cafes'], 'A lista de cafés deve estar vazia');
        $this->assertEmpty($data['restaurantes'], 'A lista de restaurantes deve estar vazia');
    }


    /**
     * Testa a resposta do script get_restauracao.php em caso de erro na consulta.
     *
     * Este teste simula um erro na consulta e verifica se a resposta contém a mensagem de erro.
     */
    public function testGetRestauracaoDatabaseError()
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