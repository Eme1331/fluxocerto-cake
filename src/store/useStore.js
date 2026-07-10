import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';

const emptyIngrediente = () => ({
  id: uuid(),
  nome: '',
  precoCompra: '',
  qtdCompra: '',
  unidadeCompra: 'kg',
  quantidadeUtilizada: '',
});

const emptyComponente = (extra = {}) => ({
  id: uuid(),
  nome: '',
  categoria: '',
  foto: '',
  descricao: '',
  rendimento: '',
  tempoPreparo: '',
  tempoForno: '',
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

      novoIngrediente: emptyIngrediente,
      novoComponente: emptyComponente,
      novaReceita: emptyReceita,
      novoPedido: emptyPedido,

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
        set({ massas: [], recheios: [], coberturas: [], receitas: [], pedidos: [] }),
    }),
    {
      name: 'fluxocerto-cake-storage',
      version: 3,
      migrate: () => ({}),
    }
  )
);
