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
