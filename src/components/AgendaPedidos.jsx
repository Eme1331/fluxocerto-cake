import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Button } from './ui';
import { DIAS_SEMANA, getDiasDaSemana, formatMesAno, toISODate, isMesmoDia } from '../utils/date';
import { STATUS_STYLES } from '../utils/pedidos';

export default function AgendaPedidos() {
  const navigate = useNavigate();
  const pedidos = useStore((s) => s.pedidos);
  const [selecionado, setSelecionado] = useState(() => new Date());

  const dias = useMemo(() => getDiasDaSemana(selecionado), [selecionado]);

  const pedidosPorDia = useMemo(() => {
    const map = {};
    for (const p of pedidos) {
      map[p.data] = (map[p.data] || 0) + 1;
    }
    return map;
  }, [pedidos]);

  const pedidosDoDia = useMemo(() => {
    const iso = toISODate(selecionado);
    return pedidos
      .filter((p) => p.data === iso)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [pedidos, selecionado]);

  const mudarSemana = (delta) => {
    const nova = new Date(selecionado);
    nova.setDate(nova.getDate() + delta * 7);
    setSelecionado(nova);
  };

  const hoje = new Date();

  return (
    <Card className="!p-5 mb-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-2xl bg-primary/20 flex items-center justify-center text-xl shrink-0">
          🗓️
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-text leading-tight">Agenda de Pedidos</h2>
          <p className="text-xs text-text-light">Acompanhe e organize seus pedidos</p>
        </div>
        <Button
          className="!px-3 !py-2 text-xs shrink-0"
          onClick={() => navigate('/pedidos/novo', { state: { data: toISODate(selecionado) } })}
        >
          ➕ Novo pedido
        </Button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => mudarSemana(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary-dark active:scale-95 transition"
        >
          ‹
        </button>
        <span className="text-sm font-bold text-text">{formatMesAno(dias[3])}</span>
        <button
          onClick={() => mudarSemana(1)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary-dark active:scale-95 transition"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {dias.map((dia, i) => {
          const iso = toISODate(dia);
          const isSelecionado = isMesmoDia(dia, selecionado);
          const isHoje = isMesmoDia(dia, hoje);
          const temPedido = !!pedidosPorDia[iso];
          return (
            <button key={iso} onClick={() => setSelecionado(dia)} className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-text-light">{DIAS_SEMANA[i]}</span>
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition ${
                  isSelecionado
                    ? 'bg-primary-dark text-white'
                    : isHoje
                    ? 'text-primary-dark'
                    : 'text-text'
                }`}
              >
                {dia.getDate()}
              </span>
              <span
                className={`w-1 h-1 rounded-full ${
                  temPedido ? (isSelecionado ? 'bg-primary-dark' : 'bg-danger') : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>

      {!pedidosDoDia.length ? (
        <p className="text-center text-xs text-text-light py-4">Nenhum pedido para este dia.</p>
      ) : (
        <div className="divide-y divide-accent-light/40">
          {pedidosDoDia.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/pedidos/${p.id}`)}
              className="flex items-center gap-3 py-3 w-full text-left"
            >
              <div className="shrink-0 text-center">
                <p className="text-sm font-bold text-primary-dark leading-none">{p.hora}</p>
                <p className="text-[10px] text-text-light mt-0.5">{p.tipo}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text text-sm truncate">{p.produtoNome || 'Sem nome'}</p>
                <p className="text-xs text-text-light truncate">Cliente: {p.cliente || '—'}</p>
              </div>
              <span className={`text-[11px] font-semibold px-3 py-1 rounded-full shrink-0 ${STATUS_STYLES[p.status] || ''}`}>
                {p.status}
              </span>
              <span className="text-primary-dark shrink-0">›</span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate('/pedidos')}
        className="w-full text-center text-sm font-semibold text-primary-dark mt-3 pt-3 border-t border-accent-light/40"
      >
        Ver todos os pedidos 🗓️
      </button>
    </Card>
  );
}
