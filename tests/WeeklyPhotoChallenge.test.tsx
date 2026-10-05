import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WeeklyPhotoChallenge from '../components/WeeklyPhotoChallenge';

describe('WeeklyPhotoChallenge Component', () => {
  it('shows the pre-event teaser before October 19 and hides all weekly prompts', () => {
    render(<WeeklyPhotoChallenge currentDate="2026-10-10" />);

    expect(screen.getByText(/Something Exciting is Brewing/i)).toBeInTheDocument();
    expect(screen.getByText(/Unlocks Oct 19/i)).toBeInTheDocument();
    expect(screen.queryByText(/Wear Pink for Breast Cancer Awareness/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Celebrating Diwali/i)).not.toBeInTheDocument();
  });

  it('shows ONLY Week 1 challenge during Oct 19 - Oct 25', () => {
    render(<WeeklyPhotoChallenge currentDate="2026-10-20" />);

    expect(screen.getByText('Week 1 Photo Challenge')).toBeInTheDocument();
    expect(screen.getByText('Wear Pink for Breast Cancer Awareness')).toBeInTheDocument();
    expect(screen.getByText('Find Something Pink')).toBeInTheDocument();
    // Future weeks must not be visible
    expect(screen.queryByText('Mental Health Awareness Month')).not.toBeInTheDocument();
    expect(screen.queryByText('Celebrating Diwali')).not.toBeInTheDocument();
  });

  it('shows ONLY Week 2 challenge during Oct 26 - Nov 1', () => {
    render(<WeeklyPhotoChallenge currentDate="2026-10-27" />);

    expect(screen.getByText('Week 2 Photo Challenge')).toBeInTheDocument();
    expect(screen.getByText('Mental Health Awareness Month')).toBeInTheDocument();
    expect(screen.getByText('Mindful Moment')).toBeInTheDocument();
    expect(screen.queryByText('Wear Pink for Breast Cancer Awareness')).not.toBeInTheDocument();
    expect(screen.queryByText('Celebrating Diwali')).not.toBeInTheDocument();
  });

  it('shows ONLY Week 3 challenge during Nov 2 - Nov 8', () => {
    render(<WeeklyPhotoChallenge currentDate="2026-11-04" />);

    expect(screen.getByText('Week 3 Photo Challenge')).toBeInTheDocument();
    expect(screen.getByText('Celebrating Diwali')).toBeInTheDocument();
    expect(screen.getByText('Find the Light')).toBeInTheDocument();
    expect(screen.queryByText('Movember Men\'s Health')).not.toBeInTheDocument();
  });

  it('shows ONLY Week 4 challenge during Nov 9 - Nov 15', () => {
    render(<WeeklyPhotoChallenge currentDate="2026-11-11" />);

    expect(screen.getByText('Week 4 Photo Challenge')).toBeInTheDocument();
    expect(screen.getByText("Movember Men's Health")).toBeInTheDocument();
    expect(screen.getByText('Mustache Moment')).toBeInTheDocument();
    expect(screen.queryByText('Gratitude, Community, and Connection')).not.toBeInTheDocument();
  });

  it('shows ONLY Week 5 challenge starting Nov 16', () => {
    render(<WeeklyPhotoChallenge currentDate="2026-11-17" />);

    expect(screen.getByText('Week 5 Photo Challenge')).toBeInTheDocument();
    expect(screen.getByText('Gratitude, Community, and Connection')).toBeInTheDocument();
    expect(screen.getByText('Grateful for This')).toBeInTheDocument();
    expect(screen.queryByText('Wear Pink for Breast Cancer Awareness')).not.toBeInTheDocument();
  });
});
