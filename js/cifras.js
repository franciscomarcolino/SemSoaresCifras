let indiceAtual = 0;
let ensaioAtual = null;

// Abrir cifra
function abrirCifraDoEnsaio(musica, ensaio) {
    ensaioAtual = ensaio;

    const cifra = window.cifras.find(c => c.id === musica.idCifra || c.titulo === musica.nome);
    if (!cifra) {
        alert("Cifra não encontrada.");
        return;
    }

    const detalheDiv = document.getElementById('detalhe-cifra');
    const container = document.getElementById('acorde-letra-container');

    detalheDiv.style.display = 'block';
    container.innerHTML = '';
    document.getElementById('titulo-cifra').textContent = cifra.titulo;
    document.getElementById('banda-cifra').textContent = cifra.banda;
    document.getElementById('link-cifra').href = cifra.linkYoutube || '#';

    if (cifra.versos) {
        cifra.versos.forEach(v => {
            const versoDiv = document.createElement('div');
            versoDiv.className = 'verso';

            if (v.acordes) {
                const acordesDiv = document.createElement('div');
                acordesDiv.className = 'linha-acordes';
                acordesDiv.textContent = v.acordes;
                versoDiv.appendChild(acordesDiv);
            }

            const letraDiv = document.createElement('div');
            letraDiv.className = 'linha-letra';
            letraDiv.textContent = v.letra;
            versoDiv.appendChild(letraDiv);

            container.appendChild(versoDiv);
        });
    }

    // Inicializa scroll automático
    initScrollAutomatico();

    // Botão voltar
    const btnVoltar = document.getElementById('btn-voltar-ensaio');
    btnVoltar.addEventListener('click', () => {
        document.getElementById('detalhe-cifra').style.display = 'none';
        container.innerHTML = '';
    });

    lucide.createIcons();
}

// Scroll automático reutilizável
function initScrollAutomatico() {
    const botao = document.getElementById('rolarBtn');
    const slider = document.getElementById('velocidadeScroll');
    if (!botao || !slider) return;

    let running = false, rafId = null, lastTs = null, acumulado = 0;
    let pxPorSegundo = parseInt(slider.value,10);

    const scroller = () => (document.scrollingElement || document.documentElement || document.body);
    const estaNoFim = () => (window.innerHeight + (scroller().scrollTop || window.scrollY) >= scroller().scrollHeight-1);

    function step(ts) {
        if (!running) return;
        if (!lastTs) lastTs = ts;
        const delta = ts - lastTs;
        lastTs = ts;

        acumulado += (pxPorSegundo * delta)/1000;
        const px = Math.floor(acumulado);
        if(px>=1){ scroller().scrollTop += px; acumulado -= px; }

        if(estaNoFim()){ parar(); return; }
        rafId = requestAnimationFrame(step);
    }

    function iniciar(){ if(running) return; running=true; lastTs=null; rafId=requestAnimationFrame(step); botao.textContent='Parar Scroll'; }
    function parar(){ if(!running) return; running=false; lastTs=null; acumulado=0; if(rafId!==null) cancelAnimationFrame(rafId); rafId=null; botao.textContent='Ativar Scroll'; }

    botao.addEventListener('click',()=>{ if(running) parar(); else iniciar(); });
    slider.addEventListener('input', e=>{ pxPorSegundo=parseInt(e.target.value,10); });

    ['touchstart','touchmove','wheel','mousedown'].forEach(evt=>window.addEventListener(evt,e=>{ if(e.target.closest('#rolarBtn')) return; if(running) parar(); },{passive:true}));
    document.addEventListener('visibilitychange',()=>{ if(document.hidden) parar(); });
}

// Inicializa
document.addEventListener('DOMContentLoaded', async () => {
    const resp = await fetch('data/cifras.json');
    window.cifras = await resp.json();
});
