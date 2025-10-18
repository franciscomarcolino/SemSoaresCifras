// -----------------------
// CIFRAS.JS
// -----------------------

let cifras = [];
let indiceAtual = 0;

// Carrega cifras do JSON
async function carregarCifras() {
    if (cifras.length) return; // já carregadas
    const resp = await fetch('data/cifras.json');
    cifras = await resp.json();
    cifras.sort((a, b) => a.titulo.localeCompare(b.titulo));
}

// Abrir cifra a partir da página de ensaio
function abrirCifraDoEnsaio(musica, ensaio) {
    abrirCifraInterna(cifras.find(c => c.id === musica.idCifra || c.titulo === musica.nome));
}

// Abrir cifra detalhada (genérico)
function abrirCifra(cifraOuIndice) {
    let cifra;
    if (typeof cifraOuIndice === 'number') {
        indiceAtual = cifraOuIndice;
        cifra = cifras[indiceAtual];
    } else cifra = cifraOuIndice;

    abrirCifraInterna(cifra);
}

// Função interna de abrir cifra e renderizar
function abrirCifraInterna(cifra) {
    if (!cifra) return alert("Cifra não encontrada.");

    const detalheDiv = document.getElementById('detalhe-cifra');
    const container = document.getElementById('acorde-letra-container');
    detalheDiv.style.display = 'block';
    container.innerHTML = '';
    container.style.display = 'block';
    container.style.minHeight = '200px';

    document.getElementById('titulo-cifra').textContent = cifra.titulo;
    document.getElementById('banda-cifra').textContent = cifra.banda;
    document.getElementById('link-cifra').href = cifra.linkYoutube || '#';

    if (cifra.versos && cifra.versos.length) {
        cifra.versos.forEach(verso => {
            const versoDiv = document.createElement('div');
            versoDiv.className = 'verso';

            if (verso.acordes?.trim()) {
                const acordesDiv = document.createElement('div');
                acordesDiv.className = 'linha-acordes';
                acordesDiv.textContent = verso.acordes;
                versoDiv.appendChild(acordesDiv);
            }

            const letraDiv = document.createElement('div');
            letraDiv.className = 'linha-letra';
            letraDiv.textContent = verso.letra;
            versoDiv.appendChild(letraDiv);

            container.appendChild(versoDiv);
        });
    }

    // Scroll automático
    iniciarScrollDetalhe();

    if (document.getElementById('btn-voltar-ensaio')) {
        document.getElementById('btn-voltar-ensaio').onclick = () => {
            detalheDiv.style.display = 'none';
            document.getElementById('lista-ensaios').style.display = 'block';
        };
    }
}

// -----------------------
// Scroll automático
// -----------------------
function iniciarScrollDetalhe() {
    const botao = document.getElementById('rolarBtn');
    const slider = document.getElementById('velocidadeScroll');
    if (!botao || !slider) return;

    let running = false;
    let rafId = null;
    let lastTs = null;
    let acumulado = 0;
    let pxPorSegundo = parseInt(slider.value, 10);

    const scroller = () => document.getElementById('acorde-letra-container');
    const step = ts => {
        if (!running) return;
        if (!lastTs) lastTs = ts;
        const delta = ts - lastTs;
        lastTs = ts;

        acumulado += (pxPorSegundo * delta) / 1000;
        const px = Math.floor(acumulado);
        if (px >= 1) {
            scroller().scrollTop += px;
            acumulado -= px;
        }
        rafId = requestAnimationFrame(step);
    };

    const iniciar = () => {
        if (running) return;
        running = true;
        lastTs = null;
        rafId = requestAnimationFrame(step);
        botao.textContent = 'Parar Scroll';
    };

    const parar = () => {
        running = false;
        lastTs = null;
        acumulado = 0;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        botao.textContent = 'Ativar Scroll';
    };

    botao.onclick = () => (running ? parar() : iniciar);
    slider.oninput = e => pxPorSegundo = parseInt(e.target.value, 10);

    ['touchstart','touchmove','wheel','mousedown'].forEach(evt =>
        window.addEventListener(evt, () => running && parar(), {passive:true})
    );

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) running && parar();
    });
}

// -----------------------
// Inicialização
// -----------------------
document.addEventListener('DOMContentLoaded', carregarCifras);
