import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const activeClasses = 'bg-accent-500 text-night-900 shadow-sm';
  const inactiveClasses = 'text-white/70 hover:bg-white/10 hover:text-white';

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
    >
      <button
        type="button"
        aria-pressed={unit === 'celsius'}
        onClick={() => onChange('celsius')}
        className={`min-w-12 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${unit === 'celsius' ? activeClasses : inactiveClasses}`}
      >
        °C
      </button>
      <button
        type="button"
        aria-pressed={unit === 'fahrenheit'}
        onClick={() => onChange('fahrenheit')}
        className={`min-w-12 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${unit === 'fahrenheit' ? activeClasses : inactiveClasses}`}
      >
        °F
      </button>
    </div>
  );
}
