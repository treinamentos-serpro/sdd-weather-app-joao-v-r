import { useEffect, useRef, useState } from 'react';
import CityResults from './components/CityResults';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const { cities, data, error, retry, search, selectCity, status } = useWeather();
  const mainRef = useRef<HTMLElement>(null);
  const previousStatus = useRef(status);

  useEffect(() => {
    const searchFinishedWithResults =
      previousStatus.current === 'loading' &&
      (status === 'success' || status === 'empty' || (status === 'idle' && cities.length > 1));
    previousStatus.current = status;

    if (searchFinishedWithResults) {
      mainRef.current?.focus();
    }
  }, [cities.length, status]);

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <header className="border-b border-white/10 bg-night-800/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center">
          <a
            className="shrink-0 rounded text-xl font-bold tracking-tight text-white outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
            href="/"
          >
            WeatherView
          </a>
          <div className="min-w-0 flex-1">
            <SearchBar disabled={status === 'loading'} onSearch={(city) => void search(city)} />
          </div>
          <UnitToggle onChange={setUnit} unit={unit} />
        </div>
      </header>

      <main
        aria-busy={status === 'loading'}
        className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:py-12"
        ref={mainRef}
        tabIndex={-1}
      >
        {status === 'idle' && cities.length === 0 && <EmptyState />}
        {status === 'idle' && cities.length > 1 && (
          <CityResults cities={cities} onSelect={(city) => void selectCity(city)} />
        )}
        {status === 'loading' && <LoadingState message="Consultando previsão..." />}
        {status === 'empty' && (
          <EmptyState
            title="Nenhuma cidade encontrada"
            hint="Tente pesquisar outro nome de cidade."
          />
        )}
        {status === 'error' && (
          <ErrorState
            message={error?.message}
            onRetry={() => void retry()}
            retryable={error?.retryable ?? false}
          />
        )}
        {status === 'success' && data && (
          <>
            <CurrentWeather city={data.city} current={data.current} unit={unit} />
            <ForecastList forecast={data.forecast} unit={unit} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
