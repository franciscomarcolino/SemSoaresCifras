// listar_evento.js
// Lista eventos a partir de /data/eventos.json (ou evento.json) e permite expandir setlist;
// ao clicar em música do evento, exibe a cifra logo abaixo da div do evento (usando exibir_cifra.js)
document.addEventListener('DOMContentLoaded', async ()=>{
  const eventosPath = '../data/eventos.json';
  const listaPath = '../data/lista_de_musicas.json';
  const container = document.getElementById('eventos-lista');
  if(!container) return;
  const eventos = await fetch(eventosPath).then(r=>r.json()).catch(()=>[]);
  const lista = await fetch(listaPath).then(r=>r.json()).catch(()=>[]);
  container.innerHTML = '';
  eventos.forEach(ev=>{
    const evDiv = document.createElement('div');
    evDiv.className = 'list-item evento-item';
    evDiv.innerHTML = `
      <div class="evento-top">
        <h3>🎶 ${ev.data} <small>${ev.status ? '<span class="status">'+ev.status+'</span>' : ''}</small></h3>
        <p><span class="evento-hora">⏰ ${ev.hora}</span> | <span class="evento-local">📍 ${ev.local}</span></p>
        <br>
        <div class="setlist"><strong>Setlist (Clique na música para visualizar sua cifra logo abaixo) </strong><ul class="setlist-ul"></ul></div>
        <br>
        <div class="cifra-inline-area"></div>
      </div>
    `;
    const ul = evDiv.querySelector('.setlist-ul');
    // if ev.musicas are ids or objects
    const ids = Array.isArray(ev.musicas) ? ev.musicas : [];
    ids.forEach(id => {
      const m = lista.find(x => x.idMusica === (typeof id === 'number' ? id : id.idMusica));
      const li = document.createElement('li');
      if (m) {
        li.innerHTML = `<a href="#" class="evento-musica" data-id="${m.idMusica}"><strong>${m.nome}</strong> - <em>${m.artista}</em></a>`;
      } else {
        li.textContent = 'Música não encontrada';
      }
      ul.appendChild(li);
    });

    /*// toggle: show/hide setlist
    <button class="btn btn-toggle">Abrir / Fechar</button> 
    evDiv.querySelector('.btn-toggle').addEventListener('click', ()=>{
      evDiv.querySelector('.setlist').classList.toggle('open');
      // close cifra area when toggle closes
      if(!evDiv.querySelector('.setlist').classList.contains('open')){
        evDiv.querySelector('.cifra-inline-area').innerHTML = '';
      }
    });*/

    // click on music in setlist -> render cifra inline for that music only within this evento's context
    evDiv.addEventListener('click', async (e)=>{
      const a = e.target.closest('.evento-musica');
      if(!a) return;
      e.preventDefault();
      const id = parseInt(a.dataset.id,10);
      const musicEntry = lista.find(x=>x.idMusica===id);
      const cifraArea = evDiv.querySelector('.cifra-inline-area');
      // context is the event's list of ids
      const contextIds = ids.map(x=> (typeof x==='number'? x : x.idMusica));
      // dynamically import render function from exibir_cifra.js (it's loaded globally in HTML)
      // show cifra inline
      // clear and render
      cifraArea.innerHTML = '';
      const wrapper = document.createElement('div');
      cifraArea.appendChild(wrapper);
      // call global helper (defined in exibir_cifra.js)
      if (typeof renderCifraInline === 'function') {
        renderCifraInline(wrapper, musicEntry, contextIds);
        // listen to navigation events
        wrapper.addEventListener('cifra:navigate', (evNav) => {
          const newId = evNav.detail.id;
          const newMusic = lista.find(x=>x.idMusica===newId);
          wrapper.innerHTML = '';
          renderCifraInline(wrapper, newMusic, contextIds);
        });
      }
    });

    container.appendChild(evDiv);
  });
});