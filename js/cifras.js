let cifras = [];
let cifraAtualIndex = 0;
let ensaioParaVoltar = null;

async function carregarCifras() {
    const resp = await fetch('data/cifras.json');
    cifras = await resp.json();
    mostrarListaCifras(cifras);
}

function mostrarListaCifras(lista) {
    const container = document.getElementById('lista-cifras');
    const filtro = document.getElementById('filtro-cifras');

    if (!container) return;

    container.querySelectorAll('ul, .cifra-item').forEach(e => e.remove());

    const ul = document.createElement('ul');
    lista.forEach(c => {
        const li = document.createElement('li');
        li.className = 'cifra-item';
        li.innerHTML = `<a href="#" onclick="abrirCifra(${c.id}); return false;">${c.titulo} - ${c.banda}</a>`;
        ul.appendChild(li);
    });
    container.appendChild(ul);

    filtro.addEventListener('input', e => {
        const termo = e.target.value.toLowerCase();
        const filtrado = cifras.filter(c => c.titulo.toLowerCase().includes(termo) || c.banda.toLowerCase().includes(termo));
        mostrarListaCifras(filtrado);
    });
}

function abrirCifra(id, ensaio = null) {
    const cifra = cifras.find(c => c.id === id);
    if (!cifra) {
        alert('Cifra não encontrada.');
        return;
    }

    ensaioParaVoltar = ensaio;

    document.getElementById('lista-ensaios')?.classList.add('hidden');
    document.getElementById('cifras-container')?.classList.remove('hidden');

    const container = document.getElementById('acorde-letra-container');
    container.innerHTML = '';

    cifra.versos.forEach(v => {
        const div = document.createElement('div');
        div.className = 'verso';
        div.innerHTML = `
            <div class="linha-acordes">${v.acordes}</div>
            <div class="linha-letra">${v.letra}</div>
        `;
        container.appendChild(div);
    });

    document.getElementById('titulo-cifra').textContent = cifra.titulo;
    document.getElementById('banda-cifra').textContent = cifra.banda;
    const link = document.getElementById('link-cifra');
    link.href = cifra.linkYoutube || '#';

    document.getElementById('btn-anterior').onclick = () => {
        cifraAtualIndex = Math.max(0, cifraAtualIndex - 1);
        abrirCifra(cifras[cifraAtualIndex].id);
    };
    document.getElementById('btn-proxima').onclick = () => {
        cifraAtualIndex = Math.min(cifras.length - 1, cifraAtualIndex + 1);
        abrirCifra(cifras[cifraAtualIndex].id);
    };

    document.getElementById('btn-voltar')?.addEventListener('click', () => {
        if (ensaioParaVoltar) {
            document.getElementById('cifras-container')?.classList.add('hidden');
            document.getElementById('lista-ensaios')?.classList.remove('hidden');
            mostrarDetalhe(ensaioParaVoltar, [ensaioParaVoltar]);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    carregarCifras();
});
