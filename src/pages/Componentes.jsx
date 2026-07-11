import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calcComponentTotals, formatBRL, UNIT_OPTIONS } from '../utils/calc';
import { Card, Button, EmptyState } from '../components/ui';

const TABS = [
  { key: 'massa', label: '🍰 Massa', listKey: 'massas' },
  { key: 'recheio', label: '🍯 Recheio', listKey: 'recheios' },
  { key: 'cobertura', label: '🎨 Cobertura', listKey: 'coberturas' },
  { key: 'materiaprima', label: '🌾 Matéria-prima', listKey: 'materiasPrimas' },
];

export default function Componentes() {
  const [tab, setTab] = useState('massa');
  const navigate = useNavigate();
  const massas = useStore((s) => s.massas);
  const recheios = useStore((s) => s.recheios);
  const coberturas = useStore((s) => s.coberturas);
  const materiasPrimas = useStore((s) => s.materiasPrimas);

  const dados = { massas, recheios, coberturas, materiasPrimas };
  const atual = TABS.find((t) => t.key === tab);
  const lista = dados[atual.listKey];
  const isMateriaPrima = tab === 'materiaprima';

  const caminho = (id) => (isMateriaPrima ? `/materia-prima/${id}` : `/componentes/${tab}/${id}`);

  return (
    <div>
      <div className="px-5 pt-7 pb-2">
        <h1 className="text-lg font-bold text-text mb-1">Componentes</h1>
        <p className="text-xs text-text-light mb-4">Cadastre massas, recheios e coberturas para reutilizar em suas receitas.</p>

        <div className="flex bg-accent-light/30 rounded-2xl p-1 gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 text-[11px] font-semibold py-2 rounded-xl transition ${
                tab === t.key ? 'bg-white text-primary-dark shadow-sm' : 'text-text-light'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        <Button className="w-full mb-4" onClick={() => navigate(caminho('novo'))}>
          ➕ Adicionar {atual.label.replace(/^\S+\s/, '')}
        </Button>

        {!lista.length ? (
          <EmptyState icon="🥣" title="Nada por aqui ainda" subtitle="Toque no botão acima para cadastrar." />
        ) : (
          <div className="space-y-3 pb-4">
            {lista.map((item) => {
              if (isMateriaPrima) {
                const unidade = UNIT_OPTIONS.find((u) => u.value === item.unidadeCompra)?.label || item.unidadeCompra;
                return (
                  <Card key={item.id} className="flex items-center gap-3" onClick={() => navigate(caminho(item.id))}>
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center text-2xl shrink-0">
                      🌾
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-text truncate">{item.nome || 'Sem nome'}</p>
                      <p className="text-xs text-text-light truncate">{item.categoria || '—'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-text-light">Preço</p>
                      <p className="font-bold text-primary-dark text-sm">
                        {formatBRL(item.precoCompra)} / {item.qtdCompra}{unidade}
                      </p>
                    </div>
                  </Card>
                );
              }
              const totals = calcComponentTotals(item, materiasPrimas);
              return (
                <Card
                  key={item.id}
                  className="flex items-center gap-3"
                  onClick={() => navigate(caminho(item.id))}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/15 overflow-hidden flex items-center justify-center text-2xl shrink-0">
                    {item.foto ? <img src={item.foto} className="w-full h-full object-cover" alt="" /> : '🧁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-text truncate">{item.nome || 'Sem nome'}</p>
                    <p className="text-xs text-text-light truncate">{item.categoria || '—'} · {item.ingredientes.length} ingrediente(s)</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-text-light">Custo</p>
                    <p className="font-bold text-primary-dark text-sm">{formatBRL(totals.custoTotal)}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
