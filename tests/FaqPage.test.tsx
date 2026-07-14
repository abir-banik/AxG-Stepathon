import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FaqPage from '../components/FaqPage';

describe('FaqPage Component', () => {
  it('renders FAQ banner and key dates grid', () => {
    render(<FaqPage />);

    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByText('July 6 – July 10')).toBeInTheDocument();
    expect(screen.getByText('July 13 – August 5')).toBeInTheDocument();
    expect(screen.getByText('Aug 5 @ 5:00 PM EST')).toBeInTheDocument();
  });

  it('renders interactive host email contact links', () => {
    render(<FaqPage />);

    const sydneyLinks = screen.getAllByRole('link', { name: /sydney\.yap@accenture\.com/i });
    expect(sydneyLinks.length).toBeGreaterThan(0);
    expect(sydneyLinks[0]).toHaveAttribute('href', 'mailto:Sydney.yap@accenture.com');

    const abirLinks = screen.getAllByRole('link', { name: /a\.banik@accenture\.com/i });
    expect(abirLinks.length).toBeGreaterThan(0);
    expect(abirLinks[0]).toHaveAttribute('href', 'mailto:a.banik@accenture.com');
  });

  it('filters questions by category tabs and search input', () => {
    render(<FaqPage />);

    const searchInput = screen.getByPlaceholderText('Search questions...');
    fireEvent.change(searchInput, { target: { value: 'forget' } });

    expect(screen.getByText('What if I forget to log my steps on a specific day?')).toBeInTheDocument();
    expect(screen.queryByText('When does the Step-a-Thon take place?')).not.toBeInTheDocument();
  });

  it('toggles accordion items when clicked', () => {
    render(<FaqPage />);

    const ruleQuestion = screen.getByText('Do I need to save proof or screenshots of my step count?');
    const isTextPresent = () => screen.queryByText('Honor System');

    // Initially closed
    expect(isTextPresent()).toBeNull();

    // Click to expand
    fireEvent.click(ruleQuestion);
    expect(isTextPresent()).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(ruleQuestion);
    expect(isTextPresent()).toBeNull();
  });

  it('renders leaderboards explanation FAQ item', () => {
    render(<FaqPage />);

    const leaderboardQuestion = screen.getByText('How do the different Leaderboard pages work?');
    expect(leaderboardQuestion).toBeInTheDocument();

    fireEvent.click(leaderboardQuestion);
    expect(screen.getByText(/Weekly Leaderboard:/i)).toBeInTheDocument();
  });
});
