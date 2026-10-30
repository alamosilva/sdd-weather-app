import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('temperature helpers', () => {
  it('converts Celsius reference points to Fahrenheit', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
    expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
  });

  it('returns the rounded value in the selected unit', () => {
    expect(convertTemperature(20, 'celsius')).toBe(20);
    expect(convertTemperature(21.3, 'fahrenheit')).toBe(70);
    expect(convertTemperature(-40, 'celsius')).toBe(-40);
  });

  it('formats rounded values with the selected unit symbol', () => {
    expect(formatTemperature(21.3, 'celsius')).toBe('21 °C');
    expect(formatTemperature(21.3, 'fahrenheit')).toBe('70 °F');
    expect(formatTemperature(-40, 'fahrenheit')).toBe('-40 °F');
  });

  it('labels Celsius and Fahrenheit units', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });

  it('formats a missing temperature as unavailable', () => {
    expect(formatTemperature(null, 'celsius')).toBe('Indisponível');
  });
});
