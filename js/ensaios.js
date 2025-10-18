async function carregarEnsaios() {
  const resp = await fetch('data/ensaios.json');
  const ensaios = await resp.json();
  const container = document.getElementById('lista-ensaios');

  // Ordena por data
  ensaios.sort((a, b) => new Date(a.data) - new Date(b.data));

  // Cria lista de ensaios
  ensaios.forEach(en => {
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
      <h2>Ensaio de ${formatarData(en.data)}</h2>
      <span class="status-${en.cancelado ? 'cancelado' : 'ativo'}">
        ${en.cancelado ? 'CANCELADO' : 'ATIVO'}
      </span>
      <p>⏰ ${en.hora} | 📍 ${en.local}</p>
    `;
    container.appendChild(div);

    // Clique no ensaio para abrir detalhe
    div.addEventListener('click', () => abrirDetalheEnsaio(en));
  });
}

// Função para abrir detalhe de um ensaio
function abrirDetalheEnsaio(en) {
  const container = document.getElementById('lista-ensaios');
  container.innerHTML = `
    <button id="btn-anterior"><i data-lucide="chevron-left"></i> Voltar</button>
    <div class="detalhe-ensaio">
      <h2>Ensaio de ${formatarData(en.data)}</h2>
      <span class="status-${en.cancelado ? 'cancelado' : 'ativo'}">
        ${en.cancelado ? 'CANCELADO' : 'ATIVO'}
      </span>
      <p>⏰ ${en.hora} | 📍 ${en.local}</p>
      <ul>
        ${en.musicas.map(m => `<li><a href="${m.link}" target="_blank">${m.nome}</a></li>`).join('')}
      </ul>
    </div>
  `;

  // Renderiza os ícones do Lucide no botão
  lucide.createIcons();

  // Evento para voltar à lista
  document.getElementById('btn-anterior').addEventListener('click', () => {
    container.innerHTML = '';
    carregarEnsaios();
  });
}

// Função auxiliar para formatar datas
function formatarData(dataStr) {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const d = new Date(dataStr);
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

// Carrega ensaios na inicialização
carregarEnsaios();
