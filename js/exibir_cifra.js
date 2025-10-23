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
// Realça acordes dentro do texto da cifra (corrigido para F#, Bb, etc.)
// -----------------------
function highlightChords(cifraText) {
  const escaped = escapeHtml(cifraText);

  // Regex final: suporta acordes complexos como A7(b13), F#m7(9), D7/9, C6/9, A7+, Cº etc.
  const CHORD_RE = /^(?:[A-G](?:#|b)?)(?:(?:m|M|maj|min|dim|aug|sus\d*|add\d*|maj7|M7|7M|7|9|11|13|6\/9|6|5|4|2|º|°|\+)|(?:\([^)]+\)))*(?:\/[A-G0-9](?:#|b)?)?$/;

  const isChordLike = (tok) => CHORD_RE.test(tok.replace(/[,:;.!?]+$/,''));
  const isBareRoot  = (tok) => /^[A-G]$/.test(tok.replace(/[,:;.!?]+$/,''));

  return escaped
    .split('\n')
    .map(line => {
      const tokens = line.match(/[^\s]+/g) || [];
      const chordTokens = tokens.filter(isChordLike);
      const manyChordsInLine = chordTokens.length >= 2;

      return line.replace(/([^\s]+)/g, (m) => {
        const ok = isChordLike(m) && (manyChordsInLine || !isBareRoot(m));
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

  const cifraPath = musicEntry.cifra.startsWith('/')
    ? musicEntry.cifra
    : '../data/cifras/' + musicEntry.cifra;

  let cifraText = '';
  try {
    const j = await fetchJson(cifraPath);
    cifraText = j.cifra || '';
  } catch (e) {
    cifraText = 'Não foi possível carregar a cifra.';
  }

  const area = document.createElement('div');
  area.className = 'cifra-inline-wrapper';

  // Monta o HTML dinamicamente respeitando o modo hideNavButtons
  area.innerHTML = `
    <div class="cifra-controls">
      <button class="btn btn-close">Fechar cifra</button>
      <br><br><br><br>
      ${!hideNavButtons ? `
        <button class="btn btn-prev">◀ Anterior</button>
        <button class="btn btn-next">Próxima ▶</button>
        <br><br>` : ''}
      <label id="vel-label">Velocidade:
        <input class="scroll-speed" type="range" min="5" max="500" value="5">
      </label>
    </div>

    <div class="cifra-info">
      <h3>🎵 ${musicEntry.nome} <small><em>${musicEntry.artista}</em></small></h3>
    </div>

    <pre class="cifra-texto">${highlightChords(cifraText)}</pre>
  `;

  container.appendChild(area);

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
          currentIndex < contextIds.length - 1
            ? currentIndex + 1
            : contextIds.length - 1;
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
    backgroundColor: '#ffcc00', // 🔸 amarelo original restaurado
    color: '#000',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease'
  });

  // Insere botão na área de controles
  if (btnContainer) {
    btnContainer.appendChild(btnScroll);
  } else if (container.parentElement) {
    container.parentElement.insertBefore(btnScroll, container);
  }

  // Ajusta velocidade conforme slider
  if (speedInput) {
    speedInput.addEventListener('input', (e) => {
      const v = parseInt(e.target.value, 10);
      if (!Number.isNaN(v)) pxPorSegundo = v;
    });
  }

  const estaNoFim = () =>
    container.scrollTop + container.clientHeight >= container.scrollHeight - 1;

  // Função de rolagem animada
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

  // Inicia ou pausa a rolagem
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

  // Clique alterna scroll
  btnScroll.addEventListener('click', () => toggle());

  // Pausa ao interagir manualmente
  const pauseOnUser = (e) => {
    if (e.target === btnScroll) return;
    if (running) toggle(false);
  };

  ['touchstart', 'touchmove', 'wheel', 'mousedown', 'keydown'].forEach((evt) =>
    container.addEventListener(evt, pauseOnUser, { passive: true })
  );

  // Pausa ao sair da aba
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) toggle(false);
  });
}
