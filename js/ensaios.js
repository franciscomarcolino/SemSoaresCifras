let ensaioAtual = null; // Guarda o ensaio atual para voltar

async function carregarEnsaios() {
    const resp = await fetch('data/ensaios.json');
    const ensaios = await resp.json();
    ensaios.sort((a, b) => new Date(a.data) - new Date(b.data));
    mostrarLista(ensaios);
}

function mostrarLista(ensaios) {
    const container = document.getElementById('lista-ensaios');
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

        div.addEventListener('click', () => mostrarDetalhe(ensaio, ensaios));
        container.appendChild(div);
    });
}

function mostrarDetalhe(ensaio, ensaios) {
    ensaioAtual = ensaio; // guarda para voltar
    const container = document.getElementById('lista-ensaios');
    container.innerHTML = '';

    const detalheDiv = document.createElement('div');
    detalheDiv.className = 'list-item detalhe-ensaio';

    const cancelado = ensaio.status?.toLowerCase() === 'cancelado';
    const statusTexto = cancelado ? '❌ Cancelado' : '✅ Ativo';
    const statusClass = cancelado ? 'status-cancelado' : 'status-ativo';

    const musicasHtml = ensaio.musicas.length
        ? `<ul>${ensaio.musicas.map(m =>
            `<li><a href="#" onclick="abrirCifraDoEnsaio({idCifra: ${m.idCifra}, nome: '${m.nome}'}, ensaioAtual); return false;">${m.nome}</a></li>`
        ).join('')}</ul>`
        : `<p><em>Sem músicas cadastradas.</em></p>`;

    detalheDiv.innerHTML = `
        <h2>🎵 Ensaio de ${ensaio.data}</h2>
        <span class="${statusClass}">${statusTexto}</span>
        <p><span class="evento-hora">⏰ ${ensaio.hora}</span> | <span class="evento-local">📍 ${ensaio.local}</span></p>
        <h3>Setlist</h3>
        ${musicasHtml}
        <button id="btn-voltar"><i data-lucide="chevron-left"></i> Voltar</button>
    `;

    container.appendChild(detalheDiv);

    if (window.lucide) lucide.createIcons();

    document.getElementById('btn-voltar').addEventListener('click', () => {
        mostrarLista(ensaioAtual ? [ensaioAtual] : []); 
    });
}

document.addEventListener('DOMContentLoaded', () => {
    carregarEnsaios();
});
