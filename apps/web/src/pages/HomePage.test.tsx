import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';

// <Head> is rendered by vite-react-ssg at build time; it has no visible output to test here.
vi.mock('vite-react-ssg', () => ({ Head: () => null }));

const renderHome = () => render(<HomePage />);

describe('HomePage', () => {
  it('shows the name as the only h1', () => {
    renderHome();
    expect(screen.getByRole('heading', { level: 1, name: 'Coral Bareket' })).toBeInTheDocument();
  });

  it('numbers every section in the nav and links to it', () => {
    renderHome();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const links = within(nav).getAllByRole('link').slice(1); // skip the logo
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '#stack',
      '#focus',
      '#experience',
      '#projects',
      '#about',
      '#contact',
    ]);
    expect(links[0]).toHaveTextContent('01.');
  });

  it('shows the "coming soon" state when there are no projects', () => {
    renderHome();
    expect(screen.getByText(/Projects coming soon/)).toBeInTheDocument();
  });

  it('highlights the intern to full-time promotion', () => {
    renderHome();
    expect(screen.getByText(/Promoted from intern to full-time developer/)).toBeInTheDocument();
  });

  it('offers a skip link to the main content', () => {
    renderHome();
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute('href', '#main');
  });
});
