// -----------------------
// ENSAIOS.JS
// -----------------------

// Função de carregar cifras antes dos ensaios
async function carregarCifras() {
    if (window.cifras && cifras.length) return; // já carregadas
    const resp = await fetch('data/cifras.json');
    window.cifras = await resp.json();
    cifras.sort((a, b) => a.titulo.localeCompare(b.titulo));
}

// Carrega ensaios e exibe lista
async function carregarEnsaios() {
    await carregarCifras(); // garante cifras carregadas antes
    const resp = await fetch('data/ensaios.json');
    const ensaios = await resp.json();
    const container = document.getElementById('lista-ensaios');

    // Ordena por data
    ensaios.sort((a, b) => new Date(a.data) - new Date(b.data));

    mostrarLista(ensaios, container);
}

// Mostra lista de ensaios
function mostrarLista(ensaios, container) {
    container.innerHTML = '';

    ensaios.forEach(ensaio => {
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

        div.addEventListener('click', () => mostrarDetalhe(ensaio, ensaios, container));
        container.appendChild(div);
    });
}

// Mostra detalhe do ensaio + setlist
function mostrarDetalhe(ensaio, ensaios, container) {
    container.innerHTML = '';

    const detalheDiv = document.createElement('div');
    detalheDiv.className = 'list-item detalhe-ensaio';

    const cancelado = ensaio.status?.toLowerCase() === 'cancelado' || 
                      ensaio.local?.toLowerCase().includes('cancel');
    const statusTexto = cancelado ? '❌ Cancelado' : '✅ Ativo';
    const statusClass = cancelado ? 'status-cancelado' : 'status-ativo';

    const musicasHtml = ensaio.musicas.length
        ? `<ul>${ensaio.musicas.map(m => 
            `<li><a href="#" onclick="abrirCifraDoEnsaio({idCifra:${m.idCifra},nome:'${m.nome}'}, ${JSON.stringify(ensaio)})">${m.nome}</a></li>`
          ).join('')}</ul>`
        : `<p><em>Sem músicas cadastradas.</em></p>`;

    detalheDiv.innerHTML = `
        <h2>🎵 Ensaio de ${ensaio.data}</h2>
        <span class="${statusClass}">${statusTexto}</span>
        <p><span class="evento-hora">⏰ ${ensaio.hora}</span> | <span class="evento-local">📍 ${ensaio.local}</span></p>
        <h3>Setlist</h3>
        ${musicasHtml}
    `;

    container.appendChild(detalheDiv);

    if (window.lucide) lucide.createIcons();
}

// Inicializa
document.addEventListener('DOMContentLoaded', carregarEnsaios);
