export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id: string;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number | null;
  weatherCode: number | null;
  referenceTimeEpochSeconds: number | null;
  humidityPercent?: number | null;
  windSpeedKmh?: number | null;
  precipitationMm?: number | null;
  pressureHpa?: number | null;
}

export interface ForecastDay {
  localDate: string;
  weatherCode: number | null;
  minimumC: number | null;
  maximumC: number | null;
  precipitationProbabilityPercent?: number | null;
}

export interface WeatherData {
  location: City;
  timezone: string | null;
  current: CurrentWeather;
  forecast: ForecastDay[];
  receivedAtEpochMs: number;
}

export type TemperatureUnit = Unit;
export type CityLocation = City;
export type CurrentConditions = CurrentWeather;
export type WeatherSnapshot = WeatherData;
