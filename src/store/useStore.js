import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';

const emptyMateriaPrima = () => ({
  id: uuid(),
  nome: '',
  categoria: '',
  precoCompra: '',
  qtdCompra: '',
  unidadeCompra: 'kg',
  createdAt: Date.now(),
});

const emptyIngrediente = () => ({
  id: uuid(),
  materiaPrimaId: '',
  quantidadeUtilizada: '',
});

const emptyComponente = (extra = {}) => ({
  id: uuid(),
  nome: '',
  categoria: '',
  foto: '',
  descricao: '',
  rendimento: '',
  ingredientes: [],
  createdAt: Date.now(),
  ...extra,
});

const emptyPedido = (extra = {}) => ({
  id: uuid(),
  produtoNome: '',
  receitaId: '',
  cliente: '',
  data: new Date().toISOString().slice(0, 10),
  hora: '09:00',
  tipo: 'Entrega',
  status: 'Pendente',
  valor: '',
  observacoes: '',
  createdAt: Date.now(),
  ...extra,
});

const emptyReceita = () => ({
  id: uuid(),
  nome: '',
  foto: '',
  categoria: '',
  pesoFinal: '',
  andares: 1,
  fatias: 12,
  tempoPreparo: '',
  tempoForno: '',
  tempoDecoracao: '',
  massas: [],
  recheios: [],
  coberturas: [],
  margem: 60,
  custosExtras: {
    embalagem: '',
    topo: '',
    caixa: '',
    fita: '',
    outras: '',
  },
  createdAt: Date.now(),
});

// v3 -> v4: ingredientes deixam de guardar nome/preço/unidade embutidos e passam
// a referenciar um catálogo de matérias-primas (materiaPrimaId). Esta migração
// extrai uma matéria-prima para cada ingrediente já cadastrado, preservando os
// dados existentes em vez de resetar tudo.
function migrarIngredientesParaMateriaPrima(persisted) {
  const materiasPrimas = [];
  const indice = new Map();

  function obterOuCriarMateriaPrima(ing) {
    const chave = `${ing.nome}|${ing.precoCompra}|${ing.qtdCompra}|${ing.unidadeCompra}`;
    if (indice.has(chave)) return indice.get(chave);
    const id = uuid();
    materiasPrimas.push({
      id,
      nome: ing.nome || 'Sem nome',
      categoria: '',
      precoCompra: ing.precoCompra || '',
      qtdCompra: ing.qtdCompra || '',
      unidadeCompra: ing.unidadeCompra || 'kg',
      createdAt: Date.now(),
    });
    indice.set(chave, id);
    return id;
  }

  function migrarLista(lista) {
    return (lista || []).map((comp) => ({
      ...comp,
      ingredientes: (comp.ingredientes || []).map((ing) => ({
        id: ing.id,
        materiaPrimaId: ing.materiaPrimaId || obterOuCriarMateriaPrima(ing),
        quantidadeUtilizada: ing.quantidadeUtilizada || '',
      })),
    }));
  }

  persisted.massas = migrarLista(persisted.massas);
  persisted.recheios = migrarLista(persisted.recheios);
  persisted.coberturas = migrarLista(persisted.coberturas);
  persisted.materiasPrimas = [...(persisted.materiasPrimas || []), ...materiasPrimas];
  persisted.pedidos = (persisted.pedidos || []).map((p) => ({ ...p, valor: p.valor ?? '' }));
  persisted.valoresOcultos = persisted.valoresOcultos ?? false;
  return persisted;
}

export const useStore = create(
  persist(
    (set, get) => ({
      usuarioNome: 'Confeiteiro(a)',
      logo: '',
      tema: {
        primary: '#F3B6C5',
        primaryDark: '#E393AA',
        accent: '#B08968',
        bg: '#FFF8F6',
      },
      custosIndiretosPadrao: {
        gasPorMin: '',
        energiaPorMin: '',
        aguaPorMin: '',
        maoDeObraPorHora: '',
        despesasFixasPorMes: '',
        taxaCartao: '',
        taxaIfood: '',
        impostoPercent: '',
      },
      valoresOcultos: false,

      materiasPrimas: [],
      massas: [],
      recheios: [],
      coberturas: [],
      receitas: [],
      pedidos: [],

      setUsuarioNome: (nome) => set({ usuarioNome: nome }),
      setLogo: (logo) => set({ logo }),
      setTema: (patch) => set((s) => ({ tema: { ...s.tema, ...patch } })),
      setCustosIndiretosPadrao: (patch) =>
        set((s) => ({ custosIndiretosPadrao: { ...s.custosIndiretosPadrao, ...patch } })),
      toggleValoresOcultos: () => set((s) => ({ valoresOcultos: !s.valoresOcultos })),

      novaMateriaPrima: emptyMateriaPrima,
      novoIngrediente: emptyIngrediente,
      novoComponente: emptyComponente,
      novaReceita: emptyReceita,
      novoPedido: emptyPedido,

      // Matérias-primas
      addMateriaPrima: (mp) => set((s) => ({ materiasPrimas: [...s.materiasPrimas, mp] })),
      updateMateriaPrima: (id, patch) =>
        set((s) => ({ materiasPrimas: s.materiasPrimas.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      removeMateriaPrima: (id) => set((s) => ({ materiasPrimas: s.materiasPrimas.filter((m) => m.id !== id) })),

      // Massas
      addMassa: (massa) => set((s) => ({ massas: [...s.massas, massa] })),
      updateMassa: (id, patch) =>
        set((s) => ({ massas: s.massas.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      removeMassa: (id) => set((s) => ({ massas: s.massas.filter((m) => m.id !== id) })),

      // Recheios
      addRecheio: (recheio) => set((s) => ({ recheios: [...s.recheios, recheio] })),
      updateRecheio: (id, patch) =>
        set((s) => ({ recheios: s.recheios.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      removeRecheio: (id) => set((s) => ({ recheios: s.recheios.filter((m) => m.id !== id) })),

      // Coberturas
      addCobertura: (cobertura) => set((s) => ({ coberturas: [...s.coberturas, cobertura] })),
      updateCobertura: (id, patch) =>
        set((s) => ({ coberturas: s.coberturas.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      removeCobertura: (id) => set((s) => ({ coberturas: s.coberturas.filter((m) => m.id !== id) })),

      // Receitas (bolos montados)
      addReceita: (receita) => set((s) => ({ receitas: [...s.receitas, receita] })),
      updateReceita: (id, patch) =>
        set((s) => ({ receitas: s.receitas.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      removeReceita: (id) => set((s) => ({ receitas: s.receitas.filter((m) => m.id !== id) })),

      // Pedidos (agenda)
      addPedido: (pedido) => set((s) => ({ pedidos: [...s.pedidos, pedido] })),
      updatePedido: (id, patch) =>
        set((s) => ({ pedidos: s.pedidos.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removePedido: (id) => set((s) => ({ pedidos: s.pedidos.filter((p) => p.id !== id) })),

      resetAll: () =>
        set({ materiasPrimas: [], massas: [], recheios: [], coberturas: [], receitas: [], pedidos: [] }),
    }),
    {
      name: 'fluxocerto-cake-storage',
      version: 4,
      migrate: (persisted, version) => {
        if (!persisted) return persisted;
        if (version < 4) return migrarIngredientesParaMateriaPrima(persisted);
        return persisted;
      },
    }
  )
);
