import type { WeatherData } from '../types/weather';

const nowEpochSeconds = Math.floor(Date.now() / 1000);

export const mockWeatherData: WeatherData = {
  location: {
    id: 'open-meteo:3448439',
    name: 'São Paulo',
    admin1: 'São Paulo',
    country: 'Brasil',
    latitude: -23.55,
    longitude: -46.63,
  },
  timezone: 'America/Sao_Paulo',
  current: {
    temperatureC: 22,
    weatherCode: 2,
    referenceTimeEpochSeconds: nowEpochSeconds,
    humidityPercent: 68,
    windSpeedKmh: 12.5,
    precipitationMm: 0,
    pressureHpa: 1014,
  },
  forecast: [
    {
      localDate: '2026-10-29',
      weatherCode: 2,
      minimumC: 17,
      maximumC: 25,
      precipitationProbabilityPercent: 20,
    },
    {
      localDate: '2026-10-30',
      weatherCode: 3,
      minimumC: 18,
      maximumC: 26,
      precipitationProbabilityPercent: 15,
    },
    {
      localDate: '2026-10-31',
      weatherCode: 61,
      minimumC: 17,
      maximumC: 22,
      precipitationProbabilityPercent: 80,
    },
    {
      localDate: '2026-11-01',
      weatherCode: 1,
      minimumC: 16,
      maximumC: 26,
      precipitationProbabilityPercent: 10,
    },
    {
      localDate: '2026-11-02',
      weatherCode: 0,
      minimumC: 17,
      maximumC: 27,
      precipitationProbabilityPercent: 5,
    },
  ],
  receivedAtEpochMs: nowEpochSeconds * 1000,
};
