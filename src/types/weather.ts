export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperatureCelsius?: number;
  weatherCode?: number;
  humidityPercent?: number;
  windSpeedKmh?: number;
  precipitationMm?: number;
  pressureHpa?: number;
}

export interface ForecastDay {
  date: string;
  minimumCelsius?: number;
  maximumCelsius?: number;
  weatherCode?: number;
  precipitationProbabilityPercent?: number;
}

export interface WeatherData {
  city: City;
  current: CurrentWeather;
  forecast: ForecastDay[];
}

export type Unit = 'celsius' | 'fahrenheit';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export type WeatherErrorKind = 'validation' | 'network' | 'api' | 'timeout' | 'invalid-response';

export interface WeatherError {
  kind: WeatherErrorKind;
  message: string;
  retryable: boolean;
}

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'Sao Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
    country: 'Brazil',
    admin1: 'Sao Paulo',
  },
  current: {
    temperatureCelsius: 22,
    weatherCode: 1,
    humidityPercent: 68,
    windSpeedKmh: 14,
    precipitationMm: 0,
    pressureHpa: 1015,
  },
  forecast: [
    {
      date: '2026-09-30',
      minimumCelsius: 17,
      maximumCelsius: 25,
      weatherCode: 1,
      precipitationProbabilityPercent: 10,
    },
    {
      date: '2026-10-01',
      minimumCelsius: 18,
      maximumCelsius: 26,
      weatherCode: 2,
      precipitationProbabilityPercent: 20,
    },
    {
      date: '2026-10-02',
      minimumCelsius: 19,
      maximumCelsius: 27,
      weatherCode: 3,
      precipitationProbabilityPercent: 35,
    },
    {
      date: '2026-10-03',
      minimumCelsius: 18,
      maximumCelsius: 24,
      weatherCode: 61,
      precipitationProbabilityPercent: 65,
    },
    {
      date: '2026-10-04',
      minimumCelsius: 17,
      maximumCelsius: 23,
      weatherCode: 80,
      precipitationProbabilityPercent: 55,
    },
  ],
};
