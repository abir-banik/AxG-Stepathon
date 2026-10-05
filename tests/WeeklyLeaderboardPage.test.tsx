import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WeeklyLeaderboardPage from '../pages/WeeklyLeaderboardPage';
import { User, Team } from '../types';

const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alice Smith',
    teamId: 'team-1',
    teamName: 'Boba Walkers',
    steps: 15000,
    weeklySteps: { 1: 10000, 2: 5000 },
    stepHistory: [],
    iconId: 'smile'
  },
  {
    id: 'user-2',
    name: 'Bob Jones',
    teamId: 'team-1',
    teamName: 'Boba Walkers',
    steps: 8000,
    weeklySteps: { 1: 8000 },
    stepHistory: [],
    iconId: 'smile'
  },
  {
    id: 'user-3',
    name: 'Charlie Brown',
    teamId: 'team-2',
    teamName: 'Viento',
    steps: 20000,
    weeklySteps: { 1: 12000, 2: 8000 },
    stepHistory: [],
    iconId: 'smile'
  }
];

const mockTeams: Team[] = [
  { id: 'team-1', name: 'Boba Walkers', color: '#4285F4', iconId: 'trophy' },
  { id: 'team-2', name: 'Viento', color: '#EA4335', iconId: 'trophy' }
];

describe('WeeklyLeaderboardPage component', () => {
  it('renders correctly with 5-week schedule buttons', () => {
    render(<WeeklyLeaderboardPage users={mockUsers} teams={mockTeams} />);
    expect(screen.getByText('Weekly Leaderboard')).toBeInTheDocument();
    expect(screen.getByText(/5-Week Challenge \(October 19th – November 17th\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Week 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Week 5/i })).toBeInTheDocument();
  });

  it('calculates individual weekly stats correctly and formats names as First L.', () => {
    render(<WeeklyLeaderboardPage users={mockUsers} teams={mockTeams} distanceUnit="mi" />);
    
    // Week 1 Charlie B.: 12,000 steps
    // Week 1 Alice S.: 10,000 steps
    // Week 1 Bob J.: 8,000 steps
    expect(screen.getByText('Charlie B.')).toBeInTheDocument();
    expect(screen.getByText('Alice S.')).toBeInTheDocument();
    expect(screen.getByText('Bob J.')).toBeInTheDocument();
    
    expect(screen.getAllByText('12,000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('10,000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('8,000').length).toBeGreaterThanOrEqual(1);
  });

  it('switches calculations when selected week changes', () => {
    render(<WeeklyLeaderboardPage users={mockUsers} teams={mockTeams} distanceUnit="mi" />);
    
    // Click Week 2 button
    const week2Button = screen.getByRole('button', { name: /Week 2/i });
    fireEvent.click(week2Button);
    
    // Week 2 Charlie B.: 8,000 steps
    // Week 2 Alice S.: 5,000 steps
    // Week 2 Bob J.: 0 steps (so filtered out)
    expect(screen.getByText('Charlie B.')).toBeInTheDocument();
    expect(screen.getByText('Alice S.')).toBeInTheDocument();
    expect(screen.queryByText('Bob J.')).not.toBeInTheDocument();
  });

  it('converts distances to kilometers when unit is km', () => {
    render(<WeeklyLeaderboardPage users={mockUsers} teams={mockTeams} distanceUnit="km" />);
    
    // Week 1 Charlie B.: 12000 steps / 2000 = 6 miles * 1.60934 = 9.7 km
    expect(screen.getAllByText('9.7 km').length).toBeGreaterThanOrEqual(1);
  });

  it('filters out entries submitted after Monday Midnight PST deadline for that week', () => {
    const userWithLateSubmission: User = {
      id: 'user-late',
      name: 'Late Submitter',
      teamId: 'team-1',
      teamName: 'Boba Walkers',
      steps: 15000,
      weeklySteps: { 1: 15000 },
      stepHistory: [
        { amount: 5000, date: '2026-10-21', week: 1, submittedAt: '2026-10-24T10:00:00.000Z' }, // Before Week 1 deadline (Oct 27 08:00 UTC) -> valid
        { amount: 10000, date: '2026-10-25', week: 1, submittedAt: '2026-10-28T14:00:00.000Z' } // After deadline -> excluded from W1 leaderboard
      ],
      iconId: 'smile'
    };

    render(<WeeklyLeaderboardPage users={[userWithLateSubmission]} teams={mockTeams} distanceUnit="mi" />);
    
    // Should show 5,000 steps for Week 1 (not 15,000) and formatted name "Late S."
    expect(screen.getByText('Late S.')).toBeInTheDocument();
    expect(screen.getAllByText('5,000')[0]).toBeInTheDocument();
    expect(screen.queryByText('15,000')).not.toBeInTheDocument();
  });
});
