async function carregarEventos() {
  const resp = await fetch('data/eventos.json');
  eventos = await resp.json();
  renderizar();
}

function renderizar() {
  const container = document.getElementById('lista-eventos');
  container.innerHTML = '';

  const agora = new Date();
  let lista = [...eventos].sort((a, b) => new Date(a.data) - new Date(b.data));

  if (ocultarPassados) {
    lista = lista.filter(ev => new Date(ev.data) >= agora);
  }

  lista.forEach(ev => {
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
      <strong>${ev.nome}</strong><br>
      📅 ${ev.data} ⏰ ${ev.hora}<br>
      📍 ${ev.local}<br>
      🎵<br> 
      ${ev.musicas.map(m => `<strong>${m.titulo}</strong> <em>(${m.artista})</em>`).join('<br>')}
    `;
    container.appendChild(div);
  });
}

document.getElementById('btn-ocultar').onclick = () => {
  ocultarPassados = !ocultarPassados;
  
  const btn = document.getElementById('btn-ocultar');
  btn.innerHTML = `
    <i data-lucide="${ocultarPassados ? 'eye' : 'eye-off'}"></i> 
    ${ocultarPassados ? 'Mostrar todos os eventos' : 'Ocultar eventos passados'}
  `;

  renderizar();
  lucide.createIcons();
};

carregarEventos();
