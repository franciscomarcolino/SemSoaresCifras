let cifras = [];
let cifraAtualIndex = null;
let scrollRunning = false;
let scrollRAF = null;
let lastTs = null;
let acumulado = 0;
let pxPorSegundo = 30;

// Carrega o JSON de cifras
async function carregarCifras() {
    const resp = await fetch('data/cifras.json');
    cifras = await resp.json();
    mostrarListaCifras();
}

// Exibe lista de cifras
function mostrarListaCifras() {
    const container = document.getElementById('lista-cifras');
    container.innerHTML = `
        <div id="filtro-container">
            <i class="fa fa-search"></i>
            <input type="text" id="filtro-cifras" placeholder="Buscar música ou banda...">
        </div>
        <ul id="cifras-ul">
            ${cifras.map((c, idx) => `<li><a href="#" onclick="abrirCifra(${idx})">${c.titulo}</a></li>`).join('')}
        </ul>
    `;

    const filtro = document.getElementById('filtro-cifras');
    filtro.addEventListener('input', () => {
        const termo = filtro.value.toLowerCase();
        document.querySelectorAll('#cifras-ul li').forEach((li, idx) => {
            li.style.display = cifras[idx].titulo.toLowerCase().includes(termo) ? '' : 'none';
        });
    });
}

// Abre a cifra pelo índice
function abrirCifra(index) {
    cifraAtualIndex = index;
    const c = cifras[index];
    document.getElementById('titulo-cifra').textContent = c.titulo;
    document.getElementById('banda-cifra').textContent = c.banda;
    document.getElementById('link-cifra').href = c.linkYoutube;
    
    const container = document.getElementById('acorde-letra-container');
    container.innerHTML = '';
    c.versos.forEach(v => {
        const verso = document.createElement('div');
        verso.className = 'verso';
        verso.innerHTML = `<div class="linha-acordes">${v.acordes}</div><div class="linha-letra">${v.letra}</div>`;
        container.appendChild(verso);
    });

    document.getElementById('lista-cifras').style.display = 'none';
    document.getElementById('detalhe-cifra').style.display = 'block';

    atualizarBotoes();
    pararScroll(); // garante scroll parado ao abrir cifra
}

// Botões anterior e próxima
function atualizarBotoes() {
    document.getElementById('btn-anterior').onclick = () => {
        if (cifraAtualIndex > 0) abrirCifra(cifraAtualIndex - 1);
    };
    document.getElementById('btn-proxima').onclick = () => {
        if (cifraAtualIndex < cifras.length - 1) abrirCifra(cifraAtualIndex + 1);
    };
}

// Função de scroll automático
function stepScroll(ts) {
    if (!scrollRunning) return;
    if (!lastTs) lastTs = ts;
    const delta = ts - lastTs;
    lastTs = ts;

    acumulado += (pxPorSegundo * delta) / 1000;
    const px = Math.floor(acumulado);
    if (px >= 1) {
        document.getElementById('acorde-letra-container').scrollTop += px;
        acumulado -= px;
    }
    scrollRAF = requestAnimationFrame(stepScroll);
}

function iniciarScroll() {
    if (scrollRunning) return;
    scrollRunning = true;
    lastTs = null;
    scrollRAF = requestAnimationFrame(stepScroll);
    document.getElementById('rolarBtn').textContent = 'Parar Scroll';
}

function pararScroll() {
    scrollRunning = false;
    lastTs = null;
    acumulado = 0;
    if (scrollRAF) cancelAnimationFrame(scrollRAF);
    scrollRAF = null;
    document.getElementById('rolarBtn').textContent = 'Scroll automático';
}

// Eventos do slider e botão
document.addEventListener('DOMContentLoaded', () => {
    carregarCifras();

    const btnScroll = document.getElementById('rolarBtn');
    const slider = document.getElementById('velocidadeScroll');

    btnScroll.addEventListener('click', () => {
        if (scrollRunning) pararScroll(); else iniciarScroll();
    });

    slider.addEventListener('input', e => {
        pxPorSegundo = parseInt(e.target.value, 10);
    });

    // Interrompe scroll em qualquer ação do usuário
    ['touchstart', 'touchmove', 'wheel', 'mousedown', 'keydown'].forEach(evt =>
        window.addEventListener(evt, () => {
            if (scrollRunning) pararScroll();
        }, { passive: true })
    );
});
