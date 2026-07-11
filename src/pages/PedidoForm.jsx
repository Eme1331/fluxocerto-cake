import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Field, Input, Select, TextArea, Button } from '../components/ui';
import Header from '../components/Header';
import { STATUS_OPTIONS, TIPO_OPTIONS } from '../utils/pedidos';
import { calcReceitaCompleta } from '../utils/calc';

export default function PedidoForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isNovo = id === 'novo';

  const pedidos = useStore((s) => s.pedidos);
  const receitas = useStore((s) => s.receitas);
  const massas = useStore((s) => s.massas);
  const recheios = useStore((s) => s.recheios);
  const coberturas = useStore((s) => s.coberturas);
  const materiasPrimas = useStore((s) => s.materiasPrimas);
  const custosIndiretosPadrao = useStore((s) => s.custosIndiretosPadrao);
  const novoPedido = useStore((s) => s.novoPedido);
  const addPedido = useStore((s) => s.addPedido);
  const updatePedido = useStore((s) => s.updatePedido);
  const removePedido = useStore((s) => s.removePedido);

  const existente = useMemo(() => pedidos.find((p) => p.id === id), [pedidos, id]);
  const [form, setForm] = useState(() => existente || novoPedido(
    location.state?.data ? { data: location.state.data } : {}
  ));

  useEffect(() => {
    if (existente) setForm(existente);
  }, [existente]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const salvar = () => {
    if (isNovo) addPedido(form);
    else updatePedido(id, form);
    navigate(-1);
  };

  const excluir = () => {
    removePedido(id);
    navigate(-1);
  };

  const selecionarReceita = (receitaId) => {
    const receita = receitas.find((r) => r.id === receitaId);
    if (!receita) {
      set({ receitaId: '' });
      return;
    }
    const listas = { massas, recheios, coberturas, materiasPrimas, custosIndiretosPadrao };
    const calc = calcReceitaCompleta(receita, listas);
    set({ receitaId, produtoNome: receita.nome, valor: calc.precoIdeal.toFixed(2) });
  };

  return (
    <div>
      <Header title={isNovo ? 'Novo Pedido' : 'Editar Pedido'} onBack={true} />
      <div className="px-5">
        <Field label="Receita vinculada (opcional)">
          <Select value={form.receitaId} onChange={(e) => selecionarReceita(e.target.value)}>
            <option value="">Nenhuma / produto avulso</option>
            {receitas.map((r) => (
              <option key={r.id} value={r.id}>{r.nome || 'Sem nome'}</option>
            ))}
          </Select>
        </Field>

        <Field label="Produto / descrição">
          <Input
            value={form.produtoNome}
            onChange={(e) => set({ produtoNome: e.target.value })}
            placeholder="Ex: Bolo de Aniversário"
          />
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Cliente">
            <Input value={form.cliente} onChange={(e) => set({ cliente: e.target.value })} placeholder="Nome do cliente" />
          </Field>
          <Field label="Valor (R$)">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.valor}
              onChange={(e) => set({ valor: e.target.value })}
              placeholder="0,00"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Data">
            <Input type="date" value={form.data} onChange={(e) => set({ data: e.target.value })} />
          </Field>
          <Field label="Hora">
            <Input type="time" value={form.hora} onChange={(e) => set({ hora: e.target.value })} />
          </Field>
          <Field label="Tipo">
            <Select value={form.tipo} onChange={(e) => set({ tipo: e.target.value })}>
              {TIPO_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => set({ status: e.target.value })}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Observações">
          <TextArea rows={3} value={form.observacoes} onChange={(e) => set({ observacoes: e.target.value })} placeholder="Detalhes, alergias, recado..." />
        </Field>

        <Card className="!bg-accent-light/20 mt-2">
          <p className="text-xs text-text-light">
            Dica: vincule uma receita já cadastrada para manter o histórico de pedidos organizado por produto.
          </p>
        </Card>

        <div className="flex gap-3 mt-5 mb-6">
          {!isNovo && (
            <Button variant="danger" className="flex-1" onClick={excluir}>
              Excluir
            </Button>
          )}
          <Button className="flex-1" onClick={salvar}>
            Salvar Pedido
          </Button>
        </div>
      </div>
    </div>
  );
}
