let cifras = [];
let indiceAtual = 0;

async function carregarCifras() {
  const resposta = await fetch('data/cifras.json');
  cifras = await resposta.json();
  cifras.sort((a, b) => a.titulo.localeCompare(b.titulo));
  exibirLista();
}

function exibirLista() {
  const listaDiv = document.getElementById('lista-cifras');
  const detalheDiv = document.getElementById('detalhe-cifra');
  listaDiv.style.display = 'block';
  detalheDiv.style.display = 'none';
  listaDiv.innerHTML = '';

  cifras.forEach((cifra, i) => {
    const div = document.createElement('div');
    div.className = 'list-item';
    // Exibe título + banda + acordes
    div.innerHTML = `<strong>${cifra.titulo}</strong> - <em>${cifra.banda}</em><br><em>${cifra.acordes}</em>`;
    div.onclick = () => abrirCifra(i);
    listaDiv.appendChild(div);
  });
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

function voltarLista() {
  exibirLista();
}

carregarCifras();
