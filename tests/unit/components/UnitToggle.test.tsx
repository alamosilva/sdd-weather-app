import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CurrentWeather from '../../../src/components/CurrentWeather';
import UnitToggle from '../../../src/components/UnitToggle';
import type { City, Unit } from '../../../src/types/weather';

const city: City = {
  id: 'city-1',
  name: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};

function UnitToggleWithWeather() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather
        city={city}
        current={{
          temperatureC: 0,
          weatherCode: 0,
          referenceTimeEpochSeconds: null,
        }}
        unit={unit}
      />
    </>
  );
}

describe('UnitToggle', () => {
  it('labels the group and marks the selected unit with aria-pressed', () => {
    render(<UnitToggle unit="celsius" onChange={vi.fn()} />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange when a unit button is activated', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith('fahrenheit');
  });

  it('supports Tab and Space keyboard navigation and activation', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole('button', { name: '°C' })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: '°F' })).toHaveFocus();

    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith('fahrenheit');
  });

  it('updates CurrentWeather from 0 °C to 32 °F when Fahrenheit is selected', async () => {
    const user = userEvent.setup();
    render(<UnitToggleWithWeather />);

    expect(screen.getByText('0 °C')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByText('32 °F')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true');
  });
});
