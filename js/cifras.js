let cifras = [];
let indiceAtual = 0;
let contextoAtual = null; // "cifras" ou "ensaio"

// Carrega o JSON de cifras
async function carregarCifras() {
    const resposta = await fetch('data/cifras.json');
    cifras = await resposta.json();
    cifras.sort((a, b) => a.titulo.localeCompare(b.titulo));
}

// Exibe a lista de cifras na página de cifras
function exibirLista(filtro = '') {
    const listaDiv = document.getElementById('lista-cifras');
    if (!listaDiv) return;

    listaDiv.style.display = 'block';
    const detalheDiv = document.getElementById('detalhe-cifra');
    if (detalheDiv) detalheDiv.style.display = 'none';

    let listaContainer = document.getElementById('cifras-lista-container');
    if (!listaContainer) {
        listaContainer = document.createElement('div');
        listaContainer.id = 'cifras-lista-container';
        listaDiv.appendChild(listaContainer);
    }

    const filtroLower = filtro.toLowerCase();
    const cifrasFiltradas = cifras.filter(c =>
        c.titulo.toLowerCase().includes(filtroLower) ||
        (c.banda && c.banda.toLowerCase().includes(filtroLower))
    );

    listaContainer.innerHTML = '';

    cifrasFiltradas.forEach((cifra, i) => {
        const div = document.createElement('div');
        div.className = 'list-item';

        const acordesUnicos = Array.from(new Set(
            cifra.versos
                .map(v => v.acordes)
                .filter(a => a && a.trim() !== "")
                .join(' ')
                .split(/\s+/)
        ));

        div.innerHTML = `<strong>${cifra.titulo}</strong> - <em>${cifra.banda}</em> <span class="acordes-resumo">${acordesUnicos.join(' ')}</span>`;
        div.addEventListener('click', () => abrirCifra(i, "cifras"));
        listaContainer.appendChild(div);
    });

    if (cifrasFiltradas.length === 0) {
        const msg = document.createElement('p');
        msg.textContent = 'Nenhuma música encontrada.';
        msg.style.textAlign = 'center';
        listaContainer.appendChild(msg);
    }
}

// Abre cifra detalhada
function abrirCifra(indice, contexto = "cifras") {
    indiceAtual = indice;
    contextoAtual = contexto;
    const cifra = cifras[indice];

    const detalheDiv = document.getElementById('detalhe-cifra');
    const container = document.getElementById('acorde-letra-container');
    if (!detalheDiv || !container) return;

    detalheDiv.style.display = 'block';
    container.innerHTML = '';
    container.style.display = 'block';
    container.style.minHeight = '200px';

    document.getElementById('titulo-cifra').textContent = cifra.titulo;
    document.getElementById('banda-cifra').textContent = cifra.banda;
    const linkCifra = document.getElementById('link-cifra');
    if (linkCifra) linkCifra.href = cifra.linkYoutube || '#';

    // Renderiza versos
    cifra.versos.forEach(verso => {
        const versoDiv = document.createElement('div');
        versoDiv.className = 'verso';

        if (verso.acordes && verso.acordes.trim() !== '') {
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

    if (contexto === "cifras") {
        document.getElementById('lista-cifras').style.display = 'none';
    }

    iniciarScrollAutomatico();
    lucide.createIcons();
}

// Botões de navegação
function proximaCifra() {
    indiceAtual = (indiceAtual + 1) % cifras.length;
    abrirCifra(indiceAtual, contextoAtual);
}
function anteriorCifra() {
    indiceAtual = (indiceAtual - 1 + cifras.length) % cifras.length;
    abrirCifra(indiceAtual, contextoAtual);
}

// Voltar para lista
function voltarLista() {
    if (contextoAtual === "cifras") {
        const filtroAtual = document.getElementById('filtro-cifras')?.value || '';
        exibirLista(filtroAtual);
    } else if (contextoAtual === "ensaio" && window.mostrarDetalheEnsaio) {
        // Para ensaios, chamamos função externa
        window.mostrarDetalheEnsaio();
    }
}

// -----------------------
// Scroll automático
// -----------------------
let scrollRunning = false;
let rafId = null;
let lastTs = null;
let acumulado = 0;

function iniciarScrollAutomatico() {
    const botao = document.getElementById('rolarBtn');
    const slider = document.getElementById('velocidadeScroll');
    if (!botao || !slider) return;

    let pxPorSegundo = parseInt(slider.value, 10);

    const scroller = () => (document.scrollingElement || document.documentElement || document.body);
    const estaNoFim = () => (window.innerHeight + (scroller().scrollTop || window.scrollY) >= scroller().scrollHeight - 1);

    function step(ts) {
        if (!scrollRunning) return;
        if (!lastTs) lastTs = ts;
        const delta = ts - lastTs;
        lastTs = ts;

        acumulado += (pxPorSegundo * delta) / 1000;
        const px = Math.floor(acumulado);
        if (px >= 1) {
            scroller().scrollTop += px;
            acumulado -= px;
        }

        if (estaNoFim()) {
            pararScroll();
            return;
        }
        rafId = requestAnimationFrame(step);
    }

    function iniciar() {
        if (scrollRunning) return;
        scrollRunning = true;
        lastTs = null;
        rafId = requestAnimationFrame(step);
        botao.textContent = 'Parar Scroll';
    }

    function pararScroll() {
        if (!scrollRunning) return;
        scrollRunning = false;
        lastTs = null;
        acumulado = 0;
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = null;
        botao.textContent = 'Scroll automático';
    }

    botao.onclick = () => { scrollRunning ? pararScroll() : iniciar(); };
    slider.oninput = e => { pxPorSegundo = parseInt(e.target.value, 10); };

    ['touchstart', 'touchmove', 'wheel', 'mousedown'].forEach(evt =>
        window.addEventListener(evt, () => { if (scrollRunning) pararScroll(); }, { passive: true })
    );
    document.addEventListener('visibilitychange', () => { if (document.hidden) pararScroll(); });
}

// Inicializa
document.addEventListener('DOMContentLoaded', async () => {
    await carregarCifras();
    if (document.getElementById('filtro-cifras')) {
        exibirLista();
    }
    document.getElementById('btn-proxima')?.addEventListener('click', proximaCifra);
    document.getElementById('btn-anterior')?.addEventListener('click', anteriorCifra);
});
