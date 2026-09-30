import { useEffect, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData, WeatherError, WeatherStatus } from '../types/weather';

type LastOperation = { kind: 'search'; query: string } | { kind: 'weather'; city: City };

export interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | undefined;
  cities: City[];
  error: WeatherError | undefined;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function getErrorKind(error: unknown): WeatherError['kind'] {
  return error instanceof WeatherServiceError ? error.kind : 'network';
}

function createWeatherError(error: unknown, operation: 'search' | 'weather'): WeatherError {
  const kind = getErrorKind(error);
  const message =
    kind === 'timeout'
      ? 'A consulta expirou. Tente novamente.'
      : kind === 'network'
        ? 'Falha de rede. Verifique sua conexão e tente novamente.'
        : kind === 'invalid-response'
          ? 'A resposta recebida é inválida. Tente novamente.'
          : operation === 'search'
            ? 'Não foi possível buscar a cidade.'
            : 'Não foi possível carregar o clima.';

  return {
    kind,
    message,
    retryable: true,
  };
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | undefined>(undefined);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<WeatherError | undefined>(undefined);
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const lastOperation = useRef<LastOperation | undefined>(undefined);
  const activeController = useRef<AbortController | undefined>(undefined);

  useEffect(() => () => activeController.current?.abort(), []);

  function startRequest() {
    const activeRequestId = requestId.current + 1;
    requestId.current = activeRequestId;
    activeController.current?.abort();
    const controller = new AbortController();
    activeController.current = controller;

    return { activeRequestId, signal: controller.signal };
  }

  async function loadWeather(
    city: City,
    activeRequestId: number,
    signal: AbortSignal,
  ): Promise<void> {
    lastOperation.current = { kind: 'weather', city };

    try {
      const weather = await getWeather(city, signal);

      if (activeRequestId !== requestId.current) {
        return;
      }

      setData(weather);
      setStatus('success');
      setError(undefined);
    } catch (weatherError) {
      if (activeRequestId !== requestId.current) {
        return;
      }

      setData(undefined);
      setStatus('error');
      setError(createWeatherError(weatherError, 'weather'));
    }
  }

  async function search(name: string): Promise<void> {
    const normalizedName = name.trim();

    if (!normalizedName) {
      requestId.current += 1;
      activeController.current?.abort();
      activeController.current = undefined;
      lastOperation.current = undefined;
      setQuery('');
      setCities([]);
      setData(undefined);
      setStatus('error');
      setError({
        kind: 'validation',
        message: 'Informe uma cidade para pesquisar.',
        retryable: false,
      });
      return;
    }

    const { activeRequestId, signal } = startRequest();
    lastOperation.current = { kind: 'search', query: normalizedName };
    setQuery(normalizedName);
    setCities([]);
    setData(undefined);
    setError(undefined);
    setStatus('loading');

    try {
      const results = await searchCities(normalizedName, signal);

      if (activeRequestId !== requestId.current) {
        return;
      }

      setCities(results);

      if (results.length === 0) {
        setStatus('empty');
        return;
      }

      if (results.length > 1) {
        setStatus('idle');
        return;
      }

      await loadWeather(results[0], activeRequestId, signal);
    } catch (searchError) {
      if (activeRequestId !== requestId.current) {
        return;
      }

      setStatus('error');
      setError(createWeatherError(searchError, 'search'));
    }
  }

  async function selectCity(city: City): Promise<void> {
    const { activeRequestId, signal } = startRequest();
    setData(undefined);
    setError(undefined);
    setStatus('loading');
    await loadWeather(city, activeRequestId, signal);
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;

    if (!operation) {
      return;
    }

    if (operation.kind === 'search') {
      await search(operation.query);
      return;
    }

    await selectCity(operation.city);
  }

  return {
    status,
    data,
    cities,
    error,
    query,
    search,
    selectCity,
    retry,
  };
}
