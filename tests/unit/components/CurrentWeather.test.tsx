import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../../src/components/CurrentWeather';
import type { City, CurrentWeather as CurrentWeatherData } from '../../../src/types/weather';

const city: City = {
  id: 'city-1',
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  latitude: -23.55,
  longitude: -46.63,
};

const current: CurrentWeatherData = {
  temperatureC: 22,
  weatherCode: 2,
  referenceTimeEpochSeconds: 1_798_000_000,
  humidityPercent: 68,
  windSpeedKmh: 12.5,
  precipitationMm: 0,
  pressureHpa: 1014,
};

describe('CurrentWeather', () => {
  it('renders the city, condition, converted temperature, and metrics', () => {
    render(<CurrentWeather city={city} current={current} unit="fahrenheit" />);

    expect(screen.getByRole('heading', { name: 'São Paulo' })).toBeInTheDocument();
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(screen.getByText('72 °F')).toBeInTheDocument();
    expect(screen.getByText('68 %')).toBeInTheDocument();
    expect(screen.getByText('12,5 km/h')).toBeInTheDocument();
    expect(screen.getByText('0 mm')).toBeInTheDocument();
    expect(screen.getByText('1.014 hPa')).toBeInTheDocument();
  });

  it('shows unavailable labels when current values are missing', () => {
    render(
      <CurrentWeather
        city={city}
        current={{
          temperatureC: null,
          weatherCode: null,
          referenceTimeEpochSeconds: null,
        }}
        unit="celsius"
      />,
    );

    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(5);
  });

  it('gives each rendered weather region a unique accessible name', () => {
    render(
      <>
        <CurrentWeather city={city} current={current} unit="celsius" />
        <CurrentWeather city={city} current={current} unit="fahrenheit" />
      </>,
    );

    expect(screen.getAllByRole('region', { name: 'São Paulo' })).toHaveLength(2);
  });
});
