import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('shows the name as the main heading', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Coral Bareket' })).toBeInTheDocument();
  });
});
