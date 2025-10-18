let cifras = []; // precisa carregar cifras primeiro

// Carrega JSON de cifras
async function carregarCifras() {
    const resp = await fetch('data/cifras.json');
    cifras = await resp.json();
}

// Carrega JSON de ensaios
async function carregarEnsaios() {
    await carregarCifras();
    const resp = await fetch('data/ensaios.json');
    const ensaios = await resp.json();

    const container = document.getElementById('lista-ensaios');
    ensaios.sort((a, b) => new Date(a.data) - new Date(b.data));
    mostrarLista(ensaios, container);
}

function mostrarLista(ensaios, container) {
    container.innerHTML = '';
    ensaios.forEach(ensaio => {
        const div = document.createElement('div');
        div.className = 'list-item';

        const cancelado = ensaio.status?.toLowerCase() === 'cancelado';
        const statusTexto = cancelado ? '❌ Cancelado' : '✅ Ativo';
        const statusClass = cancelado ? 'status-cancelado' : 'status-ativo';

        div.innerHTML = `
            <h2>🎵 Ensaio de ${ensaio.data}</h2>
            <span class="${statusClass}">${statusTexto}</span>
            <p><span class="evento-hora">⏰ ${ensaio.hora}</span> | <span class="evento-local">📍 ${ensaio.local}</span></p>
        `;
        div.addEventListener('click', () => mostrarDetalhe(ensaio, ensaios, container));
        container.appendChild(div);
    });
}

function mostrarDetalhe(ensaio, ensaios, container) {
    container.innerHTML = '';

    const detalheDiv = document.createElement('div');
    detalheDiv.className = 'list-item detalhe-ensaio';

    const cancelado = ensaio.status?.toLowerCase() === 'cancelado';
    const statusTexto = cancelado ? '❌ Cancelado' : '✅ Ativo';
    const statusClass = cancelado ? 'status-cancelado' : 'status-ativo';

    // Lista de músicas com onclick para abrir cifra na mesma tela
    const musicasHtml = ensaio.musicas.length
        ? `<ul id="musicas-ensaio-container">${ensaio.musicas.map(m => 
            `<li><a href="#" onclick="abrirCifraDoEnsaio(${m.idCifra})">${m.nome}</a></li>`
        ).join('')}</ul>`
        : `<p><em>Sem músicas cadastradas.</em></p>`;

    detalheDiv.innerHTML = `
        <h2>🎵 Ensaio de ${ensaio.data}</h2>
        <span class="${statusClass}">${statusTexto}</span>
        <p><span class="evento-hora">⏰ ${ensaio.hora}</span> | <span class="evento-local">📍 ${ensaio.local}</span></p>
        <h3>Setlist</h3>
        ${musicasHtml}
    `;

    // Botão voltar para lista de ensaios
    const btnVoltar = document.createElement('button');
    btnVoltar.textContent = '⬅ Voltar';
    btnVoltar.id = 'btn-voltar-ensaio';
    btnVoltar.style.display = 'none';
    detalheDiv.appendChild(btnVoltar);

    container.appendChild(detalheDiv);
}

// Função para abrir cifra na mesma tela do detalhe do ensaio
function abrirCifraDoEnsaio(idCifra) {
    const cifra = cifras.find(c => c.id === idCifra);
    if (!cifra) return;

    const detalheDiv = document.getElementById('lista-ensaios');
    detalheDiv.innerHTML = ''; // limpa a lista do ensaio
    const container = document.getElementById('acorde-letra-container');
    container.style.display = 'block';
    container.innerHTML = '';

    document.getElementById('titulo-cifra').textContent = cifra.titulo;
    document.getElementById('banda-cifra').textContent = cifra.banda;

    cifra.versos.forEach(verso => {
        const versoDiv = document.createElement('div');
        versoDiv.className = 'verso';
        if (verso.acordes) {
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

    // Botão voltar para detalhe do ensaio
    const btnVoltar = document.getElementById('btn-voltar-ensaio');
    btnVoltar.style.display = 'inline-block';
    btnVoltar.onclick = () => {
        container.style.display = 'none';
        carregarEnsaios(); // recarrega lista para voltar ao detalhe do ensaio
    };
}

// Inicializa
carregarEnsaios();
