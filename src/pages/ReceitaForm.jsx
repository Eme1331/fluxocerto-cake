import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Field, Input, PhotoPicker, Button, SectionTitle, StatPill } from '../components/ui';
import ComponenteSelector from '../components/ComponenteSelector';
import Header from '../components/Header';
import { calcReceitaCompleta, formatBRL, formatPercent } from '../utils/calc';

const EXTRA_LABELS = {
  embalagem: 'Embalagem',
  topo: 'Topo',
  caixa: 'Caixa',
  fita: 'Fita',
  outras: 'Outras despesas',
};

export default function ReceitaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNovo = id === 'novo';

  const receitas = useStore((s) => s.receitas);
  const massas = useStore((s) => s.massas);
  const recheios = useStore((s) => s.recheios);
  const coberturas = useStore((s) => s.coberturas);
  const materiasPrimas = useStore((s) => s.materiasPrimas);
  const custosIndiretosPadrao = useStore((s) => s.custosIndiretosPadrao);
  const novaReceita = useStore((s) => s.novaReceita);
  const addReceita = useStore((s) => s.addReceita);
  const updateReceita = useStore((s) => s.updateReceita);
  const removeReceita = useStore((s) => s.removeReceita);

  const existente = useMemo(() => receitas.find((r) => r.id === id), [receitas, id]);
  const [form, setForm] = useState(() => existente || novaReceita());

  useEffect(() => {
    if (existente) setForm(existente);
  }, [existente]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setExtra = (key, value) =>
    setForm((f) => ({ ...f, custosExtras: { ...f.custosExtras, [key]: value } }));

  const listas = { massas, recheios, coberturas, materiasPrimas, custosIndiretosPadrao };
  const calc = useMemo(
    () => calcReceitaCompleta(form, listas),
    [form, massas, recheios, coberturas, materiasPrimas, custosIndiretosPadrao]
  );

  const salvar = () => {
    if (isNovo) addReceita(form);
    else updateReceita(id, form);
    navigate('/receitas');
  };

  const excluir = () => {
    removeReceita(id);
    navigate('/receitas');
  };

  return (
    <div>
      <Header title={isNovo ? 'Montar Receita' : 'Editar Receita'} onBack={true} />
      <div className="px-5">
        <PhotoPicker value={form.foto} onChange={(foto) => set({ foto })} label="Foto do bolo" />

        <div className="mt-4">
          <Field label="Nome do bolo">
            <Input value={form.nome} onChange={(e) => set({ nome: e.target.value })} placeholder="Ex: Bolo de Chocolate com Morango" />
          </Field>
          <Field label="Categoria">
            <Input value={form.categoria} onChange={(e) => set({ categoria: e.target.value })} placeholder="Ex: Aniversário, Casamento..." />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Peso final (g)">
              <Input type="number" min="0" value={form.pesoFinal} onChange={(e) => set({ pesoFinal: e.target.value })} placeholder="0" />
            </Field>
            <Field label="Andares">
              <Input type="number" min="1" value={form.andares} onChange={(e) => set({ andares: e.target.value })} />
            </Field>
            <Field label="Fatias">
              <Input type="number" min="1" value={form.fatias} onChange={(e) => set({ fatias: e.target.value })} />
            </Field>
          </div>
          <Field label="Tempo de decoração (min)">
            <Input type="number" min="0" value={form.tempoDecoracao} onChange={(e) => set({ tempoDecoracao: e.target.value })} placeholder="0" />
          </Field>
        </div>

        <SectionTitle>Componentes</SectionTitle>
        <div className="space-y-1 mb-2">
          <ComponenteSelector
            label="Massa(s)"
            opcoes={massas}
            selecionados={form.massas}
            onChange={(massas) => set({ massas })}
            materiasPrimas={materiasPrimas}
          />
          <ComponenteSelector
            label="Recheio(s)"
            opcoes={recheios}
            selecionados={form.recheios}
            onChange={(recheios) => set({ recheios })}
            materiasPrimas={materiasPrimas}
          />
          <ComponenteSelector
            label="Cobertura(s)"
            opcoes={coberturas}
            selecionados={form.coberturas}
            onChange={(coberturas) => set({ coberturas })}
            materiasPrimas={materiasPrimas}
          />
          {(!massas.length || !recheios.length || !coberturas.length) && (
            <p className="text-xs text-text-light bg-accent-light/30 rounded-xl px-3 py-2">
              Cadastre ao menos uma massa, recheio e cobertura na aba Componentes para montar o bolo.
            </p>
          )}
        </div>

        <SectionTitle>Custos indiretos do bolo</SectionTitle>
        <Card className="grid grid-cols-2 gap-2 !bg-accent-light/20">
          {Object.entries(EXTRA_LABELS).map(([key, label]) => (
            <Field key={key} label={label}>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={form.custosExtras[key]}
                onChange={(e) => setExtra(key, e.target.value)}
              />
            </Field>
          ))}
        </Card>

        <SectionTitle>Custos automáticos (por tempo)</SectionTitle>
        <Card className="!bg-accent-light/20">
          <p className="text-[11px] text-text-light mb-3">
            Calculados a partir do tempo total registrado ({calc.automaticos.tempoTotalMin.toFixed(0)} min) e das taxas
            definidas em Configurações.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <StatPill label="Mão de obra" value={formatBRL(calc.automaticos.custoMaoDeObra)} />
            <StatPill label="Energia" value={formatBRL(calc.automaticos.custoEnergia)} />
            <StatPill label="Gás" value={formatBRL(calc.automaticos.custoGas)} />
            <StatPill label="Água" value={formatBRL(calc.automaticos.custoAgua)} />
          </div>
        </Card>

        {/* Painel central de precificação */}
        <Card
          className="mt-5 !p-5 text-white"
          style={{ background: 'linear-gradient(135deg, var(--fc-primary), var(--fc-primary-dark))' }}
        >
          <p className="text-xs font-semibold opacity-90 mb-1">Custo Total do Bolo</p>
          <p className="text-3xl font-extrabold mb-4">{formatBRL(calc.custoTotal)}</p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-white/20 rounded-2xl px-2 py-2 text-center">
              <p className="text-[10px] opacity-90">Massa(s)</p>
              <p className="text-xs font-bold">{formatBRL(calc.custoMassa)}</p>
            </div>
            <div className="bg-white/20 rounded-2xl px-2 py-2 text-center">
              <p className="text-[10px] opacity-90">Recheio(s)</p>
              <p className="text-xs font-bold">{formatBRL(calc.custoRecheio)}</p>
            </div>
            <div className="bg-white/20 rounded-2xl px-2 py-2 text-center">
              <p className="text-[10px] opacity-90">Cobertura(s)</p>
              <p className="text-xs font-bold">{formatBRL(calc.custoCobertura)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold opacity-90">Margem de lucro desejada</span>
            <div className="flex items-center gap-1 bg-white/25 rounded-xl px-2 py-1">
              <input
                type="number"
                min="0"
                max="95"
                value={form.margem}
                onChange={(e) => set({ margem: e.target.value === '' ? '' : Number(e.target.value) })}
                className="w-10 bg-transparent text-right text-sm font-bold outline-none"
              />
              <span className="text-sm font-bold">%</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            value={form.margem || 0}
            onChange={(e) => set({ margem: Number(e.target.value) })}
            className="w-full mb-4"
          />

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-white/25 rounded-2xl px-3 py-2">
              <p className="text-[10px] opacity-90">Markup</p>
              <p className="text-sm font-bold">{calc.markup.toFixed(2)}x</p>
            </div>
            <div className="bg-white/25 rounded-2xl px-3 py-2">
              <p className="text-[10px] opacity-90">Preço mínimo</p>
              <p className="text-sm font-bold">{formatBRL(calc.precoMinimo)}</p>
            </div>
            <div className="bg-white rounded-2xl px-3 py-2 col-span-2 text-primary-dark">
              <p className="text-[10px] opacity-80">Preço ideal (sugerido)</p>
              <p className="text-xl font-extrabold">{formatBRL(calc.precoIdeal)}</p>
            </div>
            <div className="bg-white/25 rounded-2xl px-3 py-2 col-span-2">
              <p className="text-[10px] opacity-90">Preço premium</p>
              <p className="text-sm font-bold">{formatBRL(calc.precoPremium)}</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-2 mt-4 mb-2">
          <StatPill label="Lucro/bolo" value={formatBRL(calc.lucroTotal)} tone="success" />
          <StatPill label="Lucro/fatia" value={formatBRL(calc.lucroPorFatia)} tone="success" />
          <StatPill label="Custo/kg" value={formatBRL(calc.custoPorKg)} tone="primary" />
        </div>

        <div className="flex gap-3 mt-5 mb-6">
          {!isNovo && (
            <Button variant="danger" className="flex-1" onClick={excluir}>
              Excluir
            </Button>
          )}
          <Button className="flex-1" onClick={salvar}>
            Salvar Receita
          </Button>
        </div>
      </div>
    </div>
  );
}
