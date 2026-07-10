import { useState } from 'react';
import { Select, Input, Button, IconButton, Field } from './ui';
import { calcComponentTotals, formatBRL } from '../utils/calc';

export default function ComponenteSelector({ label, opcoes, selecionados, onChange }) {
  const [escolhido, setEscolhido] = useState('');

  const disponiveis = opcoes.filter((o) => !selecionados.some((s) => s.componenteId === o.id));

  const adicionar = () => {
    if (!escolhido) return;
    onChange([...selecionados, { componenteId: escolhido, quantidade: 1 }]);
    setEscolhido('');
  };

  const atualizarQtd = (componenteId, quantidade) => {
    onChange(
      selecionados.map((s) => (s.componenteId === componenteId ? { ...s, quantidade } : s))
    );
  };

  const remover = (componenteId) => {
    onChange(selecionados.filter((s) => s.componenteId !== componenteId));
  };

  return (
    <Field label={label}>
      <div className="flex gap-2 mb-2">
        <Select value={escolhido} onChange={(e) => setEscolhido(e.target.value)} className="flex-1">
          <option value="">Selecione...</option>
          {disponiveis.map((o) => (
            <option key={o.id} value={o.id}>{o.nome || 'Sem nome'}</option>
          ))}
        </Select>
        <Button variant="ghost" className="!px-3 !py-0 shrink-0" onClick={adicionar}>
          ➕
        </Button>
      </div>

      {!!selecionados.length && (
        <div className="space-y-2">
          {selecionados.map((sel) => {
            const componente = opcoes.find((o) => o.id === sel.componenteId);
            if (!componente) return null;
            const { custoTotal } = calcComponentTotals(componente);
            return (
              <div key={sel.componenteId} className="flex items-center gap-2 bg-accent-light/25 rounded-2xl px-3 py-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text truncate">{componente.nome || 'Sem nome'}</p>
                  <p className="text-[11px] text-text-light">{formatBRL(custoTotal)} cada</p>
                </div>
                <Input
                  type="number"
                  min="1"
                  value={sel.quantidade}
                  onChange={(e) => atualizarQtd(sel.componenteId, e.target.value)}
                  className="!w-16 !py-1.5 text-center shrink-0"
                />
                <IconButton
                  onClick={() => remover(sel.componenteId)}
                  className="!w-7 !h-7 !text-sm !bg-danger/15 !text-danger shrink-0"
                >
                  ✕
                </IconButton>
              </div>
            );
          })}
        </div>
      )}
    </Field>
  );
}
