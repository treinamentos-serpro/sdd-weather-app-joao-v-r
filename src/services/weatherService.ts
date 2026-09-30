import type {
  City,
  CurrentWeather,
  ForecastDay,
  WeatherData,
  WeatherErrorKind,
} from '../types/weather';

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

interface GeocodingResponse {
  results?: unknown;
}

interface ForecastResponse {
  timezone?: unknown;
  current?: {
    temperature_2m?: unknown;
    relative_humidity_2m?: unknown;
    weather_code?: unknown;
    wind_speed_10m?: unknown;
    precipitation?: unknown;
    surface_pressure?: unknown;
  };
  daily?: {
    time?: unknown;
    temperature_2m_min?: unknown;
    temperature_2m_max?: unknown;
    weather_code?: unknown;
    precipitation_probability_max?: unknown;
  };
}

export class WeatherServiceError extends Error {
  readonly kind: WeatherErrorKind;

  constructor(message: string, kind: WeatherErrorKind) {
    super(message);
    this.name = 'WeatherServiceError';
    this.kind = kind;
  }
}

function isGeocodingResult(value: unknown): value is GeocodingResult {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const result = value as Record<string, unknown>;

  return (
    isFiniteNumber(result.id) &&
    typeof result.name === 'string' &&
    result.name.trim().length > 0 &&
    isFiniteNumber(result.latitude) &&
    isFiniteNumber(result.longitude) &&
    typeof result.country === 'string' &&
    result.country.trim().length > 0 &&
    (result.admin1 === undefined || typeof result.admin1 === 'string')
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function optionalNumber(value: unknown): number | undefined {
  return isFiniteNumber(value) ? value : undefined;
}

function isForecastResponse(value: unknown): value is ForecastResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as ForecastResponse;
  const dates = response.daily?.time;

  return (
    typeof response.timezone === 'string' &&
    response.timezone.length > 0 &&
    response.current !== undefined &&
    response.current !== null &&
    typeof response.current === 'object' &&
    Array.isArray(dates) &&
    dates.length >= 5 &&
    dates.slice(0, 5).every((date) => typeof date === 'string' && date.length > 0)
  );
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const externalSignal = init?.signal;
  let timedOut = false;
  const abortRequest = () => controller.abort();
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  if (externalSignal?.aborted) {
    controller.abort();
  } else {
    externalSignal?.addEventListener('abort', abortRequest, { once: true });
  }

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch {
    if (timedOut) {
      throw new WeatherServiceError('A requisição demorou demais.', 'timeout');
    }

    throw new WeatherServiceError('Falha de rede.', 'network');
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', abortRequest);
  }
}

export async function searchCities(name: string, signal?: AbortSignal): Promise<City[]> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return [];
  }

  const url = `${GEOCODING_ENDPOINT}?name=${encodeURIComponent(trimmedName)}&count=5&language=pt&format=json`;

  const response = await fetchWithTimeout(url, { signal });

  if (!response.ok) {
    throw new WeatherServiceError(`A busca de cidades falhou (${response.status}).`, 'api');
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new WeatherServiceError('A resposta de cidades é inválida.', 'invalid-response');
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new WeatherServiceError('A resposta de cidades é inválida.', 'invalid-response');
  }

  const results = (payload as GeocodingResponse).results;

  if (results === undefined) {
    return [];
  }

  if (!Array.isArray(results)) {
    throw new WeatherServiceError('A resposta de cidades é inválida.', 'invalid-response');
  }

  if (results.length === 0) {
    return [];
  }

  if (!results.every(isGeocodingResult)) {
    throw new WeatherServiceError('A resposta de cidades é inválida.', 'invalid-response');
  }

  return results.map((result) => ({
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    admin1: result.admin1,
  }));
}

export async function getWeather(city: City, signal?: AbortSignal): Promise<WeatherData> {
  const parameters = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,surface_pressure',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    temperature_unit: 'celsius',
    timezone: 'auto',
    forecast_days: '5',
  });

  const response = await fetchWithTimeout(`${FORECAST_ENDPOINT}?${parameters.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new WeatherServiceError(`A consulta meteorológica falhou (${response.status}).`, 'api');
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new WeatherServiceError('A resposta meteorológica é inválida.', 'invalid-response');
  }

  if (!isForecastResponse(payload)) {
    throw new WeatherServiceError('A previsão meteorológica está incompleta.', 'invalid-response');
  }

  const currentResponse = payload.current;
  const dailyResponse = payload.daily;

  if (!dailyResponse) {
    throw new WeatherServiceError('A previsão meteorológica está incompleta.', 'invalid-response');
  }

  const dates = dailyResponse.time as string[];
  const minimums = Array.isArray(dailyResponse.temperature_2m_min)
    ? dailyResponse.temperature_2m_min
    : [];
  const maximums = Array.isArray(dailyResponse.temperature_2m_max)
    ? dailyResponse.temperature_2m_max
    : [];
  const weatherCodes = Array.isArray(dailyResponse.weather_code) ? dailyResponse.weather_code : [];
  const precipitationProbabilities = Array.isArray(dailyResponse.precipitation_probability_max)
    ? dailyResponse.precipitation_probability_max
    : [];

  const current: CurrentWeather = {
    temperatureCelsius: optionalNumber(currentResponse?.temperature_2m),
    humidityPercent: optionalNumber(currentResponse?.relative_humidity_2m),
    weatherCode: optionalNumber(currentResponse?.weather_code),
    windSpeedKmh: optionalNumber(currentResponse?.wind_speed_10m),
    precipitationMm:
      currentResponse?.precipitation === null ? 0 : optionalNumber(currentResponse?.precipitation),
    pressureHpa: optionalNumber(currentResponse?.surface_pressure),
  };

  const forecast: ForecastDay[] = dates.slice(0, 5).map((date, index) => ({
    date,
    minimumCelsius: optionalNumber(minimums[index]),
    maximumCelsius: optionalNumber(maximums[index]),
    precipitationProbabilityPercent: optionalNumber(precipitationProbabilities[index]),
    weatherCode: optionalNumber(weatherCodes[index]),
  }));

  return { city, current, forecast };
}
