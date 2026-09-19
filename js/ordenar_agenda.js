// Datas do catálogo: "18 Setembro 2026" ou "14 de Novembro de 2026".
function ordenarAgendaPorData(itens) {
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  function chave(item) {
    const partes = String(item.data || '').trim().toLowerCase()
      .replace(/\s+de\s+/g, ' ').split(/\s+/);
    const dia = Number(partes[0]);
    const mes = meses.indexOf(partes[1]);
    const ano = Number(partes[2]);
    if (partes.length !== 3 || !Number.isInteger(dia) || dia < 1 || dia > 31 ||
        mes < 0 || !Number.isInteger(ano) || ano < 1000) return -Infinity;
    return ano * 10000 + (mes + 1) * 100 + dia;
  }
  // Mantém a ordem original entre datas iguais ou desconhecidas.
  return [...itens].sort((a, b) => {
    const ca = chave(a), cb = chave(b);
    return ca === cb ? 0 : ca > cb ? -1 : 1;
  });
}

function dataHoraAgenda(item) {
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const partes = String(item.data || '').trim().toLowerCase()
    .replace(/\s+de\s+/g, ' ').split(/\s+/);
  const mes = meses.indexOf(partes[1]);
  const dia = Number(partes[0]), ano = Number(partes[2]);
  if (partes.length !== 3 || mes < 0 || !Number.isInteger(dia) ||
      dia < 1 || dia > 31 || !Number.isInteger(ano)) return '';
  return String(ano).padStart(4, '0') + '-' + String(mes + 1).padStart(2, '0') +
    '-' + String(dia).padStart(2, '0') + 'T' + (item.hora || '23:59');
}

function filtrarAgenda(itens, futuros, passados, agora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(agora);
  const p = Object.fromEntries(partes.map(x => [x.type, x.value]));
  const limite = p.year + '-' + p.month + '-' + p.day + 'T' + p.hour + ':' + p.minute;
  return itens.filter(item => {
    const data = dataHoraAgenda(item);
    return data && (data >= limite ? futuros : passados);
  });
}

function configurarFiltrosAgenda(renderizar) {
  const futuros = document.getElementById('filtro-futuros');
  const passados = document.getElementById('filtro-passados');
  futuros.checked = true;
  passados.checked = false;
  const atualizar = () => renderizar(futuros.checked, passados.checked);
  futuros.addEventListener('change', atualizar);
  passados.addEventListener('change', atualizar);
  atualizar();
}
