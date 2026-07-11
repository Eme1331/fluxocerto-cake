import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calcReceitaCompleta, formatBRL } from '../utils/calc';
import { Card, Button, EmptyState } from '../components/ui';

export default function Receitas() {
  const navigate = useNavigate();
  const receitas = useStore((s) => s.receitas);
  const massas = useStore((s) => s.massas);
  const recheios = useStore((s) => s.recheios);
  const coberturas = useStore((s) => s.coberturas);
  const materiasPrimas = useStore((s) => s.materiasPrimas);
  const custosIndiretosPadrao = useStore((s) => s.custosIndiretosPadrao);
  const listas = { massas, recheios, coberturas, materiasPrimas, custosIndiretosPadrao };

  return (
    <div className="px-5 pt-7">
      <h1 className="text-lg font-bold text-text mb-1">Receitas (Bolos)</h1>
      <p className="text-xs text-text-light mb-4">Monte um bolo combinando massa, recheio e cobertura já cadastrados.</p>

      <Button className="w-full mb-4" onClick={() => navigate('/receitas/novo')}>
        ➕ Montar novo bolo
      </Button>

      {!receitas.length ? (
        <EmptyState icon="🎂" title="Nenhuma receita montada" subtitle="Combine seus componentes para calcular o preço ideal." />
      ) : (
        <div className="space-y-3 pb-4">
          {receitas.map((r) => {
            const calc = calcReceitaCompleta(r, listas);
            return (
              <Card key={r.id} className="flex items-center gap-3" onClick={() => navigate(`/receitas/${r.id}`)}>
                <div className="w-14 h-14 rounded-2xl bg-primary/15 overflow-hidden flex items-center justify-center text-2xl shrink-0">
                  {r.foto ? <img src={r.foto} className="w-full h-full object-cover" alt="" /> : '🎂'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text truncate">{r.nome || 'Sem nome'}</p>
                  <p className="text-xs text-text-light truncate">{r.categoria || '—'} · {r.fatias} fatias</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-text-light">Preço ideal</p>
                  <p className="font-bold text-primary-dark text-sm">{formatBRL(calc.precoIdeal)}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
