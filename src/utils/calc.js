// Fatores de conversão para unidade-base (g, ml ou und)
export const UNIT_FACTORS = {
  kg: 1000,
  g: 1,
  l: 1000,
  ml: 1,
  und: 1,
};

export const UNIT_OPTIONS = [
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'l', label: 'L' },
  { value: 'ml', label: 'ml' },
  { value: 'und', label: 'und' },
];

export function toBase(qty, unit) {
  const q = Number(qty) || 0;
  const f = UNIT_FACTORS[unit] ?? 1;
  return q * f;
}

// Custo de um ingrediente dentro de uma receita/componente
// ingrediente: { materiaPrimaId, quantidadeUtilizada } — a quantidade utilizada é
// sempre expressa na mesma unidade do pacote da matéria-prima (unidadeCompra).
export function calcIngredientCost(ing, materiasPrimas = []) {
  const materiaPrima = materiasPrimas.find((m) => m.id === ing.materiaPrimaId);
  if (!materiaPrima) return { custoUnitario: 0, custoUtilizado: 0, materiaPrima: null };

  const precoCompra = Number(materiaPrima.precoCompra) || 0;
  const qtdCompraBase = toBase(materiaPrima.qtdCompra, materiaPrima.unidadeCompra) || 1;
  const custoPorBase = precoCompra / qtdCompraBase;
  const qtdUsadaBase = toBase(ing.quantidadeUtilizada, materiaPrima.unidadeCompra);
  const custoUnitario = custoPorBase; // custo por g/ml/und
  const custoUtilizado = custoPorBase * qtdUsadaBase;
  return { custoUnitario, custoUtilizado, materiaPrima };
}

// Totais de um componente (massa, recheio ou cobertura)
export function calcComponentTotals(componente, materiasPrimas = []) {
  const ingredientes = componente?.ingredientes || [];
  let custoTotal = 0;
  let pesoTotalG = 0;
  for (const ing of ingredientes) {
    const { custoUtilizado, materiaPrima } = calcIngredientCost(ing, materiasPrimas);
    custoTotal += custoUtilizado;
    if (materiaPrima) pesoTotalG += toBase(ing.quantidadeUtilizada, materiaPrima.unidadeCompra);
  }
  return {
    custoTotal,
    pesoTotalG,
    pesoTotalKg: pesoTotalG / 1000,
  };
}

// Precificação da receita/bolo final
// params: custoTotal (numero), margem (0-100), fatias, pesoFinalKg
export function calcPricing(custoTotal, margem, fatias = 1, pesoFinalKg = 1) {
  const margemFrac = Math.min(Math.max(Number(margem) || 0, 0), 95) / 100;
  const markup = margemFrac >= 1 ? 0 : 1 / (1 - margemFrac);
  const precoIdeal = custoTotal * markup;
  const precoMinimo = custoTotal / (1 - 0.15);
  const precoPremium = precoIdeal * 1.25;
  const lucroTotal = precoIdeal - custoTotal;
  const lucroPorFatia = fatias > 0 ? lucroTotal / fatias : 0;
  const custoPorKg = pesoFinalKg > 0 ? custoTotal / pesoFinalKg : 0;

  return {
    markup,
    precoIdeal,
    precoMinimo,
    precoPremium,
    lucroTotal,
    lucroPorFatia,
    custoPorKg,
  };
}

// Custos automáticos (mão de obra, energia, gás, água) calculados a partir do
// tempo total registrado (min) e das taxas cadastradas em Configurações
export function calcCustosAutomaticos(tempoTotalMin, custosIndiretosPadrao = {}) {
  const tempo = Number(tempoTotalMin) || 0;
  const custoGas = tempo * (Number(custosIndiretosPadrao.gasPorMin) || 0);
  const custoEnergia = tempo * (Number(custosIndiretosPadrao.energiaPorMin) || 0);
  const custoAgua = tempo * (Number(custosIndiretosPadrao.aguaPorMin) || 0);
  const custoMaoDeObra = (tempo / 60) * (Number(custosIndiretosPadrao.maoDeObraPorHora) || 0);
  const total = custoGas + custoEnergia + custoAgua + custoMaoDeObra;
  return { tempoTotalMin: tempo, custoGas, custoEnergia, custoAgua, custoMaoDeObra, total };
}

function somarSelecoes(selecoes, lista, materiasPrimas) {
  let custoTotal = 0;
  let pesoTotalKg = 0;
  const itens = [];
  for (const sel of selecoes || []) {
    const componente = lista.find((c) => c.id === sel.componenteId);
    if (!componente) continue;
    const qtd = Number(sel.quantidade) || 1;
    const totals = calcComponentTotals(componente, materiasPrimas);
    custoTotal += totals.custoTotal * qtd;
    pesoTotalKg += totals.pesoTotalKg * qtd;
    itens.push({ componente, quantidade: qtd, ...totals });
  }
  return { custoTotal, pesoTotalKg, itens };
}

// Junta os componentes selecionados de uma receita e calcula tudo
// listas: { massas, recheios, coberturas, materiasPrimas, custosIndiretosPadrao }
export function calcReceitaCompleta(receita, listas) {
  const materiasPrimas = listas.materiasPrimas || [];
  const massas = somarSelecoes(receita.massas, listas.massas, materiasPrimas);
  const recheios = somarSelecoes(receita.recheios, listas.recheios, materiasPrimas);
  const coberturas = somarSelecoes(receita.coberturas, listas.coberturas, materiasPrimas);

  const extras = receita.custosExtras || {};
  const custoIndiretosManual = Object.values(extras).reduce((acc, v) => acc + (Number(v) || 0), 0);

  const tempoTotalMin = (Number(receita.tempoPreparo) || 0) + (Number(receita.tempoForno) || 0) +
    (Number(receita.tempoDecoracao) || 0);
  const automaticos = calcCustosAutomaticos(tempoTotalMin, listas.custosIndiretosPadrao);

  const custoMassa = massas.custoTotal;
  const custoRecheio = recheios.custoTotal;
  const custoCobertura = coberturas.custoTotal;
  const custoIndiretos = custoIndiretosManual + automaticos.total;
  const custoTotal = custoMassa + custoRecheio + custoCobertura + custoIndiretos;

  const pesoFinalKg = Number(receita.pesoFinal) ||
    massas.pesoTotalKg + recheios.pesoTotalKg + coberturas.pesoTotalKg || 1;

  const pricing = calcPricing(custoTotal, receita.margem, Number(receita.fatias) || 1, pesoFinalKg);

  return {
    massas: massas.itens,
    recheios: recheios.itens,
    coberturas: coberturas.itens,
    custoMassa,
    custoRecheio,
    custoCobertura,
    custoIndiretosManual,
    automaticos,
    custoIndiretos,
    custoTotal,
    pesoFinalKg,
    ...pricing,
  };
}

export function formatBRL(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatPercent(value) {
  const n = Number(value) || 0;
  return `${n.toFixed(0)}%`;
}
