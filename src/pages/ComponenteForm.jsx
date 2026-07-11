import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Field, Input, Select, PhotoPicker, Button, SectionTitle } from '../components/ui';
import IngredientesList from '../components/IngredientesList';
import Header from '../components/Header';
import { calcComponentTotals, formatBRL } from '../utils/calc';

const CONFIG = {
  massa: {
    titulo: 'Massa',
    artigo: 'da',
    listKey: 'massas',
    add: 'addMassa',
    update: 'updateMassa',
    remove: 'removeMassa',
    categorias: ['Baunilha', 'Chocolate', 'Cenoura', 'Red Velvet', 'Fubá', 'Limão', 'Massa para Docinho', 'Massa para Cookies', 'Outra'],
    temDescricao: true,
  },
  recheio: {
    titulo: 'Recheio',
    artigo: 'do',
    listKey: 'recheios',
    add: 'addRecheio',
    update: 'updateRecheio',
    remove: 'removeRecheio',
    categorias: ['Brigadeiro', 'Doce de leite', 'Frutas', 'Chantilly', 'Nutella', 'Outro'],
    temDescricao: false,
  },
  cobertura: {
    titulo: 'Cobertura',
    artigo: 'da',
    listKey: 'coberturas',
    add: 'addCobertura',
    update: 'updateCobertura',
    remove: 'removeCobertura',
    categorias: ['Ganache', 'Chantininho', 'Chantilly', 'Buttercream', 'Pasta Americana', 'Glacê', 'Espelhada', 'Outro'],
    temDescricao: false,
  },
};

export default function ComponenteForm() {
  const { tipo, id } = useParams();
  const navigate = useNavigate();
  const cfg = CONFIG[tipo];

  const lista = useStore((s) => s[cfg.listKey]);
  const materiasPrimas = useStore((s) => s.materiasPrimas);
  const novoComponente = useStore((s) => s.novoComponente);
  const novoIngrediente = useStore((s) => s.novoIngrediente);
  const addFn = useStore((s) => s[cfg.add]);
  const updateFn = useStore((s) => s[cfg.update]);
  const removeFn = useStore((s) => s[cfg.remove]);

  const existente = useMemo(() => lista.find((m) => m.id === id), [lista, id]);
  const isNovo = id === 'novo';

  const [form, setForm] = useState(() => existente || novoComponente());

  useEffect(() => {
    if (existente) setForm(existente);
  }, [existente]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const totals = useMemo(() => calcComponentTotals(form, materiasPrimas), [form, materiasPrimas]);

  const ingredientesListRef = useRef(null);

  const adicionarIngrediente = () => {
    setForm((f) => ({ ...f, ingredientes: [novoIngrediente(), ...f.ingredientes] }));
    requestAnimationFrame(() => {
      const primeiro = ingredientesListRef.current?.querySelector('[data-ingrediente-item]');
      primeiro?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const salvar = () => {
    if (isNovo) {
      addFn(form);
    } else {
      updateFn(id, form);
    }
    navigate('/componentes');
  };

  const excluir = () => {
    removeFn(id);
    navigate('/componentes');
  };

  return (
    <div>
      <Header
        title={isNovo ? `${cfg.artigo === 'da' ? 'Nova' : 'Novo'} ${cfg.titulo}` : `Editar ${cfg.titulo}`}
        onBack={true}
      />
      <div className="px-5">
        <PhotoPicker value={form.foto} onChange={(foto) => set({ foto })} label={`Foto ${cfg.artigo} ${cfg.titulo.toLowerCase()}`} />

        <div className="mt-4">
          <Field label="Nome">
            <Input value={form.nome} onChange={(e) => set({ nome: e.target.value })} placeholder={`Ex: ${cfg.titulo} de chocolate`} />
          </Field>

          <Field label={cfg.titulo === 'Cobertura' ? 'Tipo' : 'Categoria'}>
            <Select value={form.categoria} onChange={(e) => set({ categoria: e.target.value })}>
              <option value="">Selecione...</option>
              {cfg.categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>

          {cfg.temDescricao && (
            <Field label="Descrição">
              <Input value={form.descricao} onChange={(e) => set({ descricao: e.target.value })} placeholder="Observações da receita" />
            </Field>
          )}

          <Field label="Rendimento">
            <Input value={form.rendimento} onChange={(e) => set({ rendimento: e.target.value })} placeholder="Ex: 1 kg assado" />
          </Field>
        </div>

        <SectionTitle
          right={
            <Button
              variant="ghost"
              className="!px-3 !py-2 text-xs"
              onClick={adicionarIngrediente}
              disabled={!materiasPrimas.length}
            >
              ➕ Adicionar ingrediente
            </Button>
          }
        >
          Ingredientes
        </SectionTitle>

        {!materiasPrimas.length && (
          <p className="text-xs text-text-light bg-accent-light/30 rounded-xl px-3 py-2 mb-3">
            Cadastre matérias-primas na aba <strong>Componentes → Matéria-prima</strong> antes de adicionar ingredientes aqui.
          </p>
        )}

        <IngredientesList
          ingredientes={form.ingredientes}
          onChange={(ingredientes) => set({ ingredientes })}
          listRef={ingredientesListRef}
          materiasPrimas={materiasPrimas}
        />

        <Card className="mt-5 flex items-center justify-between !bg-accent-light/40">
          <p className="text-xs text-text-light">Custo total {cfg.artigo} {cfg.titulo.toLowerCase()}</p>
          <p className="font-bold text-primary-dark text-lg">{formatBRL(totals.custoTotal)}</p>
        </Card>

        <div className="flex gap-3 mt-5 mb-6">
          {!isNovo && (
            <Button variant="danger" className="flex-1" onClick={excluir}>
              Excluir
            </Button>
          )}
          <Button className="flex-1" onClick={salvar}>
            Salvar {cfg.titulo}
          </Button>
        </div>
      </div>
    </div>
  );
}
