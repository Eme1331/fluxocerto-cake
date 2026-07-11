import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calcReceitaCompleta, formatBRL } from '../utils/calc';
import { Card, EmptyState } from '../components/ui';
import AgendaPedidos from '../components/AgendaPedidos';

export default function Dashboard() {
  const navigate = useNavigate();
  const usuarioNome = useStore((s) => s.usuarioNome);
  const logo = useStore((s) => s.logo);
  const massas = useStore((s) => s.massas);
  const recheios = useStore((s) => s.recheios);
  const coberturas = useStore((s) => s.coberturas);
  const materiasPrimas = useStore((s) => s.materiasPrimas);
  const receitas = useStore((s) => s.receitas);
  const pedidos = useStore((s) => s.pedidos);
  const custosIndiretosPadrao = useStore((s) => s.custosIndiretosPadrao);
  const valoresOcultos = useStore((s) => s.valoresOcultos);
  const toggleValoresOcultos = useStore((s) => s.toggleValoresOcultos);
  const temPedidosPendentes = pedidos.some((p) => p.status === 'Pendente');
  const v = (valor) => (valoresOcultos ? '••••••' : formatBRL(valor));

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  const analisadas = useMemo(() => {
    const listas = { massas, recheios, coberturas, materiasPrimas, custosIndiretosPadrao };
    return receitas.map((r) => ({ receita: r, calc: calcReceitaCompleta(r, listas) }));
  }, [receitas, massas, recheios, coberturas, materiasPrimas, custosIndiretosPadrao]);

  const totalReceitas = analisadas.length;
  const lucroMedio = totalReceitas
    ? analisadas.reduce((acc, a) => acc + a.calc.lucroTotal, 0) / totalReceitas
    : 0;
  const custoMedio = totalReceitas
    ? analisadas.reduce((acc, a) => acc + a.calc.custoTotal, 0) / totalReceitas
    : 0;

  const maisLucrativa = analisadas.length
    ? analisadas.reduce((a, b) => (b.calc.lucroTotal > a.calc.lucroTotal ? b : a))
    : null;
  const menosLucrativa = analisadas.length
    ? analisadas.reduce((a, b) => (b.calc.lucroTotal < a.calc.lucroTotal ? b : a))
    : null;

  const totalPedidos = pedidos
    .filter((p) => p.status !== 'Cancelado')
    .reduce((acc, p) => acc + (Number(p.valor) || 0), 0);

  return (
    <div className="px-5 pt-7">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-primary/25 flex items-center justify-center text-2xl overflow-hidden shrink-0">
          {logo ? <img src={logo} alt="" className="w-full h-full object-cover" /> : '🎂'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-light">{saudacao},</p>
          <h1 className="text-lg font-bold text-text truncate">{usuarioNome}</h1>
        </div>
        <button
          onClick={() => navigate('/pedidos')}
          className="relative w-11 h-11 flex items-center justify-center rounded-full bg-white shadow-sm text-accent text-xl shrink-0 active:scale-95 transition"
        >
          🔔
          {temPedidosPendentes && (
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-danger" />
          )}
        </button>
      </div>

      <Card
        className="!p-5 text-white mb-5"
        style={{ background: 'linear-gradient(135deg, var(--fc-primary), var(--fc-primary-dark))' }}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium opacity-90">Resumo financeiro</p>
          <button
            onClick={toggleValoresOcultos}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-sm active:scale-95 transition"
          >
            {valoresOcultos ? '🙈' : '👁️'}
          </button>
        </div>
        <p className="text-2xl font-extrabold mb-3">{v(lucroMedio)} <span className="text-sm font-medium opacity-90">lucro médio/receita</span></p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/20 rounded-2xl px-2 py-2">
            <p className="text-[10px] opacity-90">Custo médio</p>
            <p className="text-sm font-bold">{v(custoMedio)}</p>
          </div>
          <div className="bg-white/20 rounded-2xl px-2 py-2">
            <p className="text-[10px] opacity-90">Receitas</p>
            <p className="text-sm font-bold">{totalReceitas}</p>
          </div>
          <div className="bg-white/20 rounded-2xl px-2 py-2">
            <p className="text-[10px] opacity-90">Pedidos</p>
            <p className="text-sm font-bold">{pedidos.length ? v(totalPedidos) : '—'}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'Massas', value: massas.length, icon: '🍰' },
          { label: 'Recheios', value: recheios.length, icon: '🍯' },
          { label: 'Coberturas', value: coberturas.length, icon: '🎨' },
        ].map((item) => (
          <div key={item.label} className="relative bg-accent-light/40 rounded-2xl px-3 py-3 overflow-hidden">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">{item.label}</p>
            <p className="text-xl font-extrabold text-text">{item.value}</p>
            <span className="absolute -bottom-1 -right-1 text-2xl opacity-70">{item.icon}</span>
          </div>
        ))}
      </div>

      <AgendaPedidos />

      {!totalReceitas ? (
        <EmptyState
          icon="🎂"
          title="Nenhuma receita ainda"
          subtitle="Cadastre massas, recheios e coberturas, depois monte sua primeira receita."
        />
      ) : (
        <div className="space-y-3">
          {maisLucrativa && (
            <Card className="flex items-center gap-3" onClick={() => navigate(`/receitas/${maisLucrativa.receita.id}`)}>
              <div className="w-12 h-12 rounded-2xl bg-success/15 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                {maisLucrativa.receita.foto ? (
                  <img src={maisLucrativa.receita.foto} className="w-full h-full object-cover" alt="" />
                ) : '🏆'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-success uppercase tracking-wide">Mais lucrativa</p>
                <p className="font-bold text-text truncate">{maisLucrativa.receita.nome || 'Sem nome'}</p>
                <p className="text-xs text-text-light">Lucro: {v(maisLucrativa.calc.lucroTotal)}</p>
              </div>
            </Card>
          )}
          {menosLucrativa && menosLucrativa.receita.id !== maisLucrativa?.receita.id && (
            <Card className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-danger/15 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                {menosLucrativa.receita.foto ? (
                  <img src={menosLucrativa.receita.foto} className="w-full h-full object-cover" alt="" />
                ) : '📉'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-danger uppercase tracking-wide">Menos lucrativa</p>
                <p className="font-bold text-text truncate">{menosLucrativa.receita.nome || 'Sem nome'}</p>
                <p className="text-xs text-text-light">Lucro: {v(menosLucrativa.calc.lucroTotal)}</p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
