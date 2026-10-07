import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DashboardStats from '../components/DashboardStats';

describe('DashboardStats Component (Upgrade 2)', () => {
  it('renders 3 distinct KPI cards (Total Team Steps, Community Pace, Challenge Schedule) without a duplicate progress bar', () => {
    render(
      <DashboardStats
        totalSteps={250000}
        activeUserCount={25}
        teamCount={5}
        distanceUnit="mi"
      />
    );

    // Card 1: Total Team Steps & Distance
    expect(screen.getByText('Total Team Steps')).toBeInTheDocument();
    expect(screen.getByText('250,000')).toBeInTheDocument();
    expect(screen.getByText(/125\.0 mi covered/i)).toBeInTheDocument();

    // Card 2: Community Pace (Avg steps/racer, Racers count, Teams count)
    expect(screen.getByText('Community Pace')).toBeInTheDocument();
    expect(screen.getByText('10,000')).toBeInTheDocument();
    expect(screen.getByText(/avg steps\/racer/i)).toBeInTheDocument();
    expect(screen.getByText(/25 Racers/i)).toBeInTheDocument();
    expect(screen.getByText(/5 Teams/i)).toBeInTheDocument();

    // Card 3: Challenge Schedule
    expect(screen.getByText('Challenge Schedule')).toBeInTheDocument();

    // Duplicate progress bar title should no longer be present in DashboardStats
    expect(screen.queryByText('Race Progress')).not.toBeInTheDocument();
  });

  it('converts distance to kilometers when distanceUnit is km', () => {
    render(
      <DashboardStats
        totalSteps={20000}
        activeUserCount={2}
        teamCount={1}
        distanceUnit="km"
      />
    );

    // 20,000 steps = 10 miles = 16.1 km
    expect(screen.getByText(/16\.1 km covered/i)).toBeInTheDocument();
  });
});
