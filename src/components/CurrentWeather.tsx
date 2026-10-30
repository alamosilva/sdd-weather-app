import { useId } from 'react';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCodePresentation } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatMetric(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'Indisponível';
  }

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(value);

  return `${formattedValue} ${unit}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const headingId = useId();
  const condition = getWeatherCodePresentation(current.weatherCode);
  const temperature = formatTemperature(current.temperatureC, unit);
  const cityDetails = [city.admin1, city.country].filter(Boolean).join(', ');

  const metrics = [
    { label: 'Umidade', value: formatMetric(current.humidityPercent, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, 'km/h') },
    {
      label: 'Precipitação',
      value: formatMetric(current.precipitationMm, 'mm'),
    },
    { label: 'Pressão', value: formatMetric(current.pressureHpa, 'hPa') },
  ];

  return (
    <section
      aria-labelledby={headingId}
      className="w-full rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md sm:p-8"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium uppercase text-white/60">Clima atual</p>
          <h2 id={headingId} className="mt-1 text-2xl font-semibold text-white">
            {city.name}
          </h2>
          {cityDetails && <p className="mt-1 text-sm text-white/65">{cityDetails}</p>}
          <p className="mt-4 text-lg text-white/80">{condition.label}</p>
        </div>

        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <span aria-hidden="true" className="shrink-0 text-5xl sm:text-7xl">
            {condition.icon}
          </span>
          <p className="min-w-0 break-words text-4xl font-semibold leading-none text-white sm:text-7xl">
            {temperature}
          </p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-5 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="text-sm text-white/60">{metric.label}</dt>
            <dd className="mt-1 text-base font-medium text-white">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
