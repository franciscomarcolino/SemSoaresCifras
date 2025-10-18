// -----------------------
// Carrega ensaios
// -----------------------
let ensaios = [];

async function carregarEnsaios() {
    const resp = await fetch('data/ensaios.json');
    ensaios = await resp.json();
    ensaios.sort((a,b) => new Date(a.data) - new Date(b.data));
    mostrarListaEnsaios();
}

function mostrarListaEnsaios() {
    const container = document.getElementById('lista-ensaios');
    container.innerHTML = '';

    ensaios.forEach(ensaio => {
        const div = document.createElement('div');
        div.className = 'list-item';
        const cancelado = ensaio.status.toLowerCase() === 'cancelado';
        const statusClass = cancelado ? 'status-cancelado' : 'status-ativo';
        const statusTexto = cancelado ? '❌ Cancelado' : '✅ Ativo';

        div.innerHTML = `
            <h2>🎵 Ensaio de ${ensaio.data}</h2>
            <span class="${statusClass}">${statusTexto}</span>
            <p><span class="evento-hora">⏰ ${ensaio.hora}</span> | <span class="evento-local">📍 ${ensaio.local}</span></p>
        `;

        div.addEventListener('click', () => mostrarDetalheEnsaio(ensaio));
        container.appendChild(div);
    });
}

function mostrarDetalheEnsaio(ensaio) {
    const container = document.getElementById('lista-ensaios');
    container.innerHTML = '';

    const detalheDiv = document.getElementById('detalhe-cifra');
    detalheDiv.style.display = 'block';

    const titulo = document.getElementById('titulo-cifra');
    const bandaSpan = document.getElementById('banda-cifra');
    const linkYoutube = document.getElementById('link-cifra');
    const containerVersos = document.getElementById('acorde-letra-container');

    // Mostra a primeira música do setlist
    let indexCifra = 0;

    function abrirMusicaCifra() {
        const musica = ensaio.musicas[indexCifra];
        if (!musica) return containerVersos.innerHTML = '<em>Sem músicas cadastradas.</em>';

        fetch('data/cifras.json')
            .then(r => r.json())
            .then(cifras => {
                const cifra = cifras.find(c => c.id === musica.idCifra);
                if (!cifra) return alert('Cifra não encontrada.');

                titulo.textContent = cifra.titulo;
                bandaSpan.textContent = cifra.banda;
                linkYoutube.href = cifra.linkYoutube;

                containerVersos.innerHTML = '';
                cifra.versos.forEach(v => {
                    const div = document.createElement('div');
                    div.className = 'verso';
                    div.innerHTML = `<div class="linha-acordes">${v.acordes}</div>
                                     <div class="linha-letra">${v.letra}</div>`;
                    containerVersos.appendChild(div);
                });

                if (window.lucide) lucide.createIcons();
            });
    }

    abrirMusicaCifra();

    // Botões
    document.getElementById('btn-anterior').onclick = () => {
        if (indexCifra > 0) indexCifra--;
        abrirMusicaCifra();
    };

    document.getElementById('btn-proxima').onclick = () => {
        if (indexCifra < ensaio.musicas.length -1) indexCifra++;
        abrirMusicaCifra();
    };
}

// Inicializa
document.addEventListener('DOMContentLoaded', () => {
    carregarEnsaios();
});
