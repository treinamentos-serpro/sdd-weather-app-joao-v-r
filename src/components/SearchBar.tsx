import type { FormEvent } from 'react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCity = city.trim();

    if (!trimmedCity) {
      setError('Informe uma cidade para pesquisar.');
      return;
    }

    setError('');
    onSearch(trimmedCity);
  }

  function handleCityChange(value: string) {
    setCity(value);

    if (error) {
      setError('');
    }
  }

  return (
    <form
      aria-label="Buscar cidade"
      className="flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-glass backdrop-blur-md sm:flex-row sm:items-end"
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label className="text-sm font-medium text-white" htmlFor="city-search">
          Cidade
        </label>
        <input
          aria-describedby={error ? 'city-search-error' : undefined}
          aria-invalid={Boolean(error)}
          className="min-h-11 w-full rounded-xl border border-white/40 bg-night-800/80 px-4 text-white outline-none transition placeholder:text-white/70 focus:border-accent-400 focus:ring-2 focus:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id="city-search"
          onChange={(event) => handleCityChange(event.target.value)}
          placeholder="Digite uma cidade"
          type="search"
          value={city}
        />
        {error ? (
          <p className="text-sm text-red-300" id="city-search-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <button
        className="min-h-11 rounded-xl bg-accent-500 px-5 font-semibold text-night-900 transition hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-accent-500"
        disabled={disabled}
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}

export default SearchBar;
