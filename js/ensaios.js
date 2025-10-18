async function carregarEnsaios() {
  const resp = await fetch('data/ensaios.json');
  const ensaios = await resp.json();
  const container = document.getElementById('lista-ensaios');

  // Ordena por data
  ensaios.sort((a, b) => new Date(a.data) - new Date(b.data));

  // Mostra lista inicial
  mostrarLista(ensaios, container);
}

function mostrarLista(ensaios, container) {
  container.innerHTML = ''; // limpa conteúdo anterior

  ensaios.forEach(en => {
    const div = document.createElement('div');
    div.className = 'list-item';

    // status baseado no campo ou texto
    const cancelado = en.local?.toLowerCase().includes('cancel') || en.status === 'cancelado';
    const statusTexto = cancelado ? '❌ Cancelado' : '✅ Ativo';
    const statusClass = cancelado ? 'status-cancelado' : 'status-ativo';

    div.innerHTML = `
      <strong class="evento-data">📅 ${en.data}</strong>
      <span class="evento-hora">⏰ ${en.hora}</span><br>
      <span class="evento-local">📍 ${en.local}</span><br>
      <span class="${statusClass}">${statusTexto}</span>
    `;

    // evento de clique para abrir o detalhe
    div.addEventListener('click', () => mostrarDetalhe(en, ensaios, container));

    container.appendChild(div);
  });
}

function mostrarDetalhe(ensaio, ensaios, container) {
  container.innerHTML = ''; // limpa lista

  const detalheDiv = document.createElement('div');
  detalheDiv.className = 'list-item detalhe-ensaio';

  const cancelado = ensaio.local?.toLowerCase().includes('cancel') || ensaio.status === 'cancelado';
  const statusTexto = cancelado ? '❌ Cancelado' : '✅ Ativo';
  const statusClass = cancelado ? 'status-cancelado' : 'status-ativo';

  const musicasHtml = ensaio.musicas.length
    ? `<ul>${ensaio.musicas.map(m => `<li><a href="${m.link}" target="_blank">${m.nome}</a></li>`).join('')}</ul>`
    : `<p><em>Sem músicas cadastradas.</em></p>`;

  detalheDiv.innerHTML = `
    <h2>🎵 Ensaio de ${ensaio.data}</h2>
    <span class="${statusClass}">${statusTexto}</span>
    <p><span class="evento-hora">⏰ ${ensaio.hora}</span> | <span class="evento-local">📍 ${ensaio.local}</span></p>
    <h3 class="setlist">Setlist</h3>
    ${musicasHtml}
    <button id="btn-voltar">⬅ Voltar</button>
  `;

  container.appendChild(detalheDiv);

  document.getElementById('btn-voltar').addEventListener('click', () => {
    mostrarLista(ensaios, container);
  });
}

carregarEnsaios();
