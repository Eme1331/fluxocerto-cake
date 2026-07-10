import { Input, Select, Field, IconButton } from './ui';
import { UNIT_OPTIONS, calcIngredientCost, formatBRL } from '../utils/calc';

export default function IngredientesList({ ingredientes, onChange, listRef }) {
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
        const { custoUtilizado } = calcIngredientCost(ing);
        const unidadeLabel = UNIT_OPTIONS.find((u) => u.value === ing.unidadeCompra)?.label || ing.unidadeCompra;
        return (
          <div key={ing.id} data-ingrediente-item className="rounded-2xl bg-accent-light/25 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-accent">Ingrediente {idx + 1}</span>
              <IconButton onClick={() => remove(ing.id)} className="!w-7 !h-7 !text-sm !bg-danger/15 !text-danger">
                ✕
              </IconButton>
            </div>
            <Field>
              <Input
                placeholder="Nome do ingrediente"
                value={ing.nome}
                onChange={(e) => update(ing.id, { nome: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Preço pago (R$)">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={ing.precoCompra}
                  onChange={(e) => update(ing.id, { precoCompra: e.target.value })}
                />
              </Field>
              <Field label="Qtd. do pacote">
                <div className="flex gap-1">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1"
                    value={ing.qtdCompra}
                    onChange={(e) => update(ing.id, { qtdCompra: e.target.value })}
                  />
                  <Select
                    value={ing.unidadeCompra}
                    onChange={(e) => update(ing.id, { unidadeCompra: e.target.value })}
                    className="!w-20 shrink-0"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </Field>
              <Field label={`Qtd. utilizada (${unidadeLabel})`}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={ing.quantidadeUtilizada}
                  onChange={(e) => update(ing.id, { quantidadeUtilizada: e.target.value })}
                />
              </Field>
            </div>
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
