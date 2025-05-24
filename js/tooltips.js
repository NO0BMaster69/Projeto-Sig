const tutorialSteps = [
    {
        el: document.querySelector('.btn-group > .btn-primary'), // Botão Mapas
        msg: 'Use este botão para <strong>trocar o tipo de mapa</strong>.<br>Escolha entre OSM, Topo ou Satélite.',
        arrow: 'top'
    },
    {
        el: document.getElementById('controlPanel'),
        msg: 'Aqui você pode <strong>ligar ou desligar camadas temáticas</strong> como Locais Arqueológicos, Cafés e Restaurantes.',
        arrow: 'left' // seta vermelha para esquerda, balão à direita dela

    },
    {
        el: document.getElementById('btnManual'),
        msg: 'Aqui você encontra o <strong>manual do utilizador</strong>!<br>Clique neste botão para ajuda.',
        arrow: 'top'
    },
    {
        el: document.getElementById('searchBar'),
        msg: 'Utilize esta <strong>barra de pesquisa</strong> para procurar endereços.',
        arrow: 'bottom'
    },
    {
        el: document.querySelector('.btn-success'),
        msg: 'Clique aqui para <strong>criar uma rota</strong> no mapa!',
        arrow: 'top'
    }
];


let currentStep = 0;

document.addEventListener("DOMContentLoaded", function () {
    showTutorialStep(0);

    document.querySelector('#tutorial-step-overlay .tutorial-screen').onclick = function () {
        currentStep++;
        if (currentStep < tutorialSteps.length) {
            showTutorialStep(currentStep);
        } else {
            document.getElementById('tutorial-step-overlay').style.display = 'none';
        }
    };
});

function showTutorialStep(idx) {
    if (!tutorialSteps[idx] || !tutorialSteps[idx].el) return;
    document.getElementById('tutorial-step-overlay').style.display = 'block';

    let step = document.getElementById('tutorial-step-container');
    let bubble = step.querySelector('.tutorial-bubble');
    let arrow = step.querySelector('.tutorial-arrow');

    // Insere texto
    bubble.innerHTML = tutorialSteps[idx].msg;

    // Torna visível para cálculo correto
    step.style.visibility = 'hidden';
    step.style.display = 'block';
    setTimeout(function () {
        positionStep(step, arrow, tutorialSteps[idx].el, tutorialSteps[idx].arrow);
        step.style.visibility = 'visible';
    }, 50);
}

function positionStep(step, arrow, el, arrowDirection) {
    var rect = el.getBoundingClientRect();
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    // Medidas do balão
    var stepWidth = step.offsetWidth;
    var stepHeight = step.offsetHeight;

    let stepTop = 0, stepLeft = 0;

    switch (arrowDirection) {
        case 'left':
            stepTop = rect.top + scrollTop + rect.height / 2 - stepHeight / 2;
            stepLeft = rect.right + scrollLeft + 18;
            arrow.className = 'tutorial-arrow arrow-left';
            break;

        case 'bottom':
            stepTop = rect.bottom + scrollTop + 18;
            stepLeft = rect.left + scrollLeft + rect.width / 2 - stepWidth / 2;
            arrow.className = 'tutorial-arrow arrow-top';
            break;
        case 'right':
            stepTop = rect.top + scrollTop + rect.height / 2 - stepHeight / 2;
            stepLeft = rect.left + scrollLeft - stepWidth - 18;
            arrow.className = 'tutorial-arrow arrow-right';
            break;
        case 'top':
        default:
            stepTop = rect.top + scrollTop - stepHeight - 26;
            stepLeft = rect.left + scrollLeft + rect.width / 2 - stepWidth / 2;
            arrow.className = 'tutorial-arrow arrow-bottom';
    }

    // Ajuste para não sair da tela
    if (stepLeft < 8) stepLeft = 8;
    if ((stepLeft + stepWidth + 8) > window.innerWidth) stepLeft = window.innerWidth - stepWidth - 8;
    if (stepTop < 8) stepTop = 8;
    if ((stepTop + stepHeight + 8) > window.innerHeight + scrollTop) stepTop = window.innerHeight + scrollTop - stepHeight - 8;

    step.style.top = stepTop + "px";
    step.style.left = stepLeft + "px";
    step.style.visibility = 'visible';
}
