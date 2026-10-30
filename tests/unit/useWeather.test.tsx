import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weatherData';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

const firstCity: City = {
  id: 'city-1',
  name: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};

const secondCity: City = {
  id: 'city-2',
  name: 'Campinas',
  latitude: -22.91,
  longitude: -47.06,
};

const mockedSearchCities = vi.mocked(searchCities);
const mockedGetWeather = vi.mocked(getWeather);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('useWeather', () => {
  it('searches and loads the forecast for the first city result', async () => {
    mockedSearchCities.mockResolvedValue([firstCity, secondCity]);
    mockedGetWeather.mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('  São Paulo  ');
    });

    expect(mockedSearchCities).toHaveBeenCalledWith('São Paulo');
    expect(mockedGetWeather).toHaveBeenCalledWith(firstCity);
    expect(result.current).toMatchObject({
      status: 'success',
      data: mockWeatherData,
      cities: [firstCity, secondCity],
      query: 'São Paulo',
      error: null,
    });
  });

  it('does not call services for a blank search and sets empty status', async () => {
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('   ');
    });

    expect(mockedSearchCities).not.toHaveBeenCalled();
    expect(mockedGetWeather).not.toHaveBeenCalled();
    expect(result.current.status).toBe('empty');
  });

  it('sets empty when geocoding returns no cities', async () => {
    mockedSearchCities.mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Cidade inexistente');
    });

    expect(result.current.status).toBe('empty');
    expect(result.current.cities).toEqual([]);
    expect(mockedGetWeather).not.toHaveBeenCalled();
  });

  it('retries the last failed forecast without repeating geocoding', async () => {
    mockedSearchCities.mockResolvedValue([firstCity]);
    mockedGetWeather
      .mockRejectedValueOnce(new Error('Falha de rede.'))
      .mockResolvedValueOnce(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search(firstCity.name);
    });
    expect(result.current).toMatchObject({ status: 'error', error: 'Falha de rede.' });

    await act(async () => {
      await result.current.retry();
    });

    expect(mockedSearchCities).toHaveBeenCalledOnce();
    expect(mockedGetWeather).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });

  it('ignores a stale response after a newer search starts', async () => {
    let resolveFirstSearch: ((cities: City[]) => void) | undefined;
    mockedSearchCities
      .mockImplementationOnce(
        () =>
          new Promise<City[]>((resolve) => {
            resolveFirstSearch = resolve;
          }),
      )
      .mockResolvedValueOnce([secondCity]);
    mockedGetWeather.mockResolvedValue(mockWeatherData);
    const { result } = renderHook(() => useWeather());

    let firstSearch: Promise<void> | undefined;
    await act(async () => {
      firstSearch = result.current.search(firstCity.name);
    });
    await act(async () => {
      await result.current.search(secondCity.name);
    });
    await act(async () => {
      resolveFirstSearch?.([firstCity]);
      await firstSearch;
    });

    expect(result.current.query).toBe(secondCity.name);
    expect(result.current.cities).toEqual([secondCity]);
    expect(mockedGetWeather).toHaveBeenCalledWith(secondCity);
  });
});
