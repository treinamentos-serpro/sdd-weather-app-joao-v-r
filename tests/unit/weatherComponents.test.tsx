import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import ForecastList from '../../src/components/ForecastList';
import SearchBar from '../../src/components/SearchBar';
import ErrorState from '../../src/components/states/ErrorState';
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

  it('não chama onSearch quando o campo contém apenas espaços', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), '   ');
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

  it('mostra fallback acessível quando os dados atuais estão ausentes', () => {
    const { container } = render(
      <CurrentWeather
        city={{
          id: 1,
          name: 'Lisboa',
          latitude: 38.72,
          longitude: -9.14,
          country: 'Portugal',
        }}
        current={{}}
        unit="celsius"
      />,
    );

    expect(screen.getByText('Temperatura indisponível')).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(4);
    expect(container.textContent).not.toMatch(/NaN|undefined/);
  });

  it('mostra fallback seguro para valores ausentes na previsão', () => {
    const { container } = render(
      <ForecastList forecast={[{ date: '2026-09-30' }]} unit="celsius" />,
    );

    expect(screen.getByRole('img', { name: 'Condição não disponível' })).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(2);
    expect(screen.getByText('Chuva: Indisponível')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/NaN|undefined/);
  });
});

describe('ErrorState', () => {
  it('anuncia o erro sem oferecer retry quando a falha não é repetível', () => {
    render(
      <ErrorState
        message="Informe uma cidade para pesquisar."
        onRetry={vi.fn()}
        retryable={false}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Informe uma cidade para pesquisar.');
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
  });

  it('oferece retry quando a falha pode ser repetida', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorState message="Falha de rede." onRetry={onRetry} retryable />);

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
