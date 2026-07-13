import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { calcReceitaCompleta, calcIngredientCost, UNIT_OPTIONS } from '../utils/calc';

function unidadeLabel(unidade) {
  return UNIT_OPTIONS.find((u) => u.value === unidade)?.label || unidade || '';
}

function GrupoComponente({ titulo, itens, materiasPrimas }) {
  if (!itens.length) return null;
  return (
    <>
      {itens.map(({ componente }) => (
        <div key={componente.id} className="mb-3">
          <p className="text-xs font-bold text-[#993556] mb-1">{titulo} · {componente.nome || 'Sem nome'}</p>
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="text-left text-text-light">
                <th className="font-normal py-1 border-b border-accent-light">Ingrediente</th>
                <th className="font-normal py-1 border-b border-accent-light text-right">Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {(componente.ingredientes || []).map((ing) => {
                const { materiaPrima } = calcIngredientCost(ing, materiasPrimas);
                if (!materiaPrima) return null;
                return (
                  <tr key={ing.id}>
                    <td className="py-1 border-b border-accent-light/40">{materiaPrima.nome || 'Sem nome'}</td>
                    <td className="py-1 border-b border-accent-light/40 text-right">
                      {ing.quantidadeUtilizada} {unidadeLabel(materiaPrima.unidadeCompra)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
}

export default function FichaTecnica() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState('');

  const receitas = useStore((s) => s.receitas);
  const massas = useStore((s) => s.massas);
  const recheios = useStore((s) => s.recheios);
  const coberturas = useStore((s) => s.coberturas);
  const materiasPrimas = useStore((s) => s.materiasPrimas);
  const custosIndiretosPadrao = useStore((s) => s.custosIndiretosPadrao);
  const usuarioNome = useStore((s) => s.usuarioNome);

  const receita = receitas.find((r) => r.id === id);
  const listas = { massas, recheios, coberturas, materiasPrimas, custosIndiretosPadrao };
  const calc = useMemo(() => (receita ? calcReceitaCompleta(receita, listas) : null), [receita, massas, recheios, coberturas, materiasPrimas, custosIndiretosPadrao]);

  const tempoTotal = receita
    ? (Number(receita.tempoPreparo) || 0) + (Number(receita.tempoForno) || 0) + (Number(receita.tempoDecoracao) || 0)
    : 0;

  const dataEmissao = new Date().toLocaleDateString('pt-BR');

  const baixarPdf = async () => {
    setErro('');
    setGerando(true);
    try {
      const { gerarFichaTecnicaPDF } = await import('../utils/pdfFichaTecnica');
      gerarFichaTecnicaPDF({ receita, calc, materiasPrimas, usuarioNome });
    } catch (err) {
      setErro('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGerando(false);
    }
  };

  if (!receita || !calc) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-text-light">Receita não encontrada.</p>
        <button onClick={() => navigate('/receitas')} className="text-sm font-semibold text-primary-dark">
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#E9E1DC] z-50 overflow-y-auto">
      <div className="sticky top-0 bg-[#E9E1DC]/95 backdrop-blur px-4 py-3 flex items-center justify-between max-w-[720px] mx-auto">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-accent">←</button>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={baixarPdf}
            disabled={gerando}
            className="bg-primary-dark text-white text-sm font-semibold rounded-2xl px-4 py-2 disabled:opacity-60"
          >
            {gerando ? 'Gerando...' : '⬇️ Baixar PDF'}
          </button>
          {erro && <p className="text-[11px] text-danger font-medium">{erro}</p>}
        </div>
      </div>

      <div className="max-w-[640px] mx-auto bg-white my-6 print:my-0 px-9 py-8 text-[#2E2620] shadow-[0_2px_10px_rgba(0,0,0,0.12)] print:shadow-none" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div className="flex items-center justify-between border-b-2 border-primary-dark pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-sm">🎂</div>
            <div>
              <p className="text-xs font-bold tracking-wide">FLUXOCERTO - CAKE</p>
              <p className="text-[9px] text-text-light">{usuarioNome} · Ficha técnica de produção</p>
            </div>
          </div>
          <p className="text-[9px] text-text-light text-right">Emitido em<br />{dataEmissao}</p>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="w-16 h-16 rounded-xl bg-[#FBEAF0] shrink-0 flex items-center justify-center text-2xl overflow-hidden">
            {receita.foto ? <img src={receita.foto} alt="" className="w-full h-full object-cover" /> : '🎂'}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold mb-0.5">{receita.nome || 'Sem nome'}</p>
            <p className="text-[10px] text-text-light">
              {receita.categoria || '—'} · {(Number(receita.pesoFinal) || 0).toLocaleString('pt-BR')} kg · {receita.andares} andar(es) · {receita.fatias} fatias
            </p>
          </div>
        </div>

        <table className="w-full border-collapse mb-5 text-[10px]">
          <tbody>
            <tr>
              <td className="bg-[#F6F1EC] p-2 text-center border-r border-white">
                <p className="text-[8px] text-text-light uppercase m-0">Preparo</p>
                <p className="font-bold mt-0.5 mb-0">{receita.tempoPreparo || 0} min</p>
              </td>
              <td className="bg-[#F6F1EC] p-2 text-center border-r border-white">
                <p className="text-[8px] text-text-light uppercase m-0">Forno</p>
                <p className="font-bold mt-0.5 mb-0">{receita.tempoForno || 0} min</p>
              </td>
              <td className="bg-[#F6F1EC] p-2 text-center border-r border-white">
                <p className="text-[8px] text-text-light uppercase m-0">Decoração</p>
                <p className="font-bold mt-0.5 mb-0">{receita.tempoDecoracao || 0} min</p>
              </td>
              <td className="bg-accent p-2 text-center">
                <p className="text-[8px] text-[#F6EFE7] uppercase m-0">Tempo total</p>
                <p className="font-bold mt-0.5 mb-0 text-white">{tempoTotal} min</p>
              </td>
            </tr>
          </tbody>
        </table>

        <p className="text-xs font-bold border-l-[3px] border-primary-dark pl-2 mb-2">Componentes e ingredientes</p>
        <GrupoComponente titulo="Massa" itens={calc.massas} materiasPrimas={materiasPrimas} />
        <GrupoComponente titulo="Recheio" itens={calc.recheios} materiasPrimas={materiasPrimas} />
        <GrupoComponente titulo="Cobertura" itens={calc.coberturas} materiasPrimas={materiasPrimas} />

        <p className="text-xs font-bold border-l-[3px] border-primary-dark pl-2 mb-2 mt-5">Observações</p>
        <div className="border border-accent-light rounded-lg px-3.5 py-3 min-h-[110px]">
          <div className="border-t border-dashed border-accent-light h-6" />
          <div className="border-t border-dashed border-accent-light h-6" />
          <div className="border-t border-dashed border-accent-light h-6" />
          <div className="border-t border-dashed border-accent-light h-6" />
        </div>

        <p className="text-[8px] text-text-light text-center mt-6 border-t border-accent-light/40 pt-2.5">
          Gerado por FluxoCerto - Cake · Página 1 de 1
        </p>
      </div>
    </div>
  );
}
