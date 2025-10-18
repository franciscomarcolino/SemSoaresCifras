// -----------------------
// Carrega cifras
// -----------------------
let cifras = [];
let cifraAtualIndex = 0;

async function carregarCifras() {
    const resp = await fetch('data/cifras.json');
    cifras = await resp.json();
    mostrarListaCifras();
}

function mostrarListaCifras() {
    const container = document.getElementById('lista-cifras');
    if (!container) return;

    const filtro = document.getElementById('filtro-cifras');

    const atualizarLista = () => {
        const termo = filtro.value.toLowerCase();
        container.querySelectorAll('.cifra-item').forEach(div => div.remove());

        cifras.forEach((cifra, index) => {
            if (cifra.titulo.toLowerCase().includes(termo) || cifra.banda.toLowerCase().includes(termo)) {
                const div = document.createElement('div');
                div.className = 'cifra-item list-item';
                div.textContent = cifra.titulo + ' - ' + cifra.banda;
                div.addEventListener('click', () => abrirCifra(index));
                container.appendChild(div);
            }
        });
    };

    filtro.addEventListener('input', atualizarLista);
    atualizarLista();
}

function abrirCifra(index) {
    cifraAtualIndex = index;
    const cifra = cifras[index];
    if (!cifra) return alert('Cifra não encontrada.');

    document.getElementById('lista-cifras').style.display = 'none';
    const detalhe = document.getElementById('detalhe-cifra');
    detalhe.style.display = 'block';

    document.getElementById('titulo-cifra').textContent = cifra.titulo;
    document.getElementById('banda-cifra').textContent = cifra.banda;
    document.getElementById('link-cifra').href = cifra.linkYoutube;

    const container = document.getElementById('acorde-letra-container');
    container.innerHTML = '';
    cifra.versos.forEach(v => {
        const div = document.createElement('div');
        div.className = 'verso';
        div.innerHTML = `<div class="linha-acordes">${v.acordes}</div>
                         <div class="linha-letra">${v.letra}</div>`;
        container.appendChild(div);
    });

    if (window.lucide) lucide.createIcons();
}

// Botões Anterior e Próxima
document.getElementById('btn-anterior').addEventListener('click', () => {
    document.getElementById('detalhe-cifra').style.display = 'none';
    document.getElementById('lista-cifras').style.display = 'block';
});

document.getElementById('btn-proxima').addEventListener('click', () => {
    cifraAtualIndex++;
    if (cifraAtualIndex >= cifras.length) cifraAtualIndex = 0;
    abrirCifra(cifraAtualIndex);
});

// Inicializa
document.addEventListener('DOMContentLoaded', () => {
    carregarCifras();
});
