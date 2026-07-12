import { useStore } from '../store/useStore';
import { Card, Field, Input, PhotoPicker, Button, SectionTitle } from '../components/ui';
import { getActivation, clearActivation } from '../utils/activation';

const VAR_MAP = {
  primary: '--fc-primary',
  primaryDark: '--fc-primary-dark',
  accent: '--fc-accent',
  bg: '--fc-bg',
};

const TEMAS = [
  { nome: 'Rosa Doce', primary: '#F3B6C5', primaryDark: '#E393AA', accent: '#B08968', bg: '#FFF8F6' },
  { nome: 'Lilás Suave', primary: '#DCC6F0', primaryDark: '#B99AE0', accent: '#8D7B94', bg: '#FAF6FE' },
  { nome: 'Menta Fresca', primary: '#BFE8D4', primaryDark: '#93D1B3', accent: '#6E8F7C', bg: '#F4FBF7' },
  { nome: 'Azul Céu', primary: '#BFE0F7', primaryDark: '#8FC6EC', accent: '#6D8CA3', bg: '#F3FAFE' },
  { nome: 'Pêssego', primary: '#FFD9B8', primaryDark: '#FFBD8A', accent: '#B08968', bg: '#FFF8F1' },
  { nome: 'Café com Leite', primary: '#E3CCB8', primaryDark: '#C9A47F', accent: '#8C6E54', bg: '#FBF6F0' },
];

export default function Configuracoes() {
  const usuarioNome = useStore((s) => s.usuarioNome);
  const setUsuarioNome = useStore((s) => s.setUsuarioNome);
  const logo = useStore((s) => s.logo);
  const setLogo = useStore((s) => s.setLogo);
  const tema = useStore((s) => s.tema);
  const setTema = useStore((s) => s.setTema);
  const custosIndiretosPadrao = useStore((s) => s.custosIndiretosPadrao);
  const setCustosIndiretosPadrao = useStore((s) => s.setCustosIndiretosPadrao);
  const resetAll = useStore((s) => s.resetAll);
  const ativacao = getActivation();

  const aplicarTema = (preset) => {
    setTema(preset);
    Object.entries(VAR_MAP).forEach(([key, varName]) => {
      document.documentElement.style.setProperty(varName, preset[key]);
    });
  };

  const temaAtivo = TEMAS.find(
    (t) => t.primary === tema.primary && t.primaryDark === tema.primaryDark && t.accent === tema.accent && t.bg === tema.bg
  );

  const trocarCodigo = () => {
    if (confirm('Isso vai pedir um novo código de ativação ao reabrir o app. Continuar?')) {
      clearActivation();
      window.location.reload();
    }
  };

  return (
    <div className="px-5 pt-7 pb-6">
      <h1 className="text-lg font-bold text-text mb-4">Configurações</h1>

      <SectionTitle>Perfil</SectionTitle>
      <Card className="mb-5">
        <div className="flex justify-center mb-3">
          <div className="w-24">
            <PhotoPicker value={logo} onChange={setLogo} label="Logo da empresa" />
          </div>
        </div>
        <Field label="Nome / Empresa">
          <Input value={usuarioNome} onChange={(e) => setUsuarioNome(e.target.value)} placeholder="Seu nome ou nome da doceria" />
        </Field>
      </Card>

      <SectionTitle>Cores do tema</SectionTitle>
      <Card className="mb-5">
        <p className="text-xs text-text-light mb-3">Escolha um tema pastel para o app.</p>
        <div className="grid grid-cols-2 gap-3">
          {TEMAS.map((t) => {
            const ativo = temaAtivo?.nome === t.nome;
            return (
              <button
                key={t.nome}
                onClick={() => aplicarTema(t)}
                className={`rounded-2xl p-3 text-left border-2 transition ${
                  ativo ? 'border-primary-dark' : 'border-transparent bg-accent-light/25'
                }`}
                style={ativo ? { backgroundColor: t.bg } : undefined}
              >
                <div className="flex gap-1 mb-2">
                  <span className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: t.primary }} />
                  <span className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: t.primaryDark }} />
                  <span className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: t.accent }} />
                </div>
                <p className="text-xs font-semibold text-text">{t.nome}</p>
                {ativo && <p className="text-[10px] text-primary-dark font-medium">Selecionado</p>}
              </button>
            );
          })}
        </div>
      </Card>

      <SectionTitle>Custos indiretos</SectionTitle>
      <Card className="mb-5">
        <p className="text-xs text-text-light mb-3">
          Gás, energia, água e mão de obra são calculados automaticamente em cada receita, com base no tempo
          registrado (preparo + forno + decoração) e nas taxas abaixo.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Gás (R$/min)">
            <Input type="number" min="0" step="0.01" value={custosIndiretosPadrao.gasPorMin}
              onChange={(e) => setCustosIndiretosPadrao({ gasPorMin: e.target.value })} />
          </Field>
          <Field label="Energia (R$/min)">
            <Input type="number" min="0" step="0.01" value={custosIndiretosPadrao.energiaPorMin}
              onChange={(e) => setCustosIndiretosPadrao({ energiaPorMin: e.target.value })} />
          </Field>
          <Field label="Água (R$/min)">
            <Input type="number" min="0" step="0.01" value={custosIndiretosPadrao.aguaPorMin}
              onChange={(e) => setCustosIndiretosPadrao({ aguaPorMin: e.target.value })} />
          </Field>
          <Field label="Mão de obra (R$/hora)">
            <Input type="number" min="0" step="0.01" value={custosIndiretosPadrao.maoDeObraPorHora}
              onChange={(e) => setCustosIndiretosPadrao({ maoDeObraPorHora: e.target.value })} />
          </Field>
          <Field label="Despesas fixas (R$/mês)">
            <Input type="number" min="0" step="0.01" value={custosIndiretosPadrao.despesasFixasPorMes}
              onChange={(e) => setCustosIndiretosPadrao({ despesasFixasPorMes: e.target.value })} />
          </Field>
          <Field label="Taxa cartão (%)">
            <Input type="number" min="0" step="0.01" value={custosIndiretosPadrao.taxaCartao}
              onChange={(e) => setCustosIndiretosPadrao({ taxaCartao: e.target.value })} />
          </Field>
          <Field label="Taxa iFood (%)">
            <Input type="number" min="0" step="0.01" value={custosIndiretosPadrao.taxaIfood}
              onChange={(e) => setCustosIndiretosPadrao({ taxaIfood: e.target.value })} />
          </Field>
          <Field label="Imposto (%)">
            <Input type="number" min="0" step="0.01" value={custosIndiretosPadrao.impostoPercent}
              onChange={(e) => setCustosIndiretosPadrao({ impostoPercent: e.target.value })} />
          </Field>
        </div>
      </Card>

      <SectionTitle>Ativação</SectionTitle>
      <Card className="mb-5">
        <p className="text-xs text-text-light mb-1">Código ativo neste aparelho</p>
        <p className="font-bold text-text tracking-widest mb-1">{ativacao?.chave || '—'}</p>
        {ativacao?.email && <p className="text-xs text-text-light mb-3">{ativacao.email}</p>}
        <Button variant="outline" className="w-full" onClick={trocarCodigo}>
          Trocar código de ativação
        </Button>
      </Card>

      <SectionTitle>Dados</SectionTitle>
      <Card>
        <p className="text-xs text-text-light mb-3">
          Apaga todas as massas, recheios, coberturas e receitas cadastradas. Essa ação não pode ser desfeita.
        </p>
        <Button
          variant="danger"
          className="w-full"
          onClick={() => {
            if (confirm('Tem certeza que deseja apagar todos os dados cadastrados?')) resetAll();
          }}
        >
          Limpar todos os dados
        </Button>
      </Card>
    </div>
  );
}
