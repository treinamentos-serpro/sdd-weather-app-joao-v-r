function parseDate(date: string): Date | undefined {
  const [year, month, day] = date.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  return Number.isFinite(parsedDate.getTime()) ? parsedDate : undefined;
}

export function formatDayLabel(date: string, index?: number): string {
  if (index === 0) {
    return 'Hoje';
  }

  if (index === 1) {
    return 'Amanhã';
  }

  const parsedDate = parseDate(date);

  if (!parsedDate) {
    return 'Data indisponível';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    weekday: 'long',
  }).format(parsedDate);
}

export function getShortDate(date: string): string {
  const parsedDate = parseDate(date);

  if (!parsedDate) {
    return 'Data indisponível';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(parsedDate);
}
