import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WeeklyLeaderboardPage from '../pages/WeeklyLeaderboardPage';
import { User, Team } from '../types';

const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alice',
    teamId: 'team-1',
    teamName: 'Boba Walkers',
    steps: 15000,
    weeklySteps: { 1: 10000, 2: 5000 },
    stepHistory: [],
    iconId: 'smile'
  },
  {
    id: 'user-2',
    name: 'Bob',
    teamId: 'team-1',
    teamName: 'Boba Walkers',
    steps: 8000,
    weeklySteps: { 1: 8000 },
    stepHistory: [],
    iconId: 'smile'
  },
  {
    id: 'user-3',
    name: 'Charlie',
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
  it('renders correctly with default props', () => {
    render(<WeeklyLeaderboardPage users={mockUsers} teams={mockTeams} />);
    expect(screen.getByText('Weekly Leaderboard')).toBeInTheDocument();
  });

  it('calculates individual weekly stats correctly for selected week', () => {
    render(<WeeklyLeaderboardPage users={mockUsers} teams={mockTeams} distanceUnit="mi" />);
    
    // Week 1 Charlie: 12,000 steps
    // Week 1 Alice: 10,000 steps
    // Week 1 Bob: 8,000 steps
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    
    expect(screen.getAllByText('12,000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('10,000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('8,000').length).toBeGreaterThanOrEqual(1);
  });

  it('switches calculations when selected week changes', () => {
    render(<WeeklyLeaderboardPage users={mockUsers} teams={mockTeams} distanceUnit="mi" />);
    
    // Click Week 2 button
    const week2Button = screen.getByText('Week 2');
    fireEvent.click(week2Button);
    
    // Week 2 Charlie: 8,000 steps
    // Week 2 Alice: 5,000 steps
    // Week 2 Bob: 0 steps (so filtered out)
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('converts distances to kilometers when unit is km', () => {
    render(<WeeklyLeaderboardPage users={mockUsers} teams={mockTeams} distanceUnit="km" />);
    
    // Week 1 Charlie: 12000 steps / 2000 = 6 miles * 1.60934 = 9.7 km
    expect(screen.getAllByText('9.7 km').length).toBeGreaterThanOrEqual(1);
  });
});
