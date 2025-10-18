async function carregarEnsaios() {
  const resp = await fetch('data/ensaios.json');
  const ensaios = await resp.json();
  const container = document.getElementById('lista-ensaios');

  // Ordena por data
  ensaios.sort((a, b) => new Date(a.data) - new Date(b.data));

  mostrarLista(ensaios, container);
}

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
        `<li><a href="cifras.html?id=${m.idCifra}" target="_self">${m.nome}</a></li>`
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

  // Inicializa ícones do lucide
  if (window.lucide) lucide.createIcons();

  document.getElementById('btn-anterior').addEventListener('click', () => {
    mostrarLista(ensaios, container);
  });
}

carregarEnsaios();
