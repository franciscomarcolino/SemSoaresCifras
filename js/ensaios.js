let ensaios = [];

async function carregarEnsaios() {
    const resp = await fetch('data/ensaios.json');
    ensaios = await resp.json();
    ensaios.sort((a, b) => new Date(a.data) - new Date(b.data));
    mostrarLista(ensaios);
}

function mostrarLista(lista) {
    const container = document.getElementById('lista-ensaios');
    container.innerHTML = '';

    lista.forEach(ensaio => {
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

        div.addEventListener('click', () => mostrarDetalheEnsaio(ensaio));
        container.appendChild(div);
    });
}

function mostrarDetalheEnsaio(ensaio) {
    const container = document.getElementById('lista-ensaios');
    container.innerHTML = '';

    const detalheDiv = document.createElement('div');
    detalheDiv.className = 'list-item detalhe-ensaio';

    const cancelado = ensaio.status?.toLowerCase() === 'cancelado';
    const statusTexto = cancelado ? '❌ Cancelado' : '✅ Ativo';
    const statusClass = cancelado ? 'status-cancelado' : 'status-ativo';

    const musicasHtml = ensaio.musicas.length
        ? `<ul>${ensaio.musicas.map(m => 
            `<li><a href="#" onclick="abrirCifra(${m.idCifra - 1})">${m.nome}</a></li>`).join('')}</ul>`
        : `<p><em>Sem músicas cadastradas.</em></p>`;

    detalheDiv.innerHTML = `
        <h2>🎵 Ensaio de ${ensaio.data}</h2>
        <span class="${statusClass}">${statusTexto}</span>
        <p><span class="evento-hora">⏰ ${ensaio.hora}</span> | <span class="evento-local">📍 ${ensaio.local}</span></p>
        <h3>Setlist</h3>
        ${musicasHtml}
        <button id="btn-anterior">Voltar</button>
    `;

    container.appendChild(detalheDiv);

    document.getElementById('btn-anterior').addEventListener('click', () => mostrarLista(ensaios));
}

// Inicializa
document.addEventListener('DOMContentLoaded', () => {
    carregarEnsaios();
});
