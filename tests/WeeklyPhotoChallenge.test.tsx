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
    expect(screen.getByText('October 19 – October 23')).toBeInTheDocument();
    expect(screen.getByText('Find Something Pink')).toBeInTheDocument();
    expect(screen.getByText(/🌷 A pink flower/i)).toBeInTheDocument();
    // Future weeks must not be visible
    expect(screen.queryByText(/Mindful Moments for Men’s Mental Health Awareness/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Celebrating Diwali/i)).not.toBeInTheDocument();
  });

  it('shows ONLY Week 2 challenge during Oct 26 - Nov 1', () => {
    render(<WeeklyPhotoChallenge currentDate="2026-10-27" />);

    expect(screen.getByText('Week 2 Photo Challenge')).toBeInTheDocument();
    expect(screen.getByText('Mindful Moments for Men’s Mental Health Awareness')).toBeInTheDocument();
    expect(screen.getByText('October 26 – October 30')).toBeInTheDocument();
    expect(screen.getByText('Mindful Moment')).toBeInTheDocument();
    expect(screen.getByText(/🌅 A beautiful sunrise or sunset/i)).toBeInTheDocument();
    expect(screen.queryByText('Wear Pink for Breast Cancer Awareness')).not.toBeInTheDocument();
    expect(screen.queryByText(/Celebrating Diwali/i)).not.toBeInTheDocument();
  });

  it('shows ONLY Week 3 challenge during Nov 2 - Nov 8', () => {
    render(<WeeklyPhotoChallenge currentDate="2026-11-04" />);

    expect(screen.getByText('Week 3 Photo Challenge')).toBeInTheDocument();
    expect(screen.getByText('Celebrating Diwali: Find the Light')).toBeInTheDocument();
    expect(screen.getByText('November 2 – November 6')).toBeInTheDocument();
    expect(screen.getByText('Find the Light')).toBeInTheDocument();
    expect(screen.getByText(/✨ Sparkling or decorative lights/i)).toBeInTheDocument();
    expect(screen.queryByText(/Movember Men’s Health/i)).not.toBeInTheDocument();
  });

  it('shows ONLY Week 4 challenge during Nov 9 - Nov 15', () => {
    render(<WeeklyPhotoChallenge currentDate="2026-11-11" />);

    expect(screen.getByText('Week 4 Photo Challenge')).toBeInTheDocument();
    expect(screen.getByText('Movember Men’s Health: Walk With Someone You Appreciate')).toBeInTheDocument();
    expect(screen.getByText('November 9 – November 13')).toBeInTheDocument();
    expect(screen.getByText('Walk With Someone You Appreciate')).toBeInTheDocument();
    expect(screen.getByText(/🏃 A walking or workout buddy/i)).toBeInTheDocument();
    expect(screen.queryByText(/Gratitude, Community & Connection/i)).not.toBeInTheDocument();
  });

  it('shows ONLY Week 5 challenge starting Nov 16', () => {
    render(<WeeklyPhotoChallenge currentDate="2026-11-17" />);

    expect(screen.getByText('Week 5 Photo Challenge')).toBeInTheDocument();
    expect(screen.getByText('Gratitude, Community & Connection')).toBeInTheDocument();
    expect(screen.getByText('November 16 – November 20')).toBeInTheDocument();
    expect(screen.getByText('Grateful for This')).toBeInTheDocument();
    expect(screen.getByText(/🐾 A furry companion joining your steps/i)).toBeInTheDocument();
    expect(screen.queryByText('Wear Pink for Breast Cancer Awareness')).not.toBeInTheDocument();
  });
});
