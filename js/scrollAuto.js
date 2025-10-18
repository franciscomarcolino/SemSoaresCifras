export function initScrollAutomatico(botaoId = 'rolarBtn', sliderId = 'velocidadeScroll') {
    const botao = document.getElementById(botaoId);
    const slider = document.getElementById(sliderId);
    if (!botao || !slider) return;

    let running = false;
    let rafId = null;
    let lastTs = null;
    let pxPorSegundo = parseInt(slider.value, 10);
    let acumulado = 0;

    const scroller = () => document.scrollingElement || document.documentElement || document.body;
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
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = null;
        botao.textContent = 'Ativar Scroll';
    }

    botao.addEventListener('click', (e) => {
        e.stopPropagation();
        if (running) parar(); else iniciar();
    });

    slider.addEventListener('input', e => {
        pxPorSegundo = parseInt(e.target.value, 10);
    });

    const pauseOnUser = (e) => {
        if (e.target.closest(`#${botaoId}`) || e.target.closest(`#${sliderId}`)) return;
        if (running) parar();
    };

    ['touchstart', 'touchmove', 'wheel', 'mousedown'].forEach(evt =>
        window.addEventListener(evt, pauseOnUser, { passive: true })
    );

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) parar();
    });
}

// Inicialização automática se houver DOM
document.addEventListener('DOMContentLoaded', () => initScrollAutomatico());
