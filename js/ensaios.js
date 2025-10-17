async function carregarEnsaios() {
  const resp = await fetch('data/ensaios.json');
  const ensaios = await resp.json();
  const container = document.getElementById('lista-ensaios');

  ensaios.sort((a, b) => new Date(a.data) - new Date(b.data));

  ensaios.forEach(en => {
    const div = document.createElement('div');
    div.className = 'list-item';
    const musicasHtml = en.musicas.map(
      m => `<li><a href="${m.link}" target="_blank">${m.nome}</a></li>`
    ).join('');
    div.innerHTML = `
      <strong>📅 ${en.data} ⏰ ${en.hora}</strong><br>
      📍 ${en.local}<br>
      <ul>${musicasHtml}</ul>
    `;
    container.appendChild(div);
  });
}

carregarEnsaios();
