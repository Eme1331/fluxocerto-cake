import { Input, Select, Field, IconButton } from './ui';
import { UNIT_OPTIONS, calcIngredientCost, formatBRL } from '../utils/calc';

export default function IngredientesList({ ingredientes, onChange, listRef, materiasPrimas = [] }) {
  const update = (id, patch) => {
    onChange(ingredientes.map((ing) => (ing.id === id ? { ...ing, ...patch } : ing)));
  };
  const remove = (id) => {
    onChange(ingredientes.filter((ing) => ing.id !== id));
  };

  if (!ingredientes.length) {
    return (
      <p className="text-center text-sm text-text-light py-6">
        Nenhum ingrediente adicionado ainda.
      </p>
    );
  }

  return (
    <div ref={listRef} className="space-y-3">
      {ingredientes.map((ing, idx) => {
        const { custoUtilizado, materiaPrima } = calcIngredientCost(ing, materiasPrimas);
        const unidadeLabel = materiaPrima
          ? UNIT_OPTIONS.find((u) => u.value === materiaPrima.unidadeCompra)?.label || materiaPrima.unidadeCompra
          : '';
        return (
          <div key={ing.id} data-ingrediente-item className="rounded-2xl bg-accent-light/25 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-accent">Ingrediente {idx + 1}</span>
              <IconButton onClick={() => remove(ing.id)} className="!w-7 !h-7 !text-sm !bg-danger/15 !text-danger">
                ✕
              </IconButton>
            </div>

            <Field label="Matéria-prima">
              <Select
                value={ing.materiaPrimaId}
                onChange={(e) => update(ing.id, { materiaPrimaId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {materiasPrimas.map((mp) => (
                  <option key={mp.id} value={mp.id}>{mp.nome || 'Sem nome'}</option>
                ))}
              </Select>
            </Field>

            {materiaPrima && (
              <p className="text-[11px] text-text-light -mt-2 mb-3 ml-1">
                {formatBRL(materiaPrima.precoCompra)} / {materiaPrima.qtdCompra}{unidadeLabel}
              </p>
            )}

            <Field label={unidadeLabel ? `Qtd. utilizada (${unidadeLabel})` : 'Qtd. utilizada'}>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={ing.quantidadeUtilizada}
                onChange={(e) => update(ing.id, { quantidadeUtilizada: e.target.value })}
                disabled={!ing.materiaPrimaId}
              />
            </Field>

            <div className="flex justify-end mt-1">
              <span className="text-xs font-bold text-primary-dark bg-primary/15 rounded-full px-3 py-1">
                Custo: {formatBRL(custoUtilizado)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
