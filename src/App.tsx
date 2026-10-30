import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const weather = useWeather();

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <header className="border-b border-white/10 bg-night-900/80 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center">
          <a
            href="#main-content"
            className="flex shrink-0 items-center gap-2 text-lg font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          >
            <span aria-hidden="true" className="text-sun">
              ☀
            </span>
            <span>Tempo</span>
          </a>

          <div className="min-w-0 flex-1">
            <SearchBar onSearch={(query) => void weather.search(query)} />
          </div>

          <div className="flex justify-end sm:shrink-0">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        aria-busy={weather.status === 'loading'}
        className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10"
      >
        {weather.status === 'idle' && (
          <EmptyState
            title="Busque uma cidade"
            hint="Digite o nome de uma cidade para consultar o clima."
          />
        )}

        {weather.status === 'loading' && (
          <LoadingState message={`Buscando clima para ${weather.query}...`} />
        )}

        {weather.status === 'empty' && (
          <EmptyState
            title="Nenhuma cidade encontrada"
            hint={`Não encontramos resultados para “${weather.query}”. Tente outro nome.`}
          />
        )}

        {weather.status === 'error' && (
          <ErrorState
            message={weather.error ?? 'Não foi possível carregar os dados do clima.'}
            onRetry={() => void weather.retry()}
          />
        )}

        {weather.status === 'success' && weather.data && (
          <>
            <CurrentWeather
              city={weather.data.location}
              current={weather.data.current}
              unit={unit}
            />
            <ForecastList forecast={weather.data.forecast} unit={unit} />
          </>
        )}
      </main>
    </div>
  );
}
