import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

interface Metric {
  label: string;
  value: string;
}

function formatMetric(value: number | undefined, suffix: string): string {
  return value !== undefined && Number.isFinite(value) ? `${value}${suffix}` : 'Indisponível';
}

function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const condition = getWeatherCondition(current.weatherCode);
  const metrics: Metric[] = [
    { label: 'Umidade', value: formatMetric(current.humidityPercent, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, ' km/h') },
    { label: 'Precipitação', value: formatMetric(current.precipitationMm, ' mm') },
    { label: 'Pressão', value: formatMetric(current.pressureHpa, ' hPa') },
  ];

  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-glass backdrop-blur-md sm:p-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-white/75">Agora</p>
          <h1 className="mt-1 text-2xl font-semibold" id="current-weather-title">
            {city.name}
          </h1>
          <p className="mt-1 text-white/75">
            {city.admin1 ? `${city.admin1}, ` : ''}
            {city.country}
          </p>
        </div>
        <div aria-label={condition.label} className="flex items-center gap-4" role="img">
          <span aria-hidden="true" className="text-6xl leading-none">
            {condition.icon}
          </span>
          <div>
            <p className="text-6xl font-bold tracking-tight sm:text-7xl">
              {formatTemperature(current.temperatureCelsius, unit)}
            </p>
            <p className="mt-2 text-lg text-white/75">{condition.label}</p>
          </div>
        </div>
      </div>
      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div className="rounded-xl border border-white/10 bg-night-800/60 p-4" key={metric.label}>
            <dt className="text-sm text-white/75">{metric.label}</dt>
            <dd className="mt-1 text-lg font-semibold">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default CurrentWeather;
