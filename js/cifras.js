let cifras = []; 
let indiceAtual = 0;

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function carregarCifras() {
    const resposta = await fetch('data/cifras.json');
    cifras = await resposta.json();
    cifras.sort((a, b) => a.titulo.localeCompare(b.titulo));

    // Se houver id na URL, abre direto a cifra correspondente
    const idCifra = getQueryParam('id');
    if (idCifra) {
        const indice = cifras.findIndex(c => c.id == idCifra);
        if (indice !== -1) abrirCifra(indice);
        return;
    }

    exibirLista();

    // 🔍 Filtro em tempo real
    const filtroInput = document.getElementById('filtro-cifras');
    if (filtroInput) {
        filtroInput.addEventListener('input', e => exibirLista(e.target.value));
    }
}

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

function abrirCifra(indice) {
    indiceAtual = indice;
    const cifra = cifras[indice];

    const detalheDiv = document.getElementById('detalhe-cifra');
    detalheDiv.style.display = 'block';

    const container = document.getElementById('acorde-letra-container');
    container.innerHTML = '';
    container.style.display = 'block';
    container.style.minHeight = '200px';

    document.getElementById('titulo-cifra').textContent = cifra.titulo;
    document.getElementById('banda-cifra').textContent = cifra.banda;
    document.getElementById('link-cifra').href = cifra.linkCifra;

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
}

document.getElementById('btn-proxima').onclick = () => {
    indiceAtual = (indiceAtual + 1) % cifras.length;
    abrirCifra(indiceAtual);
};

document.getElementById('btn-anterior').onclick = () => {
    indiceAtual = (indiceAtual - 1 + cifras.length) % cifras.length;
    abrirCifra(indiceAtual);
};

function voltarLista() {
    const filtroAtual = document.getElementById('filtro-cifras')?.value || '';
    exibirLista(filtroAtual);
}

document.addEventListener('DOMContentLoaded', () => {
    carregarCifras();
});
