import { useState } from 'react';
import { Card, Field, Input, Select } from './ui';
import { calcReceitaCompleta, formatBRL } from '../utils/calc';

export default function CalculadoraPorcao({ receitas, listas }) {
  const [receitaId, setReceitaId] = useState('');
  const [pesoPorcao, setPesoPorcao] = useState('');

  const receita = receitas.find((r) => r.id === receitaId);
  const calc = receita ? calcReceitaCompleta(receita, listas) : null;
  const peso = Number(pesoPorcao) || 0;
  const pesoFinalG = calc ? calc.pesoFinalKg * 1000 : 0;
  const valorPorcao = calc && peso > 0 ? (calc.precoIdeal / pesoFinalG) * peso : 0;
  const rendimento = calc && peso > 0 ? Math.floor(pesoFinalG / peso) : 0;
  const temResultado = receita && peso > 0;

  return (
    <Card className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-2xl bg-primary/20 flex items-center justify-center text-lg shrink-0">📏</div>
        <div>
          <p className="text-sm font-bold text-text">Calculadora de porção</p>
          <p className="text-[11px] text-text-light">Preço e rendimento por fatia</p>
        </div>
      </div>

      <Field label="Receita">
        <Select value={receitaId} onChange={(e) => setReceitaId(e.target.value)}>
          <option value="">Selecione...</option>
          {receitas.map((r) => (
            <option key={r.id} value={r.id}>{r.nome || 'Sem nome'}</option>
          ))}
        </Select>
      </Field>

      <Field label="Peso da porção (g)">
        <Input
          type="number"
          min="0"
          value={pesoPorcao}
          onChange={(e) => setPesoPorcao(e.target.value)}
          placeholder="Ex: 100"
        />
      </Field>

      <div
        className="rounded-2xl p-3 flex gap-2 text-white"
        style={{ background: 'linear-gradient(135deg, var(--fc-primary), var(--fc-primary-dark))' }}
      >
        <div className="flex-1 bg-white/20 rounded-xl px-3 py-2">
          <p className="text-[10px] opacity-90">Valor da porção</p>
          <p className="font-bold">{temResultado ? formatBRL(valorPorcao) : '—'}</p>
        </div>
        <div className="flex-1 bg-white/20 rounded-xl px-3 py-2">
          <p className="text-[10px] opacity-90">Rendimento</p>
          <p className="font-bold">{temResultado ? `${rendimento} porções` : '—'}</p>
        </div>
      </div>
    </Card>
  );
}
