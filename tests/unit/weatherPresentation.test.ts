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

  it.each([
    { code: 56, label: 'Garoa congelante fraca' },
    { code: 57, label: 'Garoa congelante intensa' },
    { code: 66, label: 'Chuva congelante fraca' },
    { code: 67, label: 'Chuva congelante intensa' },
    { code: 77, label: 'Grãos de neve' },
    { code: 85, label: 'Pancadas de neve fracas' },
    { code: 86, label: 'Pancadas de neve intensas' },
  ])('mapeia o código WMO $code', ({ code, label }) => {
    expect(getWeatherCondition(code).label).toBe(label);
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
