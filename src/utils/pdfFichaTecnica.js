import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { calcIngredientCost, UNIT_OPTIONS } from './calc';

function unidadeLabel(unidade) {
  return UNIT_OPTIONS.find((u) => u.value === unidade)?.label || unidade || '';
}

const COR_PRIMARIA = [227, 147, 170]; // #E393AA
const COR_TEXTO = [46, 38, 32]; // #2E2620
const COR_TEXTO_CLARO = [140, 122, 112]; // #8C7A70
const COR_ACCENT = [176, 137, 104]; // #B08968
const COR_TITULO_GRUPO = [153, 53, 86]; // #993556
const COR_FUNDO_TEMPO = [246, 241, 236]; // #F6F1EC
const COR_LINHA_TABELA = [243, 238, 231];
const COR_BORDA_OBS = [232, 220, 204];

// Gera e baixa a ficha técnica de uma receita em PDF (desenhado diretamente,
// sem depender do diálogo de impressão do navegador — mais confiável em PWA/mobile).
export function gerarFichaTecnicaPDF({ receita, calc, materiasPrimas, usuarioNome }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COR_TEXTO);
  doc.text('FLUXOCERTO - CAKE', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COR_TEXTO_CLARO);
  doc.text(`${usuarioNome || 'Confeiteiro(a)'} · Ficha técnica de produção`, margin, y + 4.5);

  const dataEmissao = new Date().toLocaleDateString('pt-BR');
  doc.text(`Emitido em ${dataEmissao}`, pageWidth - margin, y, { align: 'right' });

  y += 7;
  doc.setDrawColor(...COR_PRIMARIA);
  doc.setLineWidth(0.7);
  doc.line(margin, y, pageWidth - margin, y);
  y += 9;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COR_TEXTO);
  doc.text(receita.nome || 'Sem nome', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COR_TEXTO_CLARO);
  const pesoFinal = (Number(receita.pesoFinal) || 0).toLocaleString('pt-BR');
  doc.text(
    `${receita.categoria || '—'}   ·   ${pesoFinal} kg   ·   ${receita.andares || 1} andar(es)   ·   ${receita.fatias || 1} fatias`,
    margin,
    y
  );
  y += 8;

  const tempoTotal = (Number(receita.tempoPreparo) || 0) + (Number(receita.tempoForno) || 0) + (Number(receita.tempoDecoracao) || 0);
  const caixasTempo = [
    { label: 'PREPARO', valor: `${receita.tempoPreparo || 0} min`, destaque: false },
    { label: 'FORNO', valor: `${receita.tempoForno || 0} min`, destaque: false },
    { label: 'DECORAÇÃO', valor: `${receita.tempoDecoracao || 0} min`, destaque: false },
    { label: 'TEMPO TOTAL', valor: `${tempoTotal} min`, destaque: true },
  ];
  const boxWidth = contentWidth / 4;
  const boxHeight = 13;
  caixasTempo.forEach((box, i) => {
    const x = margin + i * boxWidth;
    doc.setFillColor(...(box.destaque ? COR_ACCENT : COR_FUNDO_TEMPO));
    doc.rect(x, y, boxWidth - 1, boxHeight, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...(box.destaque ? [246, 239, 231] : COR_TEXTO_CLARO));
    doc.text(box.label, x + (boxWidth - 1) / 2, y + 4.5, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...(box.destaque ? [255, 255, 255] : COR_TEXTO));
    doc.text(box.valor, x + (boxWidth - 1) / 2, y + 9.5, { align: 'center' });
  });
  y += boxHeight + 9;

  function tituloSecao(texto) {
    doc.setDrawColor(...COR_PRIMARIA);
    doc.setLineWidth(1.1);
    doc.line(margin, y - 3.2, margin, y + 1.2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COR_TEXTO);
    doc.text(texto, margin + 3, y);
    y += 6;
  }

  tituloSecao('Componentes e ingredientes');

  const grupos = [
    { titulo: 'Massa', itens: calc.massas },
    { titulo: 'Recheio', itens: calc.recheios },
    { titulo: 'Cobertura', itens: calc.coberturas },
  ];

  for (const grupo of grupos) {
    for (const item of grupo.itens) {
      const componente = item.componente;
      const linhas = (componente.ingredientes || [])
        .map((ing) => {
          const { materiaPrima } = calcIngredientCost(ing, materiasPrimas);
          if (!materiaPrima) return null;
          return [materiaPrima.nome || 'Sem nome', `${ing.quantidadeUtilizada} ${unidadeLabel(materiaPrima.unidadeCompra)}`];
        })
        .filter(Boolean);
      if (!linhas.length) continue;

      if (y > pageHeight - 40) {
        doc.addPage();
        y = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...COR_TITULO_GRUPO);
      doc.text(`${grupo.titulo} · ${componente.nome || 'Sem nome'}`, margin, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Ingrediente', 'Quantidade']],
        body: linhas,
        theme: 'plain',
        styles: { fontSize: 8.5, textColor: COR_TEXTO, cellPadding: { top: 1.3, bottom: 1.3, left: 0, right: 0 } },
        headStyles: { textColor: COR_TEXTO_CLARO, fontStyle: 'normal', lineWidth: { bottom: 0.2 }, lineColor: COR_BORDA_OBS },
        columnStyles: { 1: { halign: 'right' } },
        didParseCell: (data) => {
          if (data.section === 'body') {
            data.cell.styles.lineWidth = { bottom: 0.1 };
            data.cell.styles.lineColor = COR_LINHA_TABELA;
          }
        },
      });
      y = doc.lastAutoTable.finalY + 5;
    }
  }

  if (y > pageHeight - 55) {
    doc.addPage();
    y = margin;
  }

  tituloSecao('Observações');

  const obsHeight = 30;
  doc.setDrawColor(...COR_BORDA_OBS);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, obsHeight, 2, 2);
  for (let i = 1; i <= 3; i++) {
    const lineY = y + (obsHeight / 4) * i;
    doc.setLineDashPattern([1, 1], 0);
    doc.line(margin + 4, lineY, margin + contentWidth - 4, lineY);
  }
  doc.setLineDashPattern([], 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...COR_TEXTO_CLARO);
  doc.text('Gerado por FluxoCerto - Cake', pageWidth / 2, pageHeight - 10, { align: 'center' });

  const nomeArquivo = `ficha-tecnica-${(receita.nome || 'receita').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}.pdf`;
  doc.save(nomeArquivo);
}
