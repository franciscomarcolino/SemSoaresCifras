let cifras = []; 
let indiceAtual = 0;
let ensaioAtual = null; // Guarda o ensaio atual para voltar

// Carrega o JSON de cifras
async function carregarCifras() {
    const resposta = await fetch('data/cifras.json');
    cifras = await resposta.json();
    cifras.sort((a, b) => a.titulo.localeCompare(b.titulo));

    // Exibe lista na página de cifras
    exibirLista();
}

// Exibe a lista de cifras filtrada
function exibirLista(filtro = '') {
    const listaDiv = document.getElementById('lista-cifras');
    const detalheDiv = document.getElementById('detalhe-cifra');
    listaDiv.style.display = 'block';
    detalheDiv.style.display = 'none';

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
        div.onclick = () => abrirCifra(i);
        listaContainer.appendChild(div);
    });

    if (cifrasFiltradas.length === 0) {
        const msg = document.createElement('p');
        msg.textContent = 'Nenhuma música encontrada.';
        msg.style.textAlign = 'center';
        listaContainer.appendChild(msg);
    }
}

// Abre cifra detalhada na página de cifras
function abrirCifra(indice) {
    indiceAtual = indice;
    const cifra = cifras[indice];

    const detalheDiv = document.getElementById('detalhe-cifra');
    const container = document.getElementById('acorde-letra-container');
    detalheDiv.style.display = 'block';
    container.innerHTML = '';
    container.style.display = 'block';
    container.style.minHeight = '200px';

    document.getElementById('titulo-cifra').textContent = cifra.titulo;
    document.getElementById('banda-cifra').textContent = cifra.banda;
    document.getElementById('link-cifra').href = cifra.linkYoutube || '#';

    // Renderiza versos
    if (cifra.versos && cifra.versos.length > 0) {
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
    }

    document.getElementById('lista-cifras').style.display = 'none';

    // Renderiza ícones Lucide
    lucide.createIcons();
}

// Abre cifra diretamente do detalhe do ensaio
function abrirCifraDoEnsaio(musica, ensaio) {
    ensaioAtual = ensaio;

    const cifra = cifras.find(c => c.id === musica.idCifra || c.titulo === musica.nome);
    if (!cifra) {
        alert("Cifra não encontrada.");
        return;
    }

    const detalheDiv = document.getElementById('detalhe-cifra');
    const container = document.getElementById('acorde-letra-container');
    detalheDiv.style.display = 'block';
    container.innerHTML = '';
    container.style.display = 'block';
    container.style.minHeight = '200px';

    document.getElementById('titulo-cifra').textContent = cifra.titulo;
    document.getElementById('banda-cifra').textContent = cifra.banda;
    document.getElementById('link-cifra').href = cifra.linkYoutube || '#';

    if (cifra.versos && cifra.versos.length > 0) {
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
    }

    // Botão de voltar para detalhe do ensaio
    const btnVoltar = document.createElement('button');
    btnVoltar.id = 'btn-voltar-ensaio';
    btnVoltar.innerHTML = `<i data-lucide="chevron-left"></i> Voltar`;
    btnVoltar.addEventListener('click', () => {
        detalheDiv.style.display = 'none';
        container.innerHTML = '';
        mostrarDetalhe(ensaioAtual, [ensaioAtual], document.getElementById('lista-ensaios'));
        lucide.createIcons();
    });
    container.appendChild(btnVoltar);

    lucide.createIcons();
}

// Botões de navegação
document.getElementById('btn-proxima').onclick = () => {
    indiceAtual = (indiceAtual + 1) % cifras.length;
    abrirCifra(indiceAtual);
};
document.getElementById('btn-anterior').onclick = () => {
    indiceAtual = (indiceAtual - 1 + cifras.length) % cifras.length;
    abrirCifra(indiceAtual);
};

// Voltar para lista
function voltarLista() {
    const filtroAtual = document.getElementById('filtro-cifras')?.value || '';
    exibirLista(filtroAtual);
}

// -----------------------
// Scroll automático
// -----------------------
document.addEventListener('DOMContentLoaded', () => {
    carregarCifras(); // garante que a lista seja carregada
    const botao = document.getElementById('rolarBtn');
    const slider = document.getElementById('velocidadeScroll');
    if (!botao || !slider) return;

    let running = false;
    let rafId = null;
    let lastTs = null;
    let pxPorSegundo = parseInt(slider.value, 10);
    let acumulado = 0;

    const scroller = () => (document.scrollingElement || document.documentElement || document.body);
    const estaNoFim = () => (window.innerHeight + (scroller().scrollTop || window.scrollY) >= scroller().scrollHeight - 1);

    function step(ts) {
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

        if (estaNoFim()) {
            parar();
            return;
        }
        rafId = requestAnimationFrame(step);
    }

    function iniciar() {
        if (running) return;
        running = true;
        lastTs = null;
        rafId = requestAnimationFrame(step);
        botao.textContent = 'Parar Scroll';
    }

    function parar() {
        if (!running) return;
        running = false;
        lastTs = null;
        acumulado = 0;
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = null;
        botao.textContent = 'Ativar Scroll';
    }

    botao.addEventListener('click', () => {
        if (running) parar(); else iniciar();
    });

    slider.addEventListener('input', e => {
        pxPorSegundo = parseInt(e.target.value, 10);
    });

    const pauseOnUser = (e) => {
        if (e.target.closest('#rolarBtn')) return;
        if (running) parar();
    };

    ['touchstart', 'touchmove', 'wheel', 'mousedown'].forEach(evt =>
        window.addEventListener(evt, pauseOnUser, { passive: true })
    );

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) parar();
    });
});
