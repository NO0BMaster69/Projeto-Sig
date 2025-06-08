/**
 * js/intro.js
 *
 * Este ficheiro gere a introdução interativa (tour) da aplicação usando a biblioteca introJs,
 * bem como a exibição do menu de seleção de raio e o comportamento do dropdown do mapa.
 *
 * Funcionalidades:
 * - Mostra/oculta o menu de raio arqueológico ao iniciar/terminar o tour.
 * - Garante que o dropdown do mapa reflete corretamente o seu estado visual.
 * - Permite avançar o tour ao clicar fora da tooltip.
 * - Remove o botão "Próximo" do introJs para forçar navegação personalizada.
 *
 * @author Grupo 3 PTAS 2025
 * @version 1.0
 */

document.addEventListener('DOMContentLoaded', function () {
    // Obtém referências aos elementos do DOM relevantes
    const menuRaio = document.getElementById('menuRaioArqueo');
    const dropdownButton = document.querySelector('.map-dropdown');

    // Adiciona/remover classe 'show' ao dropdown conforme o seu estado (Bootstrap)
    dropdownButton.addEventListener('shown.bs.dropdown', () => {
        dropdownButton.classList.add('show');
    });

    dropdownButton.addEventListener('hidden.bs.dropdown', () => {
        dropdownButton.classList.remove('show');
    });

    // Inicia o tour manual ao clicar no botão 'Manual'
    document.getElementById('btnManual').addEventListener('click', function () {
        // Mostra o menu de raio arqueológico
        menuRaio.classList.remove('d-none');

        // Inicializa o introJs
        const intro = introJs();

        // Define opções do introJs
        intro.setOptions({
            showButtons: true,
            showBullets: false,
            showStepNumbers: false,
            exitOnOverlayClick: false,
            nextLabel: '',
            prevLabel: 'Voltar',
            showSkipButton: false,
            skipLabel: ''
        });

        /**
         * Avança o passo do introJs ao clicar fora da tooltip.
         * @param {MouseEvent} e - Evento de clique
         */
        function avancarAoClicarFora(e) {
            const isTooltip = e.target.closest('.introjs-tooltip');
            if (!isTooltip) {
                intro.nextStep();
            }
        }

        // Adiciona o evento para avançar ao clicar fora da tooltip
        document.addEventListener('click', avancarAoClicarFora);

        // Ao sair do tour, esconde o menu e remove o evento
        intro.onexit(function () {
            menuRaio.classList.add('d-none');
            document.removeEventListener('click', avancarAoClicarFora);
        });

        // Ao completar o tour, esconde o menu e remove o evento
        intro.oncomplete(function () {
            menuRaio.classList.add('d-none');
            document.removeEventListener('click', avancarAoClicarFora);
        });

        // Após cada passo, remove o botão "Próximo" do introJs
        intro.onafterchange(function () {
            const nextBtn = document.querySelector('.introjs-nextbutton');
            if (nextBtn) nextBtn.remove();
        });

        // Inicia o tour
        intro.start();
    });
});