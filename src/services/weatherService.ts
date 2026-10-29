import type { City, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REQUEST_TIMEOUT_MS = 10_000;

export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizeCityName(name: string): string {
  return name
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR');
}

function mapCity(value: unknown): City | null {
  if (!isRecord(value)) return null;

  const { name, latitude, longitude, id, admin1, country } = value;
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    !isFiniteNumber(latitude) ||
    !isFiniteNumber(longitude)
  ) {
    return null;
  }

  const cityId =
    typeof id === 'string' || typeof id === 'number'
      ? String(id)
      : `fallback:${normalizeCityName(name)}:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;

  return {
    id: cityId,
    name,
    latitude,
    longitude,
    ...(typeof admin1 === 'string' ? { admin1 } : {}),
    ...(typeof country === 'string' ? { country } : {}),
  };
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    const wasAborted =
      controller.signal.aborted || (error instanceof Error && error.name === 'AbortError');
    throw new WeatherServiceError(wasAborted ? 'A requisição demorou demais.' : 'Falha de rede.');
  } finally {
    clearTimeout(timeoutId);
  }
}

async function requestJson(url: string): Promise<unknown> {
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError(
      `Open-Meteo respondeu com HTTP ${response.status}.`,
      response.status,
    );
  }

  try {
    return await response.json();
  } catch {
    throw new WeatherServiceError('A resposta da Open-Meteo não contém JSON válido.');
  }
}

function finiteNumber(value: unknown): number | null {
  return isFiniteNumber(value) ? value : null;
}

function finiteNumberOrZeroWhenNull(value: unknown): number | null {
  return value === null ? 0 : finiteNumber(value);
}

function dateInTimezone(epochSeconds: number, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(epochSeconds * 1000));
  const dateParts = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const { year, month, day } = dateParts;

  if (!year || !month || !day) {
    throw new WeatherServiceError('Não foi possível determinar a data local do forecast.');
  }

  return `${year}-${month}-${day}`;
}

function addCalendarDays(localDate: string, daysToAdd: number): string {
  const [year, month, day] = localDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + daysToAdd));
  return date.toISOString().slice(0, 10);
}

export async function searchCities(name: string): Promise<City[]> {
  const trimmedName = name.trim();
  if (!trimmedName) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(trimmedName)}&count=10&language=pt&format=json`;

  const payload = await requestJson(url);

  if (!isRecord(payload) || !Array.isArray(payload.results)) return [];

  return payload.results.map(mapCity).filter((city): city is City => city !== null);
}

export async function getWeather(city: City): Promise<WeatherData> {
  const query = [
    `latitude=${encodeURIComponent(String(city.latitude))}`,
    `longitude=${encodeURIComponent(String(city.longitude))}`,
    'current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure',
    'daily=weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    'forecast_days=5',
    'timezone=auto',
    'temperature_unit=celsius',
    'wind_speed_unit=kmh',
    'timeformat=unixtime',
  ].join('&');
  const payload = await requestJson(`https://api.open-meteo.com/v1/forecast?${query}`);

  if (!isRecord(payload) || !isRecord(payload.current) || !isRecord(payload.daily)) {
    throw new WeatherServiceError('Resposta incompleta: current ou daily ausente.');
  }
  const currentData = payload.current;
  const dailyData = payload.daily;

  if (typeof payload.timezone !== 'string' || payload.timezone.length === 0) {
    throw new WeatherServiceError('Resposta incompleta: timezone ausente.');
  }
  const timezone = payload.timezone;

  const dailyTimes = Array.isArray(dailyData.time) ? dailyData.time : [];
  const firstTime = dailyTimes.find(isFiniteNumber);
  if (firstTime === undefined) {
    throw new WeatherServiceError('Resposta incompleta: daily.time ausente.');
  }

  let firstLocalDate: string;
  try {
    firstLocalDate = dateInTimezone(firstTime, timezone);
  } catch (error) {
    if (error instanceof WeatherServiceError) throw error;
    throw new WeatherServiceError('Timezone inválido na resposta do forecast.');
  }

  const dailyValues = (key: string, index: number): number | null => {
    const values = dailyData[key];
    return Array.isArray(values) ? finiteNumber(values[index]) : null;
  };

  const forecast = Array.from({ length: 5 }, (_, index): ForecastDay => {
    const time = dailyTimes[index];
    const localDate = isFiniteNumber(time)
      ? dateInTimezone(time, timezone)
      : addCalendarDays(firstLocalDate, index);

    return {
      localDate,
      weatherCode: dailyValues('weather_code', index),
      minimumC: dailyValues('temperature_2m_min', index),
      maximumC: dailyValues('temperature_2m_max', index),
      precipitationProbabilityPercent: finiteNumberOrZeroWhenNull(
        Array.isArray(dailyData.precipitation_probability_max)
          ? dailyData.precipitation_probability_max[index]
          : undefined,
      ),
    };
  });

  return {
    location: city,
    timezone,
    current: {
      temperatureC: finiteNumber(currentData.temperature_2m),
      weatherCode: finiteNumber(currentData.weather_code),
      referenceTimeEpochSeconds: finiteNumber(currentData.time),
      humidityPercent: finiteNumber(currentData.relative_humidity_2m),
      windSpeedKmh: finiteNumber(currentData.wind_speed_10m),
      precipitationMm: finiteNumberOrZeroWhenNull(currentData.precipitation),
      pressureHpa: finiteNumber(currentData.surface_pressure),
    },
    forecast,
    receivedAtEpochMs: Date.now(),
  };
}
