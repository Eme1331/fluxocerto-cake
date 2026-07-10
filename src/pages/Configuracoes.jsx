import { useStore } from '../store/useStore';
import { Card, Field, Input, PhotoPicker, Button, SectionTitle } from '../components/ui';
import { getActivation, clearActivation } from '../utils/activation';

const CORES = [
  { key: 'primary', varName: '--fc-primary', label: 'Rosa (destaque)' },
  { key: 'primaryDark', varName: '--fc-primary-dark', label: 'Rosa escuro' },
  { key: 'accent', varName: '--fc-accent', label: 'Marrom claro' },
  { key: 'bg', varName: '--fc-bg', label: 'Fundo (branco)' },
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

  const aplicarCor = (key, varName, value) => {
    setTema({ [key]: value });
    document.documentElement.style.setProperty(varName, value);
  };

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
        <div className="grid grid-cols-2 gap-3">
          {CORES.map((c) => (
            <Field key={c.key} label={c.label}>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={tema[c.key]}
                  onChange={(e) => aplicarCor(c.key, c.varName, e.target.value)}
                  className="w-10 h-10 rounded-xl border border-accent-light/70 cursor-pointer bg-transparent"
                />
                <span className="text-xs text-text-light">{tema[c.key]}</span>
              </div>
            </Field>
          ))}
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
