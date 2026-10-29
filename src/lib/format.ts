function parseLocalDate(localDate: string): Date | null {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDate);
  if (!dateParts) return null;

  const [, year, month, day] = dateParts;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12));

  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return date;
}

export function formatDayLabel(localDate: string, index: number): string {
  const date = parseLocalDate(localDate);
  if (!date) return 'Data indisponível';

  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';

  const weekday = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    weekday: 'short',
  })
    .format(date)
    .replace(/\.$/, '');

  return weekday.charAt(0).toLocaleUpperCase('pt-BR') + weekday.slice(1);
}

export function getShortDate(localDate: string): string {
  if (!parseLocalDate(localDate)) return 'Data indisponível';

  const [, , month, day] = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDate) ?? [];
  return `${day}/${month}`;
}
