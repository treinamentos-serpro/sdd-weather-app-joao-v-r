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
  results?: GeocodingResult[];
}

interface ForecastResponse {
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
    typeof result.id === 'number' &&
    typeof result.name === 'string' &&
    typeof result.latitude === 'number' &&
    typeof result.longitude === 'number' &&
    typeof result.country === 'string' &&
    (result.admin1 === undefined || typeof result.admin1 === 'string')
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isForecastResponse(value: unknown): value is ForecastResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const response = value as ForecastResponse;
  const dates = response.daily?.time;

  return (
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
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (
      error !== null &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'AbortError'
    ) {
      throw new WeatherServiceError('A requisição demorou demais.', 'timeout');
    }

    throw new WeatherServiceError('Falha de rede.', 'network');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return [];
  }

  const url = `${GEOCODING_ENDPOINT}?name=${encodeURIComponent(trimmedName)}&count=5&language=pt&format=json`;

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(`A busca de cidades falhou (${response.status}).`, 'api');
  }

  let payload: GeocodingResponse;

  try {
    payload = (await response.json()) as GeocodingResponse;
  } catch {
    throw new WeatherServiceError('A resposta de cidades é inválida.', 'invalid-response');
  }

  return (payload.results ?? []).filter(isGeocodingResult).map((result) => ({
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country,
    admin1: result.admin1,
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
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

  const response = await fetchWithTimeout(`${FORECAST_ENDPOINT}?${parameters.toString()}`);

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
    temperatureCelsius: isFiniteNumber(currentResponse?.temperature_2m)
      ? currentResponse.temperature_2m
      : undefined,
    humidityPercent: isFiniteNumber(currentResponse?.relative_humidity_2m)
      ? currentResponse.relative_humidity_2m
      : undefined,
    weatherCode: isFiniteNumber(currentResponse?.weather_code)
      ? currentResponse.weather_code
      : undefined,
    windSpeedKmh: isFiniteNumber(currentResponse?.wind_speed_10m)
      ? currentResponse.wind_speed_10m
      : undefined,
    precipitationMm:
      currentResponse?.precipitation === null
        ? 0
        : isFiniteNumber(currentResponse?.precipitation)
          ? currentResponse.precipitation
          : undefined,
    pressureHpa: isFiniteNumber(currentResponse?.surface_pressure)
      ? currentResponse.surface_pressure
      : undefined,
  };

  const forecast: ForecastDay[] = dates.slice(0, 5).map((date, index) => ({
    date,
    minimumCelsius: isFiniteNumber(minimums[index]) ? minimums[index] : undefined,
    maximumCelsius: isFiniteNumber(maximums[index]) ? maximums[index] : undefined,
    precipitationProbabilityPercent: isFiniteNumber(precipitationProbabilities[index])
      ? precipitationProbabilities[index]
      : undefined,
    weatherCode: isFiniteNumber(weatherCodes[index]) ? weatherCodes[index] : undefined,
  }));

  return { city, current, forecast };
}
