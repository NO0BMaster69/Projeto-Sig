document.addEventListener('DOMContentLoaded', function () {
    const menuRaio = document.getElementById('menuRaioArqueo');
    const dropdownButton = document.querySelector('.map-dropdown');

    dropdownButton.addEventListener('shown.bs.dropdown', () => {
        dropdownButton.classList.add('show');
    });

    dropdownButton.addEventListener('hidden.bs.dropdown', () => {
        dropdownButton.classList.remove('show');
    });

    document.getElementById('btnManual').addEventListener('click', function () {
        menuRaio.classList.remove('d-none');

        const intro = introJs();

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

        function avancarAoClicarFora(e) {
            const isTooltip = e.target.closest('.introjs-tooltip');
            if (!isTooltip) {
                intro.nextStep();
            }
        }

        document.addEventListener('click', avancarAoClicarFora);

        intro.onexit(function () {
            menuRaio.classList.add('d-none');
            document.removeEventListener('click', avancarAoClicarFora);
        });

        intro.oncomplete(function () {
            menuRaio.classList.add('d-none');
            document.removeEventListener('click', avancarAoClicarFora);
        });

        intro.onafterchange(function () {
            const nextBtn = document.querySelector('.introjs-nextbutton');
            if (nextBtn) nextBtn.remove();
        });

        intro.start();
    });
});