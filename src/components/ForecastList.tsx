import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-title" className="w-full">
      <h2 className="mb-4 text-xl font-semibold text-white" id="forecast-title">
        Previsão para os próximos dias
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day, index) => (
          <ForecastCard day={day} index={index} key={day.date} unit={unit} />
        ))}
      </div>
    </section>
  );
}

export default ForecastList;
