import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../../src/components/states/EmptyState';
import ErrorState from '../../../src/components/states/ErrorState';
import LoadingState from '../../../src/components/states/LoadingState';

describe('states components', () => {
  it('announces loading with a status role', () => {
    render(<LoadingState message="Buscando cidade..." />);

    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidade...');
  });

  it('announces the error and calls onRetry', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Falha ao carregar os dados." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao carregar os dados.');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('announces an empty state with title and hint', () => {
    render(<EmptyState title="Nenhuma cidade encontrada" hint="Tente outro nome." />);

    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
    expect(screen.getByText('Tente outro nome.')).toBeInTheDocument();
  });
});
