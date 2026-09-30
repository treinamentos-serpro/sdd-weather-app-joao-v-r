import type { KeyboardEvent } from 'react';
import { useRef } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const units: Unit[] = ['celsius', 'fahrenheit'];

function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusUnit(nextUnit: Unit) {
    onChange(nextUnit);
    buttonRefs.current[units.indexOf(nextUnit)]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentUnit: Unit) {
    const currentIndex = units.indexOf(currentUnit);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % units.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + units.length) % units.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = units.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    focusUnit(units[nextIndex]);
  }

  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
      role="group"
    >
      {units.map((option, index) => {
        const isActive = unit === option;
        const label = option === 'celsius' ? 'Celsius' : 'Fahrenheit';

        return (
          <button
            aria-label={label}
            aria-pressed={isActive}
            className={`min-h-10 min-w-12 rounded-lg px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 ${
              isActive
                ? 'bg-accent-500 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
            key={option}
            onClick={() => onChange(option)}
            onKeyDown={(event) => handleKeyDown(event, option)}
            ref={(button) => {
              buttonRefs.current[index] = button;
            }}
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            {option === 'celsius' ? '°C' : '°F'}
          </button>
        );
      })}
    </div>
  );
}

export default UnitToggle;
