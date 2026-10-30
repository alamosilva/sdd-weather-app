import { useRef, useState } from 'react';
import { getWeather, searchCities } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

type LastOperation = { kind: 'search'; name: string } | { kind: 'forecast'; city: City };

export interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Falha inesperada ao consultar o clima.';
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const lastOperation = useRef<LastOperation | null>(null);

  async function loadWeather(city: City, activeRequestId: number): Promise<void> {
    lastOperation.current = { kind: 'forecast', city };
    const result = await getWeather(city);
    if (activeRequestId !== requestId.current) return;

    setData(result);
    setError(null);
    setStatus('success');
  }

  async function search(name: string): Promise<void> {
    const trimmedName = name.trim();
    const activeRequestId = ++requestId.current;
    lastOperation.current = { kind: 'search', name: trimmedName };
    setQuery(trimmedName);
    setCities([]);
    setData(null);
    setError(null);

    if (!trimmedName) {
      setStatus('empty');
      return;
    }

    setStatus('loading');
    try {
      const results = await searchCities(trimmedName);
      if (activeRequestId !== requestId.current) return;

      setCities(results);
      const firstCity = results[0];
      if (!firstCity) {
        setStatus('empty');
        return;
      }

      await loadWeather(firstCity, activeRequestId);
    } catch (requestError) {
      if (activeRequestId !== requestId.current) return;
      setError(errorMessage(requestError));
      setStatus('error');
    }
  }

  async function selectCity(city: City): Promise<void> {
    const activeRequestId = ++requestId.current;
    lastOperation.current = { kind: 'forecast', city };
    setQuery(city.name);
    setData(null);
    setError(null);
    setStatus('loading');

    try {
      await loadWeather(city, activeRequestId);
    } catch (requestError) {
      if (activeRequestId !== requestId.current) return;
      setError(errorMessage(requestError));
      setStatus('error');
    }
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (!operation) return;

    if (operation.kind === 'search') {
      await search(operation.name);
      return;
    }

    await selectCity(operation.city);
  }

  return { status, data, cities, error, query, search, selectCity, retry };
}
