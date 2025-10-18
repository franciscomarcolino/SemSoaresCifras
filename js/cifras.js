let cifras = [];
let indiceAtual = 0;

async function carregarCifras() {
  const resposta = await fetch('data/cifras.json');
  cifras = await resposta.json();
  cifras.sort((a, b) => a.titulo.localeCompare(b.titulo));
  exibirLista();

  // 🔍 adiciona evento para filtrar conforme o usuário digita
  const filtroInput = document.getElementById('filtro-cifras');
  if (filtroInput) {
    filtroInput.addEventListener('input', e => {
      exibirLista(e.target.value);
    });
  }
}

function exibirLista(filtro = '') {
  const listaDiv = document.getElementById('lista-cifras');
  const detalheDiv = document.getElementById('detalhe-cifra');
  listaDiv.style.display = 'block';
  detalheDiv.style.display = 'none';

  // Mantém o campo de busca, caso já exista
  const filtroContainer = document.getElementById('filtro-container');
  listaDiv.innerHTML = '';
  if (filtroContainer) listaDiv.appendChild(filtroContainer);

  // 🔍 aplica o filtro, se houver texto digitado
  const filtroLower = filtro.toLowerCase();
  const cifrasFiltradas = cifras.filter(c =>
    c.titulo.toLowerCase().includes(filtroLower) ||
    (c.banda && c.banda.toLowerCase().includes(filtroLower))
  );

  // Gera os itens da lista filtrada
  cifrasFiltradas.forEach((cifra, i) => {
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `<strong>${cifra.titulo}</strong> - <em>${cifra.banda}</em><br><em>${cifra.acordes}</em>`;
    div.onclick = () => abrirCifra(i);
    listaDiv.appendChild(div);
  });

  // Se não houver resultados
  if (cifrasFiltradas.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = 'Nenhuma música encontrada.';
    msg.style.textAlign = 'center';
    listaDiv.appendChild(msg);
  }
}

function abrirCifra(indice) {
  indiceAtual = indice;
  const cifra = cifras[indice];
  document.getElementById('titulo-cifra').textContent = cifra.titulo;
  document.getElementById('banda-cifra').textContent = cifra.banda;
  document.getElementById('acordes-cifra').textContent = cifra.acordes;
  document.getElementById('letra-cifra').textContent = cifra.letra;
  document.getElementById('link-cifra').href = cifra.linkYoutube;
  document.getElementById('lista-cifras').style.display = 'none';
  document.getElementById('detalhe-cifra').style.display = 'block';
}

document.getElementById('btn-proxima').onclick = () => {
  indiceAtual = (indiceAtual + 1) % cifras.length;
  abrirCifra(indiceAtual);
};

document.getElementById('btn-anterior').onclick = () => {
  indiceAtual = (indiceAtual - 1 + cifras.length) % cifras.length;
  abrirCifra(indiceAtual);
};

function voltarLista() {
  const filtroAtual = document.getElementById('filtro-cifras')?.value || '';
  exibirLista(filtroAtual);
}

carregarCifras();


//


document.addEventListener('DOMContentLoaded', () => {
  const botao = document.getElementById('rolarBtn');
  const slider = document.getElementById('velocidadeScroll');
  if (!botao || !slider) return;

  let running = false;
  let rafId = null;
  let lastTs = null;
  let pxPorSegundo = parseInt(slider.value, 10);
  let acumulado = 0; // para subpixels

  const scroller = () => (document.scrollingElement || document.documentElement || document.body);
  const estaNoFim = () => (window.innerHeight + (scroller().scrollTop || window.scrollY) >= scroller().scrollHeight - 1);

  function step(ts) {
    if (!running) return;

    if (!lastTs) lastTs = ts;
    const delta = ts - lastTs;
    lastTs = ts;

    // acumula subpixels
    acumulado += (pxPorSegundo * delta) / 1000;
    const px = Math.floor(acumulado);
    if (px >= 1) {
      scroller().scrollTop += px;
      acumulado -= px;
    }

    if (estaNoFim()) {
      parar();
      return;
    }

    rafId = requestAnimationFrame(step);
  }

  function iniciar() {
    if (running) return;
    running = true;
    lastTs = null;
    rafId = requestAnimationFrame(step);
    botao.textContent = 'Parar Scroll';
  }

  function parar() {
    if (!running) return;
    running = false;
    lastTs = null;
    acumulado = 0;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    botao.textContent = 'Ativar Scroll';
  }

  botao.addEventListener('click', () => {
    if (running) parar();
    else iniciar();
  });

  slider.addEventListener('input', (e) => {
    pxPorSegundo = parseInt(e.target.value, 10);
  });

  const pauseOnUser = (e) => {
    // ignora cliques/toques no botão
    if (e.target.closest('#rolarBtn')) return;
    if (running) parar();
  };

  ['touchstart', 'touchmove', 'wheel', 'mousedown'].forEach(evt =>
    window.addEventListener(evt, pauseOnUser, { passive: true })
  );

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) parar();
  });
});
