let cifras = []; 
let indiceAtual = 0;
let ensaioAtual = null;

// Carrega cifras
async function carregarCifras() {
    const resp = await fetch('data/cifras.json');
    cifras = await resp.json();
}

// Carrega ensaios
async function carregarEnsaios() {
    const resp = await fetch('data/ensaios.json');
    const ensaios = await resp.json();
    const container = document.getElementById('lista-ensaios');

    ensaios.sort((a,b)=> new Date(a.data) - new Date(b.data));
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
    ensaioAtual = ensaio;

    const detalheDiv = document.getElementById('detalhe-cifra');
    const listaContainer = container;

    // Renderiza lista de músicas do ensaio
    let musicasHtml = ensaio.musicas.length
        ? `<ul>${ensaio.musicas.map(m => 
            `<li><a href="#" onclick='abrirCifraDoEnsaio({idCifra:${m.idCifra},nome:"${m.nome}"}, ${JSON.stringify(ensaio)})'>${m.nome}</a></li>`
          ).join('')}</ul>`
        : `<p><em>Sem músicas cadastradas.</em></p>`;

    listaContainer.innerHTML = `
        <h2>🎵 Ensaio de ${ensaio.data}</h2>
        <span class="${ensaio.status === 'cancelado' ? 'status-cancelado' : 'status-ativo'}">
          ${ensaio.status === 'cancelado' ? '❌ Cancelado' : '✅ Ativo'}
        </span>
        <p><span class="evento-hora">⏰ ${ensaio.hora}</span> | <span class="evento-local">📍 ${ensaio.local}</span></p>
        <h3>Setlist</h3>
        ${musicasHtml}
        <button id="btn-voltar-lista"><i data-lucide="chevron-left"></i> Voltar</button>
    `;

    document.getElementById('btn-voltar-lista').addEventListener('click', () => mostrarLista(ensaioAtual, container));
    detalheDiv.style.display = 'none';
    lucide.createIcons();
}

// Inicializa
document.addEventListener('DOMContentLoaded', async () => {
    await carregarCifras();
    carregarEnsaios();
});
