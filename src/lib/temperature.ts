import type { Unit } from '../types/weather';

function roundHalfAwayFromZero(value: number): number {
  return Math.sign(value) * Math.floor(Math.abs(value) + 0.5);
}

export function convertTemperature(celsius: number, unit: Unit): number {
  const value = unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
  return roundHalfAwayFromZero(value);
}

export function unitLabel(unit: Unit): string {
  return unit === 'celsius' ? '°C' : '°F';
}

export function formatTemperature(celsius: number | null, unit: Unit): string {
  if (celsius === null || !Number.isFinite(celsius)) return 'Indisponível';

  return `${convertTemperature(celsius, unit)} ${unitLabel(unit)}`;
}
