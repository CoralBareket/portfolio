import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Contact } from './Contact';

describe('Contact form', () => {
  it('shows accessible validation errors and does not submit invalid input', () => {
    render(<Contact />);
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(screen.getByText('Please enter your name.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    expect(fetch).not.toHaveBeenCalledWith('/api/contact', expect.anything());
  });

  it('links to LinkedIn, email and GitHub', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute(
      'href',
      'https://il.linkedin.com/in/coral-bareket-97b886216',
    );
    expect(screen.getByRole('link', { name: /email/i })).toHaveAttribute(
      'href',
      'mailto:coral.bareket@gmail.com',
    );
    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
      'href',
      'https://github.com/CoralBareket',
    );
  });
});
