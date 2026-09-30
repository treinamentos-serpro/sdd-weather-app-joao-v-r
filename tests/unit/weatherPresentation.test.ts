import { describe, expect, it } from 'vitest';
import { formatDayLabel, getShortDate } from '../../src/lib/format';
import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('weather code presentation', () => {
  it('mapeia um codigo conhecido', () => {
    expect(getWeatherCondition(0)).toEqual({ label: 'Céu limpo', icon: '☀️' });
  });

  it('usa fallback para codigo desconhecido', () => {
    expect(getWeatherCondition(999)).toEqual({
      label: 'Condição não disponível',
      icon: '？',
    });
  });
});

describe('date presentation', () => {
  it('rotula os dois primeiros dias', () => {
    expect(formatDayLabel('2026-09-30', 0)).toBe('Hoje');
    expect(formatDayLabel('2026-10-01', 1)).toBe('Amanhã');
  });

  it('usa o dia da semana nos demais dias', () => {
    expect(formatDayLabel('2026-10-02', 2)).toBe('sexta-feira');
  });

  it('formata a data curta', () => {
    expect(getShortDate('2026-09-30')).toBe('30 de set.');
  });
});
