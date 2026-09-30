import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import SearchBar from '../../src/components/SearchBar';
import UnitToggle from '../../src/components/UnitToggle';
import type { Unit } from '../../src/types/weather';

describe('SearchBar', () => {
  it('não chama onSearch quando o campo está vazio', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Informe uma cidade para pesquisar.');
  });

  it('chama onSearch com o termo informado', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledWith('São Paulo');
  });
});

describe('temperature unit toggle', () => {
  it('exibe 32°F ao alternar o clima atual de 0°C para Fahrenheit', async () => {
    const user = userEvent.setup();

    function WeatherWithUnitToggle() {
      const [unit, setUnit] = useState<Unit>('celsius');

      return (
        <>
          <UnitToggle unit={unit} onChange={setUnit} />
          <CurrentWeather
            city={{
              id: 1,
              name: 'Lisboa',
              latitude: 38.72,
              longitude: -9.14,
              country: 'Portugal',
            }}
            current={{ temperatureCelsius: 0, weatherCode: 0 }}
            unit={unit}
          />
        </>
      );
    }

    render(<WeatherWithUnitToggle />);

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('32°F')).toBeInTheDocument();
  });
});
