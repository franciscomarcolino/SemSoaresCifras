// listar_ensaio.js
// Similar to listar_evento.js but for ensaios
document.addEventListener('DOMContentLoaded', async () => {
  const ensaiosPath = 'data/ensaios.json';
  const listaPath = 'data/lista_de_musicas.json';
  const container = document.getElementById('ensaios-lista');
  if (!container) return;

  const ensaios = await fetch(ensaiosPath, { cache: 'no-cache' }).then(r => r.json()).catch(() => []);
  const lista = await fetch(listaPath, { cache: 'no-cache' }).then(r => r.json()).catch(() => []);
  configurarFiltrosAgenda((futuros, passados) => {
  container.innerHTML = '';
  const selecionados = filtrarAgenda(ensaios, futuros, passados);
  if (!selecionados.length) {
    const aviso = document.createElement('p');
    aviso.setAttribute('role', 'status');
    aviso.textContent = !futuros && !passados ? 'Selecione Futuros ou Passados para visualizar.' : 'Nenhum ensaio para os filtros selecionados.';
    container.appendChild(aviso);
  }

  ordenarAgendaPorData(selecionados).forEach(en => {
    const evDiv = document.createElement('div');
    evDiv.className = 'list-item ensaio-item';

    // adiciona classe baseada no status (ativo/cancelado)
    const statusClass = en.status ? `ensaio-${en.status.toLowerCase()}` : '';
    evDiv.classList.add(statusClass);

    // formata o badge de status
    const statusBadge = en.status
      ? `<small class="status-badge ${en.status.toLowerCase()}">${en.status}</small>`
      : '';

    evDiv.innerHTML = `
      <div class="ensaio-top">
        <h3>🎵 Ensaio de ${en.data} ${statusBadge}</h3>
        <p><span class="evento-hora">⏰ ${en.hora}</span> | <span class="evento-local">📍 ${en.local}</span></p>
        <br>
        <div class="setlist">
          <strong>Setlist (Clique na música para visualizar sua cifra logo abaixo)</strong>
          <ul class="setlist-ul"></ul>
        </div>
        <br>
        <div class="cifra-inline-area"></div>
      </div>
    `;

    const ul = evDiv.querySelector('.setlist-ul');
    const ids = Array.isArray(en.musicas) ? en.musicas : [];
    ids.forEach(id => {
      const m = lista.find(x => x.idMusica === (typeof id === 'number' ? id : id.idMusica));
      const li = document.createElement('li');
      if (m) {
        li.innerHTML = `<a href="#" class="ensaio-musica" data-id="${m.idMusica}"><strong>${m.nome}</strong> - <em>${m.artista}</em></a>`;
      } else {
        li.textContent = 'Música não encontrada';
      }
      if (m) {
        li.classList.add('ensaio-faixa');
        const caminho = en.audios && en.audios[String(m.idMusica)];
        let url = null;
        if (typeof caminho === 'string' && caminho.trim()) {
          try {
            const candidata = new URL(caminho, document.baseURI);
            if (['https:', 'http:'].includes(candidata.protocol)) url = candidata.href;
          } catch (_) { /* Referência inválida: manter indisponível. */ }
        }
        const audio = document.createElement(url ? 'a' : 'span');
        audio.className = 'ensaio-audio';
        audio.textContent = 'Áudio do ensaio ▶';
        if (url) {
          audio.href = url;
          audio.target = '_blank';
          audio.rel = 'noopener';
          audio.setAttribute('aria-label', 'Ouvir áudio do ensaio: ' + m.nome + ' (abre em nova aba)');
        } else {
          audio.classList.add('indisponivel');
          audio.setAttribute('aria-disabled', 'true');
          audio.title = 'Gravação ainda não disponível';
          audio.setAttribute('aria-label', 'Áudio do ensaio de ' + m.nome + ': gravação ainda não disponível');
        }
        li.appendChild(audio);
      }
      ul.appendChild(li);
    });

    evDiv.addEventListener('click', (e) => {
      const a = e.target.closest('.ensaio-musica');
      if (!a) return;
      e.preventDefault();
      const id = parseInt(a.dataset.id, 10);
      const musicEntry = lista.find(x => x.idMusica === id);
      const cifraArea = evDiv.querySelector('.cifra-inline-area');
      const contextIds = ids.map(x => (typeof x === 'number' ? x : x.idMusica));
      cifraArea.innerHTML = '';
      const wrapper = document.createElement('div');
      cifraArea.appendChild(wrapper);
      if (typeof renderCifraInline === 'function') {
        renderCifraInline(wrapper, musicEntry, contextIds);
        wrapper.addEventListener('cifra:navigate', (evNav) => {
          const newId = evNav.detail.id;
          const newMusic = lista.find(x => x.idMusica === newId);
          wrapper.innerHTML = '';
          renderCifraInline(wrapper, newMusic, contextIds);
        });
      }
    });

    container.appendChild(evDiv);
  });
  });
});
