document.addEventListener('DOMContentLoaded', () => {
    const botao = document.getElementById('rolarBtn');
    const slider = document.getElementById('velocidadeScroll');
    if (!botao || !slider) return;

    let running = false;
    let rafId = null;
    let lastTs = null;
    let pxPorSegundo = parseInt(slider.value, 10);
    let acumulado = 0;

    const scroller = () => (document.scrollingElement || document.documentElement || document.body);
    const estaNoFim = () => (window.innerHeight + (scroller().scrollTop || window.scrollY) >= scroller().scrollHeight - 1);

    function step(ts) {
        if (!running) return;
        if (!lastTs) lastTs = ts;
        const delta = ts - lastTs;
        lastTs = ts;

        acumulado += (pxPorSegundo * delta) / 1000;
        const px = Math.floor(acumulado);
        if (px >= 1) {
            scroller().scrollTop += px;
            acumulado -= px;
        }

        if (estaNoFim()) parar();
        else rafId = requestAnimationFrame(step);
    }

    function iniciar() {
        if (running) return;
        running = true;
        lastTs = null;
        rafId = requestAnimationFrame(step);
        botao.textContent = 'Parar Scroll';
    }

    function parar() {
        running = false;
        lastTs = null;
        acumulado = 0;
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = null;
        botao.textContent = 'Ativar Scroll';
    }

    botao.addEventListener('click', e => {
        e.stopPropagation();
        if (running) parar(); else iniciar();
    });

    slider.addEventListener('input', e => {
        pxPorSegundo = parseInt(e.target.value, 10);
    });

    ['touchstart', 'touchmove', 'wheel', 'mousedown'].forEach(evt =>
        window.addEventListener(evt, () => { if (running) parar(); }, { passive: true })
    );

    document.addEventListener('visibilitychange', () => { if (document.hidden) parar(); });
});
