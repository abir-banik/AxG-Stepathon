import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EventConcludedPage from '../components/EventConcludedPage';

describe('EventConcludedPage Component', () => {
  it('renders the celebratory thank you message and title', () => {
    render(<EventConcludedPage />);

    expect(screen.getAllByText(/2nd/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Stepathon/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Thank You for Walking With Us!')).toBeInTheDocument();
    expect(screen.getByText(/Event Concluded • July 13 – August 5, 2026/i)).toBeInTheDocument();
  });

  it('renders community milestones and stats highlights', () => {
    render(<EventConcludedPage />);

    expect(screen.getByText('10+')).toBeInTheDocument();
    expect(screen.getByText('Countries')).toBeInTheDocument();
    expect(screen.getByText('46')).toBeInTheDocument();
    expect(screen.getByText('Teams')).toBeInTheDocument();
    expect(screen.getByText('276')).toBeInTheDocument();
    expect(screen.getByText('Racers')).toBeInTheDocument();
    expect(screen.getByText('45.4M')).toBeInTheDocument();
    expect(screen.getByText('Steps Logged')).toBeInTheDocument();
  });

  it('renders feedback link and final results notification cards', () => {
    render(<EventConcludedPage />);

    expect(screen.getByText('Final Results & Standings')).toBeInTheDocument();
    expect(screen.getByText(/Final leaderboards, team rankings, etc\. are out!/i)).toBeInTheDocument();
    expect(screen.getByText('Share Your Feedback & Memories')).toBeInTheDocument();

    const feedbackLink = screen.getByRole('link', { name: /Open Feedback Form/i });
    expect(feedbackLink).toHaveAttribute('href', 'https://forms.office.com/r/Zg03YymPPq');
    expect(feedbackLink).toHaveAttribute('target', '_blank');
  });

  it('renders footer message anticipating 2027 stepathon', () => {
    render(<EventConcludedPage />);

    expect(screen.getByText(/See you at the 3rd Annual Global Stepathon in 2027!/i)).toBeInTheDocument();
  });
});
