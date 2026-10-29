import { describe, expect, it } from 'vitest';
import { formatDayLabel, getShortDate } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it('labels index zero as today and index one as tomorrow', () => {
    expect(formatDayLabel('2026-10-29', 0)).toBe('Hoje');
    expect(formatDayLabel('2026-10-30', 1)).toBe('Amanhã');
  });

  it('uses the localized weekday for later forecast indices', () => {
    expect(formatDayLabel('2026-10-31', 2)).toBe('Sáb');
  });

  it('returns an unavailable label for an invalid date', () => {
    expect(formatDayLabel('2026-02-30', 2)).toBe('Data indisponível');
  });
});

describe('getShortDate', () => {
  it('formats valid ISO local dates as dd/MM', () => {
    expect(getShortDate('2026-10-29')).toBe('29/10');
  });

  it('returns an unavailable label for an invalid date', () => {
    expect(getShortDate('invalid')).toBe('Data indisponível');
  });
});
