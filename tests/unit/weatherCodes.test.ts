import { describe, expect, it } from 'vitest';
import { getWeatherCodePresentation } from '../../src/lib/weatherCodes';

describe('getWeatherCodePresentation', () => {
  it('returns the presentation for a known weather code', () => {
    expect(getWeatherCodePresentation(2)).toEqual({
      label: 'Parcialmente nublado',
      icon: '⛅',
    });
  });

  it('returns the unavailable fallback for an unknown weather code', () => {
    expect(getWeatherCodePresentation(999)).toEqual({
      label: 'Condição indisponível',
      icon: '—',
    });
  });
});
