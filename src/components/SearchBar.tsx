import { type FormEvent, useId, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const inputId = useId();
  const [city, setCity] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCity = city.trim();
    if (disabled || trimmedCity.length === 0) return;

    onSearch(trimmedCity);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex w-full items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 shadow-glass backdrop-blur-md sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-white/85">
          Buscar cidade
        </label>
        <input
          id={inputId}
          type="search"
          value={city}
          onChange={(event) => setCity(event.currentTarget.value)}
          placeholder="Ex.: São Paulo"
          disabled={disabled}
          className="w-full rounded-xl border border-white/10 bg-night-800/80 px-4 py-3 text-white outline-none transition placeholder:text-white/70 focus-visible:border-accent-400 focus-visible:ring-2 focus-visible:ring-accent-400/60 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
      <button
        type="submit"
        disabled={disabled || city.trim().length === 0}
        className="shrink-0 rounded-xl bg-accent-500 px-5 py-3 font-semibold text-night-900 transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buscar
      </button>
    </form>
  );
}
