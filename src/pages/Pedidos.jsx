import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Button, EmptyState } from '../components/ui';
import Header from '../components/Header';
import { STATUS_STYLES } from '../utils/pedidos';
import { parseISODate } from '../utils/date';

export default function Pedidos() {
  const navigate = useNavigate();
  const pedidos = useStore((s) => s.pedidos);

  const ordenados = useMemo(
    () =>
      [...pedidos].sort((a, b) => {
        const dataCmp = a.data.localeCompare(b.data);
        return dataCmp !== 0 ? dataCmp : a.hora.localeCompare(b.hora);
      }),
    [pedidos]
  );

  return (
    <div>
      <Header title="Todos os Pedidos" onBack={true} />
      <div className="px-5">
        <Button className="w-full mb-4" onClick={() => navigate('/pedidos/novo')}>
          ➕ Novo pedido
        </Button>

        {!ordenados.length ? (
          <EmptyState icon="🗓️" title="Nenhum pedido cadastrado" subtitle="Adicione pedidos e acompanhe pela agenda." />
        ) : (
          <div className="space-y-3 pb-4">
            {ordenados.map((p) => (
              <Card key={p.id} className="flex items-center gap-3" onClick={() => navigate(`/pedidos/${p.id}`)}>
                <div className="text-center shrink-0 w-14">
                  <p className="text-[11px] text-text-light">
                    {parseISODate(p.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </p>
                  <p className="text-sm font-bold text-primary-dark">{p.hora}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text truncate">{p.produtoNome || 'Sem nome'}</p>
                  <p className="text-xs text-text-light truncate">{p.cliente || '—'} · {p.tipo}</p>
                </div>
                <span className={`text-[11px] font-semibold px-3 py-1 rounded-full shrink-0 ${STATUS_STYLES[p.status] || ''}`}>
                  {p.status}
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
