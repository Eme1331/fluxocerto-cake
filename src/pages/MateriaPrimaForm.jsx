import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Field, Input, Select, Button } from '../components/ui';
import Header from '../components/Header';
import { UNIT_OPTIONS, toBase, formatBRL } from '../utils/calc';

const CATEGORIAS = [
  'Farinhas', 'Açúcares', 'Laticínios', 'Ovos', 'Chocolates', 'Frutas',
  'Fermentos e aditivos', 'Embalagens', 'Outros',
];

export default function MateriaPrimaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNovo = id === 'novo';

  const materiasPrimas = useStore((s) => s.materiasPrimas);
  const novaMateriaPrima = useStore((s) => s.novaMateriaPrima);
  const addMateriaPrima = useStore((s) => s.addMateriaPrima);
  const updateMateriaPrima = useStore((s) => s.updateMateriaPrima);
  const removeMateriaPrima = useStore((s) => s.removeMateriaPrima);

  const existente = useMemo(() => materiasPrimas.find((m) => m.id === id), [materiasPrimas, id]);
  const [form, setForm] = useState(() => existente || novaMateriaPrima());

  useEffect(() => {
    if (existente) setForm(existente);
  }, [existente]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const custoPorBase = useMemo(() => {
    const preco = Number(form.precoCompra) || 0;
    const qtdBase = toBase(form.qtdCompra, form.unidadeCompra) || 1;
    return preco / qtdBase;
  }, [form.precoCompra, form.qtdCompra, form.unidadeCompra]);

  const unidadeBase = form.unidadeCompra === 'kg' || form.unidadeCompra === 'g' ? 'g'
    : form.unidadeCompra === 'l' || form.unidadeCompra === 'ml' ? 'ml'
    : 'und';

  const salvar = () => {
    if (isNovo) addMateriaPrima(form);
    else updateMateriaPrima(id, form);
    navigate('/componentes');
  };

  const excluir = () => {
    removeMateriaPrima(id);
    navigate('/componentes');
  };

  return (
    <div>
      <Header title={isNovo ? 'Nova Matéria-prima' : 'Editar Matéria-prima'} onBack={true} />
      <div className="px-5">
        <Field label="Nome">
          <Input value={form.nome} onChange={(e) => set({ nome: e.target.value })} placeholder="Ex: Farinha de trigo" />
        </Field>

        <Field label="Categoria">
          <Select value={form.categoria} onChange={(e) => set({ categoria: e.target.value })}>
            <option value="">Selecione...</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Preço pago (R$)">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={form.precoCompra}
              onChange={(e) => set({ precoCompra: e.target.value })}
            />
          </Field>
          <Field label="Qtd. do pacote">
            <div className="flex gap-1">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="1"
                value={form.qtdCompra}
                onChange={(e) => set({ qtdCompra: e.target.value })}
              />
              <Select
                value={form.unidadeCompra}
                onChange={(e) => set({ unidadeCompra: e.target.value })}
                className="!w-20 shrink-0"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </Select>
            </div>
          </Field>
        </div>

        <Card className="mt-3 !bg-accent-light/40 flex items-center justify-between">
          <p className="text-xs text-text-light">Custo por {unidadeBase}</p>
          <p className="font-bold text-primary-dark">{formatBRL(custoPorBase)}</p>
        </Card>

        <div className="flex gap-3 mt-5 mb-6">
          {!isNovo && (
            <Button variant="danger" className="flex-1" onClick={excluir}>
              Excluir
            </Button>
          )}
          <Button className="flex-1" onClick={salvar}>
            Salvar Matéria-prima
          </Button>
        </div>
      </div>
    </div>
  );
}
