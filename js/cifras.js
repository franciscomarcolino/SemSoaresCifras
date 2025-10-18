let cifras = [];
let indiceAtual = 0;
let ensaioAtual = null; // Para voltar ao detalhe do ensaio

// Carrega o JSON de cifras
async function carregarCifras() {
    const resposta = await fetch('data/cifras.json');
    cifras = await resposta.json();
    cifras.sort((a, b) => a.titulo.localeCompare(b.titulo));
}

// Exibe a lista de cifras na página principal
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

// Abre uma cifra detalhada na página de cifras
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
    document.getElementById('link-cifra').href = cifra.linkCifra || '#';

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

    // Se veio de um ensaio, botão de voltar para detalhe do ensaio
    if (ensaioAtual) {
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
    }

    document.getElementById('lista-cifras').style.display = 'none';
    lucide.createIcons();
}

// Abre cifra a partir do detalhe do ensaio
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
    document.getElementById('link-cifra').href = cifra.linkCifra || '#';

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

// Navegação Próxima/Anterior
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

// Inicialização completa
document.addEventListener('DOMContentLoaded', async () => {
    await carregarCifras();
    exibirLista(); // garante que a lista apareça na página de cifras
});
