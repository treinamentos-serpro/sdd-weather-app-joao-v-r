import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchWithTimeout,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it('retorna vazio sem chamar a rede para um nome vazio', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('codifica o nome e mapeia os resultados para City', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 1,
            name: 'Sao Jose dos Campos',
            latitude: -23.18,
            longitude: -45.88,
            country: 'Brazil',
            admin1: 'Sao Paulo',
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(' São José dos Campos ')).resolves.toEqual([
      {
        id: 1,
        name: 'Sao Jose dos Campos',
        latitude: -23.18,
        longitude: -45.88,
        country: 'Brazil',
        admin1: 'Sao Paulo',
      },
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Jos%C3%A9%20dos%20Campos&count=5&language=pt&format=json',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('retorna vazio quando results está ausente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }),
    );

    await expect(searchCities('Lisboa')).resolves.toEqual([]);
  });

  it('lança WeatherServiceError para resposta não-ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );

    await expect(searchCities('Lisboa')).rejects.toBeInstanceOf(WeatherServiceError);
  });
});

describe('getWeather', () => {
  const city: City = {
    id: 1,
    name: 'Lisboa',
    latitude: 38.72,
    longitude: -9.14,
    country: 'Portugal',
  };

  it('mapeia o clima atual e exatamente cinco dias', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 20.4,
          relative_humidity_2m: 62,
          weather_code: 0,
          wind_speed_10m: 12.5,
          precipitation: 0,
          surface_pressure: 1014,
        },
        daily: {
          time: [
            '2026-09-30',
            '2026-10-01',
            '2026-10-02',
            '2026-10-03',
            '2026-10-04',
            '2026-10-05',
          ],
          temperature_2m_min: [15, 16, 17, 18, 19],
          temperature_2m_max: [24, 25, 26, 27, 28],
          weather_code: [0, 1, 2, 3, 61],
          precipitation_probability_max: [10, 20, 30, 40, 50],
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const weather = await getWeather(city);

    expect(weather.city).toEqual(city);
    expect(weather.current).toEqual({
      temperatureCelsius: 20.4,
      humidityPercent: 62,
      weatherCode: 0,
      windSpeedKmh: 12.5,
      precipitationMm: 0,
      pressureHpa: 1014,
    });
    expect(weather.forecast).toHaveLength(5);
    expect(weather.forecast[0]).toEqual({
      date: '2026-09-30',
      minimumCelsius: 15,
      maximumCelsius: 24,
      precipitationProbabilityPercent: 10,
      weatherCode: 0,
    });
    expect(fetchMock.mock.calls[0]?.[0]).toContain('forecast_days=5');
  });

  it('lança WeatherServiceError quando a resposta tem menos de cinco dias', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          daily: { time: ['2026-09-30', '2026-10-01'] },
        }),
      }),
    );

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('converte precipitação nula em zero', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          current: { precipitation: null },
          daily: {
            time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
          },
        }),
      }),
    );

    await expect(getWeather(city)).resolves.toMatchObject({
      current: { precipitationMm: 0 },
    });
  });

  it('lança WeatherServiceError quando current está ausente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          daily: {
            time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
          },
        }),
      }),
    );

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('lança WeatherServiceError quando daily está ausente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ current: {} }),
      }),
    );

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });
});

describe('fetchWithTimeout', () => {
  it('converte falhas de rede em WeatherServiceError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));

    await expect(fetchWithTimeout('/weather')).rejects.toThrow('Falha de rede.');
  });

  it('converte AbortError em timeout após 10 segundos', async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      'fetch',
      vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      }),
    );

    const request = expect(fetchWithTimeout('/weather')).rejects.toThrow(
      'A requisição demorou demais.',
    );
    await vi.advanceTimersByTimeAsync(10_000);

    await request;
  });
});
