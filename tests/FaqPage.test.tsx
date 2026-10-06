import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FaqPage from '../components/FaqPage';

describe('FaqPage Component', () => {
  it('renders FAQ banner, Oct 7-15 sign-up window, 4-week duration, and Weekly Photo Challenge banner', () => {
    render(<FaqPage />);

    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByText('October 7 – October 15')).toBeInTheDocument();
    expect(screen.getByText('October 19 – November 20')).toBeInTheDocument();
    expect(screen.getByText('4 Weeks of Global Stepping')).toBeInTheDocument();
    expect(screen.getByText('Mondays @ Midnight PST')).toBeInTheDocument();
    expect(screen.getByText('November 20th')).toBeInTheDocument();
  });

  it('renders feedback form links for event support instead of personal emails', () => {
    render(<FaqPage />);

    const feedbackLinks = screen.getAllByRole('link', { name: /feedback/i });
    expect(feedbackLinks.length).toBeGreaterThanOrEqual(2);
    expect(feedbackLinks[0]).toHaveAttribute('href', 'https://forms.office.com/r/Zg03YymPPq');

    expect(screen.queryByText(/Sydney\.yap/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/a\.banik/i)).not.toBeInTheDocument();
  });

  it('includes the #bigstepper 30k+ daily step rule in Rules & Validation', () => {
    render(<FaqPage />);

    expect(screen.getAllByText(/#bigstepper/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/30,000\+ Daily Steps Rule \(#bigstepper\):/i)).toBeInTheDocument();
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

    // Open by default now
    expect(isTextPresent()).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(ruleQuestion);
    expect(isTextPresent()).toBeNull();

    // Click to expand again
    fireEvent.click(ruleQuestion);
    expect(isTextPresent()).toBeInTheDocument();
  });

  it('renders leaderboards explanation FAQ item', () => {
    render(<FaqPage />);

    const leaderboardQuestion = screen.getByText('How do the different Leaderboard pages work?');
    expect(leaderboardQuestion).toBeInTheDocument();

    fireEvent.click(leaderboardQuestion);
    expect(screen.getByText(/Weekly Leaderboard:/i)).toBeInTheDocument();
  });
});
