import { formatDayLabel, getShortDate } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
  index: number;
}

function formatProbability(probability: number | undefined): string {
  return probability !== undefined && Number.isFinite(probability)
    ? `${Math.round(probability)}%`
    : 'Indisponível';
}

function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const condition = getWeatherCondition(day.weatherCode);

  return (
    <article
      aria-label={`Previsão para ${formatDayLabel(day.date, index)} ${getShortDate(day.date)}`}
      className="flex min-h-56 min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-white shadow-glass backdrop-blur-md"
    >
      <p className="text-sm font-semibold capitalize text-white/80">{formatDayLabel(day.date, index)}</p>
      <p className="text-xs text-white/70">{getShortDate(day.date)}</p>
      <div aria-label={condition.label} className="mt-4 text-center" role="img">
        <span aria-hidden="true" className="text-4xl">
          {condition.icon}
        </span>
        <p className="mt-2 min-h-10 text-sm text-white/70">{condition.label}</p>
      </div>
      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/75">Máxima</p>
          <p className="text-xl font-semibold">{formatTemperature(day.maximumCelsius, unit)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-white/75">Mínima</p>
          <p className="text-lg text-white/70">{formatTemperature(day.minimumCelsius, unit)}</p>
        </div>
      </div>
      <p className="mt-3 border-t border-white/10 pt-3 text-sm text-white/75">
        Chuva: {formatProbability(day.precipitationProbabilityPercent)}
      </p>
    </article>
  );
}

export default ForecastCard;
