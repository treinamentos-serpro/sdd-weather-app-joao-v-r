import { describe, expect, it } from 'vitest';
import { mockWeatherData } from '../../src/types/weather';

describe('mockWeatherData', () => {
  it('fornece uma cidade, clima atual e cinco dias de previsão', () => {
    expect(mockWeatherData.city.name).toBe('Sao Paulo');
    expect(mockWeatherData.current.temperatureCelsius).toBe(22);
    expect(mockWeatherData.forecast).toHaveLength(5);
  });
});
