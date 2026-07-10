export const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function toISODate(date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function parseISODate(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function inicioDaSemana(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function getDiasDaSemana(referencia) {
  const inicio = inicioDaSemana(referencia);
  return Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(inicio);
    dia.setDate(inicio.getDate() + i);
    return dia;
  });
}

export function formatMesAno(date) {
  return `${MESES[date.getMonth()]} ${date.getFullYear()}`;
}

export function isMesmoDia(a, b) {
  return toISODate(a) === toISODate(b);
}
