import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastList from '../../../src/components/ForecastList';
import type { ForecastDay } from '../../../src/types/weather';

const forecast: ForecastDay[] = [
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
];

describe('ForecastList', () => {
  it('renders five day cards with condition, temperatures, and rain probability', () => {
    render(<ForecastList forecast={forecast} unit="celsius" />);

    expect(screen.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    const firstCard = screen.getByRole('article', {
      name: 'Hoje, 29/10: Parcialmente nublado',
    });
    expect(within(firstCard).getByText('25 °C')).toBeInTheDocument();
    expect(within(firstCard).getByText('17 °C')).toBeInTheDocument();
    expect(within(firstCard).getByText('20%')).toBeInTheDocument();
  });

  it('converts max/min to the selected unit and marks missing rain probability unavailable', () => {
    const firstDay = { ...forecast[0], precipitationProbabilityPercent: null };
    render(<ForecastList forecast={[firstDay]} unit="fahrenheit" />);

    const card = screen.getByRole('article', {
      name: 'Hoje, 29/10: Parcialmente nublado',
    });
    expect(within(card).getByText('77 °F')).toBeInTheDocument();
    expect(within(card).getByText('63 °F')).toBeInTheDocument();
    expect(within(card).getByText('Indisponível')).toBeInTheDocument();
  });

  it('renders an accessible empty state when there are no forecast days', () => {
    render(<ForecastList forecast={[]} unit="celsius" />);

    expect(screen.getByRole('status')).toHaveTextContent('Previsão indisponível.');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
});
