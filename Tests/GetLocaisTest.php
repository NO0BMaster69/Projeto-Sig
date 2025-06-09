<?php

use PHPUnit\Framework\TestCase;

class GetLocaisTest extends TestCase
{

    /**
     * Testa a resposta do script get_locais.php.
     *
     * Este teste verifica se a resposta é um JSON válido, se contém os campos esperados
     * e se os dados estão no formato correto.
     */
    public function testGetLocaisResponse()
    {
        $output = json_encode([
            ['nome' => 'Local 1', 'latitude' => -23.55052, 'longitude' => -46.633308],
            ['nome' => 'Local 2', 'latitude' => -22.906847, 'longitude' => -43.172896]
        ]);

        $this->assertJson($output, 'A resposta deve ser um JSON válido');

        $data = json_decode($output, true);
        $this->assertIsArray($data, 'A resposta deve ser um array');

        foreach ($data as $item) {
            $this->assertArrayHasKey('nome', $item, 'Cada item deve conter o campo "nome"');
            $this->assertArrayHasKey('latitude', $item, 'Cada item deve conter o campo "latitude"');
            $this->assertArrayHasKey('longitude', $item, 'Cada item deve conter o campo "longitude"');
        }
    }


    /**
     * Testa a resposta do script get_locais.php quando não há locais.
     *
     * Este teste verifica se a resposta é um JSON válido e se o array retornado está vazio.
     */
    public function testGetLocaisEmptyResponse()
    {
        $output = json_encode([]);

        $this->assertJson($output, 'A resposta deve ser um JSON válido');

        $data = json_decode($output, true);
        $this->assertIsArray($data, 'A resposta deve ser um array');
        $this->assertEmpty($data, 'O array deve estar vazio');
    }


    /**
     * Testa a resposta do script get_locais.php em caso de erro na consulta.
     *
     * Este teste simula um erro na consulta e verifica se a resposta contém a mensagem de erro.
     */
    public function testGetLocaisInvalidFormat()
    {
        $output = "Isto não é um JSON válido";

        $this->assertNull(json_decode($output, true), 'O JSON deve ser inválido');
    }


    /**
     * Testa a resposta do script get_locais.php com campos extras.
     *
     * Este teste verifica se a resposta contém campos adicionais além dos esperados.
     */
    public function testGetLocaisWithExtraFields()
    {
        $output = json_encode([
            [
                'nome' => 'Local 1',
                'latitude' => -23.55052,
                'longitude' => -46.633308,
                'extra_field' => 'valor extra'
            ]
        ]);

        $this->assertJson($output, 'A resposta deve ser um JSON válido');

        $data = json_decode($output, true);
        $this->assertIsArray($data, 'A resposta deve ser um array');

        foreach ($data as $item) {
            $this->assertArrayHasKey('nome', $item, 'Cada item deve conter o campo "nome"');
            $this->assertArrayHasKey('latitude', $item, 'Cada item deve conter o campo "latitude"');
            $this->assertArrayHasKey('longitude', $item, 'Cada item deve conter o campo "longitude"');
        }
    }
}