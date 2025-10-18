let ensaios = [];
let ensaioAtual = null;

// Carrega JSON de ensaios
async function carregarEnsaios() {
    const resp = await fetch('data/ensaios.json');
    ensaios = await resp.json();

    // Ordena por data
    ensaios.sort((a, b) => new Date(a.data) - new Date(b.data));

    mostrarLista(ensaios);
}

// Exibe lista de ensaios
function mostrarLista(lista) {
    const container = document.getElementById('lista-ensaios');
    container.innerHTML = '';

    lista.forEach(ensaio => {
        const div = document.createElement('div');
        div.className = 'list-item';

        const cancelado = ensaio.status?.toLowerCase() === 'cancelado' ||
                          ensaio.local?.toLowerCase().includes('cancel');
        const statusTexto = cancelado ? '❌ Cancelado' : '✅ Ativo';
        const statusClass = cancelado ? 'status-cancelado' : 'status-ativo';

        div.innerHTML = `
            <h2>🎵 Ensaio de ${ensaio.data}</h2>
            <span class="${statusClass}">${statusTexto}</span>
            <p><span class="evento-hora">⏰ ${ensaio.hora}</span> | <span class="evento-local">📍 ${ensaio.local}</span></p>
        `;

        div.addEventListener('click', () => mostrarDetalhe(ensaio));
        container.appendChild(div);
    });
}

// Função que será chamada pelo cifras.js para voltar ao detalhe do ensaio
window.mostrarDetalheEnsaio = function() {
    if (ensaioAtual) {
        mostrarDetalhe(ensaioAtual);
    }
};

// Mostra detalhe do ensaio
function mostrarDetalhe(ensaio) {
    ensaioAtual = ensaio;
    const container = document.getElementById('lista-ensaios');
    container.innerHTML = '';

    const detalheDiv = document.createElement('div');
    detalheDiv.className = 'list-item detalhe-ensaio';

    const cancelado = ensaio.status?.toLowerCase() === 'cancelado' ||
                      ensaio.local?.toLowerCase().includes('cancel');
    const statusTexto = cancelado ? '❌ Cancelado' : '✅ Ativo';
    const statusClass = cancelado ? 'status-cancelado' : 'status-ativo';

    const musicasHtml = ensaio.musicas.length
        ? `<ul>${ensaio.musicas.map(m => 
            `<li><a href="#" onclick="abrirCifraDoEnsaio({idCifra:${m.idCifra}, nome:'${m.nome}'})">${m.nome}</a></li>`
          ).join('')}</ul>`
        : `<p><em>Sem músicas cadastradas.</em></p>`;

    detalheDiv.innerHTML = `
        <h2>🎵 Ensaio de ${ensaio.data}</h2>
        <span class="${statusClass}">${statusTexto}</span>
        <p><span class="evento-hora">⏰ ${ensaio.hora}</span> | <span class="evento-local">📍 ${ensaio.local}</span></p>
        <h3>Setlist</h3>
        ${musicasHtml}
        <button id="btn-anterior"><i data-lucide="chevron-left"></i> Voltar</button>
    `;

    container.appendChild(detalheDiv);

    if (window.lucide) lucide.createIcons();

    document.getElementById('btn-anterior').addEventListener('click', () => {
        mostrarLista(ensaios);
    });
}

// Função chamada pelos links do ensaio
function abrirCifraDoEnsaio(cifraRef) {
    const indice = cifras.findIndex(c => c.id === cifraRef.idCifra || c.id === cifraRef.id);
    if (indice !== -1) {
        abrirCifra(indice, "ensaio");
    } else {
        alert('Cifra não encontrada.');
    }
}

// Inicializa
document.addEventListener('DOMContentLoaded', () => {
    carregarCifras().then(() => carregarEnsaios());
});
