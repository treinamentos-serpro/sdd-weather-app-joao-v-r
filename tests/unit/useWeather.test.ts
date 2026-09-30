import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';
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
    expect(getWeather).toHaveBeenCalledWith(mockWeatherData.city, expect.any(AbortSignal));
  });

  it('aborta a busca anterior e ignora sua resposta atrasada', async () => {
    const oldCity: City = { ...mockWeatherData.city, id: 1, name: 'Lisboa' };
    const latestCity: City = { ...mockWeatherData.city, id: 2, name: 'Porto' };
    let resolveOldSearch: ((cities: City[]) => void) | undefined;
    let oldSignal: AbortSignal | undefined;

    vi.mocked(searchCities).mockImplementation((query, signal) => {
      if (query === 'Lisboa') {
        oldSignal = signal;
        return new Promise((resolve) => {
          resolveOldSearch = resolve;
        });
      }

      return Promise.resolve([latestCity]);
    });
    vi.mocked(getWeather).mockImplementation(async (city) => ({ ...mockWeatherData, city }));
    const { result } = renderHook(() => useWeather());
    let oldSearch!: Promise<void>;

    act(() => {
      oldSearch = result.current.search('Lisboa');
    });

    await act(async () => {
      await result.current.search('Porto');
    });

    expect(oldSignal?.aborted).toBe(true);
    resolveOldSearch?.([oldCity]);

    await act(async () => {
      await oldSearch;
    });

    expect(result.current.data?.city).toEqual(latestCity);
    expect(result.current.status).toBe('success');
  });

  it('aguarda escolha explícita quando o geocoding retorna várias cidades', async () => {
    const secondCity = { ...mockWeatherData.city, id: 2, name: 'Lisboa', country: 'Brasil' };
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city, secondCity]);
    vi.mocked(getWeather).mockResolvedValue({ ...mockWeatherData, city: secondCity });
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.cities).toEqual([mockWeatherData.city, secondCity]);
    expect(getWeather).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.selectCity(secondCity);
    });

    expect(getWeather).toHaveBeenCalledWith(secondCity, expect.any(AbortSignal));
    expect(result.current.data?.city).toEqual(secondCity);
    expect(result.current.status).toBe('success');
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

  it('repete a consulta de geocoding após uma falha de rede', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.', 'network'))
      .mockResolvedValueOnce([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });

    expect(result.current.error?.message).toBe(
      'Falha de rede. Verifique sua conexão e tente novamente.',
    );

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenNthCalledWith(1, 'Lisboa', expect.any(AbortSignal));
    expect(searchCities).toHaveBeenNthCalledWith(2, 'Lisboa', expect.any(AbortSignal));
    expect(getWeather).toHaveBeenCalledOnce();
    expect(result.current.status).toBe('success');
  });

  it('repete o forecast da mesma cidade sem geocodificar novamente após falha de rede', async () => {
    vi.mocked(searchCities).mockResolvedValue([mockWeatherData.city]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.', 'network'))
      .mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });

    expect(result.current.error?.message).toBe(
      'Falha de rede. Verifique sua conexão e tente novamente.',
    );

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenCalledOnce();
    expect(getWeather).toHaveBeenNthCalledWith(1, mockWeatherData.city, expect.any(AbortSignal));
    expect(getWeather).toHaveBeenNthCalledWith(2, mockWeatherData.city, expect.any(AbortSignal));
    expect(result.current.status).toBe('success');
  });

  it('mostra uma mensagem clara para timeout e permite repetir a busca', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new WeatherServiceError('Timeout.', 'timeout'))
      .mockResolvedValueOnce([mockWeatherData.city]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Lisboa');
    });

    expect(result.current.error?.message).toBe('A consulta expirou. Tente novamente.');

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });
});
