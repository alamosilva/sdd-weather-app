import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

const city: City = {
  id: 'city-1',
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
};

describe('searchCities', () => {
  it('returns an empty list for blank input without making a request', async () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('encodes the trimmed name and maps geocoding results to City', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        results: [
          {
            id: 123,
            name: 'São Paulo',
            admin1: 'São Paulo',
            country: 'Brasil',
            latitude: -23.55,
            longitude: -46.63,
          },
          {
            name: 'Cidade sem ID',
            latitude: 1.23456,
            longitude: -2.34567,
          },
          { id: 456, name: 'Resultado inválido' },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const cities = await searchCities('  São Paulo  ');

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(clearTimeoutSpy).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toContain('name=S%C3%A3o%20Paulo');
    expect(fetchMock.mock.calls[0]?.[0]).toContain('count=10&language=pt&format=json');
    expect(cities).toEqual([
      {
        id: '123',
        name: 'São Paulo',
        admin1: 'São Paulo',
        country: 'Brasil',
        latitude: -23.55,
        longitude: -46.63,
      },
      {
        id: 'fallback:cidade sem id:1.2346:-2.3457',
        name: 'Cidade sem ID',
        latitude: 1.23456,
        longitude: -2.34567,
      },
    ]);
  });

  it('returns an empty list when the response has no results', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ results: [] })));

    await expect(searchCities('São Paulo')).resolves.toEqual([]);
  });

  it('returns an empty list when results is absent', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({})));

    await expect(searchCities('São Paulo')).resolves.toEqual([]);
  });

  it('throws WeatherServiceError when the provider responds non-ok', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({}, 503)));

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      status: 503,
    });
  });

  it('normalizes network failures to WeatherServiceError', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockRejectedValue(new TypeError('offline')));

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'Falha de rede.',
    });
  });

  it('aborts after 10 seconds, reports the timeout message, and clears the timer', async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const fetchMock = vi.fn<typeof fetch>().mockImplementation(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = searchCities('São Paulo');
    const rejectionAssertion = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      message: 'A requisição demorou demais.',
    });
    await vi.advanceTimersByTimeAsync(10_000);

    await rejectionAssertion;
    expect(clearTimeoutSpy).toHaveBeenCalledOnce();
  });
});

describe('getWeather', () => {
  it('requests current and daily data and maps five local forecast days', async () => {
    const firstDayEpoch = Date.parse('2026-10-29T03:00:00Z') / 1000;
    const dailyTimes = Array.from({ length: 5 }, (_, index) => firstDayEpoch + index * 86_400);
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        timezone: 'America/Sao_Paulo',
        current: {
          time: firstDayEpoch,
          temperature_2m: 22.4,
          weather_code: 2,
          relative_humidity_2m: 68,
          wind_speed_10m: 12.5,
          precipitation: null,
          surface_pressure: 1014,
        },
        daily: {
          time: dailyTimes,
          weather_code: [2, 3, 61, 1, 0],
          temperature_2m_min: [17, 18, 17, 16, 17],
          temperature_2m_max: [25, 26, 22, 26, 27],
          precipitation_probability_max: [null, 15, 80, 10, 5],
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toContain('/v1/forecast?latitude=-23.55&longitude=-46.63');
    expect(fetchMock.mock.calls[0]?.[0]).toContain('current=temperature_2m,weather_code');
    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      'daily=weather_code,temperature_2m_min,temperature_2m_max',
    );
    expect(result.location).toEqual(city);
    expect(result.current).toMatchObject({
      temperatureC: 22.4,
      weatherCode: 2,
      referenceTimeEpochSeconds: firstDayEpoch,
      humidityPercent: 68,
      windSpeedKmh: 12.5,
      precipitationMm: 0,
      pressureHpa: 1014,
    });
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[0]).toEqual({
      localDate: '2026-10-29',
      weatherCode: 2,
      minimumC: 17,
      maximumC: 25,
      precipitationProbabilityPercent: 0,
    });
  });

  it.each([
    ['current', { timezone: 'America/Sao_Paulo', daily: { time: [1_798_000_000] } }],
    ['daily', { timezone: 'America/Sao_Paulo', current: {} }],
  ])('throws WeatherServiceError when %s is absent', async (_missingSection, payload) => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(payload)));

    await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('keeps five days and maps missing parallel values to null', async () => {
    const firstDayEpoch = Date.parse('2026-10-29T03:00:00Z') / 1000;
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse({
          timezone: 'America/Sao_Paulo',
          current: {},
          daily: {
            time: [firstDayEpoch],
            weather_code: [2],
            temperature_2m_min: [17],
            temperature_2m_max: [25],
          },
        }),
      ),
    );

    const result = await getWeather(city);

    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[0]?.precipitationProbabilityPercent).toBeNull();
    expect(result.forecast[1]).toMatchObject({
      localDate: '2026-10-30',
      weatherCode: null,
      minimumC: null,
      maximumC: null,
      precipitationProbabilityPercent: null,
    });
  });
});
