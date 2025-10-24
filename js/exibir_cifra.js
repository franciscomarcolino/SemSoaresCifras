// exibir_cifra.js
// Funções utilitárias para exibir cifras inline (usado por eventos, ensaios e lista de músicas).

// -----------------------
// Utilitários
// -----------------------
async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Erro ao carregar ' + path);
  return await res.json();
}

function escapeHtml(s) {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// -----------------------
// Realça acordes dentro do texto da cifra (versão final robusta)
// -----------------------
function highlightChords(cifraText) {
  const escaped = escapeHtml(cifraText);

  // Regex abrangente para acordes válidos
  const CHORD_RE = new RegExp(
    '^' +
      '(?:[A-G](?:#|b)?)' +                      // Tônica (A, Bb, F#)
      '(?:' +
        '(?:maj|min|M|m|dim|aug|sus|add)?\\d*(?:\\+)?' +  // extensões tipo m7+, 7+, 13+
        '(?:maj|min|M|m|dim|aug|sus|add)?\\d*' +
      ')?' +
      '(?:\\([^)]+\\))*' +                      // (b9), (#11)
      '(?:\\/(?:(?:[A-G](?:#|b)?)|(?:\\d+)))?' + // /C ou /9
    '$'
  );

  const stripEndPunct = (s) => (s || '').replace(/[,:;.!?]+$/, '');

  // Divide acordes colados (ex: A#m7C#/D# → A#m7 C#/D#)
  const splitMergedChords = (line) =>
    line.replace(
      /([A-G](?:#|b)?(?:maj|min|M|m|dim|aug|sus|add)?\d*(?:\+)?(?:\([^)]+\))?)(?=[A-G](?:#|b)?(?![a-z]))/g,
      '$1 '
    );

  return escaped
    .split('\n')
    .map((line) => {
      const processed = /[A-G](?:#|b)?[A-G]/.test(line) ? splitMergedChords(line) : line;
      const tokens = processed.match(/\S+/g) || [];

      const chordTokens = tokens.filter((t) => CHORD_RE.test(stripEndPunct(t)));
      const manyChords = chordTokens.length >= 1; // <-- 1 já ativa realce para acordes isolados

      return processed.replace(/(\S+)/g, (m) => {
        const clean = stripEndPunct(m);
        const looksLikeChord = CHORD_RE.test(clean);
        const isBareRoot = /^[A-G](?:#|b)?$/.test(clean);
        const isAllLower = /^[a-zçáéíóúàèìòùâêîôûãõ]+$/.test(clean); // ignora palavras minúsculas

        const ok = looksLikeChord && !isAllLower && (manyChords || isBareRoot);
        return ok ? `<span class="chord">${m}</span>` : m;
      });
    })
    .join('\n');
}


// -----------------------
// Renderiza uma cifra inline
// -----------------------
async function renderCifraInline(container, musicEntry, contextIds, options = {}) {
  const { hideNavButtons = false } = options;
  container.innerHTML = '';

  // === Detecção de ambiente e montagem do caminho da cifra ===
  const hostname = window.location.hostname;
  const isGithubPages = /\.github\.io$/i.test(hostname);
  let basePath = '';

  if (isGithubPages) {
    // Ex: https://usuario.github.io/SemSoaresCifras/
    const parts = window.location.pathname.split('/').filter(Boolean);
    const repo = parts[0] || '';
    basePath = repo ? `/${repo}/` : '/';
  }

  let cifraPath = musicEntry.cifra || '';

  if (cifraPath.startsWith('//')) {
    cifraPath = cifraPath.replace(/^\/+/, '');
  }

  if (/^https?:\/\//i.test(cifraPath)) {
    // URL completa (Spotify, etc.)
  } else {
    cifraPath = cifraPath.replace(/^\/+/, ''); // remove / inicial
    cifraPath = isGithubPages ? `${basePath}${cifraPath}` : cifraPath;
  }

  console.log('[DEBUG] Cifra path final:', cifraPath);

  // === Carrega o JSON da cifra ===
  let cifraText = '';
  try {
    const j = await fetchJson(cifraPath);
    cifraText = j.cifra || '';
  } catch (e) {
    console.error('Erro ao carregar cifra:', e);
    cifraText = 'Não foi possível carregar a cifra.';
  }

  // -----------------------
  // Monta o HTML dinamicamente respeitando o modo hideNavButtons
  // -----------------------
  const area = document.createElement('div');
  area.className = 'cifra-inline-wrapper';

  area.innerHTML = `
    <div class="cifra-controls">
      <button class="btn btn-close">Fechar cifra</button>
      <br><br><br>
      ${
        !hideNavButtons
          ? `
        <button class="btn btn-prev">◀ Anterior</button>
        <button class="btn btn-next">Próxima ▶</button>
        <br><br>`
          : ''
      }
      <label id="vel-label">Velocidade:        
        <input class="scroll-speed" type="range" min="5" max="50" value="5">
      </label>
    </div>

    <div class="cifra-info">
      <h3>🎵 ${musicEntry.nome} <small><em>${musicEntry.artista}</em></small></h3>
    </div>

    <pre class="cifra-texto">${highlightChords(cifraText)}</pre>
  `;

  container.appendChild(area);
  criarPlayerYoutube(musicEntry, area);


  // -----------------------
  // Configura área de rolagem
  // -----------------------
  const textoDiv = area.querySelector('.cifra-texto');
  const speedInput = area.querySelector('.scroll-speed');

  Object.assign(textoDiv.style, {
    maxHeight: '47vh',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    padding: '10px',
    border: '1px solid #222',
    borderRadius: '8px'
  });

  // -----------------------
  // Habilita scroll automático com botão
  // -----------------------
  habilitarScrollAutomatico(textoDiv, {
    speedInput,
    btnContainer: area.querySelector('.cifra-controls')
  });

  // -----------------------
  // Navegação entre músicas (somente se permitido)
  // -----------------------
  if (!hideNavButtons) {
    const currentIndex = contextIds.indexOf(musicEntry.idMusica);
    const prevBtn = area.querySelector('.btn-prev');
    const nextBtn = area.querySelector('.btn-next');

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        const idPrev = contextIds[prevIndex];
        const evt = new CustomEvent('cifra:navigate', { detail: { id: idPrev } });
        container.dispatchEvent(evt);
      });

      nextBtn.addEventListener('click', () => {
        const nextIndex =
          currentIndex < contextIds.length - 1 ? currentIndex + 1 : contextIds.length - 1;
        const idNext = contextIds[nextIndex];
        const evt = new CustomEvent('cifra:navigate', { detail: { id: idNext } });
        container.dispatchEvent(evt);
      });
    }
  }

  // -----------------------
  // Fechar cifra (corrige bug do segundo clique)
  // -----------------------
  const closeBtn = area.querySelector('.btn-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      // Limpa o conteúdo da cifra
      container.innerHTML = '';

      // ✅ Corrige o bug: redefine o estado da área pai (para funcionar no primeiro clique)
      const cifraArea = container.parentElement;
      if (cifraArea && cifraArea.classList.contains('cifra-inline-area')) {
        cifraArea.dataset.aberta = 'false';
      }
    });
  }
}

// -----------------------
// Scroll automático (com rAF + slider)
// -----------------------
function habilitarScrollAutomatico(container, opts = {}) {
  const { speedInput = null, btnContainer = null } = opts;

  let running = false;
  let rafId = null;
  let lastTs = null;
  let pxPorSegundo = speedInput ? parseInt(speedInput.value, 10) : 40;
  let acumulado = 0;

  // Botão amarelo de scroll
  const btnScroll = document.createElement('button');
  btnScroll.type = 'button';
  btnScroll.className = 'btn-scroll-auto';
  btnScroll.textContent = '🠗 Auto Scroll';
  Object.assign(btnScroll.style, {
    marginTop: '10px',
    display: 'block',
    width: '100%',
    padding: '10px',
    backgroundColor: '#b39700',
    color: '#000',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease'
  });

  if (btnContainer) {
  const velLabel = btnContainer.querySelector('#vel-label');
  if (velLabel) {
    // Insere o botão antes do rótulo de velocidade
    btnContainer.insertBefore(btnScroll, velLabel);
  } else {
    // Caso não encontre o vel-label, adiciona no final como fallback
    btnContainer.appendChild(btnScroll);
  }
} else if (container.parentElement) {
  container.parentElement.insertBefore(btnScroll, container);
}

  if (speedInput)
    speedInput.addEventListener('input', (e) => {
      const v = parseInt(e.target.value, 10);
      if (!Number.isNaN(v)) pxPorSegundo = v;
    });

  const estaNoFim = () =>
    container.scrollTop + container.clientHeight >= container.scrollHeight - 1;

  function step(ts) {
    if (!running) return;
    if (lastTs == null) lastTs = ts;
    const delta = ts - lastTs;
    lastTs = ts;
    acumulado += (pxPorSegundo * delta) / 1000;
    const px = Math.floor(acumulado);
    if (px >= 1) {
      container.scrollTop += px;
      acumulado -= px;
    }

    if (estaNoFim()) {
      toggle(false);
      return;
    }
    rafId = requestAnimationFrame(step);
  }

  function toggle(forceState) {
    const next = typeof forceState === 'boolean' ? forceState : !running;
    if (next === running) return;

    running = next;
    if (running) {
      lastTs = null;
      rafId = requestAnimationFrame(step);
      btnScroll.textContent = '⏸️ Parar Scroll';
      btnScroll.style.backgroundColor = '#555';
      btnScroll.style.color = '#fff';
    } else {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = null;
      lastTs = null;
      acumulado = 0;
      btnScroll.textContent = '🠗 Auto Scroll';
      btnScroll.style.backgroundColor = '#ffcc00';
      btnScroll.style.color = '#000';
    }
  }

  btnScroll.addEventListener('click', () => toggle());
  ['touchstart', 'touchmove', 'wheel', 'mousedown', 'keydown'].forEach((evt) =>
    container.addEventListener(evt, () => running && toggle(false), { passive: true })
  );
  document.addEventListener('visibilitychange', () => document.hidden && toggle(false));
}

// -----------------------
// Cria e inicializa player de áudio do YouTube sob demanda (lazy-load)
// -----------------------
function criarPlayerYoutube(musicEntry, area) {
  if (!musicEntry || !musicEntry.LinkYoutube) {
    console.warn('[YT] Nenhum link do YouTube encontrado para esta música:', musicEntry?.nome);
    return;
  }

  const link = musicEntry.LinkYoutube.trim();
  const match = link.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/);
  const videoId = match ? match[1] : null;
  if (!videoId) {
    console.warn('[YT] Link inválido, não foi possível extrair o ID do vídeo:', link);
    return;
  }

  console.log('[YT] Player configurado (modo lazy) para vídeo:', videoId, 'de', musicEntry.nome);

  // === Cria o HTML do player (sem carregar nada do YouTube ainda) ===
  const playerHtml = `
    <br><br>
    <div class="youtube-audio-player">
      <span class="youtube-label">🎧 Ouvir música</span>
      <div id="yt-player-container-${videoId}" class="yt-audio-iframe"></div>
      <div class="youtube-controls">
        <button class="btn btn-youtube-play">▶️</button>
        <button class="btn btn-youtube-pause" disabled>⏸️</button>
        <button class="btn btn-youtube-stop" disabled>⏹️</button>
      </div>
    </div>
    <br><br>
  `;

  const controls = area.querySelector('.cifra-controls');
  controls?.insertAdjacentHTML('beforebegin', playerHtml);

  // === Lazy load ===
  let ytPlayer = null;
  let apiLoaded = false;
  let isReady = false;

  const btnPlay = area.querySelector('.btn-youtube-play');
  const btnPause = area.querySelector('.btn-youtube-pause');
  const btnStop = area.querySelector('.btn-youtube-stop');
  const containerId = `yt-player-container-${videoId}`;

  // === Carrega API (apenas uma vez) ===
  const loadYouTubeAPI = () =>
    new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        apiLoaded = true;
        resolve();
      } else {
        if (!document.querySelector("script[src*='youtube.com/iframe_api']")) {
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          document.body.appendChild(tag);
        }
        const check = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(check);
            apiLoaded = true;
            resolve();
          }
        }, 300);
      }
    });

  // === Cria o player sob demanda ===
  const createPlayer = () => {
    console.log('[YT] Criando YT.Player sob demanda...');

    // Define parâmetros do player
    const playerVars = {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
    };

    // Evita origem inválida em ambiente local
    if (window.location.protocol === 'https:') {
      playerVars.origin = window.location.origin;
    }

    ytPlayer = new YT.Player(containerId, {
      height: '0',
      width: '0',
      videoId: videoId,
      host: 'https://www.youtube.com',
      playerVars,
      events: {
        onReady: (e) => {
          console.log('[YT] Player pronto (lazy):', videoId);
          isReady = true;
          e.target.playVideo();
          btnPause.disabled = false;
          btnStop.disabled = false;
        },
        onError: (err) => {
          console.error('[YT] Erro no player:', err);
        },
      },
    });
  };

  // === Eventos dos botões ===
  btnPlay?.addEventListener('click', async () => {
    if (!apiLoaded) await loadYouTubeAPI();

    if (!ytPlayer) {
      createPlayer();
    } else if (isReady) {
      ytPlayer.playVideo();
    }
  });

  btnPause?.addEventListener('click', () => {
    ytPlayer?.pauseVideo();
  });

  btnStop?.addEventListener('click', () => {
    if (ytPlayer && ytPlayer.seekTo) {
    ytPlayer.seekTo(0, true);  // volta para o início
    ytPlayer.stopVideo();      // apenas para, sem tocar novamente
    }
  });
}
