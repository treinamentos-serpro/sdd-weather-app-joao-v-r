import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('temperature utilities', () => {
  it('converte 0 Celsius para 32 Fahrenheit', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
  });

  it('converte 100 Celsius para 212 Fahrenheit', () => {
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
  });

  it('mantem -40 igual nas duas escalas', () => {
    expect(convertTemperature(-40, 'celsius')).toBe(-40);
    expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
  });

  it('converte conforme a unidade selecionada', () => {
    expect(convertTemperature(21, 'celsius')).toBe(21);
    expect(convertTemperature(21, 'fahrenheit')).toBe(70);
  });

  it('formata com arredondamento e simbolo', () => {
    expect(formatTemperature(20.4, 'celsius')).toBe('20°C');
    expect(formatTemperature(20.4, 'fahrenheit')).toBe('69°F');
  });

  it('retorna o simbolo da unidade', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
