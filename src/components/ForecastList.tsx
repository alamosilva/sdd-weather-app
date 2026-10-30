import { useId } from 'react';
import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  const headingId = useId();
  const days = forecast.slice(0, 5);

  return (
    <section aria-labelledby={headingId} className="w-full">
      <h2 id={headingId} className="mb-4 text-xl font-semibold text-white">
        Previsão de 5 dias
      </h2>

      {days.length === 0 ? (
        <p role="status" className="text-sm text-white/65">
          Previsão indisponível.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
          {days.map((day, index) => (
            <ForecastCard key={day.localDate} day={day} index={index} unit={unit} />
          ))}
        </div>
      )}
    </section>
  );
}
