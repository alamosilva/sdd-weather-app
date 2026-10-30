import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weatherData';
import { getWeather, searchCities } from '../../src/services/weatherService';
import type { WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
}));

const mockedSearchCities = vi.mocked(searchCities);
const mockedGetWeather = vi.mocked(getWeather);

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('App', () => {
  it('starts idle and searches the mock city through loading to success', async () => {
    const user = userEvent.setup();
    const weatherResult = createDeferred<WeatherData>();
    mockedSearchCities.mockResolvedValue([mockWeatherData.location]);
    mockedGetWeather.mockReturnValue(weatherResult.promise);
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('Busque uma cidade');
    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(screen.getByRole('status')).toHaveTextContent('Buscando clima para São Paulo');

    await act(async () => {
      weatherResult.resolve(mockWeatherData);
      await weatherResult.promise;
    });

    expect(await screen.findByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('shows the empty state when the query does not match the mock city', async () => {
    const user = userEvent.setup();
    mockedSearchCities.mockResolvedValue([]);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'Curitiba');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByText('Nenhuma cidade encontrada')).toBeInTheDocument();
    expect(mockedGetWeather).not.toHaveBeenCalled();
  });

  it('keeps focus on the search button and marks main busy while loading', async () => {
    const user = userEvent.setup();
    const weatherResult = createDeferred<WeatherData>();
    mockedSearchCities.mockResolvedValue([mockWeatherData.location]);
    mockedGetWeather.mockReturnValue(weatherResult.promise);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'São Paulo');
    const searchButton = screen.getByRole('button', { name: 'Buscar' });
    await user.click(searchButton);

    expect(searchButton).toHaveFocus();
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Buscando clima para São Paulo');

    await act(async () => {
      weatherResult.resolve(mockWeatherData);
      await weatherResult.promise;
    });
  });

  it('connects the error retry action to useWeather.retry', async () => {
    const user = userEvent.setup();
    mockedSearchCities.mockResolvedValue([mockWeatherData.location]);
    mockedGetWeather
      .mockRejectedValueOnce(new Error('Falha de rede.'))
      .mockResolvedValueOnce(mockWeatherData);
    render(<App />);

    await user.type(screen.getByRole('searchbox', { name: 'Buscar cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(mockedSearchCities).toHaveBeenCalledOnce();
    expect(mockedGetWeather).toHaveBeenCalledTimes(2);
  });
});
