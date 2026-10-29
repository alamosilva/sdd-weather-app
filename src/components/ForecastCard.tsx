import { formatDayLabel, getShortDate } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCodePresentation } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const dayLabel = formatDayLabel(day.localDate, index);
  const shortDate = getShortDate(day.localDate);
  const condition = getWeatherCodePresentation(day.weatherCode);
  const precipitation =
    day.precipitationProbabilityPercent === null ||
    day.precipitationProbabilityPercent === undefined
      ? 'Indisponível'
      : `${day.precipitationProbabilityPercent}%`;

  return (
    <article
      aria-label={`${dayLabel}, ${shortDate}: ${condition.label}`}
      className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md"
    >
      <h3 className="text-sm font-semibold text-white">{dayLabel}</h3>
      <p className="mt-1 text-xs text-white/60">{shortDate}</p>
      <span aria-hidden="true" className="mt-3 text-4xl">
        {condition.icon}
      </span>
      <p className="mt-2 min-h-10 text-sm text-white/75">{condition.label}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
        <div>
          <dt className="text-xs text-white/55">Máx.</dt>
          <dd className="mt-1 text-sm font-semibold text-white">
            {formatTemperature(day.maximumC, unit)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-white/55">Mín.</dt>
          <dd className="mt-1 text-sm font-semibold text-white">
            {formatTemperature(day.minimumC, unit)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-white/55">Probabilidade de chuva</dt>
          <dd className="mt-1 text-sm font-medium text-white">{precipitation}</dd>
        </div>
      </dl>
    </article>
  );
}
