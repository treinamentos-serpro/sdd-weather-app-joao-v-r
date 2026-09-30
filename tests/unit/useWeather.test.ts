import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { getWeather, searchCities } from '../../src/services/weatherService';
import { mockWeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async () => {
  const actual = await vi.importActual<typeof import('../../src/services/weatherService')>(
    '../../src/services/weatherService',
  );

  return {
    ...actual,
    getWeather: vi.fn(),
    searchCities: vi.fn(),
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useWeather', () => {
  it('inicia idle e retorna erro de validacao sem buscar nome vazio', async () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.status).toBe('idle');

    await act(async () => {
      await result.current.search('   ');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.kind).toBe('validation');
    expect(searchCities).not.toHaveBeenCalled();
  });

  it('carrega o clima da primeira cidade encontrada', async () => {
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.cities).toEqual([mockWeatherData.city]);
    expect(result.current.data).toEqual(mockWeatherData);
    expect(getWeather).toHaveBeenCalledWith(mockWeatherData.city);
  });

  it('define empty quando nao encontra cidades', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Atlantida');
    });

    expect(result.current.status).toBe('empty');
    expect(result.current.data).toBeUndefined();
    expect(getWeather).not.toHaveBeenCalled();
  });
});
