async function carregarEnsaios() {
    const resp = await fetch('data/ensaios.json');
    const ensaios = await resp.json();
    const container = document.getElementById('lista-ensaios');

    // Ordena por data
    ensaios.sort((a, b) => new Date(a.data) - new Date(b.data));

    mostrarLista(ensaioAtivo = null, ensaios, container);
}

function mostrarLista(ensaioAtivo, ensaios, container) {
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

function mostrarDetalhe(ensaio, ensaios, container) {
    container.innerHTML = '';

    const detalheDiv = document.createElement('div');
    detalheDiv.className = 'list-item detalhe-ensaio';

    const cancelado = ensaio.status?.toLowerCase() === 'cancelado' ||
                      ensaio.local?.toLowerCase().includes('cancel');
    const statusTexto = cancelado ? '❌ Cancelado' : '✅ Ativo';
    const statusClass = cancelado ? 'status-cancelado' : 'status-ativo';

    detalheDiv.innerHTML = `
      <h2>🎵 Ensaio de ${ensaio.data}</h2>
      <span class="${statusClass}">${statusTexto}</span>
      <p><span class="evento-hora">⏰ ${ensaio.hora}</span> | <span class="evento-local">📍 ${ensaio.local}</span></p>
      <h3>Setlist</h3>
    `;

    const listaMusicas = document.createElement('ul');
    if (ensaio.musicas.length) {
        ensaio.musicas.forEach(m => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = m.nome;
            a.addEventListener('click', e => {
                e.preventDefault();
                abrirCifraDoEnsaio(m, ensaio);
            });
            li.appendChild(a);
            listaMusicas.appendChild(li);
        });
    } else {
        const p = document.createElement('p');
        p.innerHTML = '<em>Sem músicas cadastradas.</em>';
        detalheDiv.appendChild(p);
    }

    detalheDiv.appendChild(listaMusicas);

    const btnVoltar = document.createElement('button');
    btnVoltar.id = 'btn-anterior';
    btnVoltar.innerHTML = '<i data-lucide="chevron-left"></i> Voltar';
    btnVoltar.addEventListener('click', () => mostrarLista(null, ensaios, container));
    detalheDiv.appendChild(btnVoltar);

    container.appendChild(detalheDiv);

    // Inicializa ícones Lucide
    if (window.lucide) lucide.createIcons();
}

carregarEnsaios();
