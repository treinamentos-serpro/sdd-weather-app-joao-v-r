import type { City } from '../types/weather';

interface CityResultsProps {
  cities: City[];
  onSelect: (city: City) => void;
}

function CityResults({ cities, onSelect }: CityResultsProps) {
  return (
    <section aria-labelledby="city-results-title" className="w-full">
      <h1 className="text-2xl font-semibold" id="city-results-title">
        Escolha uma cidade
      </h1>
      <ul className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/5">
        {cities.map((city) => {
          const location = [city.admin1, city.country].filter(Boolean).join(', ');

          return (
            <li key={city.id}>
              <button
                aria-label={`${city.name}, ${location}`}
                className="flex min-h-14 w-full flex-col items-start justify-center px-4 py-3 text-left transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-400"
                onClick={() => onSelect(city)}
                type="button"
              >
                <span className="font-semibold text-white">{city.name}</span>
                <span className="text-sm text-white/75">{location}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default CityResults;
