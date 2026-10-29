import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../../src/components/SearchBar';

describe('SearchBar', () => {
  it('renders an accessible search form and sends the trimmed city', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    const searchForm = screen.getByRole('search');
    const searchInput = screen.getByRole('searchbox', {
      name: 'Buscar cidade',
    });

    await user.type(searchInput, '  São Paulo  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(searchForm).toBeInTheDocument();
    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith('São Paulo');
  });

  it('does not search when the trimmed input is empty', () => {
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    const searchForm = screen.getByRole('search');
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar cidade' }), {
      target: { value: '   ' },
    });
    fireEvent.submit(searchForm);

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('disables the input and does not search when disabled', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} disabled />);

    const searchInput = screen.getByRole('searchbox', {
      name: 'Buscar cidade',
    });
    expect(searchInput).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();

    fireEvent.submit(screen.getByRole('search'));
    await user.keyboard('São Paulo');

    expect(onSearch).not.toHaveBeenCalled();
  });
});
