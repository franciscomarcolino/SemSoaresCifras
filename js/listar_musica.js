// listar_musica.js
// Lista músicas e exibe cifras inline com acordes destacados (sem botões anterior/próxima)

document.addEventListener('DOMContentLoaded', async () => {
  const listaPath = '../data/lista_de_musicas.json';
  const container = document.getElementById('musicas-lista');
  if (!container) return;

  const lista = await fetch(listaPath).then(r => r.json()).catch(() => []);
  const filtroInput = document.getElementById('filtro-cifras');

  async function renderLista(filtro = '') {
    container.innerHTML = '';
    const termo = filtro.toLowerCase().trim();
    const musicasFiltradas = lista.filter(m =>
      (m.nome || '').toLowerCase().includes(termo) ||
      (m.artista || '').toLowerCase().includes(termo)
    );

    for (const m of musicasFiltradas) {
      const div = document.createElement('div');
      div.className = 'list-item musica-item';

      let acordesUnicos = [];
      try {
        const cifraPath = m.cifra.startsWith('/') ? m.cifra : '/data/cifras/' + m.cifra;
        const cifraJson = await fetch(cifraPath).then(r => r.json());
        const texto = cifraJson.cifra || '';
        const regexAcorde = /\b([A-G](?:#|b)?(?:m|maj|min|sus|dim|aug)?\d*(?:\/[A-G](?:#|b)?)?)\b/g;
        const encontrados = texto.match(regexAcorde) || [];
        acordesUnicos = [...new Set(encontrados)].slice(0, 12);
      } catch {}

      const acordesHtml = acordesUnicos.length
        ? `<div class="acordes-resumo">${acordesUnicos.join(' ')}</div>`
        : '';

      div.innerHTML = `
        <div class="musica-header">
          <div class="musica-info">
            <strong>${m.nome}</strong> - <em>${m.artista || ''}</em>
            ${acordesHtml}
          </div>
          <div class="musica-youtube">
            <a href="${m.LinkYoutube || '#'}" target="_blank" rel="noopener" title="Abrir no YouTube">
              <i class="fa-brands fa-youtube"></i>
            </a>
          </div>
        </div>
        <div class="cifra-inline-area"></div>
      `;

      div.addEventListener('click', (ev) => {
        if (ev.target.closest('a')) return;
        if (!ev.target.closest('.musica-header')) return;

        const cifraArea = div.querySelector('.cifra-inline-area');
        const jaAberta = cifraArea.dataset.aberta === 'true';
        document.querySelectorAll('.cifra-inline-area[data-aberta="true"]').forEach(a => {
          a.innerHTML = '';
          a.dataset.aberta = 'false';
        });

        if (jaAberta) {
          cifraArea.innerHTML = '';
          cifraArea.dataset.aberta = 'false';
          return;
        }

        cifraArea.dataset.aberta = 'true';
        const wrapper = document.createElement('div');
        cifraArea.appendChild(wrapper);

        if (typeof renderCifraInline === 'function') {
          // Passa uma flag para ocultar os botões
          renderCifraInline(wrapper, m, [m.idMusica], { hideNavButtons: true });
        } else {
          cifraArea.innerHTML = '<p>Erro: função renderCifraInline não encontrada.</p>';
        }
      });

      container.appendChild(div);
    }

    if (musicasFiltradas.length === 0) {
      const msg = document.createElement('p');
      msg.textContent = 'Nenhuma música encontrada.';
      msg.style.textAlign = 'center';
      container.appendChild(msg);
    }
  }

  renderLista();
  if (filtroInput) filtroInput.addEventListener('input', () => renderLista(filtroInput.value));
});
