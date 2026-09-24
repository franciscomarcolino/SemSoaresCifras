document.addEventListener('DOMContentLoaded', async () => {
  const lista = document.getElementById('gravacoes-lista');
  const busca = document.getElementById('filtro-gravacoes');
  const normalizar = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let ativo = null;
  const ler = async caminho => {
    const resposta = await fetch(caminho, { cache: 'no-cache' });
    if (!resposta.ok) throw new Error('Falha ao carregar');
    return resposta.json();
  };
  try {
    const [musicas, gravacoes] = await Promise.all([ler('data/lista_de_musicas.json'), ler('data/gravacoes.json')]);
    if (!Array.isArray(musicas) || !Array.isArray(gravacoes)) throw new Error('Dados inválidos');
    function renderizar() {
      if (ativo) { ativo.pause(); ativo = null; }
      lista.replaceChildren();
      const termo = normalizar(busca.value);
      const filtradas = musicas.filter(m => normalizar(m.nome + ' ' + m.artista).includes(termo));
      if (!filtradas.length) { lista.textContent = 'Nenhuma música encontrada.'; return; }
      filtradas.forEach(m => {
        const card = document.createElement('article');
        card.className = 'list-item gravacao-card';
        const cabecalho = document.createElement('div');
        cabecalho.className = 'musica-header';
        const foto = document.createElement('div');
        foto.className = 'musica-foto';
        const img = document.createElement('img');
        img.src = m.fotoBanda; img.alt = ''; img.loading = 'lazy';
        foto.appendChild(img);
        const info = document.createElement('div');
        info.className = 'musica-info';
        const nome = document.createElement('strong'); nome.textContent = m.nome;
        const artista = document.createElement('em'); artista.textContent = m.artista;
        info.append(nome, document.createTextNode(' - '), artista);
        cabecalho.append(foto, info); card.appendChild(cabecalho);
        const faixas = gravacoes.filter(g => g.idMusica === m.idMusica).sort((a,b) => String(b.data).localeCompare(String(a.data)));
        if (!faixas.length) {
          const vazio = document.createElement('p'); vazio.className = 'gravacao-vazia';
          vazio.textContent = 'Nenhuma gravação disponível.'; card.appendChild(vazio);
        }
        const grupo = document.createElement('div'); grupo.className = 'gravacao-faixas';
        faixas.forEach(g => {
          const linha = document.createElement('div'); linha.className = 'gravacao-linha';
          const top = document.createElement('div'); top.className = 'gravacao-linha-top';
          const titulo = document.createElement('span');
          const data = /^\d{4}-\d{2}-\d{2}$/.test(g.data) ? g.data.split('-').reverse().join('/') : String(g.data || '');
          titulo.textContent = (g.tipo || 'Ensaio') + ' de ' + data + (g.local ? ' — ' + g.local : '');
          const botao = document.createElement('button'); botao.type = 'button'; botao.className = 'gravacao-play';
          botao.textContent = '▶'; botao.setAttribute('aria-label', 'Ouvir ' + m.nome + ': ' + titulo.textContent);
          const audio = document.createElement('audio'); audio.controls = true; audio.setAttribute('controlsList', 'nodownload noplaybackrate'); audio.preload = 'none'; audio.hidden = true;
          try { const url = new URL(g.arquivo, document.baseURI); if (!g.arquivo || !['https:', 'http:'].includes(url.protocol)) throw new Error(); audio.src = url.href; }
          catch (_) { botao.disabled = true; botao.title = 'Gravação indisponível'; }
          const erro = document.createElement('p'); erro.hidden = true; erro.setAttribute('role','status');
          const falha = () => { erro.textContent = 'Não foi possível reproduzir esta gravação.'; erro.hidden = false; };
          audio.addEventListener('error', falha);
          audio.addEventListener('play', () => { if (ativo && ativo !== audio) ativo.pause(); ativo = audio; botao.textContent = '❚❚'; botao.setAttribute('aria-label', 'Pausar ' + m.nome); });
          audio.addEventListener('pause', () => { botao.textContent = '▶'; botao.setAttribute('aria-label', 'Ouvir ' + m.nome + ': ' + titulo.textContent); });
          audio.addEventListener('ended', () => { botao.textContent = '▶'; });
          botao.addEventListener('click', () => { audio.hidden = false; erro.hidden = true; if (audio.paused) audio.play().catch(falha); else audio.pause(); });
          top.append(titulo, botao); linha.append(top, audio, erro); grupo.appendChild(linha);
        });
        card.appendChild(grupo); lista.appendChild(card);
      });
    }
    busca.addEventListener('input', renderizar); renderizar();
  } catch (_) { lista.textContent = 'Não foi possível carregar as gravações. Atualize a página para tentar novamente.'; }
});
